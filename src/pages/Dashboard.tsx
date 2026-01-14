import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Zap,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', iconBg: 'bg-primary-100' },
    success: { bg: 'bg-success-50', text: 'text-success-600', iconBg: 'bg-success-100' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600', iconBg: 'bg-warning-100' },
    danger: { bg: 'bg-danger-50', text: 'text-danger-600', iconBg: 'bg-danger-100' },
    info: { bg: 'bg-info-50', text: 'text-info-600', iconBg: 'bg-info-100' },
  };

  const classes = colorClasses[color] || colorClasses.primary;

  return (
    <div className="card p-6 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === 'up' ? (
                <ArrowUpRight size={14} className="text-success-500" />
              ) : (
                <ArrowDownRight size={14} className="text-danger-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === 'up' ? 'text-success-500' : 'text-danger-500'
                }`}
              >
                {change}
              </span>
              <span className="text-xs text-text-muted">vs last week</span>
            </div>
          )}
        </div>
        <div className={`${classes.iconBg} p-3 rounded-lg`}>
          <Icon size={24} className={classes.text} />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const { getUserById, getTasksByProject } = useApp();
  const pm = getUserById(project.pmId);
  const tasks = getTasksByProject(project.id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const priorityColors: Record<string, string> = {
    low: 'bg-info-100 text-info-600',
    medium: 'bg-success-100 text-success-600',
    high: 'bg-warning-100 text-warning-600',
    urgent: 'bg-danger-100 text-danger-600',
  };

  const budgetUsage = (project.spent / project.budget) * 100;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${priorityColors[project.priority]}`}>
              {project.priority}
            </span>
            <span className="text-xs text-text-muted">{project.jobCode}</span>
          </div>
          <h3 className="font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-text-muted mt-1">{project.clientName}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-muted">Progress</span>
          <span className="font-medium text-text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill bg-primary-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-muted">Budget</span>
          <span className={`font-medium ${budgetUsage > 90 ? 'text-danger-500' : 'text-text-primary'}`}>
            ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${budgetUsage > 90 ? 'bg-danger-500' : budgetUsage > 75 ? 'bg-warning-500' : 'bg-success-500'}`}
            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <div className="avatar avatar-sm">
            {pm?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-xs text-text-muted">{pm?.name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Calendar size={12} />
          <span>Due {format(parseISO(project.dueDate), 'MMM d')}</span>
        </div>
      </div>
    </div>
  );
}

function UpcomingShoot({ shoot }: { shoot: any }) {
  const { getUserById } = useApp();
  const shootDate = parseISO(shoot.date);
  const dateLabel = isToday(shootDate)
    ? 'Today'
    : isTomorrow(shootDate)
    ? 'Tomorrow'
    : format(shootDate, 'EEE, MMM d');

  const statusColors: Record<string, string> = {
    scheduled: 'bg-info-100 text-info-600',
    confirmed: 'bg-success-100 text-success-600',
    in_progress: 'bg-warning-100 text-warning-600',
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
      <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
        <span className="text-xs text-primary-500 font-medium">{format(shootDate, 'MMM')}</span>
        <span className="text-xl font-bold text-primary-600">{format(shootDate, 'd')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-text-primary truncate">{shoot.title}</h4>
          <span className={`badge ${statusColors[shoot.status]}`}>{shoot.status}</span>
        </div>
        <p className="text-sm text-text-muted mb-2">{shoot.location.name}</p>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Call: {shoot.callTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{shoot.crewIds.length} crew</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityFeedItem({ activity, getUserById }: { activity: any; getUserById: any }) {
  const user = getUserById(activity.userId);
  const icons: Record<string, React.ElementType> = {
    task_completed: CheckCircle2,
    task_moved: Target,
    badge_earned: Zap,
    file_uploaded: ArrowUpRight,
    client_approved: CheckCircle2,
  };
  const Icon = icons[activity.type] || Target;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="avatar avatar-sm flex-shrink-0">
        {user?.name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">
          <span className="font-medium">{user?.name}</span>{' '}
          <span className="text-text-secondary">{activity.description}</span>
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
      <Icon size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
    </div>
  );
}

export default function Dashboard() {
  const {
    currentUser,
    projects,
    tasks,
    getUpcomingShoots,
    activityFeed,
    getUserById,
    isAdmin,
    isPM,
  } = useApp();

  const activeProjects = projects.filter(p => p.status === 'active');
  const myTasks = currentUser ? tasks.filter(t => t.assigneeId === currentUser.id) : [];
  const completedToday = myTasks.filter(
    t => t.status === 'done' && isToday(parseISO(t.updatedAt))
  ).length;
  const upcomingShoots = getUpcomingShoots().slice(0, 3);
  const pendingReviews = tasks.filter(t => t.status === 'client_review').length;

  const urgentTasks = tasks.filter(
    t => t.priority === 'urgent' && t.status !== 'done'
  ).length;

  // Calculate team utilization (mock data for now)
  const teamUtilization = 78;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {currentUser?.name.split(' ')[0]}!
          </h1>
          <p className="text-text-muted mt-1">
            Here's what's happening at Neofox today
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.currentStreak && currentUser.currentStreak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-warning-50 rounded-lg">
              <span className="text-warning-500 text-xl">🔥</span>
              <span className="font-semibold text-warning-600">
                {currentUser.currentStreak} day streak
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Active Projects"
          value={activeProjects.length}
          change="12%"
          changeType="up"
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tasks Completed Today"
          value={completedToday}
          color="success"
        />
        {isPM && (
          <StatCard
            icon={Users}
            label="Team Utilization"
            value={`${teamUtilization}%`}
            change="5%"
            changeType="up"
            color="info"
          />
        )}
        <StatCard
          icon={Calendar}
          label="Upcoming Shoots"
          value={upcomingShoots.length}
          color="warning"
        />
        {isAdmin && (
          <StatCard
            icon={AlertCircle}
            label="Pending Reviews"
            value={pendingReviews}
            color="danger"
          />
        )}
      </div>

      {/* Urgent Tasks Alert */}
      {urgentTasks > 0 && (
        <div className="card p-4 bg-danger-50 border border-danger-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center">
              <AlertCircle className="text-danger-500" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-danger-700">Attention Required</h3>
              <p className="text-sm text-danger-600">
                You have {urgentTasks} urgent task{urgentTasks > 1 ? 's' : ''} that need immediate attention
              </p>
            </div>
            <button className="btn-danger btn-sm">View Tasks</button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Active Projects</h2>
            <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Shoots */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Upcoming Shoots</h2>
              <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Calendar
              </button>
            </div>
            <div className="space-y-3">
              {upcomingShoots.length > 0 ? (
                upcomingShoots.map((shoot) => (
                  <UpcomingShoot key={shoot.id} shoot={shoot} />
                ))
              ) : (
                <p className="text-sm text-text-muted text-center py-4">
                  No upcoming shoots scheduled
                </p>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Recent Activity</h2>
            </div>
            <div className="divide-y divide-surface-100">
              {activityFeed.slice(0, 5).map((activity) => (
                <ActivityFeedItem
                  key={activity.id}
                  activity={activity}
                  getUserById={getUserById}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* My Tasks Quick View */}
      {currentUser && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">My Tasks</h2>
            <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View Kanban
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['in_progress', 'review', 'raw', 'backlog'].map((status) => {
              const statusTasks = myTasks.filter(t => t.status === status);
              const statusLabels: Record<string, string> = {
                in_progress: 'In Progress',
                review: 'In Review',
                raw: 'Raw/Ready',
                backlog: 'Backlog',
              };
              const statusColors: Record<string, string> = {
                in_progress: 'bg-primary-500',
                review: 'bg-warning-500',
                raw: 'bg-info-500',
                backlog: 'bg-surface-300',
              };

              return (
                <div key={status} className="p-4 bg-surface-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                    <span className="font-medium text-text-primary">{statusLabels[status]}</span>
                    <span className="text-sm text-text-muted ml-auto">{statusTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {statusTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="p-2 bg-white rounded border border-surface-200 text-sm text-text-primary truncate hover:border-primary-300 cursor-pointer transition-colors"
                      >
                        {task.title}
                      </div>
                    ))}
                    {statusTasks.length > 2 && (
                      <p className="text-xs text-text-muted text-center">
                        +{statusTasks.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
