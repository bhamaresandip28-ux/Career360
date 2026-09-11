/**
 * Auth routes — /api/v1/auth
 *
 * POST   /register  — Create new student account
 * POST   /login     — Login and receive tokens
 * POST   /logout    — Invalidate session
 * GET    /me        — Get current authenticated user
 * POST   /refresh   — Refresh access token from cookie
 */

const express      = require('express');
const rateLimit    = require('express-rate-limit');
const validate     = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const {
  register, login, logout, me, refresh,
} = require('../controllers/auth.controller');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

// ─── Strict rate limit for auth endpoints ─────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 20,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: {
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
    },
  },
});


// ─── Public routes ────────────────────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/refresh',  refresh);

// ─── Protected routes ─────────────────────────────────────────────────────────
router.post('/logout', authenticate, logout);
router.get('/me',      authenticate, me);

module.exports = router;
