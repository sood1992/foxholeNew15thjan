import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Archive,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-success-600', bgColor: 'bg-success-100' },
  on_hold: { label: 'On Hold', color: 'text-warning-600', bgColor: 'bg-warning-100' },
  completed: { label: 'Completed', color: 'text-info-600', bgColor: 'bg-info-100' },
  cancelled: { label: 'Cancelled', color: 'text-danger-600', bgColor: 'bg-danger-100' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-info-100 text-info-600' },
  medium: { label: 'Medium', color: 'bg-success-100 text-success-600' },
  high: { label: 'High', color: 'bg-warning-100 text-warning-600' },
  urgent: { label: 'Urgent', color: 'bg-danger-100 text-danger-600' },
};

function ProjectCard({
  project,
  getUserById,
  getTasksByProject,
  onClick,
}: {
  project: Project;
  getUserById: (id: string) => any;
  getTasksByProject: (id: string) => any[];
  onClick: () => void;
}) {
  const pm = getUserById(project.pmId);
  const tasks = getTasksByProject(project.id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const budgetUsage = (project.spent / project.budget) * 100;
  const daysRemaining = differenceInDays(parseISO(project.dueDate), new Date());

  return (
    <div
      onClick={onClick}
      className="card p-5 cursor-pointer hover:shadow-card-hover transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${statusConfig[project.status].bgColor} ${statusConfig[project.status].color}`}>
              {statusConfig[project.status].label}
            </span>
            <span className={`badge ${priorityConfig[project.priority].color}`}>
              {priorityConfig[project.priority].label}
            </span>
          </div>
          <h3 className="font-semibold text-lg text-text-primary group-hover:text-primary-500 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-text-muted">{project.clientName}</p>
        </div>
        <span className="text-xs text-text-muted bg-surface-100 px-2 py-1 rounded">
          {project.jobCode}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">{project.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-text-muted">Progress</span>
          <span className="font-medium text-text-primary">
            {completedTasks}/{tasks.length} tasks ({Math.round(progress)}%)
          </span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-text-muted">Budget</span>
          <span className={`font-medium ${budgetUsage > 100 ? 'text-danger-500' : 'text-text-primary'}`}>
            ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              budgetUsage > 100 ? 'bg-danger-500' : budgetUsage > 80 ? 'bg-warning-500' : 'bg-success-500'
            }`}
            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <div className="avatar avatar-sm">{pm?.name.split(' ').map((n: string) => n[0]).join('')}</div>
          <span className="text-sm text-text-muted">{pm?.name}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Calendar size={14} className={daysRemaining < 7 ? 'text-danger-500' : 'text-text-muted'} />
          <span className={daysRemaining < 7 ? 'text-danger-500 font-medium' : 'text-text-muted'}>
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
          </span>
        </div>
      </div>

      {/* Team */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100">
        <div className="flex -space-x-2">
          {project.teamMemberIds.slice(0, 4).map(id => {
            const member = getUserById(id);
            return member ? (
              <div key={id} className="avatar avatar-sm border-2 border-white" title={member.name}>
                {member.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            ) : null;
          })}
          {project.teamMemberIds.length > 4 && (
            <div className="avatar avatar-sm border-2 border-white bg-surface-200 text-text-muted">
              +{project.teamMemberIds.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-text-muted ml-2">
          {project.teamMemberIds.length} team members
        </span>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, getUserById, getTasksByProject, isPM, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !project.clientName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && project.status !== filterStatus) return false;
      if (filterType !== 'all' && project.type !== filterType) return false;
      return true;
    });
  }, [projects, searchQuery, filterStatus, filterType]);

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    totalBudget: projects.reduce((acc, p) => acc + p.budget, 0),
    totalSpent: projects.reduce((acc, p) => acc + p.spent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-muted">Manage and track all projects</p>
        </div>
        {isPM && (
          <button className="btn-primary">
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Grid size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-sm text-text-muted">Total Projects</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
          <p className="text-sm text-text-muted">Active Projects</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
              <DollarSign size={20} className="text-info-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">${(stats.totalBudget / 1000).toFixed(0)}K</p>
          <p className="text-sm text-text-muted">Total Budget</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <Clock size={20} className="text-warning-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {((stats.totalSpent / stats.totalBudget) * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-text-muted">Budget Used</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10 py-2"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Status:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input py-1.5 w-36"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Type:</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="input py-1.5 w-36"
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="photo">Photography</option>
            <option value="marketing">Marketing</option>
            <option value="strategy">Strategy</option>
            <option value="mixed">Mixed</option>
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

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              getUserById={getUserById}
              getTasksByProject={getTasksByProject}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-surface-100">
          {filteredProjects.map(project => {
            const pm = getUserById(project.pmId);
            const tasks = getTasksByProject(project.id);
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="p-4 hover:bg-surface-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{project.name}</h3>
                      <span className={`badge ${statusConfig[project.status].bgColor} ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{project.clientName} · {project.jobCode}</p>
                  </div>

                  <div className="w-32 text-center">
                    <p className="font-medium text-text-primary">{Math.round(progress)}%</p>
                    <p className="text-xs text-text-muted">Progress</p>
                  </div>

                  <div className="w-32 text-center">
                    <p className="font-medium text-text-primary">${project.budget.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">Budget</p>
                  </div>

                  <div className="w-24 text-center">
                    <p className="text-sm text-text-primary">{format(parseISO(project.dueDate), 'MMM d')}</p>
                    <p className="text-xs text-text-muted">Due</p>
                  </div>

                  <div className="avatar avatar-sm">{pm?.name.split(' ').map((n: string) => n[0]).join('')}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No projects found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
