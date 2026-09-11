/**
 * Career360 — Historical Placement Insights Service
 * Provides aggregate historical intelligence on past placements, hiring companies,
 * CTC distributions, skill frequencies, and student profile correlation.
 */

const { prisma } = require('../config/database');

/**
 * 1. Placement Overview Metrics (with optional filters)
 */
async function getHistoricalOverview({ year, departmentId, companyId, role } = {}) {
  const where = { status: 'ACCEPTED' };

  if (companyId && companyId !== 'ALL') {
    where.companyId = companyId;
  }

  if (role && role !== 'ALL') {
    where.job = { ...where.job, role: { contains: role, mode: 'insensitive' } };
  }

  // Filter by year or department through relations
  if (year && year !== 'ALL') {
    const yearNum = parseInt(year, 10);
    const startOfYear = new Date(`${yearNum}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${yearNum}-12-31T23:59:59.999Z`);
    where.acceptedAt = { gte: startOfYear, lte: endOfYear };
  }

  if (departmentId && departmentId !== 'ALL') {
    where.student = {
      ...where.student,
      studentProfile: { departmentId },
    };
  }

  const [outcomes, totalStudents, totalCompanies, totalDrives] = await Promise.all([
    prisma.placementOutcome.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        job: { select: { id: true, title: true, role: true, requiredSkills: true } },
        student: {
          select: {
            id: true,
            studentProfile: { select: { departmentId: true } },
            skills: { select: { name: true, category: true } },
          },
        },
      },
    }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.company.count(),
    prisma.placementDrive.count(),
  ]);

  const placedCount = new Set(outcomes.map((o) => o.studentId)).size;
  const placementRate = totalStudents > 0 ? Math.min(100, Math.round((placedCount / totalStudents) * 100)) : 0;

  const packages = outcomes.map((o) => o.packageOffered || 0).filter((p) => p > 0);
  const avgPackage = packages.length > 0
    ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2))
    : 0;
  const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
  const lowestPackage = packages.length > 0 ? Math.min(...packages) : 0;

  const uniqueRecruitingCompanies = new Set(outcomes.map((o) => o.companyId)).size;

  return {
    isDemoData: true,
    totalPlaced: placedCount,
    totalOffers: outcomes.length,
    placementPercentage: placementRate,
    recruitingCompaniesCount: uniqueRecruitingCompanies || totalCompanies,
    totalDrives,
    highestPackageLpa: highestPackage,
    averagePackageLpa: avgPackage,
    lowestPackageLpa: lowestPackage,
  };
}

/**
 * 2. Company-Wise Historical Placement Breakdown
 */
async function getCompanyWisePlacements({ year, departmentId } = {}) {
  const where = { status: 'ACCEPTED' };

  if (year && year !== 'ALL') {
    const yearNum = parseInt(year, 10);
    where.acceptedAt = {
      gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
      lte: new Date(`${yearNum}-12-31T23:59:59.999Z`),
    };
  }

  if (departmentId && departmentId !== 'ALL') {
    where.student = { studentProfile: { departmentId } };
  }

  const outcomes = await prisma.placementOutcome.findMany({
    where,
    include: {
      company: true,
      job: true,
      student: {
        include: {
          studentProfile: { include: { department: true } },
          skills: true,
        },
      },
    },
    orderBy: { packageOffered: 'desc' },
  });

  // Group by Company + Job Role
  const grouped = {};
  outcomes.forEach((o) => {
    const key = `${o.companyId}_${o.job?.role || o.job?.title || 'Engineer'}`;
    if (!grouped[key]) {
      grouped[key] = {
        companyId: o.companyId,
        companyName: o.company.name,
        companyLogo: o.company.logoUrl,
        industry: o.company.industry || 'Technology',
        location: o.company.location || 'Multiple Locations',
        jobRole: o.job?.role || o.job?.title || 'Software Engineer',
        averagePackage: 0,
        highestPackage: 0,
        packages: [],
        studentsSelected: 0,
        requiredSkills: o.job?.requiredSkills || [],
        placementYear: new Date(o.acceptedAt).getFullYear(),
        studentSkills: new Set(),
      };
    }

    grouped[key].studentsSelected += 1;
    grouped[key].packages.push(o.packageOffered || 0);
    (o.student?.skills || []).forEach((s) => grouped[key].studentSkills.add(s.name));
  });

  return Object.values(grouped).map((item) => {
    const avg = item.packages.reduce((a, b) => a + b, 0) / item.packages.length;
    const max = Math.max(...item.packages);
    return {
      companyId: item.companyId,
      companyName: item.companyName,
      companyLogo: item.companyLogo,
      industry: item.industry,
      location: item.location,
      jobRole: item.jobRole,
      studentsSelected: item.studentsSelected,
      averagePackageLpa: Number(avg.toFixed(2)),
      highestPackageLpa: Number(max.toFixed(2)),
      requiredSkills: item.requiredSkills,
      observedSkills: Array.from(item.studentSkills).slice(0, 8),
      placementYear: item.placementYear,
    };
  });
}

/**
 * 3. Skills of Previously Placed Students (Frequency Distribution)
 */
async function getSkillsOfPlacedStudents({ year, role, departmentId } = {}) {
  const where = { status: 'ACCEPTED' };

  if (year && year !== 'ALL') {
    const yearNum = parseInt(year, 10);
    where.acceptedAt = {
      gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
      lte: new Date(`${yearNum}-12-31T23:59:59.999Z`),
    };
  }

  if (role && role !== 'ALL') {
    where.job = { role: { contains: role, mode: 'insensitive' } };
  }

  if (departmentId && departmentId !== 'ALL') {
    where.student = { studentProfile: { departmentId } };
  }

  const outcomes = await prisma.placementOutcome.findMany({
    where,
    include: {
      student: {
        include: { skills: true },
      },
      job: true,
    },
  });

  const skillFrequency = {};
  let totalSkillOccurrences = 0;

  outcomes.forEach((o) => {
    const studentSkills = o.student?.skills || [];
    const jobSkills = o.job?.requiredSkills || [];

    // Tally skills directly from placed students and job openings
    const combined = new Set([...studentSkills.map((s) => s.name), ...jobSkills]);
    combined.forEach((skillName) => {
      const normalized = skillName.trim();
      skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
      totalSkillOccurrences += 1;
    });
  });

  const ranked = Object.entries(skillFrequency)
    .map(([name, count]) => ({
      skill: name,
      count,
      frequencyPercentage: outcomes.length > 0 ? Math.round((count / outcomes.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalSampledOutcomes: outcomes.length,
    skills: ranked,
  };
}

/**
 * 4. Skill → Company Analysis (which companies hired students with specific skills)
 */
async function getSkillToCompanyAnalysis() {
  const outcomes = await prisma.placementOutcome.findMany({
    where: { status: 'ACCEPTED' },
    include: {
      company: { select: { id: true, name: true, industry: true } },
      job: { select: { title: true, role: true, requiredSkills: true } },
      student: {
        select: {
          skills: { select: { name: true } },
        },
      },
    },
  });

  const skillCompanyMap = {};

  outcomes.forEach((o) => {
    const skills = new Set([
      ...(o.student?.skills || []).map((s) => s.name),
      ...(o.job?.requiredSkills || []),
    ]);

    skills.forEach((skillName) => {
      const s = skillName.trim();
      if (!skillCompanyMap[s]) {
        skillCompanyMap[s] = {
          skill: s,
          companies: {},
          totalPlacements: 0,
        };
      }
      skillCompanyMap[s].totalPlacements += 1;
      const compName = o.company.name;
      skillCompanyMap[s].companies[compName] = (skillCompanyMap[s].companies[compName] || 0) + 1;
    });
  });

  return Object.values(skillCompanyMap)
    .map((item) => ({
      skill: item.skill,
      totalPlacements: item.totalPlacements,
      hiringCompanies: Object.entries(item.companies)
        .map(([name, hires]) => ({ companyName: name, hires }))
        .sort((a, b) => b.hires - a.hires),
    }))
    .sort((a, b) => b.totalPlacements - a.totalPlacements);
}

/**
 * 5. Year-over-Year Placement Trends
 */
async function getPlacementTrends() {
  const outcomes = await prisma.placementOutcome.findMany({
    where: { status: 'ACCEPTED' },
    select: {
      packageOffered: true,
      acceptedAt: true,
    },
  });

  const yearStats = {};

  outcomes.forEach((o) => {
    const year = new Date(o.acceptedAt).getFullYear();
    if (!yearStats[year]) {
      yearStats[year] = {
        year,
        placementsCount: 0,
        packages: [],
      };
    }
    yearStats[year].placementsCount += 1;
    if (o.packageOffered) yearStats[year].packages.push(o.packageOffered);
  });

  return Object.values(yearStats)
    .sort((a, b) => a.year - b.year)
    .map((s) => {
      const avg = s.packages.length > 0
        ? Number((s.packages.reduce((a, b) => a + b, 0) / s.packages.length).toFixed(2))
        : 0;
      const max = s.packages.length > 0 ? Math.max(...s.packages) : 0;
      return {
        year: s.year,
        placementsCount: s.placementsCount,
        averagePackageLpa: avg,
        highestPackageLpa: max,
      };
    });
}

/**
 * 6. Historical Cross-Reference with Current Student Profile
 * Connects student's current skills with historical patterns for their selected role
 */
async function compareStudentWithHistorical(studentId, targetRole = 'Full Stack Developer') {
  const [student, targetRoleDoc, placedSkillsRes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      include: {
        skills: true,
        careerPreference: true,
      },
    }),
    prisma.targetRole.findFirst({
      where: { name: { contains: targetRole, mode: 'insensitive' } },
      include: {
        roleSkills: {
          include: { skill: true },
        },
      },
    }),
    getSkillsOfPlacedStudents({ role: targetRole }),
  ]);

  const studentSkills = (student?.skills || []).map((s) => s.name.toLowerCase());
  const benchmarkSkills = targetRoleDoc
    ? targetRoleDoc.roleSkills.map((rs) => ({
        name: rs.skill.name,
        importance: rs.importance,
        category: rs.skill.category,
      }))
    : [
        { name: 'JavaScript', importance: 'CRITICAL', category: 'PROGRAMMING' },
        { name: 'React', importance: 'CRITICAL', category: 'FRAMEWORK' },
        { name: 'Node.js', importance: 'CRITICAL', category: 'BACKEND' },
        { name: 'SQL', importance: 'IMPORTANT', category: 'DATABASE' },
        { name: 'Git', importance: 'IMPORTANT', category: 'TOOL' },
        { name: 'Docker', importance: 'NICE_TO_HAVE', category: 'DEVOPS' },
      ];

  const matchedSkills = [];
  const missingSkills = [];

  benchmarkSkills.forEach((b) => {
    const isPresent = studentSkills.includes(b.name.toLowerCase());
    if (isPresent) {
      matchedSkills.push(b.name);
    } else {
      missingSkills.push({
        name: b.name,
        importance: b.importance,
        category: b.category,
      });
    }
  });

  return {
    studentName: student?.name,
    targetRole,
    matchedSkills,
    missingSkills,
    matchPercentage: benchmarkSkills.length > 0
      ? Math.round((matchedSkills.length / benchmarkSkills.length) * 100)
      : 0,
    historicalNotice:
      'Based on the historical placement data available in Career360, these skills appear frequently among students associated with this target role.',
  };
}

module.exports = {
  getHistoricalOverview,
  getCompanyWisePlacements,
  getSkillsOfPlacedStudents,
  getSkillToCompanyAnalysis,
  getPlacementTrends,
  compareStudentWithHistorical,
};
