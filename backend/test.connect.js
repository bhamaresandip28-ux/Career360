require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('URL value:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('\n✅ Prisma connected successfully!');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('\n❌ Prisma connection error:', e.message);
    process.exit(1);
  });
