/**
 * Career360 — Phase 7 Notifications & Audit Log Seed
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedNotifications() {
  console.log('🚀  Seeding Phase 7: Notifications & Audit Logs...');

  const student = await prisma.user.findUnique({ where: { email: 'student@career360.dev' } });
  const coordinator = await prisma.user.findUnique({ where: { email: 'placement@career360.dev' } });
  const faculty = await prisma.user.findUnique({ where: { email: 'faculty@career360.dev' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@career360.dev' } });

  // 1. Student Notifications
  if (student) {
    const studentNotifs = [
      {
        userId: student.id,
        title: 'Campus Recruitment Drive: Google India',
        message: 'Google Cloud is hiring for Full Stack & Cloud Engineers (CTC: 18.0 LPA). Check eligibility and apply.',
        type: 'DRIVE_ANNOUNCEMENT',
        isRead: false,
        linkUrl: '/student/placements',
      },
      {
        userId: student.id,
        title: 'Technical Interview Scheduled',
        message: 'Your Round 1 Technical Coding interview with Microsoft has been scheduled. Check instructions.',
        type: 'INTERVIEW_ROUND',
        isRead: false,
        linkUrl: '/student/placements',
      },
      {
        userId: student.id,
        title: 'Semester 4 Official Grade Sheet Published',
        message: 'Controller of Examinations has published verified SGPA: 8.90 for Semester 4. Download your transcript.',
        type: 'ACADEMIC_ALERT',
        isRead: true,
        readAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        linkUrl: '/student/academics',
      },
      {
        userId: student.id,
        title: 'Career Readiness Score Updated',
        message: 'Your profile readiness is benchmarked against Full Stack Developer. Next goal: Earn AWS Cloud credential.',
        type: 'INFO',
        isRead: true,
        readAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        linkUrl: '/student/career',
      },
    ];

    for (const n of studentNotifs) {
      await prisma.notification.create({ data: n });
    }
  }

  // 2. Coordinator Notifications
  if (coordinator) {
    await prisma.notification.createMany({
      data: [
        {
          userId: coordinator.id,
          title: '3 New Applications for Microsoft Drive',
          message: 'Candidates have submitted resumes and met minimum eligibility criteria (CGPA >= 7.5).',
          type: 'INFO',
          isRead: false,
          linkUrl: '/coordinator/applications',
        },
        {
          userId: coordinator.id,
          title: 'Drive Deadline Alert: Amazon SDE',
          message: 'Campus registration closes in 24 hours. 18 candidates registered so far.',
          type: 'WARNING',
          isRead: false,
          linkUrl: '/coordinator/drives',
        },
      ],
    });
  }

  // 3. Faculty Notifications
  if (faculty) {
    await prisma.notification.createMany({
      data: [
        {
          userId: faculty.id,
          title: 'Early Warning Alert: Attendance Shortfall',
          message: '1 student in Department of Computer Science has dropped below 75% aggregate attendance.',
          type: 'ACADEMIC_ALERT',
          isRead: false,
          linkUrl: '/faculty/early-warning',
        },
      ],
    });
  }

  // 4. Initial Audit Logs
  const auditEntries = [
    {
      userId: admin ? admin.id : null,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: admin ? admin.id : null,
      details: { role: 'ADMIN', ip: '127.0.0.1' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: coordinator ? coordinator.id : null,
      action: 'DRIVE_CREATED',
      entityType: 'PlacementDrive',
      entityId: 'cmtws_demo_drive_1',
      details: { company: 'Google India', packageLpa: 18.0, minCgpa: 7.5 },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: coordinator ? coordinator.id : null,
      action: 'SELECTION_ROUND_SCHEDULED',
      entityType: 'SelectionRound',
      entityId: 'cmtws_round_1',
      details: { roundName: 'Technical Coding Round', venue: 'Google Meet' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: coordinator ? coordinator.id : null,
      action: 'OFFER_RECORDED',
      entityType: 'PlacementOutcome',
      entityId: 'cmtws_outcome_1',
      details: { student: 'Priya Patel', company: 'Google India', packageLpa: 18.5 },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      userId: admin ? admin.id : null,
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: 'cmtw_dept_ai_ds',
      details: { name: 'Artificial Intelligence & Data Science', code: 'AIDS' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  ];

  for (const a of auditEntries) {
    await prisma.auditLog.create({ data: a });
  }

  console.log('✅  Seeded sample notifications and audit trail records successfully.');
}

seedNotifications()
  .catch((e) => {
    console.error('❌  Error seeding notifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
