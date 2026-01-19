import * as React from 'react';
import { useTasks } from './TasksContext';
import {
  Task,
  TaskSummary,
  TaskFilters,
  TaskSort,
  isTaskOverdue,
  isTaskDueSoon,
  getPriorityWeight,
} from './types';

// =============================================================================
// useTask - Single task operations
// =============================================================================

export interface UseTaskResult {
  task: Task | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
}

/**
 * Hook for working with a single task.
 * Automatically loads task details when taskId changes.
 */
export function useTask(taskId: string | undefined): UseTaskResult {
  const { state, selectTask, clearError } = useTasks();

  React.useEffect(() => {
    if (taskId) {
      selectTask(taskId).catch(console.error);
    } else {
      selectTask(undefined).catch(console.error);
    }

    return () => {
      clearError();
    };
  }, [taskId, selectTask, clearError]);

  const refresh = React.useCallback(async () => {
    if (taskId) {
      await selectTask(taskId);
    }
  }, [taskId, selectTask]);

  return {
    task: state.selectedTask,
    isLoading: state.isLoadingTask,
    error: state.error,
    refresh,
  };
}

// =============================================================================
// useTaskList - Filtered and sorted task list
// =============================================================================

export interface UseTaskListOptions {
  filters?: TaskFilters;
  sort?: TaskSort;
  autoRefreshInterval?: number;
}

export interface UseTaskListResult {
  tasks: TaskSummary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | undefined;
  hasMore: boolean;
  totalCount?: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for working with a filtered list of tasks.
 */
export function useTaskList(options: UseTaskListOptions = {}): UseTaskListResult {
  const { filters, sort, autoRefreshInterval } = options;
  const { state, setFilters, setSort, refreshTasks, loadMoreTasks } = useTasks();

  // Apply filters when they change
  React.useEffect(() => {
    if (filters) {
      setFilters(filters);
    }
  }, [filters, setFilters]);

  // Apply sort when it changes
  React.useEffect(() => {
    if (sort) {
      setSort(sort);
    }
  }, [sort, setSort]);

  // Auto-refresh interval
  React.useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      refreshTasks().catch(console.error);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, refreshTasks]);

  // Local sorting (client-side)
  const sortedTasks = React.useMemo(() => {
    const sorted = [...state.tasks];
    const { field, order } = state.sort;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'dueDate':
          // Tasks without due date go last
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;

        case 'priority':
          comparison = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
          break;

        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;

        case 'createdAt':
        case 'updatedAt':
          // These would need to be on TaskSummary for client sorting
          comparison = 0;
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [state.tasks, state.sort]);

  return {
    tasks: sortedTasks,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loadMore: loadMoreTasks,
    refresh: refreshTasks,
  };
}

// =============================================================================
// useTaskMutations - Create, update, delete operations
// =============================================================================

export interface UseTaskMutationsResult {
  createTask: (request: Parameters<ReturnType<typeof useTasks>['createTask']>[0]) => Promise<Task>;
  updateTask: (
    taskId: string,
    request: Parameters<ReturnType<typeof useTasks>['updateTask']>[1]
  ) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  updateStatus: (taskId: string, status: Task['status']) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Hook for task mutation operations with loading states.
 */
export function useTaskMutations(): UseTaskMutationsResult {
  const context = useTasks();

  const [isCreating, setIsCreating] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const createTask = React.useCallback(
    async (request: Parameters<typeof context.createTask>[0]): Promise<Task> => {
      setIsCreating(true);
      try {
        return await context.createTask(request);
      } finally {
        setIsCreating(false);
      }
    },
    [context]
  );

  const updateTask = React.useCallback(
    async (taskId: string, request: Parameters<typeof context.updateTask>[1]): Promise<Task> => {
      setIsUpdating(true);
      try {
        return await context.updateTask(taskId, request);
      } finally {
        setIsUpdating(false);
      }
    },
    [context]
  );

  const deleteTask = React.useCallback(
    async (taskId: string): Promise<void> => {
      setIsDeleting(true);
      try {
        await context.deleteTask(taskId);
      } finally {
        setIsDeleting(false);
      }
    },
    [context]
  );

  const updateStatus = React.useCallback(
    async (taskId: string, status: Task['status']): Promise<void> => {
      setIsUpdating(true);
      try {
        await context.updateTaskStatus(taskId, status);
      } finally {
        setIsUpdating(false);
      }
    },
    [context]
  );

  const toggleChecklistItem = React.useCallback(
    async (taskId: string, itemId: string, completed: boolean): Promise<void> => {
      await context.toggleChecklistItem(taskId, itemId, completed);
    },
    [context]
  );

  return {
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    toggleChecklistItem,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

// =============================================================================
// useTaskCounts - Overdue and due soon counts
// =============================================================================

export interface UseTaskCountsResult {
  overdueCount: number;
  dueSoonCount: number;
  totalCount: number;
  activeCount: number;
}

/**
 * Hook for task counts (overdue, due soon, etc.).
 */
export function useTaskCounts(): UseTaskCountsResult {
  const { state } = useTasks();

  const activeCount = React.useMemo(
    () => state.tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length,
    [state.tasks]
  );

  return {
    overdueCount: state.overdueCount,
    dueSoonCount: state.dueSoonCount,
    totalCount: state.totalCount ?? state.tasks.length,
    activeCount,
  };
}

// =============================================================================
// useTaskReminders - Upcoming reminders
// =============================================================================

export interface UpcomingReminder {
  taskId: string;
  taskTitle: string;
  dueDate?: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  priority: Task['priority'];
}

export interface UseTaskRemindersResult {
  upcomingReminders: UpcomingReminder[];
  overdueReminders: UpcomingReminder[];
  dueSoonReminders: UpcomingReminder[];
}

/**
 * Hook for upcoming task reminders.
 */
export function useTaskReminders(): UseTaskRemindersResult {
  const { state } = useTasks();

  const reminders = React.useMemo(() => {
    const upcoming: UpcomingReminder[] = [];
    const overdue: UpcomingReminder[] = [];
    const dueSoon: UpcomingReminder[] = [];

    for (const task of state.tasks) {
      if (task.status === 'completed' || task.status === 'cancelled') continue;

      const reminder: UpcomingReminder = {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate,
        isOverdue: isTaskOverdue(task),
        isDueSoon: isTaskDueSoon(task),
        priority: task.priority,
      };

      if (reminder.isOverdue) {
        overdue.push(reminder);
      } else if (reminder.isDueSoon) {
        dueSoon.push(reminder);
      }

      if (reminder.isOverdue || reminder.isDueSoon) {
        upcoming.push(reminder);
      }
    }

    // Sort by priority (urgent first) then due date
    const sortReminders = (a: UpcomingReminder, b: UpcomingReminder): number => {
      const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (priorityDiff !== 0) return priorityDiff;

      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    };

    upcoming.sort(sortReminders);
    overdue.sort(sortReminders);
    dueSoon.sort(sortReminders);

    return { upcoming, overdue, dueSoon };
  }, [state.tasks]);

  return {
    upcomingReminders: reminders.upcoming,
    overdueReminders: reminders.overdue,
    dueSoonReminders: reminders.dueSoon,
  };
}

// =============================================================================
// useHubTasks - Tasks for a specific hub
// =============================================================================

export interface UseHubTasksResult {
  tasks: TaskSummary[];
  count: number;
}

/**
 * Hook for tasks linked to a specific hub.
 */
export function useHubTasks(hubId: string | undefined): UseHubTasksResult {
  const { state } = useTasks();

  const hubTasks = React.useMemo(() => {
    if (!hubId) return [];
    return state.tasks.filter((t) => t.hubId === hubId);
  }, [state.tasks, hubId]);

  return {
    tasks: hubTasks,
    count: hubTasks.length,
  };
}
