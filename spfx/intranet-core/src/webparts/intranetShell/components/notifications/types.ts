/**
 * Notification system types for the DDRE Intranet.
 * Supports task-based notifications with grouping by category.
 */

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export type NotificationCategory =
  | 'overdue'
  | 'due-today'
  | 'due-tomorrow'
  | 'due-this-week'
  | 'assigned'
  | 'mentioned';

export type NotificationSource = 'task' | 'system';

/**
 * A single notification item.
 */
export interface Notification {
  id: string;
  category: NotificationCategory;
  source: NotificationSource;
  title: string;
  message?: string;
  timestamp: string;
  /** Whether the notification has been read/acknowledged */
  isRead: boolean;
  /** Link to navigate when clicked */
  deepLink?: {
    type: 'task' | 'page';
    id: string;
  };
  /** Priority for sorting within category */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  /** Due date for task notifications */
  dueDate?: string;
}

/**
 * A group of notifications by category.
 */
export interface NotificationGroup {
  category: NotificationCategory;
  label: string;
  notifications: Notification[];
  count: number;
}

/**
 * State for the unified notification system.
 */
export interface NotificationState {
  /** All notifications grouped by category */
  groups: NotificationGroup[];
  /** Total unread count */
  unreadCount: number;
  /** Whether notifications are loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error?: string;
  /** Last refresh timestamp */
  lastRefresh?: string;
}

/**
 * Category display configuration.
 */
export const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; icon: string; sortOrder: number }
> = {
  overdue: { label: 'Overdue', icon: 'Warning', sortOrder: 1 },
  'due-today': { label: 'Due Today', icon: 'Clock', sortOrder: 2 },
  'due-tomorrow': { label: 'Due Tomorrow', icon: 'Calendar', sortOrder: 3 },
  'due-this-week': { label: 'Due This Week', icon: 'CalendarWeek', sortOrder: 4 },
  assigned: { label: 'Newly Assigned', icon: 'AddFriend', sortOrder: 5 },
  mentioned: { label: 'Mentions', icon: 'Message', sortOrder: 6 },
};
