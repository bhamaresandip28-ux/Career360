import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/ui/Badge';
import NotificationCenter from '../components/ui/NotificationCenter';

const NAV_SECTIONS = [
  {
    items: [
      { label: 'Dashboard', to: '/student/dashboard', icon: '⊞' },
    ],
  },
  {
    title: 'MY CAREER',
    items: [
      { label: 'Profile', to: '/student/profile', icon: '👤' },
      { label: 'Academics', to: '/student/academics', icon: '🎓' },
      { label: 'Skills', to: '/student/skills', icon: '⚡' },
      { label: 'Projects', to: '/student/projects', icon: '💻' },
      { label: 'Certifications', to: '/student/certifications', icon: '🏅' },
      { label: 'Internships', to: '/student/internships', icon: '🏢' },
      { label: 'Achievements', to: '/student/achievements', icon: '🏆' },
    ],
  },
  {
    title: 'CAREER',
    items: [
      { label: 'Career Intelligence', to: '/student/career', icon: '🧭' },
      { label: 'Preparation Hub', to: '/student/preparation', icon: '📚' },
      { label: 'Reports & CV', to: '/student/reports', icon: '📊' },
    ],
  },
  {
    title: 'PLACEMENTS',
    items: [
      { label: 'Previous Year Insights', to: '/student/insights', icon: '📈' },
      { label: 'Placement Drives', to: '/student/placements', icon: '📋' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Notifications', to: '/student/notifications', icon: '🔔' },
      { label: 'Settings', to: '/student/settings', icon: '⚙️' },
    ],
  },
];

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB]">
      {/* ─── Sidebar (Dark Navy #001D39) ─────────────────────────────────── */}
      <aside
        className={clsx(
          'flex flex-col h-full bg-[#001D39] border-r border-[#0A4174]/40 transition-all duration-300 z-30 shadow-lg',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={clsx('flex items-center gap-3 px-4 h-16 border-b border-[#0A4174]/30 flex-shrink-0', collapsed && 'justify-center')}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0A4174] border border-[#7BBDE8]/40 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Career<span className="text-[#7BBDE8]">360</span>
            </span>
          )}
        </div>

        {/* User info */}
        {!collapsed && currentUser && (
          <div className="px-4 py-3 border-b border-[#0A4174]/30 flex-shrink-0">
            <p className="text-xs text-[#BDD8E9]/70">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <Badge variant="primary" size="sm" className="mt-1">Student</Badge>
          </div>
        )}

        {/* Grouped Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title || `sec-${idx}`} className="space-y-1">
              {section.title && !collapsed && (
                <div className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#7BBDE8]/80">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/student/dashboard'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    clsx(
                      'sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-[#0A4174] text-white font-semibold border border-[#7BBDE8]/40 shadow-sm'
                        : 'text-[#BDD8E9] hover:text-white hover:bg-[#0A4174]/40',
                      collapsed && 'justify-center px-2'
                    )
                  }
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="m-3 flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#BDD8E9] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Sign Out
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center h-10 border-t border-[#0A4174]/30 text-[#BDD8E9] hover:text-white hover:bg-[#0A4174]/30 transition-colors flex-shrink-0"
        >
          <svg
            className={clsx('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </aside>

      {/* ─── Main Content Surface ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header (Clean White Surface) */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white shadow-sm flex-shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold text-[#001D39]">Student Career Portal</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E1EFF8] text-[#0A4174] border border-[#BDD8E9]">
              Career360
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            {currentUser && <span className="text-xs font-medium text-slate-700">{currentUser.name}</span>}
            <div className="w-8 h-8 rounded-full bg-[#0A4174] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {currentUser?.name?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 overflow-y-auto bg-[#F4F7FB]"><Outlet /></main>
      </div>
    </div>
  );
}
