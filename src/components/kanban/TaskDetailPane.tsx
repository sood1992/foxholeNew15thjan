import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  User,
  Tag,
  Link2,
  Paperclip,
  MessageSquare,
  Play,
  Pause,
  ChevronDown,
  AlertCircle,
  Lock,
  CheckCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Send,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-surface-400' },
  raw: { label: 'Raw / Ready', color: 'bg-info-500' },
  in_progress: { label: 'In Progress', color: 'bg-primary-500' },
  review: { label: 'Internal Review', color: 'bg-warning-500' },
  client_review: { label: 'Client Review', color: 'bg-purple-500' },
  done: { label: 'Done', color: 'bg-success-500' },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'bg-info-100 text-info-600', label: 'Low' },
  medium: { color: 'bg-success-100 text-success-600', label: 'Medium' },
  high: { color: 'bg-warning-100 text-warning-600', label: 'High' },
  urgent: { color: 'bg-danger-100 text-danger-600', label: 'Urgent' },
};

interface TaskDetailPaneProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailPane({ task, onClose }: TaskDetailPaneProps) {
  const {
    getUserById,
    getProjectById,
    updateTask,
    moveTask,
    startTimer,
    stopTimer,
    activeTimer,
    getTimeEntriesByTask,
    currentUser,
    addXP,
    isPM,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newComment, setNewComment] = useState('');

  const assignee = getUserById(task.assigneeId);
  const creator = getUserById(task.creatorId);
  const project = getProjectById(task.projectId);
  const timeEntries = getTimeEntriesByTask(task.id);
  const isTimerActive = activeTimer?.taskId === task.id;
  const totalTimeLogged = timeEntries.reduce((acc, te) => acc + te.duration, 0);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (task.isLocked && newStatus !== 'backlog') {
      alert('This task is blocked by dependencies');
      return;
    }

    // Award XP when task is marked as done
    if (newStatus === 'done' && task.status !== 'done') {
      addXP(task.assigneeId, task.xpReward);
    }

    moveTask(task.id, newStatus);
    setShowStatusDropdown(false);
  };

  const handleSaveEdit = () => {
    updateTask({
      ...task,
      title: editedTitle,
      description: editedDescription,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleTimerToggle = () => {
    if (isTimerActive) {
      stopTimer();
    } else {
      startTimer(task.id, task.projectId, `Working on: ${task.title}`);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    updateTask({
      ...task,
      clientFeedback: [...(task.clientFeedback || []), newComment],
      updatedAt: new Date().toISOString(),
    });
    setNewComment('');
  };

  const progressPercent = (task.loggedHours / task.estimatedHours) * 100;
  const isOverBudget = task.loggedHours > task.estimatedHours;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="side-panel z-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {task.isLocked && (
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Lock size={16} className="text-warning-600" />
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted">{project?.name}</p>
              <p className="text-sm font-medium text-text-secondary">{project?.jobCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTimerToggle}
              className={`btn-sm ${
                isTimerActive
                  ? 'bg-success-500 text-white hover:bg-success-600'
                  : 'btn-secondary'
              }`}
            >
              {isTimerActive ? <Pause size={14} /> : <Play size={14} />}
              {isTimerActive ? 'Stop Timer' : 'Start Timer'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Description */}
          <div>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                  className="input text-xl font-bold"
                />
                <textarea
                  value={editedDescription}
                  onChange={e => setEditedDescription(e.target.value)}
                  className="input min-h-[120px]"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="btn-primary btn-sm">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-text-primary">{task.title}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 hover:bg-surface-100 rounded"
                  >
                    <Edit2 size={16} className="text-text-muted" />
                  </button>
                </div>
                <p className="text-text-secondary">{task.description || 'No description provided'}</p>
              </div>
            )}
          </div>

          {/* Status & Priority */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
                disabled={task.isLocked}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[task.status].color}`} />
                <span className="font-medium text-text-primary">{statusConfig[task.status].label}</span>
                <ChevronDown size={14} className="text-text-muted" />
              </button>

              {showStatusDropdown && (
                <div className="dropdown left-0 top-full mt-1">
                  {(Object.keys(statusConfig) as TaskStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`dropdown-item ${task.status === status ? 'bg-primary-50' : ''}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[status].color}`} />
                      <span>{statusConfig[status].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className={`badge ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].label} Priority
            </span>

            <div className="xp-badge ml-auto">
              <Zap size={12} />
              +{task.xpReward} XP
            </div>
          </div>

          {/* Locked Warning */}
          {task.isLocked && (
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-warning-500 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-warning-700">Task Locked</h4>
                  <p className="text-sm text-warning-600 mt-1">
                    This task is blocked by dependencies. Complete the following tasks first:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {task.dependsOn.map(depId => (
                      <li key={depId} className="text-sm text-warning-600 flex items-center gap-2">
                        <Lock size={12} />
                        Task {depId}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Time Tracking */}
          <div className="card p-4">
            <h3 className="font-semibold text-text-primary mb-3">Time Tracking</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Estimated</span>
                <span className="font-medium">{task.estimatedHours} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Logged</span>
                <span className={`font-medium ${isOverBudget ? 'text-danger-500' : ''}`}>
                  {task.loggedHours.toFixed(1)} hours
                </span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className={`progress-bar-fill ${isOverBudget ? 'bg-danger-500' : 'bg-primary-500'}`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <p className="text-xs text-danger-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Over budget by {(task.loggedHours - task.estimatedHours).toFixed(1)} hours
                </p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="p-4 bg-surface-50 rounded-lg">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <User size={14} />
                <span className="text-xs font-medium uppercase">Assignee</span>
              </div>
              {assignee && (
                <div className="flex items-center gap-2">
                  <div className="avatar avatar-sm">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{assignee.name}</p>
                    <p className="text-xs text-text-muted capitalize">{assignee.specialization.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="p-4 bg-surface-50 rounded-lg">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <Calendar size={14} />
                <span className="text-xs font-medium uppercase">Due Date</span>
              </div>
              <p className="font-medium text-text-primary">
                {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : 'Not set'}
              </p>
              {task.dueDate && (
                <p className="text-xs text-text-muted">
                  {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
                </p>
              )}
            </div>

            {/* Creator */}
            <div className="p-4 bg-surface-50 rounded-lg">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <User size={14} />
                <span className="text-xs font-medium uppercase">Created By</span>
              </div>
              <p className="font-medium text-text-primary text-sm">{creator?.name || 'Unknown'}</p>
              <p className="text-xs text-text-muted">
                {format(parseISO(task.createdAt), 'MMM d, yyyy')}
              </p>
            </div>

            {/* Last Updated */}
            <div className="p-4 bg-surface-50 rounded-lg">
              <div className="flex items-center gap-2 text-text-muted mb-2">
                <Clock size={14} />
                <span className="text-xs font-medium uppercase">Updated</span>
              </div>
              <p className="font-medium text-text-primary text-sm">
                {formatDistanceToNow(parseISO(task.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Tag size={16} />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="badge-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Client Review Link */}
          {task.clientReviewLink && (
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink size={16} className="text-primary-600" />
                  <span className="font-medium text-primary-700">Client Review Portal</span>
                </div>
                <a
                  href={task.clientReviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-sm"
                >
                  Open Link
                </a>
              </div>
              {task.clientApproved && (
                <div className="flex items-center gap-2 mt-2 text-success-600">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Client Approved</span>
                </div>
              )}
            </div>
          )}

          {/* Comments / Activity */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <MessageSquare size={16} />
              Comments
            </h3>

            <div className="space-y-3 mb-4">
              {task.clientFeedback && task.clientFeedback.length > 0 ? (
                task.clientFeedback.map((comment, index) => (
                  <div key={index} className="p-3 bg-surface-50 rounded-lg">
                    <p className="text-sm text-text-primary">{comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No comments yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input flex-1"
                onKeyPress={e => e.key === 'Enter' && handleAddComment()}
              />
              <button onClick={handleAddComment} className="btn-primary">
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Time Entries Log */}
          {timeEntries.length > 0 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Clock size={16} />
                Time Log
              </h3>
              <div className="space-y-2">
                {timeEntries.slice(0, 5).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{entry.description}</p>
                      <p className="text-xs text-text-muted">
                        {format(parseISO(entry.startTime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
