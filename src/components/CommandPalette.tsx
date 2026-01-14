import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  FolderOpen,
  Users,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
  Play,
  Square,
  Plus,
  Clock,
  Zap,
  Command,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category: 'navigation' | 'task' | 'project' | 'action' | 'user';
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const {
    tasks,
    projects,
    users,
    currentUser,
    activeTimer,
    startTimer,
    stopTimer,
    getProjectById,
    getUserById,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut to open (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Build command items
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // Navigation commands
    items.push(
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        icon: <BarChart3 size={18} />,
        category: 'navigation',
        action: () => navigate('/'),
        keywords: ['home', 'overview'],
      },
      {
        id: 'nav-kanban',
        title: 'Go to Kanban Board',
        icon: <FileText size={18} />,
        category: 'navigation',
        action: () => navigate('/kanban'),
        keywords: ['tasks', 'board'],
      },
      {
        id: 'nav-projects',
        title: 'Go to Projects',
        icon: <FolderOpen size={18} />,
        category: 'navigation',
        action: () => navigate('/projects'),
        keywords: ['jobs'],
      },
      {
        id: 'nav-calendar',
        title: 'Go to Production Calendar',
        icon: <Calendar size={18} />,
        category: 'navigation',
        action: () => navigate('/calendar'),
        keywords: ['shoots', 'schedule'],
      },
      {
        id: 'nav-team',
        title: 'Go to Team',
        icon: <Users size={18} />,
        category: 'navigation',
        action: () => navigate('/team'),
        keywords: ['members', 'employees'],
      },
      {
        id: 'nav-leaderboard',
        title: 'Go to Leaderboard',
        icon: <Trophy size={18} />,
        category: 'navigation',
        action: () => navigate('/leaderboard'),
        keywords: ['gamification', 'xp'],
      },
      {
        id: 'nav-settings',
        title: 'Go to Settings',
        icon: <Settings size={18} />,
        category: 'navigation',
        action: () => navigate('/settings'),
        keywords: ['profile', 'preferences'],
      }
    );

    // Timer actions
    if (activeTimer) {
      items.push({
        id: 'action-stop-timer',
        title: 'Stop Timer',
        subtitle: 'Stop the currently running timer',
        icon: <Square size={18} className="text-danger-500" />,
        category: 'action',
        action: () => stopTimer(),
        keywords: ['time', 'tracking'],
      });
    }

    // Quick actions
    items.push({
      id: 'action-new-task',
      title: 'Create New Task',
      subtitle: 'Add a new task to the backlog',
      icon: <Plus size={18} className="text-primary-500" />,
      category: 'action',
      action: () => navigate('/kanban?action=create'),
      keywords: ['add', 'task'],
    });

    // Tasks (limit to recent/important)
    const myTasks = tasks
      .filter(t => t.assigneeId === currentUser?.id && t.status !== 'done')
      .slice(0, 10);

    myTasks.forEach(task => {
      const project = getProjectById(task.projectId);
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: project?.name || 'No project',
        icon: <FileText size={18} />,
        category: 'task',
        action: () => navigate(`/kanban?task=${task.id}`),
        keywords: [task.title.toLowerCase(), project?.name?.toLowerCase() || ''],
      });
    });

    // Projects
    projects.filter(p => p.status === 'active').forEach(project => {
      items.push({
        id: `project-${project.id}`,
        title: project.name,
        subtitle: project.clientName,
        icon: <FolderOpen size={18} />,
        category: 'project',
        action: () => navigate(`/projects?project=${project.id}`),
        keywords: [project.name.toLowerCase(), project.clientName.toLowerCase()],
      });
    });

    // Team members
    users.slice(0, 10).forEach(user => {
      if (user.id !== 'u0') { // Exclude system admin
        items.push({
          id: `user-${user.id}`,
          title: user.name,
          subtitle: user.specialization?.replace('_', ' ') || user.role,
          icon: <Users size={18} />,
          category: 'user',
          action: () => navigate(`/team?user=${user.id}`),
          keywords: [user.name.toLowerCase(), user.specialization?.toLowerCase() || ''],
        });
      }
    });

    return items;
  }, [tasks, projects, users, currentUser, activeTimer, navigate, stopTimer, getProjectById]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) {
      // Show navigation and actions first when no query
      return commands.filter(c => c.category === 'navigation' || c.category === 'action');
    }

    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => {
      if (cmd.title.toLowerCase().includes(lowerQuery)) return true;
      if (cmd.subtitle?.toLowerCase().includes(lowerQuery)) return true;
      if (cmd.keywords?.some(k => k.includes(lowerQuery))) return true;
      return false;
    });
  }, [commands, query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    },
    [filteredCommands, selectedIndex]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) {
    // Show keyboard shortcut hint
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
      >
        <Search size={14} />
        <span>Quick Search</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-white rounded border border-surface-200 ml-2">
          {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
        </kbd>
      </button>
    );
  }

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    action: 'Quick Actions',
    task: 'Your Tasks',
    project: 'Projects',
    user: 'Team Members',
  };

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="absolute inset-x-0 top-20 mx-auto max-w-2xl p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100">
            <Search size={20} className="text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, projects, or type a command..."
              className="flex-1 text-lg outline-none placeholder-text-muted"
            />
            <kbd className="px-2 py-1 text-xs text-text-muted bg-surface-100 rounded">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                No results found for "{query}"
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide bg-surface-50">
                    {categoryLabels[category]}
                  </div>
                  {items.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          globalIndex === selectedIndex
                            ? 'bg-primary-50 text-primary-700'
                            : 'hover:bg-surface-50'
                        }`}
                      >
                        <div className={`${globalIndex === selectedIndex ? 'text-primary-500' : 'text-text-muted'}`}>
                          {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cmd.title}</p>
                          {cmd.subtitle && (
                            <p className="text-sm text-text-muted truncate">{cmd.subtitle}</p>
                          )}
                        </div>
                        {globalIndex === selectedIndex && (
                          <kbd className="px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded">
                            Enter
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-surface-100 bg-surface-50 flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded border">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border">Enter</kbd>
                to select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-primary-500" />
              <span>Foxhole Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
