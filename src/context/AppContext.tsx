import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  User,
  Project,
  Task,
  ShootEvent,
  TimeEntry,
  Notification,
  TaskStatus,
  UserRole
} from '../types';
import {
  users as initialUsers,
  projects as initialProjects,
  tasks as initialTasks,
  shootEvents as initialShootEvents,
  timeEntries as initialTimeEntries,
  notifications as initialNotifications,
  levelConfigs,
  employeeROI,
  activityFeed as initialActivityFeed,
} from '../data/sampleData';

interface AppContextType {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (userId: string) => void;
  loginWithCredentials: (username: string, password: string) => boolean;
  logout: () => void;

  // Role-based access
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isPM: boolean;
  isEmployee: boolean;

  // Users
  users: User[];
  getUserById: (id: string) => User | undefined;
  updateUser: (user: User) => void;

  // Projects
  projects: Project[];
  getProjectById: (id: string) => Project | undefined;
  getProjectsByUser: (userId: string) => Project[];
  updateProject: (project: Project) => void;
  addProject: (project: Project) => void;

  // Tasks
  tasks: Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  updateTask: (task: Task) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (task: Task) => void;

  // Shoot Events
  shootEvents: ShootEvent[];
  getShootEventById: (id: string) => ShootEvent | undefined;
  getUpcomingShoots: () => ShootEvent[];
  updateShootEvent: (event: ShootEvent) => void;
  addShootEvent: (event: ShootEvent) => void;

  // Time Tracking
  timeEntries: TimeEntry[];
  activeTimer: TimeEntry | null;
  startTimer: (taskId: string, projectId: string, description: string) => void;
  stopTimer: () => void;
  getTimeEntriesByTask: (taskId: string) => TimeEntry[];
  getTimeEntriesByUser: (userId: string) => TimeEntry[];

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;

  // Gamification
  levelConfigs: typeof levelConfigs;
  addXP: (userId: string, amount: number) => void;
  getUserLevel: (xp: number) => typeof levelConfigs[0];

  // ROI Data
  employeeROI: typeof employeeROI;
  getROIByUser: (userId: string) => typeof employeeROI[0] | undefined;

  // Activity Feed
  activityFeed: typeof initialActivityFeed;

  // UI State
  selectedProject: string | null;
  setSelectedProject: (id: string | null) => void;
  selectedTask: string | null;
  setSelectedTask: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Current user state (start logged out - user must login)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data state
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [shootEvents, setShootEvents] = useState<ShootEvent[]>(initialShootEvents);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activityFeed] = useState(initialActivityFeed);

  // UI state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth functions
  const login = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, [users]);

  const loginWithCredentials = useCallback((username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Role checks
  const hasRole = useCallback((roles: UserRole[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'admin';
  const isPM = currentUser?.role === 'pm' || currentUser?.role === 'admin';
  const isEmployee = !!currentUser;

  // User functions
  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  // Project functions
  const getProjectById = useCallback((id: string) => projects.find(p => p.id === id), [projects]);

  const getProjectsByUser = useCallback((userId: string) => {
    return projects.filter(p =>
      p.pmId === userId || p.teamMemberIds.includes(userId)
    );
  }, [projects]);

  const updateProject = useCallback((updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  // Task functions
  const getTaskById = useCallback((id: string) => tasks.find(t => t.id === id), [tasks]);

  const getTasksByProject = useCallback((projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  const getTasksByUser = useCallback((userId: string) => {
    return tasks.filter(t => t.assigneeId === userId);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  // Gamification (defined before moveTask since it uses addXP)
  const getUserLevel = useCallback((xp: number) => {
    return levelConfigs.find(l => xp >= l.minXP && xp < l.maxXP) || levelConfigs[0];
  }, []);

  const addXP = useCallback((userId: string, amount: number) => {
    setUsers(prev => {
      const user = prev.find(u => u.id === userId);
      if (!user) return prev;

      const newXP = user.xp + amount;
      const newLevel = getUserLevel(newXP);

      return prev.map(u => u.id === userId ? {
        ...u,
        xp: newXP,
        level: newLevel.level,
      } : u);
    });

    // Update currentUser if they're the one getting XP
    if (currentUser?.id === userId) {
      const newXP = currentUser.xp + amount;
      const newLevel = getUserLevel(newXP);
      setCurrentUser({
        ...currentUser,
        xp: newXP,
        level: newLevel.level,
      });
    }
  }, [getUserLevel, currentUser]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.status === 'done';
    const isNowCompleted = newStatus === 'done';

    setTasks(prev => {
      // First update the moved task
      let updatedTasks = prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      // Then update dependency locking for tasks that depend on this one
      updatedTasks = updatedTasks.map(t => {
        if (t.dependsOn.includes(taskId)) {
          // Check if all dependencies are now complete
          const allDependenciesComplete = t.dependsOn.every(depId => {
            const depTask = updatedTasks.find(dt => dt.id === depId);
            return depTask?.status === 'done';
          });

          // Update blockedBy and isLocked
          const blockedBy = t.dependsOn.filter(depId => {
            const depTask = updatedTasks.find(dt => dt.id === depId);
            return depTask?.status !== 'done';
          });

          return {
            ...t,
            blockedBy,
            isLocked: !allDependenciesComplete,
          };
        }
        return t;
      });

      return updatedTasks;
    });

    // Award XP when task is moved to done (and wasn't already done)
    if (!wasCompleted && isNowCompleted && task.assigneeId) {
      addXP(task.assigneeId, task.xpReward);
    }
  }, [tasks, addXP]);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  // Shoot Event functions
  const getShootEventById = useCallback((id: string) => shootEvents.find(s => s.id === id), [shootEvents]);

  const getUpcomingShoots = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return shootEvents
      .filter(s => s.date >= today && s.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shootEvents]);

  const updateShootEvent = useCallback((updatedEvent: ShootEvent) => {
    setShootEvents(prev => prev.map(s => s.id === updatedEvent.id ? updatedEvent : s));
  }, []);

  const addShootEvent = useCallback((event: ShootEvent) => {
    setShootEvents(prev => [...prev, event]);
  }, []);

  // Time tracking
  const activeTimer = timeEntries.find(te => te.isActive && te.userId === currentUser?.id) || null;

  const startTimer = useCallback((taskId: string, projectId: string, description: string) => {
    if (!currentUser) return;

    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      userId: currentUser.id,
      taskId,
      projectId,
      startTime: new Date().toISOString(),
      duration: 0,
      description,
      isActive: true,
    };

    setTimeEntries(prev => [...prev, newEntry]);
  }, [currentUser]);

  const stopTimer = useCallback(() => {
    if (!activeTimer) return;

    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    setTimeEntries(prev => prev.map(te => {
      if (te.id === activeTimer.id) {
        return {
          ...te,
          endTime: endTime.toISOString(),
          duration,
          isActive: false,
        };
      }
      return te;
    }));

    // Update task logged hours
    const task = tasks.find(t => t.id === activeTimer.taskId);
    if (task) {
      updateTask({
        ...task,
        loggedHours: task.loggedHours + (duration / 60),
      });
    }
  }, [activeTimer, tasks, updateTask]);

  const getTimeEntriesByTask = useCallback((taskId: string) => {
    return timeEntries.filter(te => te.taskId === taskId);
  }, [timeEntries]);

  const getTimeEntriesByUser = useCallback((userId: string) => {
    return timeEntries.filter(te => te.userId === userId);
  }, [timeEntries]);

  // Notifications
  const unreadCount = notifications.filter(n =>
    n.userId === currentUser?.id && !n.read
  ).length;

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n =>
      n.userId === currentUser.id ? { ...n, read: true } : n
    ));
  }, [currentUser]);

  // ROI
  const getROIByUser = useCallback((userId: string) => {
    return employeeROI.find(r => r.userId === userId);
  }, []);

  const value: AppContextType = {
    // Auth
    currentUser,
    setCurrentUser,
    login,
    loginWithCredentials,
    logout,

    // Roles
    hasRole,
    isAdmin,
    isPM,
    isEmployee,

    // Users
    users,
    getUserById,
    updateUser,

    // Projects
    projects,
    getProjectById,
    getProjectsByUser,
    updateProject,
    addProject,

    // Tasks
    tasks,
    getTaskById,
    getTasksByProject,
    getTasksByUser,
    getTasksByStatus,
    updateTask,
    moveTask,
    addTask,

    // Shoots
    shootEvents,
    getShootEventById,
    getUpcomingShoots,
    updateShootEvent,
    addShootEvent,

    // Time
    timeEntries,
    activeTimer,
    startTimer,
    stopTimer,
    getTimeEntriesByTask,
    getTimeEntriesByUser,

    // Notifications
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,

    // Gamification
    levelConfigs,
    addXP,
    getUserLevel,

    // ROI
    employeeROI,
    getROIByUser,

    // Activity
    activityFeed,

    // UI
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    sidebarCollapsed,
    setSidebarCollapsed,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
