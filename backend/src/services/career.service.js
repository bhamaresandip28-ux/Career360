/**
 * Career Intelligence & Preparation Service
 * Implements the 5-pillar Career Readiness Algorithm, Skill Gap Analysis Engine,
 * Personalized Milestones Roadmap, and Preparation Hub progress tracking.
 */

const { prisma } = require('../config/database');
const AppError   = require('../utils/AppError');

const PROFICIENCY_RANK = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

// ─── Target Roles ─────────────────────────────────────────────────────────────

async function getTargetRoles() {
  const roles = await prisma.targetRole.findMany({
    where: { isActive: true },
    include: {
      roleSkills: true,
      _count: {
        select: { studentTargetRoles: true },
      },
    },
    orderBy: { averageCtcLpa: 'desc' },
  });

  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    minCgpa: r.minCgpa,
    averageCtcLpa: r.averageCtcLpa,
    skillCount: r.roleSkills.length,
    activeStudents: r._count.studentTargetRoles,
    skills: r.roleSkills,
  }));
}

async function getStudentTargetRole(studentId) {
  const selection = await prisma.studentTargetRole.findFirst({
    where: { studentId, isPrimary: true },
    include: {
      targetRole: {
        include: { roleSkills: true },
      },
    },
  });

  if (selection) return selection.targetRole;

  // If student hasn't picked yet, default to first active role (e.g. Full Stack Developer)
  const defaultRole = await prisma.targetRole.findFirst({
    where: { isActive: true },
    include: { roleSkills: true },
    orderBy: { name: 'asc' },
  });

  return defaultRole;
}

async function setStudentTargetRole(studentId, targetRoleId) {
  const role = await prisma.targetRole.findUnique({
    where: { id: targetRoleId },
  });

  if (!role) {
    throw new AppError('Target role not found.', 404, 'NOT_FOUND');
  }

  // Set any previous primary to false
  await prisma.studentTargetRole.updateMany({
    where: { studentId, isPrimary: true },
    data: { isPrimary: false },
  });

  // Upsert new primary role
  const record = await prisma.studentTargetRole.upsert({
    where: {
      studentId_targetRoleId: {
        studentId,
        targetRoleId,
      },
    },
    update: { isPrimary: true },
    create: {
      studentId,
      targetRoleId,
      isPrimary: true,
    },
    include: {
      targetRole: {
        include: { roleSkills: true },
      },
    },
  });

  return record.targetRole;
}

// ─── 5-Pillar Career Readiness Score Algorithm ───────────────────────────────

async function computeReadinessScore(studentId, targetRoleId = null) {
  const targetRole = targetRoleId
    ? await prisma.targetRole.findUnique({
        where: { id: targetRoleId },
        include: { roleSkills: true },
      })
    : await getStudentTargetRole(studentId);

  // Fetch student comprehensive profile data
  const [profile, subjectRecords, skills, projects, internships, certs] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: studentId } }),
    prisma.studentSubjectRecord.findMany({ where: { semester: { userId: studentId } } }),
    prisma.skill.findMany({ where: { userId: studentId } }),
    prisma.project.findMany({ where: { userId: studentId } }),
    prisma.internship.findMany({ where: { userId: studentId } }),
    prisma.certification.findMany({ where: { userId: studentId } }),
  ]);

  // 1. Pillar: Academics (Max 25 pts)
  let academicScore = 0;
  const cgpa = profile?.cgpa ?? 0;
  const activeBacklogs = profile?.activeBacklogs ?? 0;

  if (cgpa >= 8.5) academicScore = 25;
  else if (cgpa >= 7.5) academicScore = 20;
  else if (cgpa >= 6.5) academicScore = 15;
  else if (cgpa >= 6.0) academicScore = 10;
  else if (cgpa > 0) academicScore = 5;

  // Penalties
  academicScore -= activeBacklogs * 5;

  // Attendance check
  if (subjectRecords.length > 0) {
    const totalAttendance = subjectRecords.reduce((sum, r) => sum + (r.attendance || 0), 0);
    const avgAttendance = totalAttendance / subjectRecords.length;
    if (avgAttendance < 75) academicScore -= 3;
  }
  academicScore = Math.max(0, Math.min(25, academicScore));

  // 2. Pillar: Skills Match (Max 25 pts)
  let skillsScore = 0;
  if (targetRole && targetRole.roleSkills?.length > 0) {
    const roleSkills = targetRole.roleSkills;
    let earnedSkillPoints = 0;
    let maxPossibleSkillPoints = 0;

    for (const rs of roleSkills) {
      const weight = rs.importance === 'CRITICAL' ? 3 : rs.importance === 'IMPORTANT' ? 2 : 1;
      maxPossibleSkillPoints += weight;

      const matchedStudentSkill = skills.find(
        (s) => s.name.toLowerCase().trim() === rs.name.toLowerCase().trim() ||
               s.name.toLowerCase().includes(rs.name.toLowerCase()) ||
               rs.name.toLowerCase().includes(s.name.toLowerCase())
      );

      if (matchedStudentSkill) {
        const studentRank = PROFICIENCY_RANK[matchedStudentSkill.proficiency] || 1;
        const requiredRank = PROFICIENCY_RANK[rs.minProficiency] || 2;
        if (studentRank >= requiredRank) {
          earnedSkillPoints += weight;
        } else {
          earnedSkillPoints += weight * 0.6; // Partial credit
        }
      }
    }

    if (maxPossibleSkillPoints > 0) {
      skillsScore = Math.round((earnedSkillPoints / maxPossibleSkillPoints) * 25);
    }
  } else {
    // Fallback: general skill volume & diversity
    const distinctCategories = new Set(skills.map((s) => s.category)).size;
    skillsScore = Math.min(25, skills.length * 3 + distinctCategories * 2);
  }
  skillsScore = Math.max(0, Math.min(25, skillsScore));

  // 3. Pillar: Projects (Max 20 pts)
  let projectScore = 0;
  if (projects.length > 0) {
    projectScore = Math.min(12, projects.length * 6);
    const hasLiveDemo = projects.some((p) => p.demoUrl && p.demoUrl.trim().length > 0);
    const hasGithub = projects.some((p) => p.githubUrl && p.githubUrl.trim().length > 0);
    if (hasLiveDemo) projectScore += 4;
    if (hasGithub) projectScore += 4;
  }
  projectScore = Math.max(0, Math.min(20, projectScore));

  // 4. Pillar: Internships (Max 15 pts)
  let internshipScore = 0;
  if (internships.length > 0) {
    internshipScore = 12;
    if (internships.length >= 2 || internships.some((i) => i.certificateUrl)) {
      internshipScore = 15;
    }
  }
  internshipScore = Math.max(0, Math.min(15, internshipScore));

  // 5. Pillar: Certifications (Max 15 pts)
  let certScore = 0;
  if (certs.length > 0) {
    certScore = 10;
    if (certs.length >= 2 || certs.some((c) => c.verificationUrl)) {
      certScore = 15;
    }
  }
  certScore = Math.max(0, Math.min(15, certScore));

  // Composite Readiness Score
  const totalScore = Math.round(academicScore + skillsScore + projectScore + internshipScore + certScore);

  let tier = 'NEEDS_INTERVENTION';
  let tierLabel = 'Requires Skill Building';
  let tierBadge = 'danger';

  if (totalScore >= 85) {
    tier = 'PLACEMENT_READY';
    tierLabel = 'Placement Ready (Top Tier)';
    tierBadge = 'emerald';
  } else if (totalScore >= 70) {
    tier = 'COMPETITIVE';
    tierLabel = 'Competitive Candidate';
    tierBadge = 'primary';
  } else if (totalScore >= 50) {
    tier = 'EMERGING';
    tierLabel = 'Emerging Talent';
    tierBadge = 'amber';
  }

  // Generate high-impact recommendations
  const recommendations = [];
  if (skillsScore < 18) {
    recommendations.push({
      pillar: 'SKILLS',
      message: `Close critical skill gaps for ${targetRole?.name || 'your target role'}. Focus on missing required skills.`,
      action: '/student/career',
    });
  }
  if (projectScore < 16) {
    recommendations.push({
      pillar: 'PROJECTS',
      message: 'Add a flagship full-stack or domain project with both a public GitHub repository and live deployment link.',
      action: '/student/projects',
    });
  }
  if (internshipScore < 12) {
    recommendations.push({
      pillar: 'INTERNSHIPS',
      message: 'Secure an industry internship or research assistantship to validate production-level teamwork.',
      action: '/student/internships',
    });
  }
  if (certScore < 10) {
    recommendations.push({
      pillar: 'CERTIFICATIONS',
      message: 'Earn an industry-standard credential (e.g. AWS, Microsoft Azure, Google Cloud, Oracle) to boost recruiter visibility.',
      action: '/student/certifications',
    });
  }
  if (academicScore < 20) {
    recommendations.push({
      pillar: 'ACADEMICS',
      message: 'Target SGPA > 8.0 in upcoming semesters and maintain > 75% attendance across all subjects.',
      action: '/student/academics',
    });
  }

  return {
    score: totalScore,
    tier,
    tierLabel,
    tierBadge,
    targetRole: targetRole ? { id: targetRole.id, name: targetRole.name, slug: targetRole.slug, averageCtcLpa: targetRole.averageCtcLpa } : null,
    pillars: [
      { key: 'academics', label: 'Academics & Scholastic', score: academicScore, max: 25, percentage: Math.round((academicScore / 25) * 100) },
      { key: 'skills', label: 'Role Skills Alignment', score: skillsScore, max: 25, percentage: Math.round((skillsScore / 25) * 100) },
      { key: 'projects', label: 'Technical Projects', score: projectScore, max: 20, percentage: Math.round((projectScore / 20) * 100) },
      { key: 'internships', label: 'Work & Internships', score: internshipScore, max: 15, percentage: Math.round((internshipScore / 15) * 100) },
      { key: 'certifications', label: 'Verified Certifications', score: certScore, max: 15, percentage: Math.round((certScore / 15) * 100) },
    ],
    recommendations,
  };
}

// ─── Skill Gap Analysis Engine ───────────────────────────────────────────────

async function analyzeSkillGap(studentId, targetRoleId = null) {
  const targetRole = targetRoleId
    ? await prisma.targetRole.findUnique({
        where: { id: targetRoleId },
        include: { roleSkills: true },
      })
    : await getStudentTargetRole(studentId);

  if (!targetRole) {
    throw new AppError('Target role not found.', 404, 'NOT_FOUND');
  }

  const studentSkills = await prisma.skill.findMany({
    where: { userId: studentId },
  });

  const acquired = [];
  const needsLevelUp = [];
  const missingCritical = [];
  const missingOptional = [];

  for (const rs of targetRole.roleSkills) {
    const matched = studentSkills.find(
      (s) => s.name.toLowerCase().trim() === rs.name.toLowerCase().trim() ||
             s.name.toLowerCase().includes(rs.name.toLowerCase()) ||
             rs.name.toLowerCase().includes(s.name.toLowerCase())
    );

    if (matched) {
      const studentRank = PROFICIENCY_RANK[matched.proficiency] || 1;
      const requiredRank = PROFICIENCY_RANK[rs.minProficiency] || 2;

      if (studentRank >= requiredRank) {
        acquired.push({
          name: rs.name,
          category: rs.category,
          importance: rs.importance,
          studentProficiency: matched.proficiency,
          requiredProficiency: rs.minProficiency,
          status: 'MATCHED',
        });
      } else {
        needsLevelUp.push({
          name: rs.name,
          category: rs.category,
          importance: rs.importance,
          studentProficiency: matched.proficiency,
          requiredProficiency: rs.minProficiency,
          status: 'NEEDS_IMPROVEMENT',
        });
      }
    } else {
      if (rs.importance === 'CRITICAL') {
        missingCritical.push({
          name: rs.name,
          category: rs.category,
          importance: rs.importance,
          requiredProficiency: rs.minProficiency,
          status: 'MISSING_CRITICAL',
        });
      } else {
        missingOptional.push({
          name: rs.name,
          category: rs.category,
          importance: rs.importance,
          requiredProficiency: rs.minProficiency,
          status: 'MISSING_OPTIONAL',
        });
      }
    }
  }

  const totalRequired = targetRole.roleSkills.length;
  const totalSatisfied = acquired.length;
  const matchPercentage = totalRequired > 0 ? Math.round((totalSatisfied / totalRequired) * 100) : 100;

  return {
    targetRole: {
      id: targetRole.id,
      name: targetRole.name,
      slug: targetRole.slug,
      minCgpa: targetRole.minCgpa,
      averageCtcLpa: targetRole.averageCtcLpa,
      totalSkills: totalRequired,
    },
    matchPercentage,
    summary: {
      acquiredCount: acquired.length,
      needsLevelUpCount: needsLevelUp.length,
      missingCriticalCount: missingCritical.length,
      missingOptionalCount: missingOptional.length,
    },
    acquired,
    needsLevelUp,
    missingCritical,
    missingOptional,
  };
}

// ─── Career Roadmap Milestones ───────────────────────────────────────────────

async function getStudentRoadmap(studentId) {
  const items = await prisma.careerRoadmapItem.findMany({
    where: { studentId },
    orderBy: [
      { status: 'asc' },
      { priority: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  const total = items.length;
  const completed = items.filter((i) => i.status === 'COMPLETED').length;
  const inProgress = items.filter((i) => i.status === 'IN_PROGRESS').length;
  const pending = items.filter((i) => i.status === 'PENDING').length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    summary: {
      total,
      completed,
      inProgress,
      pending,
      completionPercentage,
    },
    items,
  };
}

async function createRoadmapItem(studentId, data) {
  const item = await prisma.careerRoadmapItem.create({
    data: {
      studentId,
      title: data.title,
      description: data.description || null,
      category: data.category || 'SKILL',
      priority: data.priority || 'MEDIUM',
      targetRoleId: data.targetRoleId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'PENDING',
    },
  });

  return item;
}

async function updateRoadmapItem(studentId, itemId, data) {
  const existing = await prisma.careerRoadmapItem.findFirst({
    where: { id: itemId, studentId },
  });

  if (!existing) {
    throw new AppError('Roadmap milestone not found.', 404, 'NOT_FOUND');
  }

  const updateData = { ...data };
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
    updateData.completedAt = new Date();
  } else if (data.status && data.status !== 'COMPLETED') {
    updateData.completedAt = null;
  }

  const updated = await prisma.careerRoadmapItem.update({
    where: { id: itemId },
    data: updateData,
  });

  return updated;
}

async function deleteRoadmapItem(studentId, itemId) {
  const existing = await prisma.careerRoadmapItem.findFirst({
    where: { id: itemId, studentId },
  });

  if (!existing) {
    throw new AppError('Roadmap milestone not found.', 404, 'NOT_FOUND');
  }

  await prisma.careerRoadmapItem.delete({ where: { id: itemId } });
  return { success: true };
}

// ─── Preparation Hub ─────────────────────────────────────────────────────────

async function getPreparationCatalog(studentId, { category, difficulty } = {}) {
  const where = {};
  if (category && category !== 'ALL') where.category = category;
  if (difficulty && difficulty !== 'ALL') where.difficulty = difficulty;

  const resources = await prisma.preparationResource.findMany({
    where,
    include: {
      studentProgress: {
        where: { studentId },
      },
    },
    orderBy: [
      { order: 'asc' },
      { category: 'asc' },
    ],
  });

  // Calculate student overall preparation progress
  const allResources = await prisma.preparationResource.findMany({
    include: {
      studentProgress: {
        where: { studentId },
      },
    },
  });

  const totalModules = allResources.length;
  const totalHours = allResources.reduce((s, r) => s + (r.estimatedHours || 0), 0);

  let completedModules = 0;
  let completedHours = 0;
  let inProgressModules = 0;

  for (const r of allResources) {
    const prog = r.studentProgress[0];
    if (prog?.status === 'COMPLETED') {
      completedModules++;
      completedHours += r.estimatedHours || 0;
    } else if (prog?.status === 'IN_PROGRESS') {
      inProgressModules++;
    }
  }

  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const catalog = resources.map((r) => {
    const prog = r.studentProgress[0];
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      difficulty: r.difficulty,
      estimatedHours: r.estimatedHours,
      contentUrl: r.contentUrl,
      tags: r.tags,
      order: r.order,
      userProgress: {
        status: prog?.status || 'NOT_STARTED',
        notes: prog?.notes || '',
        completedAt: prog?.completedAt || null,
      },
    };
  });

  return {
    summary: {
      totalModules,
      completedModules,
      inProgressModules,
      totalHours,
      completedHours,
      progressPercentage,
    },
    resources: catalog,
  };
}

async function updatePrepProgress(studentId, resourceId, { status, notes }) {
  const resource = await prisma.preparationResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new AppError('Preparation resource not found.', 404, 'NOT_FOUND');
  }

  const completedAt = status === 'COMPLETED' ? new Date() : null;

  const progress = await prisma.preparationProgress.upsert({
    where: {
      studentId_resourceId: {
        studentId,
        resourceId,
      },
    },
    update: {
      status,
      notes: notes !== undefined ? notes : undefined,
      completedAt,
    },
    create: {
      studentId,
      resourceId,
      status,
      notes: notes || null,
      completedAt,
    },
  });

  return progress;
}

module.exports = {
  getTargetRoles,
  getStudentTargetRole,
  setStudentTargetRole,
  computeReadinessScore,
  analyzeSkillGap,
  getStudentRoadmap,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getPreparationCatalog,
  updatePrepProgress,
};
