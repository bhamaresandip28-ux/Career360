import { useAuthContext } from '../context/AuthContext';

/**
 * useAuth — convenience hook to access the auth context.
 *
 * Usage:
 *   const { currentUser, isAuthenticated, role, login, logout } = useAuth();
 */
export const useAuth = () => useAuthContext();
