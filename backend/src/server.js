/**
 * Career360 API — Entry Point
 * Loads environment variables then starts the HTTP server.
 */

const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const app = require('./app');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Career360 API running on http://localhost:${PORT}`);
  logger.info(`   Environment : ${env.NODE_ENV}`);
  logger.info(`   Health check: http://localhost:${PORT}/api/v1/health`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});
