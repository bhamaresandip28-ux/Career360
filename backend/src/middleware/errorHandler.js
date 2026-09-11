/**
 * Centralized error handler middleware
 *
 * Must be registered LAST in the Express middleware stack (after all routes).
 * Handles both operational (AppError) and unexpected (programming) errors.
 */

const AppError = require('../utils/AppError');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ─── Prisma error normalizer ──────────────────────────────────────────────────
const handlePrismaError = (err) => {
  // Unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return AppError.conflict(`A record with this ${field} already exists.`, 'DUPLICATE_ENTRY');
  }
  // Record not found
  if (err.code === 'P2025') {
    return AppError.notFound(err.meta?.cause || 'Record not found.', 'RESOURCE_NOT_FOUND');
  }
  // Foreign key constraint
  if (err.code === 'P2003') {
    return AppError.badRequest('Related resource does not exist.', 'FOREIGN_KEY_VIOLATION');
  }
  return null;
};

// ─── Main error handler ───────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  // Normalize Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err) || error;
  }

  // Prisma initialization error (DB not connected)
  if (
    err.name === 'PrismaClientInitializationError' ||
    err.name === 'PrismaClientValidationError' ||
    (err.message && err.message.includes('Cannot read properties of undefined') && err.message.includes('findUnique'))
  ) {
    error = new AppError(
      'Database is not available. Please configure DATABASE_URL and restart the server.',
      503,
      'DATABASE_UNAVAILABLE'
    );
  }


  // Ensure the error is an AppError
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message    = error.message    || 'An unexpected error occurred.';
    error = new AppError(message, statusCode, 'INTERNAL_ERROR', false);
  }

  // Log — always log 5xx; only log 4xx in development
  if (error.statusCode >= 500) {
    logger.error(`[${error.statusCode}] ${error.message}`, {
      stack: error.stack,
      path:  req.path,
      method: req.method,
    });
  } else if (process.env.NODE_ENV === 'development') {
    logger.warn(`[${error.statusCode}] ${error.message}`, { path: req.path });
  }

  // In production, don't leak programming error details
  const message = (!error.isOperational && process.env.NODE_ENV === 'production')
    ? 'An unexpected error occurred.'
    : error.message;

  return sendError(
    res,
    error.code,
    message,
    error.statusCode,
    process.env.NODE_ENV !== 'production' ? { stack: error.stack } : null
  );
};

module.exports = errorHandler;
