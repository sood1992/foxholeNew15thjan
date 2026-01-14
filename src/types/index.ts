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
  username?: string; // For login
  password?: string; // Hashed in production, plain for demo
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  role: UserRole;
  specialization: Specialization | 'admin';
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

// Dependency type for advanced workflow
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish';

// Auto-assignment strategy
export type AutoAssignStrategy = 'least_busy' | 'round_robin' | 'highest_skill' | 'manual';

// Task Comment for collaboration
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions: string[]; // User IDs mentioned with @
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For threaded replies
  isEdited: boolean;
}

// Visual Annotation for creative review
export interface VisualAnnotation {
  id: string;
  attachmentId: string;
  position: { x: number; y: number };
  timestamp?: number; // For video annotations (in seconds)
  userId: string;
  comment: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

// Task
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  // Multi-assignee support
  assigneeId: string; // Primary assignee (backwards compatible)
  assigneeIds?: string[]; // All assignees for collaborative tasks (optional for backwards compat)
  creatorId: string;
  // Watchers/followers
  watchers?: string[]; // User IDs watching this task
  estimatedHours: number;
  loggedHours: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  // Advanced Dependencies
  dependsOn: string[]; // Task IDs this task depends on
  dependencyType?: DependencyType; // Type of dependency (defaults to finish_to_start)
  blockedBy: string[]; // Computed: tasks that are blocking this
  isLocked: boolean; // Computed: true if any dependency is incomplete
  // Auto-routing
  nextAssigneeId?: string; // Who gets this task when current stage completes
  autoAssignStrategy?: AutoAssignStrategy;
  requiredRole?: Specialization; // Role needed for this task
  // Client review
  clientReviewLink?: string;
  clientApproved?: boolean;
  clientFeedback?: string[];
  // Comments
  comments?: TaskComment[]; // Optional for backwards compat
  // Attachments
  attachments: Attachment[];
  // Tags
  tags: string[];
  // XP value
  xpReward: number;
  // Workflow template reference
  workflowTemplateId?: string;
  workflowStageId?: string;
}

// Workflow Template for automating task flow
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  projectType: 'video' | 'photo' | 'marketing' | 'strategy' | 'mixed';
  stages: WorkflowStage[];
  createdBy: string;
  createdAt: string;
  isDefault: boolean;
}

// Workflow Stage within a template
export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  order: number;
  role: Specialization; // Auto-assign to team member with this role
  estimatedHours: number;
  dependsOnStageId?: string; // Previous stage this depends on
  autoStartWhenUnblocked: boolean;
  autoAssignStrategy: AutoAssignStrategy;
  defaultStatus: TaskStatus;
  xpReward: number;
}

// Digital Asset for Asset Library
export interface DigitalAsset {
  id: string;
  name: string;
  type: 'photo' | 'video' | 'design' | 'document' | 'audio' | 'raw_footage';
  fileSize: number;
  format: string; // .mp4, .psd, .ai, .raw, etc.
  thumbnail: string;
  previewUrl: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  projectId: string;
  taskId?: string;
  // Metadata
  dimensions?: { width: number; height: number };
  duration?: number; // For video/audio in seconds
  camera?: string;
  // Organization
  tags: string[];
  collections: string[];
  isArchived: boolean;
  // Version Control
  version: number;
  versionOf?: string; // Parent asset ID
  // Usage Rights
  license?: string;
  usageRights: 'internal' | 'client' | 'public';
}

// Project Health metrics for PM dashboard
export interface ProjectHealth {
  projectId: string;
  budgetHealth: 'green' | 'yellow' | 'red'; // Based on burn rate
  scheduleHealth: 'green' | 'yellow' | 'red'; // Based on task progress
  teamHealth: 'green' | 'yellow' | 'red'; // Based on workload
  overallHealth: 'green' | 'yellow' | 'red';
  tasksOnTrack: number;
  tasksAtRisk: number;
  tasksOverdue: number;
  budgetRemaining: number;
  daysRemaining: number;
  blockedTasks: number;
  predictedCompletionDate: string;
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
