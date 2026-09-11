require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Prisma client keys:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users.length);
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => prisma.$disconnect());
