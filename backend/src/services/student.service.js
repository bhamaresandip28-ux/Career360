/**
 * Career360 — Student Service (Phase 2)
 * All student profile business logic.
 */

const { prisma }   = require('../config/database');
const AppError     = require('../utils/AppError');

// ─── Profile Completeness ─────────────────────────────────────────────────────
/**
 * Calculate profile completeness as a real percentage.
 * Based on defined field groups, not hardcoded.
 */
const COMPLETENESS_WEIGHTS = {
  basicInfo:         20,  // name, phone, gender, dob, address
  academicInfo:      15,  // department, batch, semester, rollNumber
  skills:            15,  // at least 3 skills
  projects:          15,  // at least 1 project
  certifications:    10,  // at least 1 certification
  internships:       10,  // at least 1 internship
  professionalLinks: 10,  // at least linkedin or github
  careerPreferences:  5,  // target role set
};

async function calculateCompleteness(userId) {
  const [profile, skills, projects, certs, internships, links, career] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.skill.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.certification.count({ where: { userId } }),
    prisma.internship.count({ where: { userId } }),
    prisma.professionalLink.findMany({ where: { userId } }),
    prisma.careerPreference.findUnique({ where: { userId } }),
  ]);

  let score = 0;

  // Basic info (20%)
  if (profile) {
    const fields = ['phone', 'gender', 'dateOfBirth', 'address'];
    const filled = fields.filter(f => profile[f] != null).length;
    score += Math.round((filled / fields.length) * COMPLETENESS_WEIGHTS.basicInfo);
  }

  // Academic info (15%)
  if (profile) {
    const fields = ['departmentId', 'batchId', 'currentSemester', 'rollNumber'];
    const filled = fields.filter(f => profile[f] != null).length;
    score += Math.round((filled / fields.length) * COMPLETENESS_WEIGHTS.academicInfo);
  }

  // Skills (15%) — full if 3+
  score += skills >= 3 ? COMPLETENESS_WEIGHTS.skills : Math.round((skills / 3) * COMPLETENESS_WEIGHTS.skills);

  // Projects (15%) — full if 1+
  score += projects >= 1 ? COMPLETENESS_WEIGHTS.projects : 0;

  // Certifications (10%)
  score += certs >= 1 ? COMPLETENESS_WEIGHTS.certifications : 0;

  // Internships (10%)
  score += internships >= 1 ? COMPLETENESS_WEIGHTS.internships : 0;

  // Professional links (10%) — full if has linkedin OR github
  const hasKey = links.some(l => ['LINKEDIN', 'GITHUB'].includes(l.platform));
  score += hasKey ? COMPLETENESS_WEIGHTS.professionalLinks : Math.round((links.length > 0 ? 0.5 : 0) * COMPLETENESS_WEIGHTS.professionalLinks);

  // Career preferences (5%)
  score += career?.targetRole ? COMPLETENESS_WEIGHTS.careerPreferences : 0;

  return Math.min(100, score);
}

// ─── Profile ──────────────────────────────────────────────────────────────────
async function getProfile(userId) {
  const [user, profile, completeness] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.studentProfile.findUnique({
      where: { userId },
      include: { department: true, batch: true },
    }),
    calculateCompleteness(userId),
  ]);

  if (!user) throw AppError.notFound('User not found.');
  return { user, profile, completeness };
}

async function upsertProfile(userId, data) {
  // Parse date if provided as string
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  return prisma.studentProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
    include: { department: true, batch: true },
  });
}

// ─── Skills ──────────────────────────────────────────────────────────────────
async function getSkills(userId) {
  return prisma.skill.findMany({
    where: { userId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

async function createSkill(userId, data) {
  try {
    return await prisma.skill.create({ data: { userId, ...data } });
  } catch (e) {
    if (e.code === 'P2002') {
      throw AppError.conflict(`You already have a skill named "${data.name}".`);
    }
    throw e;
  }
}

async function updateSkill(userId, skillId, data) {
  const skill = await prisma.skill.findFirst({ where: { id: skillId, userId } });
  if (!skill) throw AppError.notFound('Skill not found.');

  try {
    return await prisma.skill.update({ where: { id: skillId }, data });
  } catch (e) {
    if (e.code === 'P2002') {
      throw AppError.conflict(`You already have a skill named "${data.name}".`);
    }
    throw e;
  }
}

async function deleteSkill(userId, skillId) {
  const skill = await prisma.skill.findFirst({ where: { id: skillId, userId } });
  if (!skill) throw AppError.notFound('Skill not found.');
  await prisma.skill.delete({ where: { id: skillId } });
}

// ─── Projects ─────────────────────────────────────────────────────────────────
async function getProjects(userId) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

async function createProject(userId, data) {
  const parsed = _parseDates(data, ['startDate', 'endDate']);
  return prisma.project.create({ data: { userId, ...parsed } });
}

async function updateProject(userId, projectId, data) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw AppError.notFound('Project not found.');
  const parsed = _parseDates(data, ['startDate', 'endDate']);
  return prisma.project.update({ where: { id: projectId }, data: parsed });
}

async function deleteProject(userId, projectId) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw AppError.notFound('Project not found.');
  await prisma.project.delete({ where: { id: projectId } });
}

// ─── Certifications ───────────────────────────────────────────────────────────
async function getCertifications(userId) {
  return prisma.certification.findMany({
    where: { userId },
    orderBy: { issueDate: 'desc' },
  });
}

async function createCertification(userId, data) {
  const parsed = _parseDates(data, ['issueDate', 'expiryDate']);
  return prisma.certification.create({ data: { userId, ...parsed } });
}

async function updateCertification(userId, certId, data) {
  const cert = await prisma.certification.findFirst({ where: { id: certId, userId } });
  if (!cert) throw AppError.notFound('Certification not found.');
  const parsed = _parseDates(data, ['issueDate', 'expiryDate']);
  return prisma.certification.update({ where: { id: certId }, data: parsed });
}

async function deleteCertification(userId, certId) {
  const cert = await prisma.certification.findFirst({ where: { id: certId, userId } });
  if (!cert) throw AppError.notFound('Certification not found.');
  await prisma.certification.delete({ where: { id: certId } });
}

// ─── Internships ──────────────────────────────────────────────────────────────
async function getInternships(userId) {
  return prisma.internship.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
}

async function createInternship(userId, data) {
  const parsed = _parseDates(data, ['startDate', 'endDate']);
  return prisma.internship.create({ data: { userId, ...parsed } });
}

async function updateInternship(userId, internshipId, data) {
  const item = await prisma.internship.findFirst({ where: { id: internshipId, userId } });
  if (!item) throw AppError.notFound('Internship not found.');
  const parsed = _parseDates(data, ['startDate', 'endDate']);
  return prisma.internship.update({ where: { id: internshipId }, data: parsed });
}

async function deleteInternship(userId, internshipId) {
  const item = await prisma.internship.findFirst({ where: { id: internshipId, userId } });
  if (!item) throw AppError.notFound('Internship not found.');
  await prisma.internship.delete({ where: { id: internshipId } });
}

// ─── Achievements ─────────────────────────────────────────────────────────────
async function getAchievements(userId) {
  return prisma.achievement.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

async function createAchievement(userId, data) {
  const parsed = _parseDates(data, ['date']);
  return prisma.achievement.create({ data: { userId, ...parsed } });
}

async function updateAchievement(userId, achievementId, data) {
  const item = await prisma.achievement.findFirst({ where: { id: achievementId, userId } });
  if (!item) throw AppError.notFound('Achievement not found.');
  const parsed = _parseDates(data, ['date']);
  return prisma.achievement.update({ where: { id: achievementId }, data: parsed });
}

async function deleteAchievement(userId, achievementId) {
  const item = await prisma.achievement.findFirst({ where: { id: achievementId, userId } });
  if (!item) throw AppError.notFound('Achievement not found.');
  await prisma.achievement.delete({ where: { id: achievementId } });
}

// ─── Professional Links ───────────────────────────────────────────────────────
async function getLinks(userId) {
  return prisma.professionalLink.findMany({
    where: { userId },
    orderBy: { platform: 'asc' },
  });
}

async function upsertLinks(userId, links) {
  // Upsert each link — one per platform
  const operations = links.map(link =>
    prisma.professionalLink.upsert({
      where: { userId_platform: { userId, platform: link.platform } },
      create: { userId, ...link },
      update: { url: link.url, isPublic: link.isPublic },
    })
  );
  return Promise.all(operations);
}

// ─── Career Preferences ───────────────────────────────────────────────────────
async function getCareerPreferences(userId) {
  return prisma.careerPreference.findUnique({ where: { userId } });
}

async function upsertCareerPreferences(userId, data) {
  return prisma.careerPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// ─── Departments & Batches ────────────────────────────────────────────────────
async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { studentProfiles: true, batches: true, subjects: true } },
    },
  });
}

async function createDepartment(data) {
  try {
    return await prisma.department.create({ data });
  } catch (e) {
    if (e.code === 'P2002') throw AppError.conflict(`Department with code "${data.code}" already exists.`);
    throw e;
  }
}

async function getBatchesByDepartment(departmentId) {
  return prisma.batch.findMany({
    where: { departmentId },
    orderBy: { year: 'desc' },
  });
}

// ─── Student Roster (Faculty & Admin) ──────────────────────────────────────────
async function getRoster(query = {}) {
  const { departmentId, batchId, search } = query;
  const where = {};

  if (departmentId) where.departmentId = departmentId;
  if (batchId) where.batchId = batchId;
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { rollNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const profiles = await prisma.studentProfile.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          _count: {
            select: {
              skills: true,
              projects: true,
              certifications: true,
              internships: true,
            },
          },
        },
      },
      department: true,
      batch: true,
    },
    orderBy: [{ cgpa: 'desc' }, { rollNumber: 'asc' }],
  });

  // Calculate attendance per student
  const userIds = profiles.map(p => p.userId);
  const subjectRecords = await prisma.studentSubjectRecord.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, attendance: true },
  });

  const attendanceMap = new Map();
  subjectRecords.forEach(r => {
    if (r.attendance !== null) {
      if (!attendanceMap.has(r.userId)) attendanceMap.set(r.userId, []);
      attendanceMap.get(r.userId).push(r.attendance);
    }
  });

  return profiles.map(p => {
    const attList = attendanceMap.get(p.userId) || [];
    const avgAttendance = attList.length > 0
      ? Number((attList.reduce((a, b) => a + b, 0) / attList.length).toFixed(1))
      : null;

    return {
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      rollNumber: p.rollNumber || 'N/A',
      department: p.department?.name || 'Unassigned',
      departmentCode: p.department?.code || null,
      batchYear: p.batch?.year || null,
      currentSemester: p.currentSemester || null,
      cgpa: p.cgpa,
      latestSgpa: p.latestSgpa,
      activeBacklogs: p.activeBacklogs,
      totalBacklogs: p.totalBacklogs,
      avgAttendance,
      skillsCount: p.user._count.skills,
      projectsCount: p.user._count.projects,
      internshipsCount: p.user._count.internships,
      certificationsCount: p.user._count.certifications,
      status: p.user.status,
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _parseDates(data, fields) {
  const result = { ...data };
  fields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = new Date(result[field]);
    }
    if (result[field] === '' || result[field] === null) {
      result[field] = null;
    }
  });
  return result;
}

module.exports = {
  calculateCompleteness,
  getProfile,
  upsertProfile,
  getSkills, createSkill, updateSkill, deleteSkill,
  getProjects, createProject, updateProject, deleteProject,
  getCertifications, createCertification, updateCertification, deleteCertification,
  getInternships, createInternship, updateInternship, deleteInternship,
  getAchievements, createAchievement, updateAchievement, deleteAchievement,
  getLinks, upsertLinks,
  getCareerPreferences, upsertCareerPreferences,
  getDepartments, getBatchesByDepartment, createDepartment,
  getRoster,
};
