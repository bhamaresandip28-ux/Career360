import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../ui/Loading';

// Role → default dashboard path
const ROLE_DASHBOARDS = {
  STUDENT:               '/student/dashboard',
  FACULTY:               '/faculty/dashboard',
  PLACEMENT_COORDINATOR: '/coordinator/dashboard',
  ADMIN:                 '/admin/dashboard',
};

/**
 * ProtectedRoute — guards a route requiring authentication.
 *
 * @param {string[]}  [allowedRoles]  - If provided, only these roles can access
 * @param {string}    [redirectTo]    - Override redirect destination
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // While session is being restored, show a full-screen loader
  if (isLoading) {
    return <Loading fullScreen label="Authenticating..." />;
  }

  // Not authenticated → send to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role → send to own dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    const ownDashboard = ROLE_DASHBOARDS[role] || '/';
    return <Navigate to={ownDashboard} replace />;
  }

  return children;
}

/**
 * PublicOnlyRoute — accessible only when NOT authenticated.
 * Redirects logged-in users to their role dashboard.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <Loading fullScreen label="Loading..." />;
  }

  if (isAuthenticated) {
    const dashboard = ROLE_DASHBOARDS[role] || '/student/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  return children;
}

export { ROLE_DASHBOARDS };
