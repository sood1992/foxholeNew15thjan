// ============================================
// FOXHOLE - Enterprise Operating System Types
// ============================================

// User Roles
export type UserRole = 'admin' | 'pm' | 'employee';

// Employee specializations at Neofox
export type Specialization =
  | 'photographer'
  | 'videographer'
  | 'editor'
  | 'graphic_designer'
  | 'project_manager'
  | 'marketing'
  | 'strategy';

// User/Employee
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  specialization: Specialization;
  hourlyRate: number; // Cost per hour
  department: string;
  joinedAt: string;
  // Gamification
  xp: number;
  level: number;
  badges: Badge[];
  currentStreak: number;
  longestStreak: number;
  // PM-specific (dual role)
  isPM?: boolean;
}

// Badge for gamification
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'productivity' | 'quality' | 'streak' | 'milestone' | 'special';
}

// Project
export interface Project {
  id: string;
  name: string;
  clientName: string;
  jobCode: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  pmId: string;
  teamMemberIds: string[];
  type: 'video' | 'photo' | 'marketing' | 'strategy' | 'mixed';
  thumbnail?: string;
}

// Task status for Kanban
export type TaskStatus = 'backlog' | 'raw' | 'in_progress' | 'review' | 'client_review' | 'done';

// Task
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  creatorId: string;
  estimatedHours: number;
  loggedHours: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  // Dependencies (Task Locking)
  dependsOn: string[]; // Task IDs this task depends on
  blockedBy: string[]; // Computed: tasks that are blocking this
  isLocked: boolean; // Computed: true if any dependency is incomplete
  // Client review
  clientReviewLink?: string;
  clientApproved?: boolean;
  clientFeedback?: string[];
  // Attachments
  attachments: Attachment[];
  // Tags
  tags: string[];
  // XP value
  xpReward: number;
}

// Attachment
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  url: string;
  thumbnailUrl?: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

// Time Entry
export interface TimeEntry {
  id: string;
  userId: string;
  taskId: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description: string;
  isActive: boolean;
}

// Production/Shoot Event
export interface ShootEvent {
  id: string;
  projectId: string;
  title: string;
  type: 'video_shoot' | 'photo_shoot' | 'interview' | 'event_coverage' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  crewIds: string[];
  equipment: string[];
  callTime: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

// Client Portal Link
export interface ClientPortalLink {
  id: string;
  projectId: string;
  taskId?: string;
  token: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

// Client Comment (on portal)
export interface ClientComment {
  id: string;
  portalLinkId: string;
  attachmentId: string;
  content: string;
  timestamp: string;
  position?: { x: number; y: number }; // For pinned comments on images/videos
  resolved: boolean;
}

// ROI Data for Moneyball approach
export interface EmployeeROI {
  userId: string;
  period: string; // e.g., "2024-01" for monthly
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  tasksCompleted: number;
  projectsContributed: string[];
  revenueGenerated: number; // Attributed revenue
  roi: number; // (revenueGenerated - totalCost) / totalCost
  verdict: 'promote' | 'raise' | 'monitor' | 'excellent';
  xpEarned: number;
  averageTaskTime: number;
  qualityScore: number; // Based on client feedback, revisions needed
}

// Capacity data for heatmap
export interface CapacityData {
  userId: string;
  date: string;
  scheduledHours: number;
  availableHours: number; // Usually 8
  utilizationPercent: number;
  tasks: { taskId: string; hours: number }[];
}

// Dashboard Stats
export interface DashboardStats {
  activeProjects: number;
  tasksCompleted: number;
  teamUtilization: number;
  upcomingShoots: number;
  totalRevenue: number;
  pendingReviews: number;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'deadline_approaching' | 'client_feedback' | 'badge_earned' | 'shoot_reminder' | 'mention';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Level configuration for gamification
export interface LevelConfig {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  perks: string[];
}

// Activity Feed Item
export interface ActivityItem {
  id: string;
  userId: string;
  type: 'task_created' | 'task_completed' | 'task_moved' | 'comment_added' | 'file_uploaded' | 'project_created' | 'badge_earned' | 'client_approved';
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Filter/Sort options
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: ('low' | 'medium' | 'high' | 'urgent')[];
  assigneeIds?: string[];
  projectIds?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
  showLocked?: boolean;
}

// Report configuration
export interface ReportConfig {
  type: 'roi' | 'capacity' | 'project_summary' | 'time_tracking';
  dateRange: { start: string; end: string };
  userIds?: string[];
  projectIds?: string[];
  format: 'pdf' | 'csv' | 'json';
}
