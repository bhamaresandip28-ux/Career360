import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/ui/Badge';
import NotificationCenter from '../components/ui/NotificationCenter';

const NAV = [
  { label: 'Dashboard',         to: '/admin/dashboard',        icon: '⊞' },
  { label: 'User Management',   to: '/admin/users',            icon: '👥' },
  { label: 'Departments',       to: '/admin/departments',      icon: '🏛️' },
  { label: 'Skill Taxonomy',    to: '/admin/skills',           icon: '⚡' },
  { label: 'Target Roles',      to: '/admin/target-roles',     icon: '🎯' },
  { label: 'System Config',     to: '/admin/config',           icon: '⚙️' },
  { label: 'Audit Logs',        to: '/admin/audit',            icon: '📋' },
  { label: 'Reports',           to: '/admin/reports',          icon: '📊' },
  { label: 'Settings',          to: '/admin/settings',         icon: '🔧' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout }   = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      <aside className={clsx('flex flex-col h-full bg-surface-900 border-r border-white/10 transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
        <div className={clsx('flex items-center gap-3 px-4 h-16 border-b border-white/10', collapsed && 'justify-center')}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          {!collapsed && <span className="font-display font-bold text-white text-lg tracking-tight">Career<span className="text-primary-400">360</span></span>}
        </div>
        {!collapsed && currentUser && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <Badge variant="danger" size="sm" className="mt-1">Admin</Badge>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin/dashboard'} title={collapsed ? item.label : undefined}
              className={({ isActive }) => clsx('sidebar-item', isActive && 'active', collapsed && 'justify-center px-2')}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {!collapsed && (
          <button onClick={handleLogout} className="m-3 flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-xl transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            Sign Out
          </button>
        )}
        <button onClick={() => setCollapsed((c) => !c)} className="flex items-center justify-center h-10 border-t border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <svg className={clsx('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-surface-900/80 backdrop-blur-sm">
          <h1 className="text-base font-semibold text-white">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            {currentUser && <span className="text-sm text-slate-400">{currentUser.name}</span>}
            <div className="w-8 h-8 rounded-full bg-danger-600 flex items-center justify-center text-white text-xs font-bold">
              {currentUser?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
