/**
 * Career360 — Development Seed Data
 *
 * Creates one account for each role for development and testing purposes.
 * ⚠️  DEV ONLY — Never run this in production.
 * ⚠️  These credentials must never be used in a real environment.
 *
 * Usage: node prisma/seed.js  (from project root)
 *        or: npm run seed      (from backend/)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

// ─── Seed accounts ────────────────────────────────────────────────────────────
// These are DEVELOPMENT credentials only.
// Change immediately if accidentally exposed.
const seedUsers = [
  {
    name:     'Admin User',
    email:    'admin@career360.dev',
    password: 'Admin@1234',
    role:     'ADMIN',
  },
  {
    name:     'Faculty Member',
    email:    'faculty@career360.dev',
    password: 'Faculty@1234',
    role:     'FACULTY',
  },
  {
    name:     'Placement Coordinator',
    email:    'placement@career360.dev',
    password: 'Placement@1234',
    role:     'PLACEMENT_COORDINATOR',
  },
  {
    name:     'Student User',
    email:    'student@career360.dev',
    password: 'Student@1234',
    role:     'STUDENT',
  },
];

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌  Seed must not be run in production.');
    process.exit(1);
  }

  console.log('🌱  Running Career360 development seed...\n');

  for (const seedUser of seedUsers) {
    const existing = await prisma.user.findUnique({ where: { email: seedUser.email } });

    if (existing) {
      console.log(`   ⏭  Skipping ${seedUser.email} — already exists.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(seedUser.password, BCRYPT_ROUNDS);

    await prisma.user.create({
      data: {
        name:         seedUser.name,
        email:        seedUser.email,
        passwordHash,
        role:         seedUser.role,
        status:       'ACTIVE',
      },
    });

    console.log(`   ✅  Created [${seedUser.role.padEnd(22)}] ${seedUser.email}`);
  }

  console.log('\n✅  Seed complete.\n');
  console.log('   DEV CREDENTIALS (never use in production):');
  console.log('   ─────────────────────────────────────────');
  seedUsers.forEach((u) => {
    console.log(`   ${u.role.padEnd(22)} ${u.email}  /  ${u.password}`);
  });
  console.log('');
}

main()
  .catch((err) => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
