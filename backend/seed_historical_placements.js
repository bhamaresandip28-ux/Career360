/**
 * Career360 — Historical Placement Seed Script
 * Populates realistic historical placement records for 2023, 2024, and 2025
 * across tier-1, tier-2, and product companies with associated roles and skills.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

async function seedHistoricalPlacements() {
  console.log('🌱  Seeding realistic historical placement records (2023 - 2025)...');

  // 1. Get or create Department
  let csDept = await prisma.department.findUnique({ where: { code: 'CS' } });
  if (!csDept) {
    csDept = await prisma.department.create({
      data: { name: 'Computer Science & Engineering', code: 'CS' },
    });
  }

  let itDept = await prisma.department.findUnique({ where: { code: 'IT' } });
  if (!itDept) {
    itDept = await prisma.department.create({
      data: { name: 'Information Technology', code: 'IT' },
    });
  }

  // 2. Companies
  const companiesData = [
    {
      name: 'Microsoft',
      industry: 'Software & Cloud',
      location: 'Bangalore / Hyderabad',
      website: 'https://careers.microsoft.com',
      description: 'Global technology giant known for Windows, Azure, and developer tooling.',
    },
    {
      name: 'Amazon',
      industry: 'E-Commerce & Cloud Infrastructure',
      location: 'Bangalore / Hyderabad',
      website: 'https://amazon.jobs',
      description: 'World leading e-commerce and cloud provider (AWS).',
    },
    {
      name: 'Goldman Sachs',
      industry: 'Fintech & Investment Banking',
      location: 'Bangalore',
      website: 'https://goldmansachs.com/careers',
      description: 'Global investment banking and financial technology enterprise.',
    },
    {
      name: 'Cisco Systems',
      industry: 'Networking & Cybersecurity',
      location: 'Bangalore',
      website: 'https://cisco.com/careers',
      description: 'Worldwide leader in networking hardware, telecom and cybersecurity.',
    },
    {
      name: 'Oracle',
      industry: 'Enterprise Software & Database',
      location: 'Bangalore / Hyderabad',
      website: 'https://oracle.com/careers',
      description: 'Pioneer in relational databases, ERP systems, and cloud infrastructure.',
    },
    {
      name: 'Deloitte USI',
      industry: 'Technology Consulting',
      location: 'Hyderabad / Bangalore',
      website: 'https://deloitte.com/careers',
      description: 'Multinational professional services network and digital transformation consulting.',
    },
    {
      name: 'TCS Digital',
      industry: 'IT Services & Digital Solutions',
      location: 'Pan-India',
      website: 'https://tcs.com/careers',
      description: 'Premier digital engineering division of Tata Consultancy Services.',
    },
    {
      name: 'Infosys (Specialist)',
      industry: 'IT & Consulting',
      location: 'Bangalore / Pune',
      website: 'https://infosys.com/careers',
      description: 'Global leader in next-generation digital services and consulting.',
    },
  ];

  const companies = {};
  for (const c of companiesData) {
    const company = await prisma.company.upsert({
      where: { name: c.name },
      update: { industry: c.industry, location: c.location, website: c.website, description: c.description },
      create: c,
    });
    companies[c.name] = company;
  }

  // 3. Job Openings
  const jobsData = [
    {
      companyKey: 'Microsoft',
      title: 'Software Development Engineer (SDE-1)',
      role: 'Software Development Engineer',
      packageMin: 32.0,
      packageMax: 44.0,
      requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'System Design', 'Distributed Systems'],
    },
    {
      companyKey: 'Amazon',
      title: 'Software Development Engineer - I',
      role: 'Software Development Engineer',
      packageMin: 28.0,
      packageMax: 38.0,
      requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'Object-Oriented Design', 'AWS'],
    },
    {
      companyKey: 'Goldman Sachs',
      title: 'Analyst - Engineering & Quantitative',
      role: 'Software Development Engineer',
      packageMin: 24.0,
      packageMax: 28.0,
      requiredSkills: ['Algorithms', 'Java', 'C++', 'SQL', 'Financial Computing'],
    },
    {
      companyKey: 'Cisco Systems',
      title: 'Network Software Engineer',
      role: 'Systems Engineer',
      packageMin: 16.0,
      packageMax: 22.0,
      requiredSkills: ['Computer Networks', 'Python', 'C', 'Linux', 'TCP/IP', 'Git'],
    },
    {
      companyKey: 'Oracle',
      title: 'Member of Technical Staff - Server Tech',
      role: 'Full Stack Developer',
      packageMin: 14.0,
      packageMax: 18.0,
      requiredSkills: ['Java', 'SQL', 'Database Internals', 'React', 'REST APIs'],
    },
    {
      companyKey: 'Deloitte USI',
      title: 'Solutions Delivery Analyst',
      role: 'Data Engineer',
      packageMin: 9.0,
      packageMax: 12.0,
      requiredSkills: ['Python', 'SQL', 'Data Warehousing', 'Tableau', 'Power BI'],
    },
    {
      companyKey: 'TCS Digital',
      title: 'Digital Cadre Engineer',
      role: 'Full Stack Developer',
      packageMin: 7.5,
      packageMax: 9.5,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    },
    {
      companyKey: 'Infosys (Specialist)',
      title: 'Specialist Programmer (Power Programmer)',
      role: 'Full Stack Developer',
      packageMin: 8.0,
      packageMax: 10.0,
      requiredSkills: ['Algorithms', 'Java', 'Spring Boot', 'Microservices', 'Docker'],
    },
  ];

  const jobs = [];
  for (const j of jobsData) {
    const company = companies[j.companyKey];
    let job = await prisma.jobOpening.findFirst({
      where: { companyId: company.id, title: j.title },
    });
    if (!job) {
      job = await prisma.jobOpening.create({
        data: {
          companyId: company.id,
          title: j.title,
          role: j.role,
          packageMin: j.packageMin,
          packageMax: j.packageMax,
          requiredSkills: j.requiredSkills,
        },
      });
    }
    jobs.push({ ...j, id: job.id, companyId: company.id });
  }

  // 4. Create Historical Students & Placements for 2023, 2024, 2025
  const defaultPassword = await bcrypt.hash('Career360Demo@2025', BCRYPT_ROUNDS);

  const historicalPlacements = [
    // 2023 Placements
    { name: 'Aditya Sharma', email: 'aditya.s.2023@career360.dev', roll: '19CS012', year: 2023, month: 9, dept: csDept.id, company: 'Microsoft', jobTitle: 'Software Development Engineer (SDE-1)', ctc: 42.0, skills: ['Data Structures', 'Algorithms', 'C++', 'System Design', 'Git'] },
    { name: 'Kavita Menon', email: 'kavita.m.2023@career360.dev', roll: '19CS034', year: 2023, month: 10, dept: csDept.id, company: 'Amazon', jobTitle: 'Software Development Engineer - I', ctc: 34.5, skills: ['Java', 'Algorithms', 'Data Structures', 'AWS', 'SQL'] },
    { name: 'Rohan Gupta', email: 'rohan.g.2023@career360.dev', roll: '19IT021', year: 2023, month: 8, dept: itDept.id, company: 'Cisco Systems', jobTitle: 'Network Software Engineer', ctc: 19.5, skills: ['Computer Networks', 'Python', 'Linux', 'Git', 'TCP/IP'] },
    { name: 'Neha Varma', email: 'neha.v.2023@career360.dev', roll: '19CS055', year: 2023, month: 11, dept: csDept.id, company: 'Oracle', jobTitle: 'Member of Technical Staff - Server Tech', ctc: 16.0, skills: ['Java', 'SQL', 'React', 'REST APIs', 'Git'] },
    { name: 'Tanmay Joshi', email: 'tanmay.j.2023@career360.dev', roll: '19IT044', year: 2023, month: 7, dept: itDept.id, company: 'TCS Digital', jobTitle: 'Digital Cadre Engineer', ctc: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'HTML5'] },
    { name: 'Swati Pillai', email: 'swati.p.2023@career360.dev', roll: '19CS089', year: 2023, month: 12, dept: csDept.id, company: 'Deloitte USI', jobTitle: 'Solutions Delivery Analyst', ctc: 10.5, skills: ['Python', 'SQL', 'Tableau', 'Data Warehousing', 'Excel'] },
    { name: 'Amitabh Sen', email: 'amitabh.s.2023@career360.dev', roll: '19IT012', year: 2023, month: 10, dept: itDept.id, company: 'Infosys (Specialist)', jobTitle: 'Specialist Programmer (Power Programmer)', ctc: 9.0, skills: ['Java', 'Spring Boot', 'Algorithms', 'Docker', 'SQL'] },

    // 2024 Placements
    { name: 'Siddharth Roy', email: 'siddharth.r.2024@career360.dev', roll: '20CS005', year: 2024, month: 8, dept: csDept.id, company: 'Microsoft', jobTitle: 'Software Development Engineer (SDE-1)', ctc: 44.0, skills: ['Data Structures', 'Algorithms', 'C++', 'System Design', 'Distributed Systems', 'Git'] },
    { name: 'Ananya Deshmukh', email: 'ananya.d.2024@career360.dev', roll: '20CS028', year: 2024, month: 9, dept: csDept.id, company: 'Amazon', jobTitle: 'Software Development Engineer - I', ctc: 36.0, skills: ['Java', 'Algorithms', 'Data Structures', 'AWS', 'Docker', 'Linux'] },
    { name: 'Varun Nair', email: 'varun.n.2024@career360.dev', roll: '20CS041', year: 2024, month: 10, dept: csDept.id, company: 'Goldman Sachs', jobTitle: 'Analyst - Engineering & Quantitative', ctc: 28.0, skills: ['Java', 'C++', 'Algorithms', 'SQL', 'Data Structures', 'Git'] },
    { name: 'Megha Kulkarni', email: 'megha.k.2024@career360.dev', roll: '20IT019', year: 2024, month: 8, dept: itDept.id, company: 'Cisco Systems', jobTitle: 'Network Software Engineer', ctc: 21.0, skills: ['Python', 'Linux', 'Computer Networks', 'Docker', 'Git'] },
    { name: 'Karthik Raja', email: 'karthik.r.2024@career360.dev', roll: '20CS067', year: 2024, month: 11, dept: csDept.id, company: 'Oracle', jobTitle: 'Member of Technical Staff - Server Tech', ctc: 17.5, skills: ['Java', 'SQL', 'React', 'Node.js', 'Git'] },
    { name: 'Divya Nambiar', email: 'divya.n.2024@career360.dev', roll: '20IT033', year: 2024, month: 12, dept: itDept.id, company: 'Deloitte USI', jobTitle: 'Solutions Delivery Analyst', ctc: 11.5, skills: ['Python', 'SQL', 'Power BI', 'Data Warehousing', 'Pandas'] },
    { name: 'Harsh Vardhan', email: 'harsh.v.2024@career360.dev', roll: '20IT051', year: 2024, month: 7, dept: itDept.id, company: 'TCS Digital', jobTitle: 'Digital Cadre Engineer', ctc: 9.0, skills: ['React', 'Node.js', 'JavaScript', 'PostgreSQL', 'Git'] },
    { name: 'Pooja Hegde', email: 'pooja.h.2024@career360.dev', roll: '20CS082', year: 2024, month: 9, dept: csDept.id, company: 'Infosys (Specialist)', jobTitle: 'Specialist Programmer (Power Programmer)', ctc: 9.5, skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'SQL'] },

    // 2025 Placements
    { name: 'Devendra Mehta', email: 'devendra.m.2025@career360.dev', roll: '21CS003', year: 2025, month: 1, dept: csDept.id, company: 'Microsoft', jobTitle: 'Software Development Engineer (SDE-1)', ctc: 43.5, skills: ['Data Structures', 'Algorithms', 'C++', 'System Design', 'Azure', 'Git'] },
    { name: 'Sneha Bose', email: 'sneha.b.2025@career360.dev', roll: '21CS019', year: 2025, month: 2, dept: csDept.id, company: 'Amazon', jobTitle: 'Software Development Engineer - I', ctc: 38.0, skills: ['Java', 'Algorithms', 'Data Structures', 'AWS', 'Distributed Systems'] },
    { name: 'Abhishek Tripathi', email: 'abhishek.t.2025@career360.dev', roll: '21CS037', year: 2025, month: 1, dept: csDept.id, company: 'Goldman Sachs', jobTitle: 'Analyst - Engineering & Quantitative', ctc: 27.5, skills: ['C++', 'Python', 'Algorithms', 'SQL', 'System Design'] },
    { name: 'Shreya Chawla', email: 'shreya.c.2025@career360.dev', roll: '21IT008', year: 2025, month: 2, dept: itDept.id, company: 'Cisco Systems', jobTitle: 'Network Software Engineer', ctc: 22.0, skills: ['Python', 'Computer Networks', 'Linux', 'Docker', 'Kubernetes'] },
    { name: 'Nikhil Rane', email: 'nikhil.r.2025@career360.dev', roll: '21CS071', year: 2025, month: 3, dept: csDept.id, company: 'Oracle', jobTitle: 'Member of Technical Staff - Server Tech', ctc: 18.0, skills: ['Java', 'Database Internals', 'SQL', 'React', 'Docker'] },
    { name: 'Ritu Singhal', email: 'ritu.s.2025@career360.dev', roll: '21IT027', year: 2025, month: 1, dept: itDept.id, company: 'Deloitte USI', jobTitle: 'Solutions Delivery Analyst', ctc: 12.0, skills: ['Python', 'SQL', 'Spark', 'Tableau', 'Data Warehousing'] },
    { name: 'Manish Pandey', email: 'manish.p.2025@career360.dev', roll: '21IT062', year: 2025, month: 2, dept: itDept.id, company: 'TCS Digital', jobTitle: 'Digital Cadre Engineer', ctc: 9.2, skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'] },
    { name: 'Ishaan Chopra', email: 'ishaan.c.2025@career360.dev', roll: '21CS094', year: 2025, month: 3, dept: csDept.id, company: 'Infosys (Specialist)', jobTitle: 'Specialist Programmer (Power Programmer)', ctc: 10.0, skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'CI/CD'] },
  ];

  let insertedCount = 0;

  for (const p of historicalPlacements) {
    // 1. Create / find user
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name },
      create: {
        name: p.name,
        email: p.email,
        passwordHash: defaultPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    // 2. Upsert studentProfile
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { departmentId: p.dept },
      create: {
        userId: user.id,
        rollNumber: p.roll,
        departmentId: p.dept,
        currentSemester: 8,
        admissionYear: p.year - 4,
        cgpa: Number((8.2 + Math.random() * 1.5).toFixed(2)),
      },
    });

    // 3. Upsert skills
    for (const skillName of p.skills) {
      const existing = await prisma.skill.findFirst({
        where: { userId: user.id, name: skillName },
      });
      if (!existing) {
        await prisma.skill.create({
          data: {
            userId: user.id,
            name: skillName,
            category: 'PROGRAMMING',
            proficiency: 'ADVANCED',
          },
        });
      }
    }

    // 4. Find company & job
    const company = companies[p.company];
    const job = jobs.find((j) => j.companyKey === p.company && j.title === p.jobTitle);

    if (company && job) {
      const acceptedDate = new Date(Date.UTC(p.year, p.month - 1, 15, 12, 0, 0));

      const existingOutcome = await prisma.placementOutcome.findFirst({
        where: { studentId: user.id, companyId: company.id, jobId: job.id },
      });

      if (!existingOutcome) {
        await prisma.placementOutcome.create({
          data: {
            studentId: user.id,
            companyId: company.id,
            jobId: job.id,
            packageOffered: p.ctc,
            status: 'ACCEPTED',
            acceptedAt: acceptedDate,
          },
        });
        insertedCount++;
      }
    }
  }

  console.log(`✅  Successfully seeded ${insertedCount} historical placement outcomes across 2023 - 2025.`);
}

seedHistoricalPlacements()
  .catch((err) => {
    console.error('❌  Error seeding historical placements:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
