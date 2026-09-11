/**
 * Career360 — Career Intelligence & Preparation Seed (Phase 6)
 * Seeds standard industry target roles, role skills, preparation resources,
 * and initial career roadmap milestones for demo student accounts.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCareer() {
  console.log('🚀  Seeding Phase 6: Career Intelligence & Preparation Hub...');

  // 1. Target Industry Roles
  const rolesData = [
    {
      slug: 'full-stack-developer',
      name: 'Full Stack Developer',
      description: 'Design and build end-to-end web applications with modern frontend frameworks and robust microservice backends.',
      minCgpa: 7.0,
      averageCtcLpa: 11.5,
      skills: [
        { name: 'React', category: 'WEB_DEVELOPMENT', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Node.js', category: 'WEB_DEVELOPMENT', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'JavaScript', category: 'PROGRAMMING', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'PostgreSQL', category: 'DATABASE', importance: 'CRITICAL', minProficiency: 'INTERMEDIATE' },
        { name: 'REST APIs', category: 'WEB_DEVELOPMENT', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Git', category: 'TOOLS', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'Docker', category: 'DEVOPS', importance: 'IMPORTANT', minProficiency: 'BEGINNER' },
        { name: 'Tailwind CSS', category: 'WEB_DEVELOPMENT', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
      ],
    },
    {
      slug: 'cloud-devops-engineer',
      name: 'Cloud & DevOps Engineer',
      description: 'Orchestrate resilient cloud infrastructure, automate deployment CI/CD pipelines, and ensure 99.99% system availability.',
      minCgpa: 6.8,
      averageCtcLpa: 13.0,
      skills: [
        { name: 'Linux', category: 'TOOLS', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Docker', category: 'DEVOPS', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Kubernetes', category: 'DEVOPS', importance: 'CRITICAL', minProficiency: 'INTERMEDIATE' },
        { name: 'AWS', category: 'CLOUD', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'CI/CD Pipelines', category: 'DEVOPS', importance: 'CRITICAL', minProficiency: 'INTERMEDIATE' },
        { name: 'Python', category: 'PROGRAMMING', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'Terraform', category: 'CLOUD', importance: 'IMPORTANT', minProficiency: 'BEGINNER' },
      ],
    },
    {
      slug: 'data-scientist-ai-engineer',
      name: 'Data Scientist & AI Engineer',
      description: 'Harness predictive machine learning models, statistical inference, and deep neural networks to extract intelligence from complex datasets.',
      minCgpa: 7.5,
      averageCtcLpa: 14.5,
      skills: [
        { name: 'Python', category: 'PROGRAMMING', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Machine Learning', category: 'AI_ML', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Deep Learning', category: 'AI_ML', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'SQL', category: 'DATABASE', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Pandas', category: 'AI_ML', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'PyTorch', category: 'AI_ML', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'Mathematics & Stats', category: 'AI_ML', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
      ],
    },
    {
      slug: 'backend-systems-engineer',
      name: 'Backend Systems Engineer',
      description: 'Engineer high-throughput, low-latency distributed systems, database scaling solutions, and mission-critical API platforms.',
      minCgpa: 7.2,
      averageCtcLpa: 13.5,
      skills: [
        { name: 'Java', category: 'PROGRAMMING', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'System Design', category: 'WEB_DEVELOPMENT', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'PostgreSQL', category: 'DATABASE', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Redis', category: 'DATABASE', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'Microservices', category: 'WEB_DEVELOPMENT', importance: 'CRITICAL', minProficiency: 'INTERMEDIATE' },
        { name: 'Kafka', category: 'TOOLS', importance: 'IMPORTANT', minProficiency: 'BEGINNER' },
      ],
    },
    {
      slug: 'mobile-app-developer',
      name: 'Mobile Application Developer',
      description: 'Craft slick, fluid native and cross-platform mobile experiences on iOS and Android with intuitive user interfaces.',
      minCgpa: 6.5,
      averageCtcLpa: 9.5,
      skills: [
        { name: 'React Native', category: 'PROGRAMMING', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'JavaScript', category: 'PROGRAMMING', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Mobile UI/UX', category: 'TOOLS', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'REST APIs', category: 'WEB_DEVELOPMENT', importance: 'CRITICAL', minProficiency: 'INTERMEDIATE' },
        { name: 'Redux', category: 'WEB_DEVELOPMENT', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
      ],
    },
    {
      slug: 'cybersecurity-analyst',
      name: 'Cybersecurity & Network Analyst',
      description: 'Defend organizational assets against advanced threats, conduct penetration audits, and implement secure network protocols.',
      minCgpa: 7.0,
      averageCtcLpa: 11.0,
      skills: [
        { name: 'Computer Networks', category: 'TOOLS', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Linux', category: 'TOOLS', importance: 'CRITICAL', minProficiency: 'ADVANCED' },
        { name: 'Vulnerability Assessment', category: 'TOOLS', importance: 'CRITICAL', minProficiency: 'INTERMEDIATE' },
        { name: 'Python', category: 'PROGRAMMING', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
        { name: 'Cryptography', category: 'TOOLS', importance: 'IMPORTANT', minProficiency: 'INTERMEDIATE' },
      ],
    },
  ];

  for (const role of rolesData) {
    const targetRole = await prisma.targetRole.upsert({
      where: { slug: role.slug },
      update: {
        name: role.name,
        description: role.description,
        minCgpa: role.minCgpa,
        averageCtcLpa: role.averageCtcLpa,
      },
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
        minCgpa: role.minCgpa,
        averageCtcLpa: role.averageCtcLpa,
      },
    });

    // Delete existing skills and recreate cleanly
    await prisma.roleSkill.deleteMany({ where: { targetRoleId: targetRole.id } });
    await prisma.roleSkill.createMany({
      data: role.skills.map((s) => ({
        targetRoleId: targetRole.id,
        name: s.name,
        category: s.category,
        importance: s.importance,
        minProficiency: s.minProficiency,
      })),
    });
  }
  console.log(`✅  Created ${rolesData.length} industry target roles with skills.`);

  // 2. Preparation Resources
  const prepData = [
    // DSA
    {
      title: 'Arrays, Two-Pointers & Sliding Window Mastery',
      description: 'Fundamental algorithmic techniques for fast contiguous subarray computation and in-place manipulations.',
      category: 'DSA',
      difficulty: 'EASY',
      estimatedHours: 4,
      contentUrl: 'https://leetcode.com/explore/featured/card/array-and-string/',
      tags: ['Arrays', 'Two Pointers', 'Sliding Window'],
      order: 1,
    },
    {
      title: 'Trees, BST & Recursive DFS/BFS Traversal',
      description: 'Master binary search trees, lowest common ancestor, diameter of tree, and level-order traversal algorithms.',
      category: 'DSA',
      difficulty: 'MEDIUM',
      estimatedHours: 6,
      contentUrl: 'https://leetcode.com/explore/learn/card/data-structure-tree/',
      tags: ['Trees', 'BST', 'Recursion'],
      order: 2,
    },
    {
      title: 'Dynamic Programming Patterns & Memoization',
      description: 'From recursion with memoization to bottom-up tabular DP. Covers 0/1 Knapsack, Longest Common Subsequence, and Grid Paths.',
      category: 'DSA',
      difficulty: 'HARD',
      estimatedHours: 10,
      contentUrl: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns',
      tags: ['DP', 'Memoization', 'Optimization'],
      order: 3,
    },
    {
      title: 'Graph Algorithms: Shortest Paths, Topological Sort & Cycles',
      description: 'Graph representations with adjacency lists, cycle detection in directed graphs, Dijkstra algorithm, and Disjoint Set Union (DSU).',
      category: 'DSA',
      difficulty: 'HARD',
      estimatedHours: 8,
      contentUrl: 'https://leetcode.com/explore/learn/card/graph/',
      tags: ['Graphs', 'BFS', 'Dijkstra', 'Topological Sort'],
      order: 4,
    },

    // System Design
    {
      title: 'High-Level Architecture: Caching, CDNs & Load Balancing',
      description: 'Learn how massive systems distribute traffic, minimize latency with Redis/Memcached, and cache assets at edge locations.',
      category: 'SYSTEM_DESIGN',
      difficulty: 'MEDIUM',
      estimatedHours: 5,
      contentUrl: 'https://github.com/donnemartin/system-design-primer',
      tags: ['Load Balancer', 'CDN', 'Redis', 'Scalability'],
      order: 5,
    },
    {
      title: 'Database Sharding, Replication & CAP Theorem',
      description: 'Horizontal partitioning, master-slave replication, consistent hashing, and navigating the trade-offs of consistency vs availability.',
      category: 'SYSTEM_DESIGN',
      difficulty: 'MEDIUM',
      estimatedHours: 4,
      contentUrl: 'https://github.com/donnemartin/system-design-primer#index-system-design-topics',
      tags: ['Sharding', 'CAP Theorem', 'NoSQL', 'Databases'],
      order: 6,
    },
    {
      title: 'Designing Real-Time Chat & Notification Pipelines',
      description: 'Architecting WebSocket servers, pub/sub queues with Kafka or RabbitMQ, and durable event storage for messaging at scale.',
      category: 'SYSTEM_DESIGN',
      difficulty: 'HARD',
      estimatedHours: 6,
      contentUrl: 'https://bytebytego.com',
      tags: ['System Design', 'WebSockets', 'Kafka', 'Real-time'],
      order: 7,
    },

    // Core CS
    {
      title: 'Operating Systems: Threads, Concurrency & Virtual Memory',
      description: 'Processes vs threads, mutex/semaphore synchronizations, deadlock prevention, page faults, and paging algorithms.',
      category: 'CORE_CS',
      difficulty: 'MEDIUM',
      estimatedHours: 5,
      contentUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
      tags: ['OS', 'Concurrency', 'Deadlock', 'Virtual Memory'],
      order: 8,
    },
    {
      title: 'DBMS Fundamentals: ACID Properties, Indexing & B-Trees',
      description: 'Database isolation levels, write-ahead logs, clustered vs non-clustered indexes, and query execution plan optimization.',
      category: 'CORE_CS',
      difficulty: 'MEDIUM',
      estimatedHours: 5,
      contentUrl: 'https://use-the-index-luke.com',
      tags: ['DBMS', 'ACID', 'Indexing', 'B-Trees'],
      order: 9,
    },
    {
      title: 'Computer Networks: TCP Handshake, DNS & TLS/HTTPS',
      description: 'Deep dive into 3-way handshake, flow control, DNS lookup resolution hierarchy, and asymmetric vs symmetric cryptography in HTTPS.',
      category: 'CORE_CS',
      difficulty: 'EASY',
      estimatedHours: 4,
      contentUrl: 'https://beej.us/guide/bgnet/',
      tags: ['Networking', 'TCP/IP', 'DNS', 'HTTPS'],
      order: 10,
    },

    // Aptitude
    {
      title: 'Quantitative Aptitude: Percentages, Profit-Loss & Time-Work',
      description: 'Standard speed math tricks, LCM/HCF shortcuts, work-rate equations, and time-speed-distance formulas frequently asked in tests.',
      category: 'APTITUDE',
      difficulty: 'EASY',
      estimatedHours: 4,
      contentUrl: 'https://www.indiabix.com/aptitude/questions-and-answers/',
      tags: ['Quant', 'Math', 'Speed Math'],
      order: 11,
    },
    {
      title: 'Logical Reasoning: Syllogisms, Blood Relations & Puzzles',
      description: 'Deductive logic questions, seating arrangement grids, family trees, and coding-decoding puzzles for campus placement filters.',
      category: 'APTITUDE',
      difficulty: 'EASY',
      estimatedHours: 3,
      contentUrl: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/',
      tags: ['Logic', 'Puzzles', 'Reasoning'],
      order: 12,
    },

    // Behavioral
    {
      title: 'The STAR Method: Mastering Behavioral & Leadership Prompts',
      description: 'Structure interview stories (Situation, Task, Action, Result) answering conflict resolution, failures, and technical leadership.',
      category: 'BEHAVIORAL',
      difficulty: 'EASY',
      estimatedHours: 2,
      contentUrl: 'https://www.themuse.com/advice/star-interview-method',
      tags: ['Behavioral', 'STAR', 'HR Questions'],
      order: 13,
    },
    {
      title: 'Culture Fit & Asking High-Impact Questions to Interviewers',
      description: 'Learn how to research company culture, demonstrate genuine intellectual curiosity, and ask thoughtful technical questions at the end of rounds.',
      category: 'BEHAVIORAL',
      difficulty: 'EASY',
      estimatedHours: 2,
      contentUrl: 'https://www.thebalancecareers.com/questions-to-ask-in-an-interview-2061205',
      tags: ['Culture', 'Questions', 'HR'],
      order: 14,
    },

    // Mock Test
    {
      title: 'Full Technical Assessment Simulation (DSA + CS Core)',
      description: 'A 90-minute timed simulation containing 2 algorithmic coding problems, 20 Core CS multiple choice questions, and 10 aptitude drills.',
      category: 'MOCK_TEST',
      difficulty: 'HARD',
      estimatedHours: 3,
      contentUrl: 'https://www.hackerrank.com',
      tags: ['Mock Test', 'Timed Assessment', 'Simulation'],
      order: 15,
    },
  ];

  for (const item of prepData) {
    const existing = await prisma.preparationResource.findFirst({
      where: { title: item.title },
    });
    if (existing) {
      await prisma.preparationResource.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.preparationResource.create({ data: item });
    }
  }
  console.log(`✅  Created ${prepData.length} curated preparation resources.`);

  // 3. Link Student Target Role & Roadmap for demo user `student@career360.dev`
  const student = await prisma.user.findUnique({
    where: { email: 'student@career360.dev' },
  });

  if (student) {
    const fullStackRole = await prisma.targetRole.findUnique({
      where: { slug: 'full-stack-developer' },
    });

    if (fullStackRole) {
      await prisma.studentTargetRole.upsert({
        where: {
          studentId_targetRoleId: {
            studentId: student.id,
            targetRoleId: fullStackRole.id,
          },
        },
        update: { isPrimary: true },
        create: {
          studentId: student.id,
          targetRoleId: fullStackRole.id,
          isPrimary: true,
        },
      });

      // Seed initial career roadmap items
      const roadmapData = [
        {
          title: 'Build a Full Stack Production Web App',
          description: 'Develop a modern web application with React, Node.js, and PostgreSQL, deployed on Vercel/Render with live demo link.',
          category: 'PROJECT',
          priority: 'HIGH',
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        {
          title: 'Solve 100 LeetCode Medium Problems',
          description: 'Focus on Arrays, Dynamic Programming, Trees, and Graph BFS/DFS patterns.',
          category: 'PREPARATION',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
        },
        {
          title: 'Earn AWS Certified Cloud Practitioner Certification',
          description: 'Validates baseline cloud architecture, EC2, S3, IAM, and VPC networking knowledge.',
          category: 'CERTIFICATION',
          priority: 'MEDIUM',
          status: 'PENDING',
        },
        {
          title: 'Complete 1 Industry Internship in Software Engineering',
          description: 'Gain real-world engineering teamwork experience, code reviews, and production bug fixing.',
          category: 'INTERNSHIP',
          priority: 'HIGH',
          status: 'COMPLETED',
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Maintain Minimum 8.5 CGPA in Upcoming Semesters',
          description: 'Ensure eligibility for Tier-1 Super Dream campus placement drives (>12 LPA CTC).',
          category: 'ACADEMIC',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
        },
      ];

      for (const item of roadmapData) {
        const existing = await prisma.careerRoadmapItem.findFirst({
          where: { studentId: student.id, title: item.title },
        });
        if (!existing) {
          await prisma.careerRoadmapItem.create({
            data: {
              ...item,
              studentId: student.id,
              targetRoleId: fullStackRole.id,
            },
          });
        }
      }

      // Seed 2 preparation progress items for student
      const firstResource = await prisma.preparationResource.findFirst({
        where: { category: 'DSA' },
      });
      if (firstResource) {
        await prisma.preparationProgress.upsert({
          where: {
            studentId_resourceId: {
              studentId: student.id,
              resourceId: firstResource.id,
            },
          },
          update: { status: 'COMPLETED', completedAt: new Date() },
          create: {
            studentId: student.id,
            resourceId: firstResource.id,
            status: 'COMPLETED',
            notes: 'Finished all 15 practice problems on sliding window.',
            completedAt: new Date(),
          },
        });
      }

      const secondResource = await prisma.preparationResource.findFirst({
        where: { category: 'CORE_CS' },
      });
      if (secondResource) {
        await prisma.preparationProgress.upsert({
          where: {
            studentId_resourceId: {
              studentId: student.id,
              resourceId: secondResource.id,
            },
          },
          update: { status: 'IN_PROGRESS' },
          create: {
            studentId: student.id,
            resourceId: secondResource.id,
            status: 'IN_PROGRESS',
            notes: 'Studying thread synchronization and deadlocks.',
          },
        });
      }

      console.log('✅  Configured demo student target role, roadmap milestones, and prep progress.');
    }
  }

  console.log('🎉  Phase 6 seeding completed successfully!');
}

seedCareer()
  .catch((e) => {
    console.error('❌  Error seeding Phase 6 data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
