/**
 * Career360 — Development Seed (Phase 2)
 * Run from: d:\Career360\backend\
 * Command:  node seed.local.js
 */
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

const departments = [
  { name: 'Computer Science', code: 'CS', description: 'Computer Science & Engineering' },
  { name: 'Information Technology', code: 'IT', description: 'Information Technology' },
  { name: 'Electronics & Communication', code: 'EC', description: 'Electronics & Communication Engineering' },
  { name: 'Mechanical Engineering', code: 'ME', description: 'Mechanical Engineering' },
  { name: 'Civil Engineering', code: 'CE', description: 'Civil Engineering' },
];

const seedUsers = [
  { name: 'Admin User',              email: 'admin@career360.dev',     password: 'Admin@1234',     role: 'ADMIN' },
  { name: 'Faculty Member',          email: 'faculty@career360.dev',   password: 'Faculty@1234',   role: 'FACULTY' },
  { name: 'Placement Coordinator',   email: 'placement@career360.dev', password: 'Placement@1234', role: 'PLACEMENT_COORDINATOR' },
  { name: 'Student User',            email: 'student@career360.dev',   password: 'Student@1234',   role: 'STUDENT' },
];

async function main() {
  console.log('\nCareer360 Development Seed (Phase 2)\n');

  // ── Departments ────────────────────────────────────────────────────────────
  console.log('Seeding departments...');
  const createdDepts = {};
  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      create: dept,
      update: { name: dept.name, description: dept.description },
    });
    createdDepts[dept.code] = d;
    console.log(`  [DEPT] ${d.name} (${d.code})`);
  }

  // ── Batches (graduation years 2025-2028 for CS and IT) ────────────────────
  console.log('\nSeeding batches...');
  const batchYears = [2025, 2026, 2027, 2028];
  const batchDeptCodes = ['CS', 'IT'];
  const createdBatches = {};

  for (const code of batchDeptCodes) {
    for (const year of batchYears) {
      const b = await prisma.batch.upsert({
        where: { year_departmentId: { year, departmentId: createdDepts[code].id } },
        create: { year, departmentId: createdDepts[code].id },
        update: {},
      });
      createdBatches[`${code}_${year}`] = b;
      console.log(`  [BATCH] ${code} - ${year}`);
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  console.log('\nSeeding users...');
  const createdUsers = {};
  for (const u of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  [SKIP]  ${u.email} - already exists`);
      createdUsers[u.role] = existing;
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { name: u.name, email: u.email, passwordHash, role: u.role, status: 'ACTIVE' },
    });
    createdUsers[u.role] = user;
    console.log(`  [OK]    [${u.role.padEnd(22)}] ${u.email}`);
  }

  // ── Student Profile for seed student ──────────────────────────────────────
  const studentUser = createdUsers['STUDENT'];
  if (studentUser) {
    console.log('\nSeeding student profile...');
    const csDept = createdDepts['CS'];
    const csBatch2027 = createdBatches['CS_2027'];

    await prisma.studentProfile.upsert({
      where: { userId: studentUser.id },
      create: {
        userId: studentUser.id,
        rollNumber: 'CS2024001',
        phone: '9876543210',
        gender: 'MALE',
        departmentId: csDept.id,
        batchId: csBatch2027.id,
        currentSemester: 5,
        admissionYear: 2024,
      },
      update: {},
    });
    console.log('  [OK]  Student profile created');

    // Seed a couple of skills
    await prisma.skill.upsert({
      where: { userId_name: { userId: studentUser.id, name: 'JavaScript' } },
      create: { userId: studentUser.id, name: 'JavaScript', category: 'PROGRAMMING', proficiency: 'INTERMEDIATE' },
      update: {},
    });
    await prisma.skill.upsert({
      where: { userId_name: { userId: studentUser.id, name: 'React' } },
      create: { userId: studentUser.id, name: 'React', category: 'WEB_DEVELOPMENT', proficiency: 'BEGINNER' },
      update: {},
    });
    console.log('  [OK]  Sample skills added');

    // ── Phase 3 Academic Subjects ──────────────────────────────────────────
    console.log('\nSeeding academic subjects...');
    const sampleSubjects = [
      { code: 'CS101', name: 'Introduction to Programming & C', credits: 4, departmentId: csDept.id },
      { code: 'CS102', name: 'Digital Logic & Computer Systems', credits: 3, departmentId: csDept.id },
      { code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, departmentId: csDept.id },
      { code: 'CS202', name: 'Discrete Mathematics', credits: 3, departmentId: csDept.id },
      { code: 'CS301', name: 'Database Management Systems', credits: 4, departmentId: csDept.id },
      { code: 'CS302', name: 'Operating Systems Principles', credits: 4, departmentId: csDept.id },
      { code: 'CS401', name: 'Computer Networks & Security', credits: 4, departmentId: csDept.id },
      { code: 'CS402', name: 'Software Engineering & Agile', credits: 3, departmentId: csDept.id },
      { code: 'CS501', name: 'Web Technologies & Cloud Architecture', credits: 4, departmentId: csDept.id },
      { code: 'CS502', name: 'Machine Learning & Neural Networks', credits: 4, departmentId: csDept.id },
    ];

    const createdSubjects = {};
    for (const sub of sampleSubjects) {
      const s = await prisma.subject.upsert({
        where: { code: sub.code },
        create: sub,
        update: { name: sub.name, credits: sub.credits },
      });
      createdSubjects[sub.code] = s;
    }
    console.log(`  [OK]  ${sampleSubjects.length} academic subjects seeded`);

    // ── Phase 3 Academic Semesters & Records for Student ───────────────────
    console.log('Seeding semester records and grades...');
    const sems = [
      { semNo: 1, year: '2022-2023', sgpa: 8.2, credits: 21 },
      { semNo: 2, year: '2022-2023', sgpa: 8.5, credits: 22 },
      { semNo: 3, year: '2023-2024', sgpa: 8.7, credits: 22 },
      { semNo: 4, year: '2023-2024', sgpa: 8.9, credits: 23 },
    ];

    for (const s of sems) {
      const semRecord = await prisma.academicSemester.upsert({
        where: { userId_semesterNumber: { userId: studentUser.id, semesterNumber: s.semNo } },
        create: {
          userId: studentUser.id,
          semesterNumber: s.semNo,
          academicYear: s.year,
          sgpa: s.sgpa,
          totalCredits: s.credits,
        },
        update: { sgpa: s.sgpa, totalCredits: s.credits },
      });

      // Add subjects to semester 3 and 4 as examples
      if (s.semNo === 3) {
        await prisma.studentSubjectRecord.upsert({
          where: { userId_semesterId_subjectId: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS301'].id } },
          create: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS301'].id, marksObtained: 88, maxMarks: 100, grade: 'A+', attendance: 88.5, isBacklog: false },
          update: {},
        });
        await prisma.studentSubjectRecord.upsert({
          where: { userId_semesterId_subjectId: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS302'].id } },
          create: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS302'].id, marksObtained: 84, maxMarks: 100, grade: 'A', attendance: 82.0, isBacklog: false },
          update: {},
        });
      } else if (s.semNo === 4) {
        await prisma.studentSubjectRecord.upsert({
          where: { userId_semesterId_subjectId: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS401'].id } },
          create: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS401'].id, marksObtained: 92, maxMarks: 100, grade: 'O', attendance: 91.0, isBacklog: false },
          update: {},
        });
        await prisma.studentSubjectRecord.upsert({
          where: { userId_semesterId_subjectId: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS402'].id } },
          create: { userId: studentUser.id, semesterId: semRecord.id, subjectId: createdSubjects['CS402'].id, marksObtained: 86, maxMarks: 100, grade: 'A+', attendance: 86.5, isBacklog: false },
          update: {},
        });
      }
    }

    // Recalculate CGPA on student profile: (8.2*21 + 8.5*22 + 8.7*22 + 8.9*23) / 88 = 8.58
    await prisma.studentProfile.update({
      where: { userId: studentUser.id },
      data: {
        cgpa: 8.58,
        latestSgpa: 8.9,
        activeBacklogs: 0,
        totalBacklogs: 0,
      },
    });
    // ── Phase 4 Placement Core ───────────────────────────────────────────
    console.log('\nSeeding placement companies, jobs, and drives...');
    
    // 1. Companies
    const companies = [
      { name: 'Amazon', industry: 'E-Commerce & Cloud Computing', website: 'https://amazon.jobs', location: 'Bangalore / Hyderabad', description: 'Global leader in cloud computing (AWS), e-commerce, and digital streaming.' },
      { name: 'Microsoft', industry: 'Cloud & Enterprise Software', website: 'https://careers.microsoft.com', location: 'Hyderabad / Bangalore', description: 'Empowering every person and organization on the planet to achieve more.' },
      { name: 'Google', industry: 'Internet & Artificial Intelligence', website: 'https://careers.google.com', location: 'Bangalore / Hyderabad', description: 'Organizing the world’s information and making it universally accessible.' },
      { name: 'Infosys', industry: 'IT Services & Consulting', website: 'https://infosys.com/careers', location: 'Bangalore / Pune / Chennai', description: 'Next-generation digital services and consulting leader.' },
    ];

    const createdCompanies = {};
    for (const c of companies) {
      const comp = await prisma.company.upsert({
        where: { name: c.name },
        create: c,
        update: { industry: c.industry, website: c.website, location: c.location, description: c.description },
      });
      createdCompanies[c.name] = comp;
    }
    console.log(`  [OK]  ${companies.length} recruiting companies seeded`);

    // 2. Jobs
    const jobs = [
      { companyId: createdCompanies['Amazon'].id, title: 'Software Development Engineer I (SDE I)', role: 'Full Stack Engineer', packageMin: 18.0, packageMax: 26.0, location: 'Bangalore', employmentType: 'Full-time', requiredSkills: ['Java', 'Data Structures', 'AWS', 'Distributed Systems'] },
      { companyId: createdCompanies['Microsoft'].id, title: 'Azure Cloud Solutions Engineer', role: 'Cloud Engineer', packageMin: 16.0, packageMax: 24.0, location: 'Hyderabad', employmentType: 'Full-time', requiredSkills: ['C#', '.NET', 'Azure', 'Kubernetes', 'Cloud Architecture'] },
      { companyId: createdCompanies['Google'].id, title: 'Associate Software Engineer - Systems', role: 'Systems Engineer', packageMin: 24.0, packageMax: 35.0, location: 'Bangalore', employmentType: 'Full-time', requiredSkills: ['C++', 'Python', 'Algorithms', 'Operating Systems'] },
      { companyId: createdCompanies['Infosys'].id, title: 'Specialist Programmer (Digital)', role: 'Full Stack Developer', packageMin: 9.5, packageMax: 12.0, location: 'Pune', employmentType: 'Full-time', requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'] },
    ];

    const createdJobs = [];
    for (const j of jobs) {
      let job = await prisma.jobOpening.findFirst({ where: { companyId: j.companyId, title: j.title } });
      if (!job) {
        job = await prisma.jobOpening.create({ data: j });
      }
      createdJobs.push(job);
    }
    console.log(`  [OK]  ${createdJobs.length} job openings created`);

    // 3. Placement Drives
    const now = new Date();
    const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const in21Days = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const drivesData = [
      {
        companyId: createdCompanies['Amazon'].id,
        jobId: createdJobs[0].id,
        title: 'Amazon University Campus Drive 2025',
        openDate: now,
        deadline: in14Days,
        selectionProcess: 'Online Assessment -> Technical Round 1 -> Technical Round 2 -> Bar Raiser HR',
        status: 'ACTIVE',
        eligibility: {
          departments: ['CS', 'IT'],
          minCgpa: 7.5,
          maxActiveBacklogs: 0,
          maxTotalBacklogs: 1,
          minAttendance: 75.0,
          allowedGraduationYears: [2026, 2027],
          requiredSkills: ['Data Structures', 'Java', 'Problem Solving'],
        },
      },
      {
        companyId: createdCompanies['Microsoft'].id,
        jobId: createdJobs[1].id,
        title: 'Microsoft College Discovery Drive 2025',
        openDate: now,
        deadline: in21Days,
        selectionProcess: 'Coding Round (Codility) -> Technical Interview 1 -> System Design / Technical 2 -> AA Interview',
        status: 'ACTIVE',
        eligibility: {
          departments: ['CS', 'IT', 'EC'],
          minCgpa: 8.0,
          maxActiveBacklogs: 0,
          maxTotalBacklogs: 0,
          minAttendance: 75.0,
          allowedGraduationYears: [2026, 2027],
          requiredSkills: ['Algorithms', 'Cloud', 'Data Structures'],
        },
      },
      {
        companyId: createdCompanies['Google'].id,
        jobId: createdJobs[2].id,
        title: 'Google Early Career Software Engineering 2025',
        openDate: now,
        deadline: in30Days,
        selectionProcess: 'Google Online Challenge -> Phone Interview -> 3x Onsite Technical Interviews',
        status: 'UPCOMING',
        eligibility: {
          departments: ['CS', 'IT'],
          minCgpa: 8.5,
          maxActiveBacklogs: 0,
          maxTotalBacklogs: 0,
          minAttendance: 80.0,
          allowedGraduationYears: [2026, 2027],
          requiredSkills: ['Algorithms', 'C++', 'Python'],
        },
      },
      {
        companyId: createdCompanies['Infosys'].id,
        jobId: createdJobs[3].id,
        title: 'Infosys Specialist Programmer Campus Hiring',
        openDate: now,
        deadline: in14Days,
        selectionProcess: 'HackWithInfy / Coding Round -> Technical Interview -> HR Round',
        status: 'ACTIVE',
        eligibility: {
          departments: ['CS', 'IT', 'EC', 'ME', 'CE'],
          minCgpa: 6.5,
          maxActiveBacklogs: 1,
          maxTotalBacklogs: 3,
          minAttendance: 70.0,
          allowedGraduationYears: [2025, 2026, 2027],
          requiredSkills: ['Programming', 'Web Development'],
        },
      },
    ];

    const createdDrives = [];
    for (const d of drivesData) {
      const { eligibility, ...driveData } = d;
      let drive = await prisma.placementDrive.findFirst({ where: { companyId: driveData.companyId, title: driveData.title } });
      if (!drive) {
        drive = await prisma.placementDrive.create({
          data: {
            ...driveData,
            eligibilityRule: { create: eligibility },
          },
        });
      }
      createdDrives.push(drive);
    }
    console.log(`  [OK]  ${createdDrives.length} placement drives with eligibility rules seeded`);

    // 4. Sample application for studentUser
    const studentApp = await prisma.application.upsert({
      where: { studentId_driveId: { studentId: studentUser.id, driveId: createdDrives[0].id } },
      create: {
        studentId: studentUser.id,
        driveId: createdDrives[0].id,
        status: 'INTERVIEW_SCHEDULED',
        notes: 'Applied for SDE I via on-campus recruitment',
      },
      update: {},
    });

    await prisma.selectionRound.createMany({
      data: [
        {
          driveId: createdDrives[0].id,
          applicationId: studentApp.id,
          studentId: studentUser.id,
          roundNumber: 1,
          roundName: 'Online Coding Assessment',
          status: 'CLEARED',
          feedback: 'Scored 100/100 on both coding test questions.',
        },
        {
          driveId: createdDrives[0].id,
          applicationId: studentApp.id,
          studentId: studentUser.id,
          roundNumber: 2,
          roundName: 'Technical Interview (Algorithms & Problem Solving)',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          venueOrLink: 'https://chime.aws/interview-room-102',
          feedback: 'Upcoming virtual video call round with Senior SDE.',
        },
      ],
      skipDuplicates: true,
    });
    console.log('  [OK]  Student application & interview rounds recorded');
  }

  console.log('\nSeed complete!\n');

  console.log('DEV LOGIN CREDENTIALS:');
  console.log('------------------------------------------------------');
  seedUsers.forEach(u => console.log(`  ${u.role.padEnd(25)} ${u.email}  /  ${u.password}`));
  console.log('');
}

main()
  .catch(e => { console.error('Seed failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
