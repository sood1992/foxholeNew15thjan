import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Mail,
  Phone,
  Calendar,
  Zap,
  Trophy,
  Flame,
  Star,
  MoreVertical,
  Edit2,
  UserX,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { format, parseISO } from 'date-fns';

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-danger-100 text-danger-600' },
  pm: { label: 'Project Manager', color: 'bg-primary-100 text-primary-600' },
  employee: { label: 'Employee', color: 'bg-success-100 text-success-600' },
};

const specializationConfig: Record<string, { label: string; icon: string }> = {
  photographer: { label: 'Photographer', icon: '📷' },
  videographer: { label: 'Videographer', icon: '🎥' },
  editor: { label: 'Editor', icon: '✂️' },
  graphic_designer: { label: 'Graphic Designer', icon: '🎨' },
  project_manager: { label: 'Project Manager', icon: '📋' },
  marketing: { label: 'Marketing', icon: '📣' },
  strategy: { label: 'Strategy', icon: '💡' },
};

function getLevelColor(level: number): string {
  if (level >= 8) return 'from-yellow-400 to-amber-600';
  if (level >= 6) return 'from-purple-400 to-purple-600';
  if (level >= 4) return 'from-blue-400 to-blue-600';
  return 'from-gray-400 to-gray-600';
}

function TeamMemberCard({
  user,
  getProjectsByUser,
  getUserLevel,
  onClick,
}: {
  user: User;
  getProjectsByUser: (id: string) => any[];
  getUserLevel: (xp: number) => any;
  onClick: () => void;
}) {
  const projects = getProjectsByUser(user.id);
  const level = getUserLevel(user.xp);
  const xpProgress = ((user.xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  const spec = specializationConfig[user.specialization];

  return (
    <div
      onClick={onClick}
      className="card p-5 cursor-pointer hover:shadow-card-hover transition-all group"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(user.level)} flex items-center justify-center text-white font-bold text-xl`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-surface-100">
            <span className="text-xs font-bold text-primary-600">{user.level}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-text-primary group-hover:text-primary-500 transition-colors">
            {user.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{spec?.icon}</span>
            <span className="text-sm text-text-muted">{spec?.label}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${roleConfig[user.role].color}`}>
              {roleConfig[user.role].label}
            </span>
            {user.isPM && (
              <span className="badge bg-primary-100 text-primary-600">PM</span>
            )}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-primary-500" />
            <span className="text-text-muted">{level.title}</span>
          </div>
          <span className="font-medium text-text-primary">{user.xp.toLocaleString()} XP</span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-surface-50 rounded-lg">
          <p className="text-lg font-bold text-text-primary">{projects.length}</p>
          <p className="text-xs text-text-muted">Projects</p>
        </div>
        <div className="text-center p-2 bg-surface-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <Flame size={14} className="text-warning-500" />
            <span className="text-lg font-bold text-text-primary">{user.currentStreak}</span>
          </div>
          <p className="text-xs text-text-muted">Streak</p>
        </div>
        <div className="text-center p-2 bg-surface-50 rounded-lg">
          <p className="text-lg font-bold text-text-primary">{user.badges.length}</p>
          <p className="text-xs text-text-muted">Badges</p>
        </div>
      </div>

      {/* Badges Preview */}
      {user.badges.length > 0 && (
        <div className="flex items-center gap-1 mb-4">
          {user.badges.slice(0, 5).map((badge, index) => (
            <div
              key={index}
              className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center text-sm"
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
          {user.badges.length > 5 && (
            <span className="text-xs text-text-muted">+{user.badges.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-100">
        <div className="flex items-center gap-1 text-sm text-text-muted">
          <Calendar size={14} />
          <span>Joined {format(parseISO(user.joinedAt), 'MMM yyyy')}</span>
        </div>
        <span className="text-sm text-text-muted">{user.department}</span>
      </div>
    </div>
  );
}

function TeamMemberModal({
  user,
  onClose,
  getProjectsByUser,
  getUserLevel,
}: {
  user: User;
  onClose: () => void;
  getProjectsByUser: (id: string) => any[];
  getUserLevel: (xp: number) => any;
}) {
  const projects = getProjectsByUser(user.id);
  const level = getUserLevel(user.xp);
  const xpProgress = ((user.xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  const spec = specializationConfig[user.specialization];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start gap-5 mb-6">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getLevelColor(user.level)} flex items-center justify-center text-white font-bold text-2xl`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
              <span className={`badge ${roleConfig[user.role].color}`}>
                {roleConfig[user.role].label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{spec?.icon}</span>
              <span className="text-text-muted">{spec?.label}</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">{user.department}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <a href={`mailto:${user.email}`} className="flex items-center gap-1 hover:text-primary-500">
                <Mail size={14} />
                {user.email}
              </a>
            </div>
          </div>
        </div>

        {/* Level & XP */}
        <div className="card p-4 mb-6 bg-surface-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getLevelColor(user.level)} flex items-center justify-center`}>
                <span className="text-white font-bold">{user.level}</span>
              </div>
              <div>
                <p className="font-semibold text-text-primary">{level.title}</p>
                <p className="text-sm text-text-muted">Level {user.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{user.xp.toLocaleString()}</p>
              <p className="text-sm text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            {level.maxXP - user.xp} XP to next level
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{projects.length}</p>
            <p className="text-sm text-text-muted">Projects</p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={20} className="text-warning-500" />
              <span className="text-2xl font-bold text-text-primary">{user.currentStreak}</span>
            </div>
            <p className="text-sm text-text-muted">Current Streak</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{user.longestStreak}</p>
            <p className="text-sm text-text-muted">Best Streak</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">${user.hourlyRate}</p>
            <p className="text-sm text-text-muted">Hourly Rate</p>
          </div>
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Trophy size={16} />
              Badges ({user.badges.length})
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {user.badges.map((badge, index) => (
                <div key={index} className="p-3 bg-surface-50 rounded-lg text-center">
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-sm font-medium text-text-primary">{badge.name}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {format(parseISO(badge.earnedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h3 className="font-semibold text-text-primary mb-3">Active Projects</h3>
            <div className="space-y-2">
              {projects.slice(0, 4).map(project => (
                <div key={project.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{project.name}</p>
                    <p className="text-sm text-text-muted">{project.clientName}</p>
                  </div>
                  <span className={`badge ${project.status === 'active' ? 'bg-success-100 text-success-600' : 'bg-surface-200 text-text-muted'}`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-surface-200">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button className="btn-primary">
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const { users, getProjectsByUser, getUserLevel, isAdmin, isPM } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Get unique departments
  const departments = [...new Set(users.map(u => u.department))];

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterDepartment !== 'all' && user.department !== filterDepartment) return false;
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      return true;
    });
  }, [users, searchQuery, filterDepartment, filterRole]);

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    pms: users.filter(u => u.role === 'pm').length,
    employees: users.filter(u => u.role === 'employee').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Team</h1>
          <p className="text-text-muted">Manage and view team members</p>
        </div>
        {isAdmin && (
          <button className="btn-primary">
            <Plus size={16} />
            Add Team Member
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-sm text-text-muted">Total Members</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-bold text-danger-600">{stats.admins}</p>
          <p className="text-sm text-text-muted">Admins</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-bold text-primary-600">{stats.pms}</p>
          <p className="text-sm text-text-muted">Project Managers</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-bold text-success-600">{stats.employees}</p>
          <p className="text-sm text-text-muted">Employees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10 py-2"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Department:</label>
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="input py-1.5 w-40"
          >
            <option value="all">All</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Role:</label>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="input py-1.5 w-40"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="pm">Project Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center bg-surface-100 rounded-lg p-1 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid size={16} className={viewMode === 'grid' ? 'text-primary-500' : 'text-text-muted'} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List size={16} className={viewMode === 'list' ? 'text-primary-500' : 'text-text-muted'} />
          </button>
        </div>
      </div>

      {/* Team Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <TeamMemberCard
              key={user.id}
              user={user}
              getProjectsByUser={getProjectsByUser}
              getUserLevel={getUserLevel}
              onClick={() => setSelectedUser(user)}
            />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-surface-100">
          {filteredUsers.map(user => {
            const level = getUserLevel(user.xp);
            const spec = specializationConfig[user.specialization];

            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="p-4 hover:bg-surface-50 cursor-pointer transition-colors flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getLevelColor(user.level)} flex items-center justify-center text-white font-bold`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{user.name}</h3>
                    <span className={`badge ${roleConfig[user.role].color}`}>
                      {roleConfig[user.role].label}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">{spec?.label} · {user.department}</p>
                </div>
                <div className="text-center w-24">
                  <p className="font-medium text-text-primary">{level.title}</p>
                  <p className="text-xs text-text-muted">Level {user.level}</p>
                </div>
                <div className="text-center w-24">
                  <p className="font-medium text-primary-600">{user.xp.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">XP</p>
                </div>
                <div className="flex items-center gap-1 w-20">
                  <Flame size={14} className="text-warning-500" />
                  <span className="font-medium text-text-primary">{user.currentStreak}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No team members found matching your criteria</p>
        </div>
      )}

      {/* Team Member Modal */}
      {selectedUser && (
        <TeamMemberModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          getProjectsByUser={getProjectsByUser}
          getUserLevel={getUserLevel}
        />
      )}
    </div>
  );
}
