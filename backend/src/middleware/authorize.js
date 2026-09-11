/**
 * Authorize middleware — Role-Based Access Control
 *
 * Must be used AFTER authenticate middleware.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('ADMIN'), controller)
 *   router.get('/staff', authenticate, authorize('FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'), controller)
 */

const AppError = require('../utils/AppError');

/**
 * @param {...string} allowedRoles - One or more allowed roles
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required.', 'NOT_AUTHENTICATED'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(AppError.forbidden(
      `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      'INSUFFICIENT_ROLE'
    ));
  }

  return next();
};

module.exports = authorize;
