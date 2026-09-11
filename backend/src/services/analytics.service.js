/**
 * Career360 — Analytics Service (Phase 5)
 * Aggregations and intelligence metrics for Admin, Coordinator, and Faculty dashboards.
 */

const { prisma } = require('../config/database');

// ─── Overview Stats (Admin / Platform) ─────────────────────────────────────────
async function getOverviewStats() {
  const [
    totalUsers,
    roleCounts,
    activeDrivesCount,
    totalApplications,
    outcomes,
    departmentsCount,
    studentProfiles,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    }),
    prisma.placementDrive.count({ where: { status: 'ACTIVE' } }),
    prisma.application.count(),
    prisma.placementOutcome.findMany({
      select: { packageOffered: true, status: true, studentId: true },
    }),
    prisma.department.count(),
    prisma.studentProfile.findMany({
      select: { cgpa: true, activeBacklogs: true },
    }),
  ]);

  const rolesMap = {
    STUDENT: 0,
    FACULTY: 0,
    PLACEMENT_COORDINATOR: 0,
    ADMIN: 0,
  };
  roleCounts.forEach((r) => {
    rolesMap[r.role] = r._count.id;
  });

  const totalOffers = outcomes.length;
  const avgPackage = totalOffers > 0
    ? (outcomes.reduce((acc, o) => acc + o.packageOffered, 0) / totalOffers).toFixed(2)
    : 0;

  const validCgpas = studentProfiles.filter(p => p.cgpa !== null && p.cgpa !== undefined).map(p => p.cgpa);
  const avgCgpa = validCgpas.length > 0
    ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2)
    : 0;

  const placedStudentsCount = new Set(outcomes.map(o => o.studentId)).size;
  const placementRate = rolesMap.STUDENT > 0
    ? Math.round((placedStudentsCount / rolesMap.STUDENT) * 100)
    : 0;

  return {
    totalUsers,
    roles: rolesMap,
    activeDrivesCount,
    totalApplications,
    totalOffers,
    avgPackage: Number(avgPackage),
    departmentsCount,
    avgCgpa: Number(avgCgpa),
    placementRate,
  };
}

// ─── Placement Analytics (Placement Coordinator & Admin) ───────────────────────
async function getPlacementAnalytics() {
  const [
    drivesByStatus,
    appsByStatus,
    companies,
    outcomes,
    recentApplications,
    totalJobs,
  ] = await Promise.all([
    prisma.placementDrive.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.company.findMany({
      include: {
        _count: { select: { jobs: true, drives: true, outcomes: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.placementOutcome.findMany({
      include: {
        company: { select: { name: true } },
        job: { select: { title: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { acceptedAt: 'desc' },
    }),
    prisma.application.findMany({
      take: 8,
      orderBy: { appliedAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        drive: {
          include: {
            company: { select: { name: true } },
            job: { select: { title: true } },
          },
        },
      },
    }),
    prisma.jobOpening.count(),
  ]);

  const driveStatusMap = { ACTIVE: 0, UPCOMING: 0, COMPLETED: 0, CANCELLED: 0 };
  drivesByStatus.forEach((d) => {
    driveStatusMap[d.status] = d._count.id;
  });

  const funnel = {
    APPLIED: 0,
    SHORTLISTED: 0,
    INTERVIEW_SCHEDULED: 0,
    OFFERED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    DECLINED: 0,
  };
  appsByStatus.forEach((a) => {
    funnel[a.status] = a._count.id;
  });

  const packages = outcomes.map(o => o.packageOffered);
  const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
  const lowestPackage = packages.length > 0 ? Math.min(...packages) : 0;
  const avgPackage = packages.length > 0
    ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)
    : 0;

  const totalApplications = Object.values(funnel).reduce((a, b) => a + b, 0);

  return {
    totalCompanies: companies.length,
    totalJobs,
    totalApplications,
    drivesByStatus: driveStatusMap,
    funnel,
    salaryStats: {
      highest: highestPackage,
      lowest: lowestPackage,
      average: Number(avgPackage),
    },
    companies,
    outcomes,
    recentApplications,
  };
}

// ─── Faculty Academic Monitoring & Early Warning ──────────────────────────────
async function getFacultyAnalytics(departmentId) {
  const whereProfile = departmentId ? { departmentId } : {};

  const [students, subjectRecords, departments] = await Promise.all([
    prisma.studentProfile.findMany({
      where: whereProfile,
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        department: true,
        batch: true,
      },
      orderBy: { cgpa: 'desc' },
    }),
    prisma.studentSubjectRecord.findMany({
      include: {
        subject: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.department.findMany({
      include: {
        _count: { select: { studentProfiles: true, subjects: true } },
      },
    }),
  ]);

  // Scholastic CGPA Tiers
  const tiers = {
    distinction: 0, // >= 8.5
    firstClass:  0, // 7.0 - 8.49
    secondClass: 0, // 6.0 - 6.99
    atRisk:       0, // < 6.0
  };

  const atRiskStudents = [];

  students.forEach((s) => {
    const cgpa = s.cgpa ?? 0;
    const backlogs = s.activeBacklogs ?? 0;

    if (cgpa >= 8.5) tiers.distinction++;
    else if (cgpa >= 7.0) tiers.firstClass++;
    else if (cgpa >= 6.0) tiers.secondClass++;
    else tiers.atRisk++;

    // Check individual student subject records for low attendance
    const studentRecords = subjectRecords.filter(r => r.userId === s.userId);
    const avgAttendance = studentRecords.length > 0
      ? studentRecords.reduce((acc, r) => acc + (r.attendance || 0), 0) / studentRecords.length
      : null;

    const reasons = [];
    if (avgAttendance !== null && avgAttendance < 75) {
      reasons.push(`Low Attendance: ${avgAttendance.toFixed(1)}% (< 75%)`);
    }
    if (cgpa < 6.0) {
      reasons.push(`Low CGPA: ${cgpa.toFixed(2)} (< 6.0)`);
    }
    if (backlogs > 0) {
      reasons.push(`${backlogs} Active Backlog(s)`);
    }

    if (reasons.length > 0) {
      atRiskStudents.push({
        id: s.id,
        userId: s.userId,
        name: s.user.name,
        email: s.user.email,
        rollNumber: s.rollNumber || 'N/A',
        department: s.department?.name || 'N/A',
        cgpa: s.cgpa,
        activeBacklogs: s.activeBacklogs,
        avgAttendance: avgAttendance ? Number(avgAttendance.toFixed(1)) : null,
        riskReasons: reasons,
        severity: reasons.length >= 2 ? 'HIGH' : 'MEDIUM',
      });
    }
  });

  // Calculate department averages
  const validCgpas = students.filter(s => s.cgpa !== null).map(s => s.cgpa);
  const classAvgCgpa = validCgpas.length > 0
    ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2)
    : 0;

  const attendances = subjectRecords.filter(r => r.attendance !== null).map(r => r.attendance);
  const avgAttendance = attendances.length > 0
    ? (attendances.reduce((a, b) => a + b, 0) / attendances.length).toFixed(1)
    : 0;

  return {
    totalStudents: students.length,
    classAvgCgpa: Number(classAvgCgpa),
    avgAttendance: Number(avgAttendance),
    tiers,
    atRiskCount: atRiskStudents.length,
    atRiskStudents,
    departments,
  };
}

// ─── Department Analytics ─────────────────────────────────────────────────────
async function getDepartmentAnalytics() {
  const departments = await prisma.department.findMany({
    include: {
      studentProfiles: { select: { cgpa: true, activeBacklogs: true } },
      batches: true,
      subjects: true,
    },
    orderBy: { name: 'asc' },
  });

  return departments.map((d) => {
    const validCgpas = d.studentProfiles.filter(s => s.cgpa !== null).map(s => s.cgpa);
    const avgCgpa = validCgpas.length > 0
      ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2)
      : 0;

    return {
      id: d.id,
      name: d.name,
      code: d.code,
      studentCount: d.studentProfiles.length,
      batchCount: d.batches.length,
      subjectCount: d.subjects.length,
      avgCgpa: Number(avgCgpa),
    };
  });
}

module.exports = {
  getOverviewStats,
  getPlacementAnalytics,
  getFacultyAnalytics,
  getDepartmentAnalytics,
};
