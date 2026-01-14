import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  MoreVertical,
  Clock,
  AlertCircle,
  Lock,
  Calendar,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  Play,
  ChevronDown,
  X,
  GripVertical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, Project } from '../types';
import TaskDetailPane from '../components/kanban/TaskDetailPane';
import { format, parseISO, isPast, isToday } from 'date-fns';

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  backlog: { label: 'Backlog', color: 'bg-surface-400', bgColor: 'bg-surface-50' },
  raw: { label: 'Raw / Ready', color: 'bg-info-500', bgColor: 'bg-info-50' },
  in_progress: { label: 'In Progress', color: 'bg-primary-500', bgColor: 'bg-primary-50' },
  review: { label: 'Internal Review', color: 'bg-warning-500', bgColor: 'bg-warning-50' },
  client_review: { label: 'Client Review', color: 'bg-purple-500', bgColor: 'bg-purple-50' },
  done: { label: 'Done', color: 'bg-success-500', bgColor: 'bg-success-50' },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'bg-info-100 text-info-600 border-info-200', label: 'Low' },
  medium: { color: 'bg-success-100 text-success-600 border-success-200', label: 'Medium' },
  high: { color: 'bg-warning-100 text-warning-600 border-warning-200', label: 'High' },
  urgent: { color: 'bg-danger-100 text-danger-600 border-danger-200', label: 'Urgent' },
};

function KanbanCard({
  task,
  onClick,
  onStartTimer,
  getUserById,
  getProjectById,
}: {
  task: Task;
  onClick: () => void;
  onStartTimer: () => void;
  getUserById: (id: string) => any;
  getProjectById: (id: string) => any;
}) {
  const assignee = getUserById(task.assigneeId);
  const project = getProjectById(task.projectId);
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));

  return (
    <div
      onClick={onClick}
      className={`kanban-card relative group ${task.isLocked ? 'opacity-75' : ''}`}
    >
      {/* Lock Indicator */}
      {task.isLocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning-500 rounded-full flex items-center justify-center shadow-md">
          <Lock size={12} className="text-white" />
        </div>
      )}

      {/* Drag Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical size={16} className="text-text-muted" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className={`badge border ${priorityConfig[task.priority].color}`}>
          {priorityConfig[task.priority].label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartTimer();
          }}
          className="p-1 hover:bg-surface-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Start Timer"
        >
          <Play size={14} className="text-success-500" />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-medium text-text-primary mb-2 line-clamp-2">{task.title}</h4>

      {/* Project Tag */}
      {project && (
        <div className="flex items-center gap-1 mb-3 text-xs text-text-muted">
          <Tag size={10} />
          <span className="truncate">{project.name}</span>
        </div>
      )}

      {/* Meta Info */}
      <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 ${
              isOverdue ? 'text-danger-500' : isDueToday ? 'text-warning-500' : ''
            }`}
          >
            <Calendar size={12} />
            <span>{format(parseISO(task.dueDate), 'MMM d')}</span>
            {isOverdue && <AlertCircle size={10} />}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>
            {task.loggedHours}h / {task.estimatedHours}h
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-3">
        <div
          className={`progress-bar-fill ${
            task.loggedHours > task.estimatedHours ? 'bg-danger-500' : 'bg-primary-500'
          }`}
          style={{
            width: `${Math.min((task.loggedHours / task.estimatedHours) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-100">
        <div className="flex items-center gap-2">
          {assignee && (
            <div className="avatar avatar-sm" title={assignee.name}>
              {assignee.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip size={12} />
              <span>{task.attachments.length}</span>
            </div>
          )}
          {task.clientFeedback && task.clientFeedback.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare size={12} />
              <span>{task.clientFeedback.length}</span>
            </div>
          )}
          <span className="xp-badge">+{task.xpReward} XP</span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
  onStartTimer,
  getUserById,
  getProjectById,
  onDrop,
}: {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onStartTimer: (task: Task) => void;
  getUserById: (id: string) => any;
  getProjectById: (id: string) => any;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const config = statusConfig[status];
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <h3 className="font-semibold text-text-primary">{config.label}</h3>
          <span className="text-sm text-text-muted">({tasks.length})</span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 hover:bg-surface-200 rounded transition-colors"
          title="Add Task"
        >
          <Plus size={18} className="text-text-muted" />
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable={!task.isLocked}
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
            }}
          >
            <KanbanCard
              task={task}
              onClick={() => onTaskClick(task)}
              onStartTimer={() => onStartTimer(task)}
              getUserById={getUserById}
              getProjectById={getProjectById}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            No tasks in this column
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projects,
  users,
  defaultStatus,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  projects: Project[];
  users: any[];
  defaultStatus: TaskStatus;
  currentUser: any;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projects[0]?.id || '',
    assigneeId: currentUser?.id || '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedHours: 4,
    dueDate: '',
    tags: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: defaultStatus,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Create New Task</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                className="input"
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Assignee
              </label>
              <select
                value={formData.assigneeId}
                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                className="input"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                className="input"
                min="0.5"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="input"
              placeholder="e.g., design, urgent, client-facing"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const {
    tasks,
    projects,
    users,
    currentUser,
    getUserById,
    getProjectById,
    moveTask,
    addTask,
    startTimer,
    activeTimer,
    selectedTask,
    setSelectedTask,
  } = useApp();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<TaskStatus>('backlog');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterProject !== 'all' && task.projectId !== filterProject) return false;
      if (filterAssignee !== 'all' && task.assigneeId !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterProject, filterAssignee]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      raw: [],
      in_progress: [],
      review: [],
      client_review: [],
      done: [],
    };

    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task.id);
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateModalStatus(status);
    setShowCreateModal(true);
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    const assigneeId = taskData.assigneeId || currentUser?.id || '';
    const creatorId = currentUser?.id || '';

    const newTask: Task = {
      id: `t-${Date.now()}`,
      projectId: taskData.projectId || projects[0]?.id || '',
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'backlog',
      priority: taskData.priority || 'medium',
      assigneeId,
      assigneeIds: [assigneeId], // Multi-assignee support
      creatorId,
      watchers: [creatorId, assigneeId].filter((id, i, arr) => arr.indexOf(id) === i), // Task watchers
      estimatedHours: taskData.estimatedHours || 4,
      loggedHours: 0,
      dueDate: taskData.dueDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dependsOn: taskData.dependsOn || [],
      dependencyType: 'finish_to_start',
      blockedBy: [],
      isLocked: false,
      comments: [], // Comments support
      attachments: [],
      tags: taskData.tags || [],
      xpReward: Math.round((taskData.estimatedHours || 4) * 25),
      // Client review fields
      clientReviewLink: undefined,
      clientApproved: undefined,
      clientFeedback: [],
    };

    addTask(newTask);
  };

  const handleStartTimer = (task: Task) => {
    if (activeTimer) {
      alert('Please stop the current timer before starting a new one');
      return;
    }
    startTimer(task.id, task.projectId, `Working on: ${task.title}`);
  };

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.isLocked) {
      moveTask(taskId, newStatus);
    }
  };

  const selectedTaskData = selectedTask ? tasks.find(t => t.id === selectedTask) : null;

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kanban Board</h1>
          <p className="text-text-muted">Drag and drop tasks to update their status</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-primary-50 border-primary-200' : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>

          {/* Add Task Button - Available to all users */}
          <button
            onClick={() => handleAddTask('backlog')}
            className="btn-primary"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-primary">Project:</label>
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="input py-1.5 w-48"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-primary">Assignee:</label>
            <select
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="input py-1.5 w-48"
            >
              <option value="all">All Team Members</option>
              <option value={currentUser?.id}>My Tasks</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setFilterProject('all');
              setFilterAssignee('all');
            }}
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100%-4rem)]">
        {(Object.keys(statusConfig) as TaskStatus[]).map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={handleTaskClick}
            onAddTask={() => handleAddTask(status)}
            onStartTimer={handleStartTimer}
            getUserById={getUserById}
            getProjectById={getProjectById}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Task Detail Pane */}
      {selectedTaskData && (
        <TaskDetailPane
          task={selectedTaskData}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        users={users}
        defaultStatus={createModalStatus}
        currentUser={currentUser}
      />
    </div>
  );
}
