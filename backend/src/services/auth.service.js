/**
 * Auth service — core authentication business logic.
 * All database operations and security logic live here, not in controllers.
 */

const bcrypt      = require('bcryptjs');
const crypto      = require('crypto');
const { prisma }  = require('../config/database');
const AppError    = require('../utils/AppError');
const logger      = require('../utils/logger');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token.service');

const BCRYPT_ROUNDS = 12;

// ─── Safe user shape — NEVER return passwordHash or refreshTokenHash ──────────
const safeUser = (user) => ({
  id:        user.id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  status:    user.status,
  createdAt: user.createdAt,
});

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new STUDENT account.
 * Only STUDENT accounts can be created via public registration.
 * Admin/Faculty/Coordinator accounts are created by admins.
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
const registerUser = async ({ name, email, password }) => {
  // Check for existing account
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Use a generic message to avoid email enumeration
    throw AppError.conflict(
      'An account with this email already exists.',
      'EMAIL_TAKEN'
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create user (always STUDENT via public registration)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'STUDENT', status: 'ACTIVE' },
  });

  logger.info(`New user registered: ${user.email} [${user.role}]`);

  // Generate tokens
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Hash and store refresh token
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data:  { refreshTokenHash },
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email + password.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
const loginUser = async ({ email, password }) => {
  // Always query — use constant-time comparison to prevent timing attacks
  const user = await prisma.user.findUnique({ where: { email } });

  // Intentionally vague error message to prevent user enumeration
  const INVALID_CREDS = AppError.unauthorized(
    'Email or password is incorrect.',
    'INVALID_CREDENTIALS'
  );

  if (!user) {
    // Still run bcrypt to maintain constant time
    await bcrypt.hash(password, BCRYPT_ROUNDS);
    throw INVALID_CREDS;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw INVALID_CREDS;

  if (user.status !== 'ACTIVE') {
    throw AppError.unauthorized(
      'Your account has been deactivated. Please contact support.',
      'ACCOUNT_INACTIVE'
    );
  }

  logger.info(`User logged in: ${user.email} [${user.role}]`);

  // Generate tokens
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Hash and store new refresh token (token rotation)
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data:  { refreshTokenHash },
  });

  return { user: safeUser(user), accessToken, refreshToken };
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

/**
 * Issue a new access token from a valid refresh token.
 * @param {string} refreshToken
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw AppError.unauthorized('No refresh token provided.', 'MISSING_REFRESH_TOKEN');
  }

  // Verify JWT signature + expiry
  const payload = verifyRefreshToken(refreshToken);

  // Load user
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.refreshTokenHash) {
    throw AppError.unauthorized('Session invalid. Please login again.', 'SESSION_INVALID');
  }

  if (user.status !== 'ACTIVE') {
    throw AppError.unauthorized('Account inactive.', 'ACCOUNT_INACTIVE');
  }

  // Verify stored hash matches provided refresh token (prevents reuse after logout)
  const tokenMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!tokenMatch) {
    // Potential refresh token theft — invalidate all sessions
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: null } });
    throw AppError.unauthorized('Session invalid. Please login again.', 'SESSION_COMPROMISED');
  }

  // Token rotation — issue new refresh token
  const newAccessToken  = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data:  { refreshTokenHash: newRefreshTokenHash },
  });

  return { user: safeUser(user), accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalidate the user's refresh token (server-side logout).
 * @param {string} userId
 */
const logoutUser = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data:  { refreshTokenHash: null },
  });
  logger.info(`User logged out: ${userId}`);
};

// ─── Get current user ─────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's safe profile.
 * @param {string} userId
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true,
      role: true, status: true, createdAt: true,
    },
  });
  if (!user) throw AppError.notFound('User not found.', 'USER_NOT_FOUND');
  return user;
};

// ─── Admin: Create privileged user ───────────────────────────────────────────

/**
 * Create a user with a specific role. Admin-only operation.
 * @param {{ name, email, password, role }} data
 */
const createPrivilegedUser = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw AppError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, status: 'ACTIVE' },
  });

  logger.info(`Privileged user created by admin: ${user.email} [${user.role}]`);
  return safeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  createPrivilegedUser,
  safeUser,
};
