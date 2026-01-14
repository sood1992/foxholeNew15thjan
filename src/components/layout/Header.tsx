import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Play,
  Pause,
  Clock,
  ChevronDown,
  LogOut,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

export default function Header() {
  const {
    currentUser,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    activeTimer,
    stopTimer,
    getUserLevel,
    users,
    login,
    logout,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Timer display update
  useEffect(() => {
    if (!activeTimer) {
      setTimerDisplay('00:00:00');
      return;
    }

    const updateTimer = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimerDisplay(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const currentLevel = currentUser ? getUserLevel(currentUser.xp) : null;
  const xpProgress = currentUser && currentLevel
    ? ((currentUser.xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100
    : 0;

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search projects, tasks, team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 py-2"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Active Timer */}
        {activeTimer && (
          <div className="flex items-center gap-2 px-4 py-2 bg-success-50 rounded-lg border border-success-500">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse" />
            </div>
            <Clock size={16} className="text-success-600" />
            <span className="font-mono font-medium text-success-600">{timerDisplay}</span>
            <button
              onClick={stopTimer}
              className="ml-2 p-1 hover:bg-success-100 rounded transition-colors"
            >
              <Pause size={16} className="text-success-600" />
            </button>
          </div>
        )}

        {/* XP Display */}
        {currentUser && currentLevel && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
            <Zap size={16} className="text-primary-500" />
            <span className="text-sm font-medium text-primary-700">
              Lvl {currentLevel.level}
            </span>
            <div className="w-20 h-2 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-xs text-primary-600">{currentUser.xp} XP</span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown right-0 w-80 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-surface-200 flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-500 hover:text-primary-600"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              {userNotifications.length === 0 ? (
                <div className="p-4 text-center text-text-muted">
                  No notifications
                </div>
              ) : (
                userNotifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`px-4 py-3 hover:bg-surface-50 cursor-pointer border-b border-surface-100 last:border-0 ${
                      !notif.read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{notif.message}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {currentUser?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <ChevronDown size={16} className="text-text-muted" />
          </button>

          {showUserMenu && (
            <div className="dropdown right-0">
              <div className="px-4 py-3 border-b border-surface-200">
                <p className="font-medium text-text-primary">{currentUser?.name}</p>
                <p className="text-xs text-text-muted capitalize">{currentUser?.role}</p>
              </div>

              {/* Role Switcher (for demo) */}
              <div className="px-2 py-2 border-b border-surface-200">
                <p className="px-2 text-xs text-text-muted uppercase tracking-wide mb-1">
                  Switch User (Demo)
                </p>
                {users.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      login(user.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full dropdown-item ${
                      currentUser?.id === user.id ? 'bg-primary-50 text-primary-600' : ''
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-text-muted capitalize">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={logout}
                className="dropdown-item text-danger-500 hover:bg-danger-50"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
