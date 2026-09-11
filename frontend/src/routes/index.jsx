import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Guards
import ProtectedRoute, { PublicOnlyRoute } from '../components/guards/ProtectedRoute';

// Layouts
import StudentLayout     from '../layouts/StudentLayout';
import FacultyLayout     from '../layouts/FacultyLayout';
import CoordinatorLayout from '../layouts/CoordinatorLayout';
import AdminLayout       from '../layouts/AdminLayout';

// Auth pages
import LoginPage    from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Student pages
import StudentDashboard   from '../pages/student/StudentDashboard';
import ProfilePage        from '../pages/student/ProfilePage';
import SkillsPage         from '../pages/student/SkillsPage';
import ProjectsPage       from '../pages/student/ProjectsPage';
import CertificationsPage from '../pages/student/CertificationsPage';
import InternshipsPage    from '../pages/student/InternshipsPage';
import AchievementsPage   from '../pages/student/AchievementsPage';
import AcademicsPage      from '../pages/student/AcademicsPage';
import PlacementsPage     from '../pages/student/PlacementsPage';
import CareerIntelligencePage from '../pages/student/CareerIntelligencePage';
import PreparationHubPage     from '../pages/student/PreparationHubPage';
import PlacementInsightsPage from '../pages/student/PlacementInsightsPage';

// Faculty pages
import FacultyDashboard      from '../pages/faculty/FacultyDashboard';
import FacultyStudentsPage   from '../pages/faculty/FacultyStudentsPage';
import FacultyEarlyWarningPage from '../pages/faculty/FacultyEarlyWarningPage';

// Placement Coordinator pages
import CoordinatorDashboard        from '../pages/coordinator/CoordinatorDashboard';
import CoordinatorCompaniesPage    from '../pages/coordinator/CoordinatorCompaniesPage';
import CoordinatorDrivesPage       from '../pages/coordinator/CoordinatorDrivesPage';
import CoordinatorApplicationsPage from '../pages/coordinator/CoordinatorApplicationsPage';
import CoordinatorPlacementsPage   from '../pages/coordinator/CoordinatorPlacementsPage';

// Admin pages
import AdminDashboard       from '../pages/admin/AdminDashboard';
import AdminUsersPage       from '../pages/admin/AdminUsersPage';
import AdminDepartmentsPage from '../pages/admin/AdminDepartmentsPage';

// Public pages
import LandingPage    from '../pages/LandingPage';
import PlaceholderPage from '../pages/PlaceholderPage';

// Phase 7 pages
import NotificationsPage      from '../pages/NotificationsPage';
import StudentReportsPage     from '../pages/student/StudentReportsPage';
import CoordinatorReportsPage from '../pages/coordinator/CoordinatorReportsPage';
import AdminAuditPage         from '../pages/admin/AdminAuditPage';
import SettingsPage           from '../pages/SettingsPage';

// ─── Placeholder factory ──────────────────────────────────────────────────────
const ph = (title, phase) => ({ element: <PlaceholderPage title={title} phase={phase} /> });

import { useAuth } from '../hooks/useAuth';
import { ROLE_DASHBOARDS } from '../components/guards/ProtectedRoute';

// ─── Dashboard Redirector ────────────────────────────────────────────────────
function DashboardRedirect() {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const dest = ROLE_DASHBOARDS[role] || '/student/dashboard';
  return <Navigate to={dest} replace />;
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Public ──────────────────────────────────────────────────────────────────
  { path: '/',          element: <LandingPage /> },
  { path: '/login',     element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/register',  element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute> },
  { path: '/dashboard', element: <DashboardRedirect /> },
  { path: '/insights',  element: <PlacementInsightsPage /> },

  // ── Student routes ──────────────────────────────────────────────────────────
  {
    path: '/student',
    element: <ProtectedRoute allowedRoles={['STUDENT']}><StudentLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',      element: <StudentDashboard /> },
      { path: 'profile',        element: <ProfilePage /> },
      { path: 'academics',      element: <AcademicsPage /> },
      { path: 'skills',         element: <SkillsPage /> },
      { path: 'projects',       element: <ProjectsPage /> },
      { path: 'certifications', element: <CertificationsPage /> },
      { path: 'internships',    element: <InternshipsPage /> },
      { path: 'achievements',   element: <AchievementsPage /> },
      { path: 'placements',     element: <PlacementsPage /> },
      { path: 'insights',       element: <PlacementInsightsPage /> },
      { path: 'placement-insights', element: <Navigate to="/student/insights" replace /> },
      { path: 'career',         element: <CareerIntelligencePage /> },
      { path: 'preparation',    element: <PreparationHubPage /> },
      { path: 'reports',        element: <StudentReportsPage /> },
      { path: 'notifications',  element: <NotificationsPage /> },
      { path: 'settings',       element: <SettingsPage /> },
    ],
  },

  // ── Faculty routes ──────────────────────────────────────────────────────────
  {
    path: '/faculty',
    element: <ProtectedRoute allowedRoles={['FACULTY']}><FacultyLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <FacultyDashboard /> },
      { path: 'students',      element: <FacultyStudentsPage /> },
      { path: 'academics',     element: <FacultyStudentsPage /> }, // Academic monitoring roster
      { path: 'skills',        ...ph('Skill Development Oversight', 'Phase 6') },
      { path: 'career',        ...ph('Career Readiness',            'Phase 6') },
      { path: 'early-warning', element: <FacultyEarlyWarningPage /> },
      { path: 'reports',       element: <CoordinatorReportsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings',      element: <SettingsPage /> },
    ],
  },

  // ── Placement Coordinator routes ─────────────────────────────────────────────
  {
    path: '/coordinator',
    element: <ProtectedRoute allowedRoles={['PLACEMENT_COORDINATOR']}><CoordinatorLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',    element: <CoordinatorDashboard /> },
      { path: 'companies',    element: <CoordinatorCompaniesPage /> },
      { path: 'jobs',         element: <CoordinatorDrivesPage /> },
      { path: 'drives',       element: <CoordinatorDrivesPage /> },
      { path: 'eligible',     element: <CoordinatorApplicationsPage /> },
      { path: 'applications', element: <CoordinatorApplicationsPage /> },
      { path: 'rounds',       element: <CoordinatorApplicationsPage /> },
      { path: 'placements',   element: <CoordinatorPlacementsPage /> },
      { path: 'analytics',    element: <CoordinatorDashboard /> },
      { path: 'reports',      element: <CoordinatorReportsPage /> },
      { path: 'notifications',element: <NotificationsPage /> },
      { path: 'settings',     element: <SettingsPage /> },
    ],
  },

  // ── Admin routes ─────────────────────────────────────────────────────────────
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',    element: <AdminDashboard /> },
      { path: 'users',        element: <AdminUsersPage /> },
      { path: 'departments',  element: <AdminDepartmentsPage /> },
      { path: 'roles',        element: <AdminUsersPage /> },
      { path: 'skills',       ...ph('Skill Taxonomy',      'Phase 6') },
      { path: 'target-roles', ...ph('Target Roles',        'Phase 6') },
      { path: 'config',       ...ph('System Config',       'Phase 7') },
      { path: 'audit',        element: <AdminAuditPage /> },
      { path: 'reports',      element: <CoordinatorReportsPage /> },
      { path: 'notifications',element: <NotificationsPage /> },
      { path: 'settings',     element: <SettingsPage /> },
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
