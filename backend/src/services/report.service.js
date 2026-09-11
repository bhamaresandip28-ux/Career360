/**
 * Career360 — Advanced Reporting Service (Phase 7)
 * Generates structured datasets for Student Placement CVs, Official Academic Transcripts,
 * Institutional Placement Metrics, and CSV exports.
 */

const { prisma } = require('../config/database');
const AppError   = require('../utils/AppError');

// ─── 1. Student Verified Placement CV Dataset ─────────────────────────────────

async function getStudentCVReport(studentId) {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: {
        include: {
          department: true,
          batch: true,
        },
      },
      skills: {
        orderBy: [{ proficiency: 'desc' }, { name: 'asc' }],
      },
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      internships: {
        orderBy: { startDate: 'desc' },
      },
      certifications: {
        orderBy: { issueDate: 'desc' },
      },
      achievements: {
        orderBy: { date: 'desc' },
      },
      professionalLinks: true,
      careerPreference: true,
    },
  });

  if (!user) {
    throw new AppError('Student not found.', 404, 'NOT_FOUND');
  }

  const p = user.studentProfile || {};

  return {
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: p.phone || 'Not specified',
      rollNumber: p.rollNumber || 'Not assigned',
      gender: p.gender,
      address: p.address,
      department: p.department?.name || 'General Engineering',
      departmentCode: p.department?.code || 'ENG',
      batch: p.batch ? `Class of ${p.batch.year}` : 'N/A',
      currentSemester: p.currentSemester || 'N/A',
      admissionYear: p.admissionYear || 'N/A',
    },
    academics: {
      cgpa: p.cgpa != null ? Number(p.cgpa.toFixed(2)) : null,
      latestSgpa: p.latestSgpa != null ? Number(p.latestSgpa.toFixed(2)) : null,
      activeBacklogs: p.activeBacklogs ?? 0,
      totalBacklogs: p.totalBacklogs ?? 0,
    },
    links: user.professionalLinks.map((l) => ({
      platform: l.platform,
      url: l.url,
    })),
    careerPreference: user.careerPreference
      ? {
          targetRole: user.careerPreference.targetRole,
          interests: user.careerPreference.careerInterests,
          goals: user.careerPreference.careerGoals,
        }
      : null,
    skills: user.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
    })),
    projects: user.projects.map((proj) => ({
      id: proj.id,
      title: proj.title,
      description: proj.description,
      techStack: proj.techStack,
      role: proj.role,
      githubUrl: proj.githubUrl,
      demoUrl: proj.demoUrl,
      category: proj.category,
    })),
    internships: user.internships.map((intern) => ({
      id: intern.id,
      company: intern.company,
      role: intern.role,
      startDate: intern.startDate,
      endDate: intern.endDate,
      isCurrent: intern.isCurrent,
      description: intern.description,
      techStack: intern.techStack,
      certificateUrl: intern.certificateUrl,
    })),
    certifications: user.certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuingOrg: cert.issuingOrg,
      issueDate: cert.issueDate,
      credentialId: cert.credentialId,
      verificationUrl: cert.verificationUrl,
    })),
    achievements: user.achievements.map((ach) => ({
      id: ach.id,
      title: ach.title,
      category: ach.category,
      date: ach.date,
      description: ach.description,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ─── 2. Official Academic Transcript Dataset ──────────────────────────────────

async function getAcademicTranscriptReport(studentId) {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: {
        include: { department: true, batch: true },
      },
      academicSemesters: {
        orderBy: { semesterNumber: 'asc' },
        include: {
          subjectRecords: {
            include: { subject: true },
            orderBy: { subject: { code: 'asc' } },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Student not found.', 404, 'NOT_FOUND');
  }

  const p = user.studentProfile || {};

  // Calculate cumulative credits and grades
  let totalCreditsEarned = 0;
  let totalCreditsAttempted = 0;

  const semesters = user.academicSemesters.map((sem) => {
    const subjects = sem.subjectRecords.map((r) => {
      const credits = r.subject?.credits || 3;
      totalCreditsAttempted += credits;
      if (r.grade !== 'F' && !r.isBacklog) {
        totalCreditsEarned += credits;
      }

      return {
        code: r.subject?.code || 'SUB',
        name: r.subject?.name || 'Subject Course',
        credits,
        marksObtained: r.marksObtained,
        maxMarks: r.maxMarks,
        grade: r.grade,
        attendance: r.attendance,
        isBacklog: r.isBacklog,
      };
    });

    return {
      id: sem.id,
      semesterNumber: sem.semesterNumber,
      academicYear: sem.academicYear,
      sgpa: sem.sgpa != null ? Number(sem.sgpa.toFixed(2)) : null,
      totalCredits: sem.totalCredits || 0,
      subjects,
    };
  });

  return {
    institution: {
      name: 'Career360 Institute of Technology',
      accreditation: 'NAAC A++ Accredited • Autonomous Campus',
      examinationOffice: 'Office of the Controller of Examinations',
    },
    student: {
      id: user.id,
      name: user.name,
      rollNumber: p.rollNumber || 'Not assigned',
      department: p.department?.name || 'Computer Science & Engineering',
      departmentCode: p.department?.code || 'CSE',
      batch: p.batch ? `Class of ${p.batch.year}` : 'N/A',
      admissionYear: p.admissionYear || 'N/A',
    },
    scholasticStanding: {
      cgpa: p.cgpa != null ? Number(p.cgpa.toFixed(2)) : null,
      totalCreditsEarned,
      totalCreditsAttempted,
      activeBacklogs: p.activeBacklogs ?? 0,
      totalBacklogs: p.totalBacklogs ?? 0,
      classification: p.cgpa >= 8.5 ? 'First Class with Distinction' : p.cgpa >= 7.0 ? 'First Class' : 'Pass Division',
    },
    semesters,
    generatedAt: new Date().toISOString(),
  };
}

// ─── 3. Institutional Placement Summary Report ────────────────────────────────

async function getPlacementSummaryReport() {
  const [
    totalStudents,
    placedOutcomes,
    totalDrives,
    totalApplications,
    departments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    prisma.placementOutcome.findMany({
      where: { status: 'ACCEPTED' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, industry: true, location: true } },
        job: { select: { title: true } },
      },
    }),
    prisma.placementDrive.count(),
    prisma.application.count(),
    prisma.department.findMany({
      include: {
        studentProfiles: {
          include: {
            user: {
              include: { placementOutcomes: { where: { status: 'ACCEPTED' } } },
            },
          },
        },
      },
    }),
  ]);

  const placedCount = new Set(placedOutcomes.map((o) => o.studentId)).size;
  const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

  const packages = placedOutcomes.map((o) => o.packageOffered || 0).filter((p) => p > 0);
  const avgCtc = packages.length > 0 ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)) : 0;
  const maxCtc = packages.length > 0 ? Math.max(...packages) : 0;
  const minCtc = packages.length > 0 ? Math.min(...packages) : 0;

  const departmentMetrics = departments.map((d) => {
    const studentsInDept = d.studentProfiles.length;
    const placedInDept = d.studentProfiles.filter((sp) => (sp.user?.placementOutcomes?.length || 0) > 0).length;
    return {
      id: d.id,
      name: d.name,
      code: d.code,
      totalStudents: studentsInDept,
      placedCount: placedInDept,
      placementRate: studentsInDept > 0 ? Math.round((placedInDept / studentsInDept) * 100) : 0,
    };
  });

  return {
    overview: {
      totalStudents,
      placedCount,
      unplacedCount: totalStudents - placedCount,
      placementRate,
      totalDrives,
      totalApplications,
      avgCtcLpa: avgCtc,
      highestCtcLpa: maxCtc,
      lowestCtcLpa: minCtc,
    },
    departmentMetrics,
    recentOffers: placedOutcomes.slice(0, 10).map((o) => ({
      studentName: o.student?.name,
      companyName: o.company?.name,
      jobTitle: o.job?.title,
      packageOffered: o.packageOffered,
      acceptedAt: o.acceptedAt,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ─── 4. Dynamic CSV Exporter ──────────────────────────────────────────────────

async function exportCSV(type = 'roster') {
  if (type === 'roster') {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentProfile: {
          include: { department: true, batch: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Batch', 'CGPA', 'Active Backlogs', 'Status'];
    const rows = students.map((s) => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.studentProfile?.rollNumber || ''}"`,
      `"${s.studentProfile?.department?.name || ''}"`,
      `"${s.studentProfile?.batch?.year || ''}"`,
      s.studentProfile?.cgpa != null ? s.studentProfile.cgpa.toFixed(2) : 'N/A',
      s.studentProfile?.activeBacklogs ?? 0,
      s.status,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  if (type === 'placements') {
    const outcomes = await prisma.placementOutcome.findMany({
      include: {
        student: {
          include: { studentProfile: { include: { department: true } } },
        },
        company: true,
        job: true,
      },
      orderBy: { acceptedAt: 'desc' },
    });

    const headers = ['Student Name', 'Email', 'Department', 'Company', 'Job Title', 'Package (LPA)', 'Status', 'Date'];
    const rows = outcomes.map((o) => [
      `"${o.student?.name}"`,
      `"${o.student?.email}"`,
      `"${o.student?.studentProfile?.department?.name || ''}"`,
      `"${o.company?.name}"`,
      `"${o.job?.title}"`,
      o.packageOffered || 0,
      o.status,
      new Date(o.acceptedAt).toLocaleDateString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  throw new AppError(`Unsupported export type: ${type}`, 400, 'BAD_REQUEST');
}

module.exports = {
  getStudentCVReport,
  getAcademicTranscriptReport,
  getPlacementSummaryReport,
  exportCSV,
};
