import api from './api';

export const auditService = {
  /**
   * Get paginated audit logs with filters
   */
  async getAuditLogs(params = {}) {
    const res = await api.get('/audit-logs', { params });
    return res.data?.data;
  },

  /**
   * Get summary statistics of audit logs
   */
  async getAuditStats() {
    const res = await api.get('/audit-logs/stats');
    return res.data?.data;
  },
};

export default auditService;
