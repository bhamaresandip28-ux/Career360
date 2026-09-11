/**
 * Career360 — Audit Log Controller (Phase 7)
 */

const auditService = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, userId, limit, offset } = req.query;
    const result = await auditService.getAuditLogs({
      action,
      entityType,
      userId,
      limit,
      offset,
    });
    sendSuccess(res, result, 'Audit logs fetched successfully.');
  } catch (e) { next(e); }
};

module.exports = {
  getAuditLogs,
};
