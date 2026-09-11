/**
 * Authenticate middleware
 *
 * Verifies the Bearer access token from the Authorization header.
 * Attaches the authenticated user to req.user.
 *
 * Usage: router.get('/protected', authenticate, controller)
 */

const { verifyAccessToken } = require('../utils/token.service');
const { prisma }            = require('../config/database');
const AppError              = require('../utils/AppError');

const authenticate = async (req, res, next) => {
  try {
    // 1. Extract Bearer token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Authentication required. Please login.', 'MISSING_TOKEN'));
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    // 2. Verify the token
    const payload = verifyAccessToken(token);

    // 3. Load the user from DB to ensure account still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id:     true,
        name:   true,
        email:  true,
        role:   true,
        status: true,
      },
    });

    if (!user) {
      return next(AppError.unauthorized('User account not found.', 'USER_NOT_FOUND'));
    }

    if (user.status !== 'ACTIVE') {
      return next(AppError.unauthorized('Your account has been deactivated. Please contact support.', 'ACCOUNT_INACTIVE'));
    }

    // 4. Attach user to request
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = authenticate;
