/**
 * Users routes — /api/v1/users
 *
 * GET  /me  — Get own profile (ownership — students cannot access others)
 */

const express      = require('express');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const { sendSuccess } = require('../utils/apiResponse');
const { prisma }   = require('../config/database');
const AppError     = require('../utils/AppError');
const auditService = require('../services/audit.service');
const bcrypt       = require('bcryptjs');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/users/me — authenticated user's own profile
router.get('/me', async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/change-password — update account password securely
router.patch('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw AppError.badRequest('Current and new passwords are required.');
    }
    if (newPassword.length < 8) {
      throw AppError.badRequest('New password must be at least 8 characters long.');
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Current password does not match.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    auditService.recordAudit({
      userId: req.user.id,
      action: 'PASSWORD_CHANGE',
      entityType: 'USER',
      entityId: req.user.id,
      req,
    });

    return sendSuccess(res, null, 'Password updated successfully.');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users — Admin list all users with search & filters
router.get('/', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        studentProfile: {
          select: {
            rollNumber: true,
            cgpa: true,
            department: { select: { name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, { users }, 'Users fetched.');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/:id/status — Admin update user status (ACTIVE / INACTIVE)
router.patch('/:id/status', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw AppError.badRequest('Status must be ACTIVE or INACTIVE.');
    }

    if (req.params.id === req.user.id) {
      throw AppError.badRequest('You cannot modify your own administrative status.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    auditService.recordAudit({
      userId: req.user.id,
      action: 'USER_STATUS_CHANGE',
      entityType: 'USER',
      entityId: updatedUser.id,
      details: { email: updatedUser.email, newStatus: status },
      req,
    });

    return sendSuccess(res, { user: updatedUser }, `User status set to ${status}.`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
