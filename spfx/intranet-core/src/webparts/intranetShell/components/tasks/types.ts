/**
 * Task system types for the DDRE Intranet.
 * These mirror the types from pkg-api-client/TasksClient for use in React components.
 */

// =============================================================================
// ENUMS / LITERALS
// =============================================================================

export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type OwnershipType = 'user' | 'team' | 'group';

export type TaskRole = 'owner' | 'assignee' | 'viewer';

export type RecurrencePattern =
  | 'daily'
  | 'weekly'
  | 'fortnightly'
  | 'monthly'
  | 'yearly'
  | 'custom';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type WeekOfMonth = 'first' | 'second' | 'third' | 'fourth' | 'last';

export type ReminderChannel = 'intranet' | 'email' | 'teams';

export type ReminderTiming = 'before-due' | 'on-due' | 'custom';

// =============================================================================
// DATA MODELS
// =============================================================================

export interface TaskOwnership {
  type: OwnershipType;
  ownerId: string;
  ownerDisplayName?: string;
}

export interface TaskAssignment {
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  role: TaskRole;
  assignedAt?: string;
  assignedBy?: string;
}

export interface TaskHubLink {
  hubId: string;
  hubDisplayName?: string;
  toolId?: string;
  toolDisplayName?: string;
  entityType?: string;
  entityId?: string;
  entityDisplayName?: string;
}

export interface TaskRecurrence {
  pattern: RecurrencePattern;
  interval?: number;
  startDate: string;
  endDate?: string;
  occurrenceCount?: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  monthOfYear?: number;
  weekOfMonth?: WeekOfMonth;
}

export interface TaskReminder {
  id: string;
  timing: ReminderTiming;
  offsetMinutes?: number;
  customDateTime?: string;
  channels: ReminderChannel[];
  recipientUserIds?: string[];
  sent?: boolean;
  sentAt?: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorDisplayName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

export interface TaskChecklist {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  sortOrder?: number;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

/**
 * Full task entity.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  ownership: TaskOwnership;
  assignments?: TaskAssignment[];
  hubLink?: TaskHubLink;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  completedBy?: string;
  recurrence?: TaskRecurrence;
  parentTaskId?: string;
  reminders?: TaskReminder[];
  checklist?: TaskChecklist[];
  comments?: TaskComment[];
  tags?: string[];
  attachments?: TaskAttachment[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
}

/**
 * Lightweight task for list views.
 */
export interface TaskSummary {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  ownership: TaskOwnership;
  dueDate?: string;
  assigneeCount?: number;
  hubId?: string;
  hubDisplayName?: string;
  hasRecurrence?: boolean;
  checklistProgress?: {
    completed: number;
    total: number;
  };
  /** Checklist items for tooltip display */
  checklist?: TaskChecklist[];
  commentCount?: number;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  ownership: TaskOwnership;
  assignments?: Array<{
    userId: string;
    role: TaskRole;
  }>;
  hubLink?: TaskHubLink;
  dueDate?: string;
  startDate?: string;
  recurrence?: TaskRecurrence;
  reminders?: CreateReminderRequest[];
  checklist?: Array<{ title: string }>;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  hubLink?: TaskHubLink;
  checklist?: Array<{
    id?: string;
    title: string;
    completed?: boolean;
    sortOrder?: number;
  }>;
  tags?: string[];
  version?: number;
}

export interface CreateReminderRequest {
  timing: ReminderTiming;
  offsetMinutes?: number;
  customDateTime?: string;
  channels: ReminderChannel[];
  recipientUserIds?: string[];
}

// =============================================================================
// FILTER / QUERY TYPES
// =============================================================================

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  hubId?: string;
  ownershipType?: OwnershipType;
  dueDateFrom?: string;
  dueDateTo?: string;
  includeCompleted?: boolean;
  searchQuery?: string;
}

export type TaskSortField = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  order: SortOrder;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export type TaskView = 'list' | 'board' | 'calendar';

export interface TasksState {
  /** All loaded tasks */
  tasks: TaskSummary[];
  /** Currently selected task (full details) */
  selectedTask: Task | undefined;
  /** Loading states */
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingTask: boolean;
  /** Error state */
  error: Error | undefined;
  /** Current filters */
  filters: TaskFilters;
  /** Current sort */
  sort: TaskSort;
  /** Current view mode */
  view: TaskView;
  /** Pagination */
  hasMore: boolean;
  continuationToken?: string;
  /** Counts */
  totalCount?: number;
  overdueCount: number;
  dueSoonCount: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a task is overdue.
 */
export function isTaskOverdue(task: Task | TaskSummary): boolean {
  if (!task.dueDate) return false;
  if (task.status === 'completed' || task.status === 'cancelled') return false;
  return new Date(task.dueDate) < new Date();
}

/**
 * Check if a task is due within the specified hours.
 */
export function isTaskDueSoon(task: Task | TaskSummary, withinHours = 48): boolean {
  if (!task.dueDate) return false;
  if (task.status === 'completed' || task.status === 'cancelled') return false;
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const threshold = new Date(now.getTime() + withinHours * 60 * 60 * 1000);
  
  return dueDate > now && dueDate <= threshold;
}

/**
 * Get priority weight for sorting (higher = more urgent).
 */
export function getPriorityWeight(priority: TaskPriority): number {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

/**
 * Get status display text.
 */
export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'not-started': return 'Not Started';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}

/**
 * Get priority display text.
 */
export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    case 'urgent': return 'Urgent';
    default: return priority;
  }
}
