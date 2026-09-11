/**
 * Career360 — Audit Logging Service (Phase 7)
 * Records and retrieves operational audit trails for security and administrative audits
 */

const { prisma } = require('../config/database');

async function recordAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  details = null,
  req = null,
}) {
  try {
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        details: details || undefined,
        ipAddress: ipAddress ? String(ipAddress).slice(0, 100) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
      },
    });
  } catch (err) {
    // Non-blocking: audit log failure should never crash user transactions
    console.error('⚠️  Failed to record audit log:', err.message);
    return null;
  }
}

async function getAuditLogs({ action, entityType, userId, limit = 50, offset = 0 } = {}) {
  const where = {};
  if (action && action !== 'ALL') where.action = action;
  if (entityType && entityType !== 'ALL') where.entityType = entityType;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    total,
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      details: l.details,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      createdAt: l.createdAt,
      user: l.user ? { name: l.user.name, email: l.user.email, role: l.user.role } : { name: 'System', role: 'SYSTEM' },
    })),
  };
}

module.exports = {
  recordAudit,
  getAuditLogs,
};
