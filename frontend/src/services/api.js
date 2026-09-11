import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required for HTTP-only refresh cookie
});

// ─── Token management (in-memory only — no localStorage) ─────────────────────
let _accessToken = null;

export const setAuthToken  = (token) => { _accessToken = token; };
export const clearAuthToken = ()     => { _accessToken = null; };
export const getAuthToken  = ()      => _accessToken;

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — silent refresh on 401 ────────────────────────────
let _isRefreshing = false;
let _failedQueue  = [];

const processQueue = (error, token = null) => {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _failedQueue = [];
};

api.interceptors.response.use(
  // Pass successful responses directly
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 for non-auth endpoints (never for /auth/refresh, /auth/login, etc.)
    const isAuthRequest = originalRequest?.url?.includes('/auth/');

    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      !isAuthRequest
    ) {
      if (_isRefreshing) {
        // Queue requests that arrive while a refresh is in progress
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retried = true;
      _isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const newToken = res.data?.data?.accessToken || res.data?.accessToken;

        setAuthToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthToken();
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        _isRefreshing = false;
      }
    }

    // Extract the server error message
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    return Promise.reject(new Error(message));
  }
);

export default api;
