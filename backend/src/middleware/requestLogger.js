/**
 * Request logger middleware
 * Uses Morgan for HTTP request logging with Winston stream integration.
 */

const morgan = require('morgan');
const logger = require('../utils/logger');

// Winston stream for Morgan
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Use 'dev' format in development, 'combined' in production
const format = (process.env.NODE_ENV || 'development') === 'production'
  ? 'combined'
  : 'dev';

const requestLogger = morgan(format, { stream });

module.exports = requestLogger;
