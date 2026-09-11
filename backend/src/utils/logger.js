/**
 * Winston logger
 * Centralised logging utility used across the backend.
 */

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf, json } = format;

const isDev = (process.env.NODE_ENV || 'development') === 'development';

// ─── Development format ───────────────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${ts}] ${level}: ${message}${extras}`;
  })
);

// ─── Production format ────────────────────────────────────────────────────────
const prodFormat = combine(
  timestamp(),
  json()
);

const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
  ],
  exitOnError: false,
});

module.exports = logger;
