/**
 * Career360 — Academic Service (Phase 3)
 * Business logic for semesters, subjects, grades, SGPA/CGPA calculation, and insights
 */

const { prisma } = require('../config/database');
const AppError   = require('../utils/AppError');

// Grade point map
const GRADE_POINTS = {
  'O':  10,
  'A+': 9,
  'A':  8,
  'B+': 7,
  'B':  6,
  'C':  5,
  'P':  4,
  'F':  0,
};

// ─── Recalculate Semester SGPA ────────────────────────────────────────────────
async function recalculateSemesterSGPA(semesterId) {
  const records = await prisma.studentSubjectRecord.findMany({
    where: { semesterId },
    include: { subject: true },
  });

  if (records.length === 0) {
    return prisma.academicSemester.update({
      where: { id: semesterId },
      data: { sgpa: null, totalCredits: 0 },
    });
  }

  let totalCreditPoints = 0;
  let totalCredits = 0;

  for (const r of records) {
    const credits = r.subject?.credits || 3;
    totalCredits += credits;

    const gradeKey = r.grade ? r.grade.toUpperCase().trim() : null;
    const gradePoint = gradeKey && GRADE_POINTS[gradeKey] != null ? GRADE_POINTS[gradeKey] : 0;
    totalCreditPoints += gradePoint * credits;
  }

  const sgpa = totalCredits > 0 ? parseFloat((totalCreditPoints / totalCredits).toFixed(2)) : 0;

  return prisma.academicSemester.update({
    where: { id: semesterId },
    data: { sgpa, totalCredits },
  });
}

// ─── Recalculate Student Overall CGPA & Backlogs ──────────────────────────────
async function recalculateStudentOverall(userId) {
  const semesters = await prisma.academicSemester.findMany({
    where: { userId },
    orderBy: { semesterNumber: 'asc' },
  });

  let totalCreditPoints = 0;
  let totalCredits = 0;
  let latestSgpa = null;

  for (const sem of semesters) {
    if (sem.sgpa != null && sem.totalCredits > 0) {
      totalCreditPoints += sem.sgpa * sem.totalCredits;
      totalCredits += sem.totalCredits;
      latestSgpa = sem.sgpa;
    }
  }

  const cgpa = totalCredits > 0 ? parseFloat((totalCreditPoints / totalCredits).toFixed(2)) : null;

  // Calculate active and total backlogs
  const allRecords = await prisma.studentSubjectRecord.findMany({
    where: { userId },
  });

  const totalBacklogs = allRecords.filter(r => r.isBacklog || (r.grade && r.grade.toUpperCase() === 'F')).length;
  const activeBacklogs = allRecords.filter(r => (r.isBacklog || (r.grade && r.grade.toUpperCase() === 'F')) && !r.clearedAt).length;

  // Update student profile cache
  await prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      cgpa,
      latestSgpa,
      totalBacklogs,
      activeBacklogs,
    },
    update: {
      cgpa,
      latestSgpa,
      totalBacklogs,
      activeBacklogs,
    },
  });

  return { cgpa, latestSgpa, totalBacklogs, activeBacklogs };
}

// ─── Semesters CRUD ───────────────────────────────────────────────────────────
async function getSemesters(userId) {
  return prisma.academicSemester.findMany({
    where: { userId },
    orderBy: { semesterNumber: 'asc' },
    include: {
      _count: { select: { subjectRecords: true } },
    },
  });
}

async function upsertSemester(userId, data) {
  const { semesterNumber, academicYear, sgpa, totalCredits } = data;

  const semester = await prisma.academicSemester.upsert({
    where: {
      userId_semesterNumber: { userId, semesterNumber },
    },
    create: {
      userId,
      semesterNumber,
      academicYear,
      sgpa: sgpa ?? null,
      totalCredits: totalCredits ?? 0,
    },
    update: {
      academicYear,
      sgpa: sgpa !== undefined ? sgpa : undefined,
      totalCredits: totalCredits !== undefined ? totalCredits : undefined,
    },
  });

  await recalculateStudentOverall(userId);
  return semester;
}

async function deleteSemester(userId, semesterId) {
  const sem = await prisma.academicSemester.findFirst({
    where: { id: semesterId, userId },
  });
  if (!sem) throw AppError.notFound('Semester record not found.');

  await prisma.academicSemester.delete({ where: { id: semesterId } });
  await recalculateStudentOverall(userId);
  return true;
}

// ─── Subjects Reference ───────────────────────────────────────────────────────
async function getSubjects(departmentId) {
  const where = departmentId ? { departmentId } : {};
  return prisma.subject.findMany({
    where,
    orderBy: { code: 'asc' },
    include: { department: true },
  });
}

async function createSubject(data) {
  try {
    return await prisma.subject.create({ data });
  } catch (e) {
    if (e.code === 'P2002') {
      throw AppError.conflict(`Subject code "${data.code}" already exists.`);
    }
    throw e;
  }
}

// ─── Semester Details & Records ───────────────────────────────────────────────
async function getSemesterDetails(userId, semesterId) {
  const semester = await prisma.academicSemester.findFirst({
    where: { id: semesterId, userId },
    include: {
      subjectRecords: {
        include: { subject: true },
        orderBy: { subject: { code: 'asc' } },
      },
    },
  });

  if (!semester) throw AppError.notFound('Semester record not found.');
  return semester;
}

async function upsertSubjectRecord(userId, data) {
  const { semesterId, subjectId, marksObtained, maxMarks, grade, attendance, isBacklog, clearedAt } = data;

  const sem = await prisma.academicSemester.findFirst({
    where: { id: semesterId, userId },
  });
  if (!sem) throw AppError.notFound('Semester not found.');

  const isFGrade = grade && grade.toUpperCase().trim() === 'F';
  const backlogFlag = isBacklog || isFGrade;

  const record = await prisma.studentSubjectRecord.upsert({
    where: {
      userId_semesterId_subjectId: {
        userId,
        semesterId,
        subjectId,
      },
    },
    create: {
      userId,
      semesterId,
      subjectId,
      marksObtained: marksObtained ?? null,
      maxMarks: maxMarks ?? 100,
      grade: grade ? grade.toUpperCase().trim() : null,
      attendance: attendance ?? null,
      isBacklog: backlogFlag,
      clearedAt: clearedAt ? new Date(clearedAt) : null,
    },
    update: {
      marksObtained: marksObtained !== undefined ? marksObtained : undefined,
      maxMarks: maxMarks !== undefined ? maxMarks : undefined,
      grade: grade !== undefined ? (grade ? grade.toUpperCase().trim() : null) : undefined,
      attendance: attendance !== undefined ? attendance : undefined,
      isBacklog: backlogFlag,
      clearedAt: clearedAt !== undefined ? (clearedAt ? new Date(clearedAt) : null) : undefined,
    },
    include: { subject: true },
  });

  // Automatically recalculate SGPA and CGPA
  await recalculateSemesterSGPA(semesterId);
  await recalculateStudentOverall(userId);

  return record;
}

async function deleteSubjectRecord(userId, recordId) {
  const record = await prisma.studentSubjectRecord.findFirst({
    where: { id: recordId, userId },
  });
  if (!record) throw AppError.notFound('Subject record not found.');

  await prisma.studentSubjectRecord.delete({ where: { id: recordId } });
  await recalculateSemesterSGPA(record.semesterId);
  await recalculateStudentOverall(userId);
  return true;
}

// ─── Academic Summary & Insights ──────────────────────────────────────────────
async function getAcademicSummary(userId) {
  const [profile, semesters, records] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId },
      include: { department: true, batch: true },
    }),
    prisma.academicSemester.findMany({
      where: { userId },
      orderBy: { semesterNumber: 'asc' },
    }),
    prisma.studentSubjectRecord.findMany({
      where: { userId },
      include: { subject: true, semester: true },
    }),
  ]);

  // Overall attendance calculation
  let totalAttendanceSum = 0;
  let attendanceCount = 0;
  const lowAttendanceList = [];

  for (const r of records) {
    if (r.attendance != null) {
      totalAttendanceSum += r.attendance;
      attendanceCount++;
      if (r.attendance < 75) {
        lowAttendanceList.push({
          subjectCode: r.subject.code,
          subjectName: r.subject.name,
          attendance: r.attendance,
          semesterNumber: r.semester.semesterNumber,
        });
      }
    }
  }

  const overallAttendance = attendanceCount > 0
    ? parseFloat((totalAttendanceSum / attendanceCount).toFixed(1))
    : null;

  // SGPA trend line
  const sgpaTrend = semesters.map(s => ({
    semesterNumber: s.semesterNumber,
    academicYear: s.academicYear,
    sgpa: s.sgpa,
    totalCredits: s.totalCredits,
  }));

  // Backlogs
  const activeBacklogRecords = records.filter(r => (r.isBacklog || r.grade === 'F') && !r.clearedAt);

  // Generate actionable insights
  const insights = [];
  if (overallAttendance != null && overallAttendance < 75) {
    insights.push({
      type: 'WARNING',
      message: `Your aggregate attendance is ${overallAttendance}%, which is below the mandatory 75% placement eligibility threshold.`,
    });
  } else if (overallAttendance != null && overallAttendance >= 85) {
    insights.push({
      type: 'SUCCESS',
      message: `Excellent attendance record (${overallAttendance}%). You satisfy campus placement attendance prerequisites.`,
    });
  }

  if (activeBacklogRecords.length > 0) {
    insights.push({
      type: 'DANGER',
      message: `You currently have ${activeBacklogRecords.length} active backlog(s). Most Tier-1 companies require zero active backlogs at the time of drive.`,
    });
  } else {
    insights.push({
      type: 'SUCCESS',
      message: 'Zero active backlogs — Eligible for all company academic criteria.',
    });
  }

  if (profile?.cgpa != null) {
    if (profile.cgpa >= 8.5) {
      insights.push({
        type: 'SUCCESS',
        message: `Distinction grade CGPA (${profile.cgpa.toFixed(2)}/10.0). Qualifies for premier high-package recruitment tracks.`,
      });
    } else if (profile.cgpa >= 7.0) {
      insights.push({
        type: 'INFO',
        message: `Good CGPA standing (${profile.cgpa.toFixed(2)}/10.0). Meets criteria for 85%+ of recruiting organizations.`,
      });
    } else {
      insights.push({
        type: 'WARNING',
        message: `Current CGPA is ${profile.cgpa.toFixed(2)}. Aim to raise above 7.0 to unlock broader company drive eligibility.`,
      });
    }
  }

  return {
    cgpa: profile?.cgpa ?? null,
    latestSgpa: profile?.latestSgpa ?? null,
    activeBacklogs: activeBacklogRecords.length,
    totalBacklogs: profile?.totalBacklogs ?? 0,
    overallAttendance,
    totalCreditsEarned: semesters.reduce((acc, s) => acc + (s.totalCredits || 0), 0),
    sgpaTrend,
    lowAttendanceSubjects: lowAttendanceList,
    insights,
    activeBacklogRecords: activeBacklogRecords.map(r => ({
      id: r.id,
      code: r.subject.code,
      name: r.subject.name,
      semesterNumber: r.semester.semesterNumber,
      grade: r.grade,
    })),
  };
}

module.exports = {
  getSemesters,
  upsertSemester,
  deleteSemester,
  getSubjects,
  createSubject,
  getSemesterDetails,
  upsertSubjectRecord,
  deleteSubjectRecord,
  getAcademicSummary,
};
