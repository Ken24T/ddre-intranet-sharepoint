/**
 * useUnifiedNotifications Hook
 *
 * Aggregates task-based notifications into grouped categories.
 * Respects the doNotNotify flag on tasks.
 */

import * as React from 'react';
import { useTasks } from '../tasks/TasksContext';
import {
  Notification,
  NotificationGroup,
  NotificationState,
  NotificationCategory,
  CATEGORY_CONFIG,
} from './types';
import { TaskSummary, TaskPriority } from '../tasks/types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determines the notification category based on due date.
 */
function getDateCategory(dueDate: string): NotificationCategory | undefined {
  const now = new Date();
  const dueParsed = new Date(dueDate);
  // Normalize to date-only (strip time) for consistent comparison
  const due = new Date(dueParsed.getFullYear(), dueParsed.getMonth(), dueParsed.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (due < today) {
    return 'overdue';
  } else if (due < tomorrow) {
    return 'due-today';
  } else if (due < dayAfterTomorrow) {
    return 'due-tomorrow';
  } else if (due < endOfWeek) {
    return 'due-this-week';
  }
  return undefined;
}

/**
 * Converts a task to a notification.
 */
function taskToNotification(task: TaskSummary, category: NotificationCategory): Notification {
  return {
    id: `task-${task.id}`,
    category,
    source: 'task',
    title: task.title,
    message: task.description,
    timestamp: task.dueDate ?? new Date().toISOString(),
    isRead: false,
    deepLink: {
      type: 'task',
      id: task.id,
    },
    priority: task.priority,
    dueDate: task.dueDate,
  };
}

/**
 * Groups notifications by category.
 */
function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  // Use a plain object instead of Map for ES5 compatibility
  const groupMap: Record<NotificationCategory, Notification[]> = {
    overdue: [],
    'due-today': [],
    'due-tomorrow': [],
    'due-this-week': [],
    assigned: [],
    mentioned: [],
    'budget-approval': [],
  };

  // Group notifications
  for (const notification of notifications) {
    groupMap[notification.category].push(notification);
  }

  // Convert to array and sort
  const groups: NotificationGroup[] = [];
  const categories = Object.keys(CATEGORY_CONFIG) as NotificationCategory[];

  for (const category of categories) {
    const items = groupMap[category];
    if (items.length > 0) {
      // Sort items within group by priority then due date
      const priorityOrder: Record<TaskPriority, number> = {
        urgent: 1,
        high: 2,
        medium: 3,
        low: 4,
      };

      items.sort((a: Notification, b: Notification) => {
        const aPriority = priorityOrder[a.priority ?? 'medium'];
        const bPriority = priorityOrder[b.priority ?? 'medium'];
        if (aPriority !== bPriority) return aPriority - bPriority;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });

      groups.push({
        category,
        label: CATEGORY_CONFIG[category].label,
        notifications: items,
        count: items.length,
      });
    }
  }

  // Sort groups by their defined order
  groups.sort((a: NotificationGroup, b: NotificationGroup) =>
    CATEGORY_CONFIG[a.category].sortOrder - CATEGORY_CONFIG[b.category].sortOrder
  );

  return groups;
}

// =============================================================================
// HOOK
// =============================================================================

export interface UseUnifiedNotificationsResult {
  state: NotificationState;
  /** Refresh notifications from source */
  refresh: () => Promise<void>;
  /** Mark a notification as read */
  markAsRead: (notificationId: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => void;
  /** Get notifications for status bar banner (overdue + due-today, excluding doNotNotify) */
  getBannerNotifications: () => Notification[];
}

export interface UseUnifiedNotificationsOptions {
  /** Additional notifications from external sources (e.g. app bridge). */
  additionalNotifications?: Notification[];
}

export function useUnifiedNotifications(
  options?: UseUnifiedNotificationsOptions,
): UseUnifiedNotificationsResult {
  const { state: tasksState, refreshTasks } = useTasks();
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());

  const additionalNotifications = options?.additionalNotifications;

  // Compute notifications from tasks + external sources
  const state = React.useMemo<NotificationState>(() => {
    const notifications: Notification[] = [];

    for (const task of tasksState.tasks) {
      // Skip tasks with doNotNotify flag
      if (task.doNotNotify) continue;

      // Skip completed/cancelled tasks
      if (task.status === 'completed' || task.status === 'cancelled') continue;

      // Only include tasks with due dates
      if (!task.dueDate) continue;

      const category = getDateCategory(task.dueDate);
      if (category) {
        const notification = taskToNotification(task, category);
        notification.isRead = readIds.has(notification.id);
        notifications.push(notification);
      }
    }

    // Merge additional notifications from external sources (e.g. budget app)
    if (additionalNotifications) {
      for (const n of additionalNotifications) {
        const merged: Notification = {
          ...n,
          isRead: readIds.has(n.id),
        };
        notifications.push(merged);
      }
    }

    const groups = groupNotifications(notifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Convert Error to string for compatibility with NotificationState.error
    const errorMessage = tasksState.error instanceof Error
      ? tasksState.error.message
      : tasksState.error;

    return {
      groups,
      unreadCount,
      isLoading: tasksState.isLoading,
      error: errorMessage,
      lastRefresh: new Date().toISOString(),
    };
  }, [tasksState.tasks, tasksState.isLoading, tasksState.error, readIds, additionalNotifications]);

  const refresh = React.useCallback(async () => {
    await refreshTasks();
  }, [refreshTasks]);

  const markAsRead = React.useCallback((notificationId: string) => {
    setReadIds((prev) => {
      const newSet = new Set<string>();
      prev.forEach((id) => newSet.add(id));
      newSet.add(notificationId);
      return newSet;
    });
  }, []);

  const markAllAsRead = React.useCallback(() => {
    // ES5-compatible: avoid flatMap
    const allIds: string[] = [];
    state.groups.forEach((g: NotificationGroup) => {
      g.notifications.forEach((n: Notification) => {
        allIds.push(n.id);
      });
    });
    setReadIds(new Set(allIds));
  }, [state.groups]);

  const getBannerNotifications = React.useCallback((): Notification[] => {
    // Return overdue and due-today notifications for status bar banner
    // ES5-compatible: avoid flatMap
    const result: Notification[] = [];
    state.groups
      .filter((g: NotificationGroup) => g.category === 'overdue' || g.category === 'due-today')
      .forEach((g: NotificationGroup) => {
        g.notifications.forEach((n: Notification) => {
          if (!n.isRead) {
            result.push(n);
          }
        });
      });
    return result;
  }, [state.groups]);

  return {
    state,
    refresh,
    markAsRead,
    markAllAsRead,
    getBannerNotifications,
  };
}
