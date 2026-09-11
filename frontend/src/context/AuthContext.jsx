import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { setAuthToken, clearAuthToken } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the entire app.
 * On mount, silently restores session via /auth/refresh (HTTP-only cookie).
 *
 * Provides:
 *   currentUser, isAuthenticated, role,
 *   login(), register(), logout(), refreshUser(), isLoading
 */
export function AuthProvider({ children }) {
  const [currentUser,     setCurrentUser]     = useState(null);
  const [accessToken,     setAccessToken]     = useState(null);
  const [isLoading,       setIsLoading]       = useState(true); // true until session check done
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── Restore session on mount (silent refresh) ───────────────────────────
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const res = await authService.refresh();
        const user = res?.user || res?.data?.user;
        const token = res?.accessToken || res?.data?.accessToken;
        if (isMounted && user && token) {
          setCurrentUser(user);
          setAccessToken(token);
          setAuthToken(token);
          setIsAuthenticated(true);
        }
      } catch {
        // No valid session — visitor is not logged in
        if (isMounted) {
          clearAuthToken();
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    restoreSession();
    return () => { isMounted = false; };
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const user = res?.user || res?.data?.user || res;
    const token = res?.accessToken || res?.data?.accessToken;
    setCurrentUser(user);
    setAccessToken(token);
    setAuthToken(token);
    setIsAuthenticated(true);
    return user;
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, confirmPassword) => {
    const res = await authService.register(name, email, password, confirmPassword);
    const user = res?.user || res?.data?.user || res;
    const token = res?.accessToken || res?.data?.accessToken;
    setCurrentUser(user);
    setAccessToken(token);
    setAuthToken(token);
    setIsAuthenticated(true);
    return user;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Silently ignore — we clear local state regardless
    } finally {
      setCurrentUser(null);
      setAccessToken(null);
      clearAuthToken();
      setIsAuthenticated(false);
    }
  }, []);

  // ─── Refresh user data ────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { user } = await authService.getMe();
      setCurrentUser(user);
      return user;
    } catch {
      await logout();
    }
  }, [logout]);

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    role: currentUser?.role || null,
    accessToken,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
};
