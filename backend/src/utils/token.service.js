/**
 * Token service — JWT generation and verification.
 * Access tokens: short-lived (15 min), sent in response body.
 * Refresh tokens: long-lived (7 days), stored in HTTP-only cookie.
 */

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const AppError = require('./AppError');

// ─── Access Token ─────────────────────────────────────────────────────────────

/**
 * Generate a short-lived access token.
 * @param {{ id: string, email: string, role: string }} user
 * @returns {string} signed JWT
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Access token has expired.', 'TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid access token.', 'INVALID_TOKEN');
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Generate a long-lived refresh token.
 * @param {{ id: string, role: string }} user
 * @returns {string} signed JWT
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );
};

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw AppError.unauthorized('Refresh token has expired. Please login again.', 'REFRESH_TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid refresh token.', 'INVALID_REFRESH_TOKEN');
  }
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = 'career360_rt';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Set the refresh token as an HTTP-only cookie on the response.
 */
const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure:   env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    maxAge:   REFRESH_COOKIE_MAX_AGE,
    path:     '/api/v1/auth',
  });
};

/**
 * Clear the refresh token cookie.
 */
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure:   env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path:     '/api/v1/auth',
  });
};

/**
 * Read the refresh token from the request cookie.
 * @returns {string|null}
 */
const getRefreshCookie = (req) => {
  return req.cookies?.[REFRESH_COOKIE_NAME] || null;
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshCookie,
  REFRESH_COOKIE_NAME,
};
