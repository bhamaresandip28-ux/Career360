/**
 * Career360 — Cohort Enrichment Seed (Phase 5)
 * Seeds diverse student profiles, academic records, and applications to power
 * realistic analytics for Faculty (Early Warning), Coordinator (Funnel), and Admin.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function seedCohort() {
  console.log('🌱  Enriching Career360 cohort data...');

  const csDept = await prisma.department.findUnique({ where: { code: 'CS' } });
  const itDept = await prisma.department.findUnique({ where: { code: 'IT' } });
  if (!csDept || !itDept) {
    console.error('❌  CS or IT department missing. Ensure departments exist.');
    return;
  }

  const csBatch = await prisma.batch.findFirst({ where: { departmentId: csDept.id } });
  const itBatch = await prisma.batch.findFirst({ where: { departmentId: itDept.id } });

  const hash = await bcrypt.hash('Student@1234', BCRYPT_ROUNDS);

  // 1. Priya Patel (High Performer)
  const priyaUser = await prisma.user.upsert({
    where: { email: 'priya.patel@career360.dev' },
    update: {},
    create: {
      name: 'Priya Patel',
      email: 'priya.patel@career360.dev',
      passwordHash: hash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: priyaUser.id },
    update: { cgpa: 9.15, latestSgpa: 9.30, activeBacklogs: 0, totalBacklogs: 0 },
    create: {
      userId: priyaUser.id,
      rollNumber: '21CS042',
      phone: '+91 98765 43210',
      gender: 'FEMALE',
      departmentId: csDept.id,
      batchId: csBatch?.id,
      currentSemester: 6,
      admissionYear: 2021,
      cgpa: 9.15,
      latestSgpa: 9.30,
      activeBacklogs: 0,
      totalBacklogs: 0,
    },
  });

  // 2. Rahul Sharma (At-Risk student: attendance < 75%, CGPA < 6.0, 1 backlog)
  const rahulUser = await prisma.user.upsert({
    where: { email: 'rahul.sharma@career360.dev' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@career360.dev',
      passwordHash: hash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: rahulUser.id },
    update: { cgpa: 5.75, latestSgpa: 5.50, activeBacklogs: 1, totalBacklogs: 1 },
    create: {
      userId: rahulUser.id,
      rollNumber: '21CS088',
      phone: '+91 98765 43211',
      gender: 'MALE',
      departmentId: csDept.id,
      batchId: csBatch?.id,
      currentSemester: 6,
      admissionYear: 2021,
      cgpa: 5.75,
      latestSgpa: 5.50,
      activeBacklogs: 1,
      totalBacklogs: 1,
    },
  });

  // 3. Ananya Sen (IT Student with Placement Outcome)
  const ananyaUser = await prisma.user.upsert({
    where: { email: 'ananya.sen@career360.dev' },
    update: {},
    create: {
      name: 'Ananya Sen',
      email: 'ananya.sen@career360.dev',
      passwordHash: hash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: ananyaUser.id },
    update: { cgpa: 7.82, latestSgpa: 8.10, activeBacklogs: 0, totalBacklogs: 0 },
    create: {
      userId: ananyaUser.id,
      rollNumber: '21IT019',
      phone: '+91 98765 43212',
      gender: 'FEMALE',
      departmentId: itDept.id,
      batchId: itBatch?.id,
      currentSemester: 6,
      admissionYear: 2021,
      cgpa: 7.82,
      latestSgpa: 8.10,
      activeBacklogs: 0,
      totalBacklogs: 0,
    },
  });

  // Add academic semester & attendance records for Rahul (to trigger early warning)
  const rahulSem = await prisma.academicSemester.upsert({
    where: { userId_semesterNumber: { userId: rahulUser.id, semesterNumber: 5 } },
    update: {},
    create: {
      userId: rahulUser.id,
      semesterNumber: 5,
      academicYear: '2024-2025',
      sgpa: 5.50,
      totalCredits: 20,
    },
  });

  const subjects = await prisma.subject.findMany({ take: 3 });
  if (subjects.length > 0) {
    // Rahul's low attendance records
    for (let i = 0; i < subjects.length; i++) {
      await prisma.studentSubjectRecord.upsert({
        where: {
          userId_semesterId_subjectId: {
            userId: rahulUser.id,
            semesterId: rahulSem.id,
            subjectId: subjects[i].id,
          },
        },
        update: {},
        create: {
          userId: rahulUser.id,
          semesterId: rahulSem.id,
          subjectId: subjects[i].id,
          marksObtained: i === 0 ? 32 : 55,
          maxMarks: 100,
          grade: i === 0 ? 'F' : 'C',
          attendance: i === 0 ? 62.0 : 69.5, // Both below 75%
          isBacklog: i === 0,
        },
      });
    }

    // Priya's high attendance records
    const priyaSem = await prisma.academicSemester.upsert({
      where: { userId_semesterNumber: { userId: priyaUser.id, semesterNumber: 5 } },
      update: {},
      create: {
        userId: priyaUser.id,
        semesterNumber: 5,
        academicYear: '2024-2025',
        sgpa: 9.30,
        totalCredits: 20,
      },
    });

    for (let i = 0; i < subjects.length; i++) {
      await prisma.studentSubjectRecord.upsert({
        where: {
          userId_semesterId_subjectId: {
            userId: priyaUser.id,
            semesterId: priyaSem.id,
            subjectId: subjects[i].id,
          },
        },
        update: {},
        create: {
          userId: priyaUser.id,
          semesterId: priyaSem.id,
          subjectId: subjects[i].id,
          marksObtained: 94 - i * 3,
          maxMarks: 100,
          grade: i === 0 ? 'O' : 'A+',
          attendance: 94.0 - i * 2,
          isBacklog: false,
        },
      });
    }
  }

  // Applications & Drives
  const drives = await prisma.placementDrive.findMany({
    include: { company: true, job: true },
  });

  if (drives.length >= 2) {
    // Priya applied to Drive 0 (Google / Microsoft)
    const priyaApp = await prisma.application.upsert({
      where: {
        studentId_driveId: { studentId: priyaUser.id, driveId: drives[0].id },
      },
      update: {},
      create: {
        studentId: priyaUser.id,
        driveId: drives[0].id,
        status: 'INTERVIEW_SCHEDULED',
        resumeUrl: 'https://linkedin.com/in/priya-patel-cs',
        notes: 'Top scorer in online assessment round.',
      },
    });

    // Schedule round for Priya
    await prisma.selectionRound.create({
      data: {
        driveId: drives[0].id,
        applicationId: priyaApp.id,
        studentId: priyaUser.id,
        roundNumber: 2,
        roundName: 'System Architecture & Coding',
        scheduledAt: new Date(Date.now() + 86400000 * 3),
        venueOrLink: 'https://meet.google.com/xyz-abc-career360',
        status: 'SCHEDULED',
      },
    }).catch(() => {});

    // Ananya applied to Drive 1 and received offer
    const ananyaApp = await prisma.application.upsert({
      where: {
        studentId_driveId: { studentId: ananyaUser.id, driveId: drives[1].id },
      },
      update: {},
      create: {
        studentId: ananyaUser.id,
        driveId: drives[1].id,
        status: 'OFFERED',
        resumeUrl: 'https://linkedin.com/in/ananya-sen-it',
        notes: 'Cleared final managerial round with distinction.',
      },
    });

    // Record Placement Outcome for Ananya
    await prisma.placementOutcome.upsert({
      where: { id: `outcome-${ananyaUser.id}-${drives[1].companyId}` },
      update: {},
      create: {
        id: `outcome-${ananyaUser.id}-${drives[1].companyId}`,
        studentId: ananyaUser.id,
        companyId: drives[1].companyId,
        jobId: drives[1].jobId,
        packageOffered: 14.5, // 14.5 LPA
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    }).catch(() => {});
  }

  console.log('✅  Cohort data enriched successfully.');
}

seedCohort()
  .catch((e) => console.error('❌  Seed cohort error:', e))
  .finally(() => prisma.$disconnect());
