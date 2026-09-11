/**
 * Career360 — Analytics & Administrative Service (Phase 5)
 */

import api from './api';

export const analyticsService = {
  // Analytics
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data?.data;
  },

  getPlacementAnalytics: async () => {
    const res = await api.get('/analytics/placement');
    return res.data?.data;
  },

  getFacultyAnalytics: async (departmentId) => {
    const params = departmentId ? { departmentId } : {};
    const res = await api.get('/analytics/faculty', { params });
    return res.data?.data;
  },

  getDepartmentAnalytics: async () => {
    const res = await api.get('/analytics/departments');
    return res.data?.data;
  },

  // Faculty & Admin Roster
  getStudentRoster: async (params = {}) => {
    const res = await api.get('/students/roster', { params });
    return res.data?.data?.students || [];
  },

  // Coordinator & Admin Placement Management
  getAllApplications: async (params = {}) => {
    const res = await api.get('/placement/applications', { params });
    return res.data?.data?.applications || [];
  },

  updateApplicationStatus: async (id, status, notes) => {
    const res = await api.patch(`/placement/applications/${id}/status`, { status, notes });
    return res.data?.data;
  },

  scheduleRound: async (data) => {
    const res = await api.post('/placement/rounds', data);
    return res.data?.data?.round;
  },

  recordOutcome: async (data) => {
    const res = await api.post('/placement/outcomes', data);
    return res.data?.data?.outcome;
  },

  // Admin User & Department Management
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data?.data?.users || [];
  },

  updateUserStatus: async (userId, status) => {
    const res = await api.patch(`/users/${userId}/status`, { status });
    return res.data?.data?.user;
  },

  createDepartment: async (data) => {
    const res = await api.post('/students/departments', data);
    return res.data?.data?.department;
  },
};

export default analyticsService;
