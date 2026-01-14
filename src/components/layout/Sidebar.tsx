import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  Users,
  BarChart3,
  Flame,
  ExternalLink,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'pm', 'employee'] },
  { icon: Kanban, label: 'Kanban Board', path: '/kanban', roles: ['admin', 'pm', 'employee'] },
  { icon: Briefcase, label: 'Projects', path: '/projects', roles: ['admin', 'pm', 'employee'] },
  { icon: Calendar, label: 'Production Calendar', path: '/calendar', roles: ['admin', 'pm', 'employee'] },
  { icon: Flame, label: 'Capacity Heatmap', path: '/heatmap', roles: ['admin', 'pm'] },
  { icon: BarChart3, label: 'Team ROI', path: '/roi', roles: ['admin'] },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', roles: ['admin', 'pm', 'employee'] },
  { icon: Users, label: 'Team', path: '/team', roles: ['admin', 'pm'] },
  { icon: ExternalLink, label: 'Client Portal', path: '/portal', roles: ['admin', 'pm'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'pm', 'employee'] },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, currentUser, hasRole } = useApp();

  const filteredNavItems = navItems.filter(item =>
    hasRole(item.roles as ('admin' | 'pm' | 'employee')[])
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white shadow-card z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">Foxhole</h1>
              <p className="text-xs text-text-muted">by Neofox</p>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">F</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-8rem)]">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-text-secondary hover:bg-surface-100 hover:text-text-primary'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon size={20} className={sidebarCollapsed ? '' : 'flex-shrink-0'} />
            {!sidebarCollapsed && (
              <span className="font-medium">{item.label}</span>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-text-primary text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Collapse Button */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-surface-200 bg-white">
        {!sidebarCollapsed && currentUser && (
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{currentUser.name}</p>
              <p className="text-xs text-text-muted capitalize">{currentUser.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full p-3 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-100 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
