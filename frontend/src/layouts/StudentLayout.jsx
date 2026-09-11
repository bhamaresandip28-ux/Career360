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
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Sidebar */}
      <aside
        className={clsx(
          'flex flex-col h-full bg-surface-900 border-r border-white/10 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className={clsx('flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0', collapsed && 'justify-center')}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Career<span className="text-primary-400">360</span>
            </span>
          )}
        </div>

        {/* User info */}
        {!collapsed && currentUser && (
          <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <Badge variant="primary" size="sm" className="mt-1">Student</Badge>
          </div>
        )}

        {/* Grouped Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title || `sec-${idx}`} className="space-y-1">
              {section.title && !collapsed && (
                <div className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                        ? 'bg-primary-600/20 text-primary-300 font-semibold border border-primary-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
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
            className="m-3 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-xl transition-colors"
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
          className="flex items-center justify-center h-10 border-t border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
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

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-surface-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-white">Student Career Portal</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20">
              Career360
            </span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            {currentUser && <span className="text-xs text-slate-300">{currentUser.name}</span>}
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-glow">
              {currentUser?.name?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
