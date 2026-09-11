/**
 * Career360 — Placement Service (Phase 4)
 * Comprehensive logic for companies, jobs, placement drives,
 * eligibility rule evaluations, student applications, and selection rounds.
 */

const { prisma } = require('../config/database');
const AppError   = require('../utils/AppError');

// ─── Companies ────────────────────────────────────────────────────────────────
async function getCompanies() {
  return prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { jobs: true, drives: true, outcomes: true } },
    },
  });
}

async function getCompanyDetails(id) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: true,
      drives: {
        include: { job: true, eligibilityRule: true },
        orderBy: { openDate: 'desc' },
      },
      outcomes: {
        include: { student: { select: { name: true } }, job: true },
      },
    },
  });
  if (!company) throw AppError.notFound('Company not found.');
  return company;
}

async function createCompany(data) {
  try {
    return await prisma.company.create({ data });
  } catch (e) {
    if (e.code === 'P2002') throw AppError.conflict(`Company "${data.name}" already exists.`);
    throw e;
  }
}

// ─── Job Openings ─────────────────────────────────────────────────────────────
async function getJobs(companyId) {
  const where = companyId ? { companyId } : {};
  return prisma.jobOpening.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { company: true },
  });
}

async function createJob(data) {
  return prisma.jobOpening.create({
    data,
    include: { company: true },
  });
}

// ─── Eligibility Engine ───────────────────────────────────────────────────────
async function evaluateEligibility(studentId, eligibilityRule) {
  if (!eligibilityRule) {
    return { isEligible: true, reasons: [], checks: [] };
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: { department: true, batch: true },
  });

  const reasons = [];
  const checks  = [];

  // 1. CGPA check
  const cgpa = profile?.cgpa ?? 0;
  const cgpaPassed = cgpa >= eligibilityRule.minCgpa;
  checks.push({
    name: 'Minimum CGPA',
    required: `${eligibilityRule.minCgpa} CGPA`,
    actual: `${cgpa.toFixed(2)} CGPA`,
    passed: cgpaPassed,
  });
  if (!cgpaPassed) {
    reasons.push(`Minimum CGPA of ${eligibilityRule.minCgpa} required (Your CGPA is ${cgpa.toFixed(2)})`);
  }

  // 2. Active Backlogs check
  const activeBacklogs = profile?.activeBacklogs ?? 0;
  const backlogsPassed = activeBacklogs <= eligibilityRule.maxActiveBacklogs;
  checks.push({
    name: 'Active Backlogs',
    required: `Max ${eligibilityRule.maxActiveBacklogs}`,
    actual: `${activeBacklogs} active`,
    passed: backlogsPassed,
  });
  if (!backlogsPassed) {
    reasons.push(`Maximum ${eligibilityRule.maxActiveBacklogs} active backlogs allowed (You currently have ${activeBacklogs})`);
  }

  // 3. Department check
  if (eligibilityRule.departments && eligibilityRule.departments.length > 0) {
    const deptCode = profile?.department?.code;
    const deptPassed = deptCode && eligibilityRule.departments.includes(deptCode);
    checks.push({
      name: 'Eligible Departments',
      required: eligibilityRule.departments.join(', '),
      actual: deptCode || 'Not Assigned',
      passed: deptPassed,
    });
    if (!deptPassed) {
      reasons.push(`Drive is restricted to [${eligibilityRule.departments.join(', ')}] department(s)`);
    }
  }

  // 4. Batch / Graduation Year check
  if (eligibilityRule.allowedGraduationYears && eligibilityRule.allowedGraduationYears.length > 0) {
    const gradYear = profile?.batch?.year;
    const batchPassed = gradYear && eligibilityRule.allowedGraduationYears.includes(gradYear);
    checks.push({
      name: 'Graduation Cohort',
      required: eligibilityRule.allowedGraduationYears.join(', '),
      actual: gradYear ? String(gradYear) : 'Not Assigned',
      passed: batchPassed,
    });
    if (!batchPassed) {
      reasons.push(`Only graduation batches [${eligibilityRule.allowedGraduationYears.join(', ')}] are eligible`);
    }
  }

  const isEligible = reasons.length === 0;
  return { isEligible, reasons, checks };
}

// ─── Placement Drives ─────────────────────────────────────────────────────────
async function getDrives(userId, role) {
  const drives = await prisma.placementDrive.findMany({
    orderBy: [{ status: 'asc' }, { openDate: 'desc' }],
    include: {
      company: true,
      job: true,
      eligibilityRule: true,
      _count: { select: { applications: true } },
    },
  });

  // If student, compute eligibility and application status for each drive
  if (role === 'STUDENT' && userId) {
    const studentApps = await prisma.application.findMany({
      where: { studentId: userId },
      select: { driveId: true, status: true, id: true },
    });
    const appMap = new Map(studentApps.map(a => [a.driveId, a]));

    const enrichedDrives = await Promise.all(
      drives.map(async (drive) => {
        const evalResult = await evaluateEligibility(userId, drive.eligibilityRule);
        const userApp = appMap.get(drive.id) || null;
        return {
          ...drive,
          isEligible: evalResult.isEligible,
          eligibilityReasons: evalResult.reasons,
          hasApplied: !!userApp,
          applicationStatus: userApp?.status || null,
          applicationId: userApp?.id || null,
        };
      })
    );
    return enrichedDrives;
  }

  return drives;
}

async function getDriveDetails(driveId, userId, role) {
  const drive = await prisma.placementDrive.findUnique({
    where: { id: driveId },
    include: {
      company: true,
      job: true,
      eligibilityRule: true,
      _count: { select: { applications: true } },
    },
  });

  if (!drive) throw AppError.notFound('Placement drive not found.');

  let studentEvaluation = null;
  let application = null;

  if (userId) {
    studentEvaluation = await evaluateEligibility(userId, drive.eligibilityRule);
    application = await prisma.application.findUnique({
      where: { studentId_driveId: { studentId: userId, driveId } },
      include: { selectionRounds: { orderBy: { roundNumber: 'asc' } } },
    });
  }

  return {
    drive,
    studentEvaluation,
    application,
  };
}

async function createDrive(data) {
  const { eligibility, ...driveData } = data;

  const drive = await prisma.placementDrive.create({
    data: {
      ...driveData,
      openDate: new Date(driveData.openDate),
      deadline: new Date(driveData.deadline),
      eligibilityRule: eligibility ? { create: eligibility } : undefined,
    },
    include: { company: true, job: true, eligibilityRule: true },
  });

  return drive;
}

// ─── Applications ─────────────────────────────────────────────────────────────
async function applyForDrive(studentId, data) {
  const { driveId, resumeUrl, notes } = data;

  const drive = await prisma.placementDrive.findUnique({
    where: { id: driveId },
    include: { eligibilityRule: true },
  });
  if (!drive) throw AppError.notFound('Drive not found.');

  if (drive.status !== 'ACTIVE') {
    throw AppError.badRequest('This placement drive is currently not accepting applications.');
  }

  const now = new Date();
  if (now > new Date(drive.deadline)) {
    throw AppError.badRequest('The deadline to apply for this placement drive has passed.');
  }

  // Check eligibility
  const evalResult = await evaluateEligibility(studentId, drive.eligibilityRule);
  if (!evalResult.isEligible) {
    throw AppError.badRequest(`You are not eligible for this drive: ${evalResult.reasons.join('; ')}`);
  }

  try {
    return await prisma.application.create({
      data: {
        studentId,
        driveId,
        resumeUrl: resumeUrl?.trim() || undefined,
        notes: notes?.trim() || undefined,
        status: 'APPLIED',
      },
      include: {
        drive: { include: { company: true, job: true } },
      },
    });
  } catch (e) {
    if (e.code === 'P2002') {
      throw AppError.conflict('You have already submitted an application for this drive.');
    }
    throw e;
  }
}

async function getStudentApplications(studentId) {
  return prisma.application.findMany({
    where: { studentId },
    orderBy: { appliedAt: 'desc' },
    include: {
      drive: {
        include: { company: true, job: true },
      },
      selectionRounds: {
        orderBy: { roundNumber: 'asc' },
      },
    },
  });
}

async function getDriveApplications(driveId) {
  return prisma.application.findMany({
    where: { driveId },
    orderBy: { appliedAt: 'asc' },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: {
            include: { department: true, batch: true },
          },
        },
      },
      selectionRounds: true,
    },
  });
}

async function getAllApplications(query = {}) {
  const { driveId, status, search } = query;
  const where = {};

  if (driveId) where.driveId = driveId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { student: { name: { contains: search, mode: 'insensitive' } } },
      { student: { email: { contains: search, mode: 'insensitive' } } },
      { drive: { company: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  return prisma.application.findMany({
    where,
    orderBy: { appliedAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: {
            include: { department: true, batch: true },
          },
        },
      },
      drive: {
        include: {
          company: true,
          job: true,
          eligibilityRule: true,
        },
      },
      selectionRounds: {
        orderBy: { roundNumber: 'asc' },
      },
    },
  });
}

async function updateApplicationStatus(applicationId, status, notes) {
  return prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      notes: notes !== undefined ? notes : undefined,
    },
    include: { drive: { include: { company: true, job: true } } },
  });
}

// ─── Selection Rounds ─────────────────────────────────────────────────────────
async function scheduleRound(data) {
  return prisma.selectionRound.create({
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });
}

async function updateRoundStatus(roundId, data) {
  return prisma.selectionRound.update({
    where: { id: roundId },
    data: {
      status: data.status,
      feedback: data.feedback !== undefined ? data.feedback : undefined,
    },
  });
}

// ─── Placement Outcomes ───────────────────────────────────────────────────────
async function getPlacementOutcomes(userId, role) {
  const where = role === 'STUDENT' ? { studentId: userId } : {};
  return prisma.placementOutcome.findMany({
    where,
    orderBy: { acceptedAt: 'desc' },
    include: {
      student: { select: { id: true, name: true, email: true } },
      company: true,
      job: true,
    },
  });
}

async function recordOutcome(data) {
  return prisma.placementOutcome.create({
    data: {
      ...data,
      acceptedAt: new Date(),
    },
    include: { company: true, job: true, student: { select: { name: true } } },
  });
}

module.exports = {
  getCompanies,
  getCompanyDetails,
  createCompany,
  getJobs,
  createJob,
  getDrives,
  getDriveDetails,
  createDrive,
  evaluateEligibility,
  applyForDrive,
  getStudentApplications,
  getDriveApplications,
  getAllApplications,
  updateApplicationStatus,
  scheduleRound,
  updateRoundStatus,
  getPlacementOutcomes,
  recordOutcome,
};
