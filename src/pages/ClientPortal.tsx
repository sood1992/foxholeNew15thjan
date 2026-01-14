import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Link2,
  Eye,
  MessageSquare,
  Clock,
  Users,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  X,
  Calendar,
  Image,
  Video,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

function generatePortalLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
      title="Copy link"
    >
      {copied ? (
        <Check size={16} className="text-success-500" />
      ) : (
        <Copy size={16} className="text-text-muted" />
      )}
    </button>
  );
}

function PortalLinkCard({
  link,
  getProjectById,
  getTaskById,
  onDelete,
  onRefresh,
}: {
  link: any;
  getProjectById: (id: string) => any;
  getTaskById: (id: string) => any;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const project = getProjectById(link.projectId);
  const task = link.taskId ? getTaskById(link.taskId) : null;
  const fullLink = `https://review.neofox.com/${link.token}`;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">{project?.name}</h3>
          {task && <p className="text-sm text-text-muted">{task.title}</p>}
        </div>
        <div className="flex items-center gap-1">
          <span className={`badge ${link.isActive ? 'bg-success-100 text-success-600' : 'bg-surface-200 text-text-muted'}`}>
            {link.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Link Display */}
      <div className="flex items-center gap-2 p-3 bg-surface-50 rounded-lg mb-4">
        <Link2 size={16} className="text-text-muted flex-shrink-0" />
        <span className="flex-1 text-sm font-mono text-text-primary truncate">{fullLink}</span>
        <CopyButton text={fullLink} />
        <a
          href={fullLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-surface-200 rounded-lg transition-colors"
          title="Open link"
        >
          <ExternalLink size={16} className="text-text-muted" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xl font-bold text-text-primary">{link.accessCount}</p>
          <p className="text-xs text-text-muted">Views</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-text-primary">
            {link.lastAccessedAt
              ? formatDistanceToNow(parseISO(link.lastAccessedAt), { addSuffix: true })
              : 'Never'}
          </p>
          <p className="text-xs text-text-muted">Last Accessed</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-text-primary">
            {link.expiresAt
              ? format(parseISO(link.expiresAt), 'MMM d')
              : 'Never'}
          </p>
          <p className="text-xs text-text-muted">Expires</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-100">
        <p className="text-xs text-text-muted">
          Created {format(parseISO(link.createdAt), 'MMM d, yyyy')}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            title="Regenerate link"
          >
            <RefreshCw size={16} className="text-text-muted" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-danger-50 rounded-lg transition-colors"
            title="Delete link"
          >
            <Trash2 size={16} className="text-danger-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({
  task,
  getProjectById,
}: {
  task: any;
  getProjectById: (id: string) => any;
}) {
  const project = getProjectById(task.projectId);

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-24 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {task.attachments.length > 0 ? (
            <Image size={32} className="text-text-muted" />
          ) : (
            <Video size={32} className="text-text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-text-primary">{task.title}</h3>
              <p className="text-sm text-text-muted">{project?.name}</p>
            </div>
            {task.clientApproved ? (
              <span className="badge bg-success-100 text-success-600">
                <CheckCircle size={12} className="mr-1" />
                Approved
              </span>
            ) : (
              <span className="badge bg-warning-100 text-warning-600">Pending Review</span>
            )}
          </div>

          {/* Client Link */}
          {task.clientReviewLink && (
            <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg mb-3">
              <Link2 size={14} className="text-primary-500" />
              <a
                href={task.clientReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline truncate"
              >
                {task.clientReviewLink}
              </a>
              <CopyButton text={task.clientReviewLink} />
            </div>
          )}

          {/* Feedback */}
          {task.clientFeedback && task.clientFeedback.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted">Client Feedback:</p>
              {task.clientFeedback.slice(0, 2).map((feedback: string, index: number) => (
                <div key={index} className="p-2 bg-surface-50 rounded text-sm text-text-secondary">
                  {feedback}
                </div>
              ))}
              {task.clientFeedback.length > 2 && (
                <p className="text-xs text-text-muted">
                  +{task.clientFeedback.length - 2} more comments
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateLinkModal({
  isOpen,
  onClose,
  projects,
  tasks,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  tasks: any[];
  onSubmit: (data: any) => void;
}) {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<string>('7');

  const projectTasks = tasks.filter(t => t.projectId === selectedProject);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      projectId: selectedProject,
      taskId: selectedTask || null,
      expiresIn: expiresIn === 'never' ? null : parseInt(expiresIn),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Create Review Link</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Project *
            </label>
            <select
              value={selectedProject}
              onChange={e => {
                setSelectedProject(e.target.value);
                setSelectedTask('');
              }}
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
              Specific Task (optional)
            </label>
            <select
              value={selectedTask}
              onChange={e => setSelectedTask(e.target.value)}
              className="input"
            >
              <option value="">All project assets</option>
              {projectTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Link Expires In
            </label>
            <select
              value={expiresIn}
              onChange={e => setExpiresIn(e.target.value)}
              className="input"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Link2 size={16} />
              Generate Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientPortal() {
  const { projects, tasks, getProjectById, getTaskById, isPM, isAdmin } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Portal link type
  interface PortalLink {
    id: string;
    projectId: string;
    taskId: string | null;
    token: string;
    expiresAt: string | null;
    accessCount: number;
    lastAccessedAt: string | null;
    createdBy: string;
    createdAt: string;
    isActive: boolean;
  }

  // Mock portal links data
  const [portalLinks, setPortalLinks] = useState<PortalLink[]>([
    {
      id: 'pl1',
      projectId: 'p1',
      taskId: 't19',
      token: generatePortalLink(),
      expiresAt: '2024-02-15',
      accessCount: 5,
      lastAccessedAt: '2024-02-03T14:30:00',
      createdBy: 'u2',
      createdAt: '2024-02-02T10:00:00',
      isActive: true,
    },
    {
      id: 'pl2',
      projectId: 'p2',
      taskId: 't20',
      token: generatePortalLink(),
      expiresAt: '2024-02-10',
      accessCount: 3,
      lastAccessedAt: '2024-02-01T11:45:00',
      createdBy: 'u3',
      createdAt: '2024-01-30T09:00:00',
      isActive: true,
    },
  ]);

  // Tasks with client review
  const clientReviewTasks = tasks.filter(t => t.status === 'client_review' || t.clientReviewLink);

  const handleCreateLink = (data: any) => {
    const newLink = {
      id: `pl-${Date.now()}`,
      projectId: data.projectId,
      taskId: data.taskId,
      token: generatePortalLink(),
      expiresAt: data.expiresIn
        ? new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : null,
      accessCount: 0,
      lastAccessedAt: null,
      createdBy: 'u1',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setPortalLinks([newLink, ...portalLinks]);
  };

  const handleDeleteLink = (linkId: string) => {
    setPortalLinks(portalLinks.filter(l => l.id !== linkId));
  };

  const handleRefreshLink = (linkId: string) => {
    setPortalLinks(
      portalLinks.map(l =>
        l.id === linkId
          ? { ...l, token: generatePortalLink(), accessCount: 0 }
          : l
      )
    );
  };

  if (!isPM && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <ExternalLink size={48} className="text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Client Portal</h2>
          <p className="text-text-muted">Only Project Managers and Admins can access the Client Portal management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Client Portal</h1>
          <p className="text-text-muted">Manage client review links and feedback</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus size={16} />
          Create Review Link
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Link2 size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{portalLinks.length}</p>
          <p className="text-sm text-text-muted">Active Links</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <Clock size={20} className="text-warning-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{clientReviewTasks.length}</p>
          <p className="text-sm text-text-muted">Pending Reviews</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
              <Eye size={20} className="text-info-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {portalLinks.reduce((acc, l) => acc + l.accessCount, 0)}
          </p>
          <p className="text-sm text-text-muted">Total Views</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {clientReviewTasks.filter(t => t.clientApproved).length}
          </p>
          <p className="text-sm text-text-muted">Approved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Links */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Active Review Links</h2>
          <div className="space-y-4">
            {portalLinks.length > 0 ? (
              portalLinks.map(link => (
                <PortalLinkCard
                  key={link.id}
                  link={link}
                  getProjectById={getProjectById}
                  getTaskById={getTaskById}
                  onDelete={() => handleDeleteLink(link.id)}
                  onRefresh={() => handleRefreshLink(link.id)}
                />
              ))
            ) : (
              <div className="card p-8 text-center">
                <Link2 size={48} className="text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No active review links</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary mt-4"
                >
                  Create Your First Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Items In Review */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Items In Client Review</h2>
          <div className="space-y-4">
            {clientReviewTasks.length > 0 ? (
              clientReviewTasks.map(task => (
                <ReviewItem key={task.id} task={task} getProjectById={getProjectById} />
              ))
            ) : (
              <div className="card p-8 text-center">
                <MessageSquare size={48} className="text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No items currently in client review</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card p-6 bg-primary-50 border border-primary-100">
        <h3 className="font-semibold text-primary-700 mb-4">How Client Review Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-primary-600">1</span>
            </div>
            <p className="text-sm text-primary-700">Generate a secure review link</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-primary-600">2</span>
            </div>
            <p className="text-sm text-primary-700">Share the link with your client</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-primary-600">3</span>
            </div>
            <p className="text-sm text-primary-700">Client reviews and leaves feedback</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-primary-600">4</span>
            </div>
            <p className="text-sm text-primary-700">Approval auto-moves task to Done</p>
          </div>
        </div>
      </div>

      {/* Create Link Modal */}
      <CreateLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projects={projects}
        tasks={tasks}
        onSubmit={handleCreateLink}
      />
    </div>
  );
}
