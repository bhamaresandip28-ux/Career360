/**
 * Auth controller — thin HTTP layer delegating to auth.service.
 */

const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshCookie,
} = require('../utils/token.service');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerUser({ name, email, password });

    setRefreshCookie(res, refreshToken);

    auditService.recordAudit({
      userId: user.id,
      action: 'AUTH_REGISTER',
      entityType: 'USER',
      entityId: user.id,
      details: { role: user.role, email: user.email },
      req,
    });

    return sendCreated(res, { user, accessToken }, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });

    setRefreshCookie(res, refreshToken);

    auditService.recordAudit({
      userId: user.id,
      action: 'AUTH_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      details: { role: user.role, email: user.email },
      req,
    });

    return sendSuccess(res, { user, accessToken }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const refreshToken = getRefreshCookie(req);
    if (refreshToken && req.user?.id) {
      await authService.logoutUser(req.user.id);
      auditService.recordAudit({
        userId: req.user.id,
        action: 'AUTH_LOGOUT',
        entityType: 'USER',
        entityId: req.user.id,
        req,
      });
    }
    clearRefreshCookie(res);
    return sendSuccess(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────
const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh access token ────────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const refreshToken = getRefreshCookie(req);
    const { user, accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(refreshToken);

    setRefreshCookie(res, newRefreshToken);
    return sendSuccess(res, { user, accessToken }, 'Token refreshed.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me, refresh };
