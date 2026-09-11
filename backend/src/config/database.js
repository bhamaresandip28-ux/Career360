/**
 * Prisma Client singleton
 * Exports a single PrismaClient instance reused across the application.
 * In development, prevents multiple instances during hot reloads.
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prismaClientOptions = {
  log: [
    { level: 'warn',  emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
};

// ─── Singleton ────────────────────────────────────────────────────────────────
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaClientOptions);
} else {
  // Prevent multiple instances in development (hot-reload)
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaClientOptions);
  }
  prisma = global.__prisma;
}

// ─── Log Prisma warnings/errors ───────────────────────────────────────────────
prisma.$on('warn',  (e) => logger.warn(`[Prisma] ${e.message}`));
prisma.$on('error', (e) => logger.error(`[Prisma] ${e.message}`));

/**
 * Test the database connection.
 * Called on server startup — logs success or failure without crashing.
 */
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established.');
  } catch (error) {
    logger.warn(`⚠️  Database not connected: ${error.message}`);
    logger.warn('   The API will run without database access.');
    logger.warn('   Configure DATABASE_URL in .env to enable database features.');
  }
};

module.exports = { prisma, connectDatabase };
