import api from './api';

/**
 * Auth service — API calls for authentication.
 * All auth HTTP calls are centralised here.
 */
export const authService = {
  /**
   * POST /auth/register — create a new student account.
   */
  register: async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, email, password, confirmPassword });
    return res.data?.data || res.data;
  },

  /**
   * POST /auth/login
   */
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data?.data || res.data;
  },

  /**
   * POST /auth/logout
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * GET /auth/me — get current authenticated user.
   */
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data?.data || res.data;
  },

  /**
   * POST /auth/refresh — exchange refresh cookie for new access token.
   */
  refresh: async () => {
    const res = await api.post('/auth/refresh');
    return res.data?.data || res.data;
  },
};
