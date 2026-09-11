/**
 * Environment configuration
 * All environment variables are validated and exported from here.
 * Never access process.env directly in application code.
 */

const optional = (key, defaultValue = '') => process.env[key] || defaultValue;

const env = {
  NODE_ENV:      optional('NODE_ENV', 'development'),
  PORT:          parseInt(optional('PORT', '5000'), 10),
  DATABASE_URL:  optional('DATABASE_URL', ''),
  FRONTEND_URL:  optional('FRONTEND_URL', 'http://localhost:5173'),

  // JWT (Phase 1)
  JWT_SECRET:               optional('JWT_SECRET', ''),
  JWT_EXPIRES_IN:           optional('JWT_EXPIRES_IN', '15m'),
  REFRESH_TOKEN_SECRET:     optional('REFRESH_TOKEN_SECRET', ''),
  REFRESH_TOKEN_EXPIRES_IN: optional('REFRESH_TOKEN_EXPIRES_IN', '7d'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX:       parseInt(optional('RATE_LIMIT_MAX', '100'), 10),

  // Derived
  isDevelopment: optional('NODE_ENV', 'development') === 'development',
  isProduction:  optional('NODE_ENV', 'development') === 'production',
};

// ─── Startup validation ───────────────────────────────────────────────────────
const _validateSecrets = () => {
  const isProduction = env.NODE_ENV === 'production';

  if (!env.JWT_SECRET) {
    const msg = 'JWT_SECRET is not set. Authentication will not work.';
    if (isProduction) throw new Error(msg);
    console.warn(`\n⚠️  WARNING: ${msg}\n   Set JWT_SECRET in your .env file.\n`);
  }
  if (!env.REFRESH_TOKEN_SECRET) {
    const msg = 'REFRESH_TOKEN_SECRET is not set. Refresh tokens will not work.';
    if (isProduction) throw new Error(msg);
    console.warn(`\n⚠️  WARNING: ${msg}\n   Set REFRESH_TOKEN_SECRET in your .env file.\n`);
  }
};

_validateSecrets();

module.exports = { env };
