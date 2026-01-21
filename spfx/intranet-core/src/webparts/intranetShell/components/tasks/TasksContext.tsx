import * as React from 'react';
import {
  Task,
  TaskSummary,
  TaskChecklist,
  TaskFilters,
  TaskSort,
  TaskView,
  TasksState,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from './types';

// =============================================================================
// CONTEXT VALUE INTERFACE
// =============================================================================

export interface ITasksContext {
  // State
  state: TasksState;

  // Task List Operations
  /** Refresh the task list with current filters */
  refreshTasks: () => Promise<void>;
  /** Load more tasks (pagination) */
  loadMoreTasks: () => Promise<void>;
  /** Update filters and refresh */
  setFilters: (filters: TaskFilters) => void;
  /** Update sort and refresh */
  setSort: (sort: TaskSort) => void;
  /** Change view mode */
  setView: (view: TaskView) => void;

  // Single Task Operations
  /** Select a task to view details */
  selectTask: (taskId: string | undefined) => Promise<void>;
  /** Create a new task */
  createTask: (request: CreateTaskRequest) => Promise<Task>;
  /** Update an existing task */
  updateTask: (taskId: string, request: UpdateTaskRequest) => Promise<Task>;
  /** Delete a task */
  deleteTask: (taskId: string) => Promise<void>;

  // Quick Actions
  /** Quick status change */
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  /** Toggle a checklist item */
  toggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<void>;

  // Utility
  /** Clear any errors */
  clearError: () => void;
}

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: TasksState = {
  tasks: [],
  selectedTask: undefined,
  isLoading: false,
  isLoadingMore: false,
  isLoadingTask: false,
  error: undefined,
  filters: {
    includeCompleted: false,
  },
  sort: {
    field: 'dueDate',
    order: 'asc',
  },
  view: 'list',
  hasMore: false,
  continuationToken: undefined,
  totalCount: undefined,
  overdueCount: 0,
  dueSoonCount: 0,
};

// =============================================================================
// CONTEXT
// =============================================================================

const TasksContext = React.createContext<ITasksContext | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

export interface TasksProviderProps {
  children: React.ReactNode;
  /**
   * API client for task operations.
   * In production, this comes from TasksClient.
   * For testing, provide a mock.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any;
  /**
   * Current user ID (for ownership checks).
   */
  currentUserId?: string;
  /**
   * Initial filters to apply.
   */
  initialFilters?: TaskFilters;
  /**
   * Auto-load tasks on mount.
   */
  autoLoad?: boolean;
}

// =============================================================================
// MOCK CLIENT (for development without API)
// =============================================================================

interface MockTasksClient {
  getMyTasks: () => Promise<{ items: TaskSummary[]; totalCount?: number; continuationToken?: string }>;
  getTask: (id: string) => Promise<Task>;
  createTask: (req: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, req: UpdateTaskRequest) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<Task>;
  getDueSoonTasks: () => Promise<{ items: TaskSummary[] }>;
  getOverdueTasks: () => Promise<{ items: TaskSummary[] }>;
}

function createMockClient(): MockTasksClient {
  // In-memory mock data
  const mockTasks: Task[] = [];

  const generateId = (): string =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  return {
    getMyTasks: async () => {
      return {
        items: mockTasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          ownership: t.ownership,
          dueDate: t.dueDate,
          assigneeCount: t.assignments?.length ?? 0,
          hubId: t.hubLink?.hubId,
          hubDisplayName: t.hubLink?.hubDisplayName,
          hasRecurrence: !!t.recurrence,
          checklistProgress: t.checklist
            ? {
                completed: t.checklist.filter((c) => c.completed).length,
                total: t.checklist.length,
              }
            : undefined,
          checklist: t.checklist,
          commentCount: t.comments?.length ?? 0,
          doNotNotify: t.doNotNotify,
        })),
        totalCount: mockTasks.length,
      };
    },

    getTask: async (id: string) => {
      const task = mockTasks.find((t) => t.id === id);
      if (!task) throw new Error(`Task not found: ${id}`);
      return task;
    },

    createTask: async (req: CreateTaskRequest) => {
      const now = new Date().toISOString();
        const task: Task = {
        id: generateId(),
        title: req.title,
        description: req.description,
          status: req.status ?? 'not-started',
        priority: req.priority ?? 'medium',
        ownership: req.ownership,
        assignments: req.assignments?.map((a) => ({
          ...a,
          assignedAt: now,
        })),
        hubLink: req.hubLink,
        dueDate: req.dueDate,
        startDate: req.startDate,
        recurrence: req.recurrence,
        checklist: req.checklist?.map((c, i) => ({
          id: generateId(),
          title: c.title,
          completed: false,
          sortOrder: i,
        })),
        tags: req.tags,
        createdAt: now,
        createdBy: 'mock-user',
        version: 1,
        doNotNotify: req.doNotNotify ?? false,
      };
      mockTasks.push(task);
      console.log('[MockTasksClient] Created task:', task.id, task.title);
      return task;
    },

    updateTask: async (id: string, req: UpdateTaskRequest) => {
      const index = mockTasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Task not found: ${id}`);

      const checklist = req.checklist
        ? req.checklist.map((item, i) => ({
            id: item.id ?? generateId(),
            title: item.title,
            completed: item.completed ?? false,
            sortOrder: item.sortOrder ?? i,
          }))
        : mockTasks[index].checklist;

      const updated: Task = {
        ...mockTasks[index],
        ...req,
        checklist,
        updatedAt: new Date().toISOString(),
        updatedBy: 'mock-user',
        version: (mockTasks[index].version ?? 1) + 1,
      };
      mockTasks[index] = updated;
      console.log('[MockTasksClient] Updated task:', id);
      return updated;
    },

    updateTaskStatus: async (id: string, status: TaskStatus) => {
      const index = mockTasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Task not found: ${id}`);

      const now = new Date().toISOString();
      const updated: Task = {
        ...mockTasks[index],
        status,
        updatedAt: now,
        updatedBy: 'mock-user',
        completedAt: status === 'completed' ? now : undefined,
        completedBy: status === 'completed' ? 'mock-user' : undefined,
      };
      mockTasks[index] = updated;
      console.log('[MockTasksClient] Status updated:', id, status);
      return updated;
    },

    deleteTask: async (id: string) => {
      const index = mockTasks.findIndex((t) => t.id === id);
      if (index === -1) throw new Error(`Task not found: ${id}`);
      mockTasks.splice(index, 1);
      console.log('[MockTasksClient] Deleted task:', id);
    },

    toggleChecklistItem: async (taskId: string, itemId: string, completed: boolean) => {
      const task = mockTasks.find((t) => t.id === taskId);
      if (!task) throw new Error(`Task not found: ${taskId}`);

      const item = task.checklist?.find((c) => c.id === itemId);
      if (!item) throw new Error(`Checklist item not found: ${itemId}`);

      item.completed = completed;
      item.completedAt = completed ? new Date().toISOString() : undefined;
      item.completedBy = completed ? 'mock-user' : undefined;

      console.log('[MockTasksClient] Toggled checklist item:', itemId, completed);
      return task;
    },

    getDueSoonTasks: async () => {
      const now = new Date();
      const threshold = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      return {
        items: mockTasks
          .filter((t) => {
            if (!t.dueDate) return false;
            if (t.status === 'completed' || t.status === 'cancelled') return false;
            const due = new Date(t.dueDate);
            return due > now && due <= threshold;
          })
          .map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            ownership: t.ownership,
            dueDate: t.dueDate,
          })),
      };
    },

    getOverdueTasks: async () => {
      // Compare against start of today (midnight) - a task is only overdue if due BEFORE today
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return {
        items: mockTasks
          .filter((t) => {
            if (!t.dueDate) return false;
            if (t.status === 'completed' || t.status === 'cancelled') return false;
            // Parse due date and compare date-only (strip time)
            const dueDate = new Date(t.dueDate);
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            return dueDateOnly < startOfToday;
          })
          .map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            ownership: t.ownership,
            dueDate: t.dueDate,
          })),
      };
    },
  };
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const TasksProvider: React.FC<TasksProviderProps> = ({
  children,
  client,
  initialFilters,
  autoLoad = true,
}) => {
  // Use provided client or mock
  const tasksClient = React.useMemo(() => client ?? createMockClient(), [client]);

  // State
  const [state, setState] = React.useState<TasksState>(() => ({
    ...defaultState,
    filters: { ...defaultState.filters, ...initialFilters },
  }));

  // Load tasks
  const refreshTasks = React.useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const [tasksResult, overdueResult, dueSoonResult] = await Promise.all([
        tasksClient.getMyTasks(),
        tasksClient.getOverdueTasks(),
        tasksClient.getDueSoonTasks(),
      ]);

      setState((prev) => ({
        ...prev,
        tasks: tasksResult.items,
        totalCount: tasksResult.totalCount,
        continuationToken: tasksResult.continuationToken,
        hasMore: !!tasksResult.continuationToken,
        overdueCount: overdueResult.items.length,
        dueSoonCount: dueSoonResult.items.length,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      }));
    }
  }, [tasksClient]);

  // Load more (pagination)
  const loadMoreTasks = React.useCallback(async () => {
    if (!state.hasMore || state.isLoadingMore) return;

    setState((prev) => ({ ...prev, isLoadingMore: true }));

    try {
      // Would pass continuationToken to API
      const result = await tasksClient.getMyTasks();
      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, ...result.items],
        continuationToken: result.continuationToken,
        hasMore: !!result.continuationToken,
        isLoadingMore: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoadingMore: false,
      }));
    }
  }, [state.hasMore, state.isLoadingMore, tasksClient]);

  // Set filters
  const setFilters = React.useCallback((filters: TaskFilters) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
    // Auto-refresh happens via useEffect
  }, []);

  // Set sort
  const setSort = React.useCallback((sort: TaskSort) => {
    setState((prev) => ({ ...prev, sort }));
  }, []);

  // Set view
  const setView = React.useCallback((view: TaskView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  // Select task (load full details)
  const selectTask = React.useCallback(
    async (taskId: string | undefined) => {
      if (!taskId) {
        setState((prev) => ({ ...prev, selectedTask: undefined }));
        return;
      }

      setState((prev) => ({ ...prev, isLoadingTask: true }));

      try {
        const task = await tasksClient.getTask(taskId);
        setState((prev) => ({ ...prev, selectedTask: task, isLoadingTask: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoadingTask: false,
        }));
      }
    },
    [tasksClient]
  );

  // Create task
  const createTask = React.useCallback(
    async (request: CreateTaskRequest): Promise<Task> => {
      const task = await tasksClient.createTask(request);
      // Refresh list to include new task
      await refreshTasks();
      return task;
    },
    [tasksClient, refreshTasks]
  );

  // Update task
  const updateTask = React.useCallback(
    async (taskId: string, request: UpdateTaskRequest): Promise<Task> => {
      const task = await tasksClient.updateTask(taskId, request);

      // Update in list
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                title: request.title ?? t.title,
                status: request.status ?? t.status,
                priority: request.priority ?? t.priority,
                dueDate: request.dueDate ?? t.dueDate,
                doNotNotify: request.doNotNotify !== undefined ? request.doNotNotify : t.doNotNotify,
                emailReminderMinutes: request.emailReminderMinutes !== undefined
                  ? request.emailReminderMinutes
                  : t.emailReminderMinutes,
                checklistProgress: request.checklist
                  ? {
                      completed: request.checklist.filter((c) => c.completed).length,
                      total: request.checklist.length,
                    }
                  : t.checklistProgress,
                checklist: request.checklist
                  ? request.checklist.map((c, i) => ({
                      id: c.id ?? `item-${i}`,
                      title: c.title,
                      completed: c.completed ?? false,
                      sortOrder: i,
                    }))
                  : t.checklist,
              }
            : t
        ),
        selectedTask: prev.selectedTask?.id === taskId ? task : prev.selectedTask,
      }));

      return task;
    },
    [tasksClient]
  );

  // Delete task
  const deleteTask = React.useCallback(
    async (taskId: string): Promise<void> => {
      await tasksClient.deleteTask(taskId);

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
        selectedTask: prev.selectedTask?.id === taskId ? undefined : prev.selectedTask,
      }));
    },
    [tasksClient]
  );

  // Quick status change
  const updateTaskStatus = React.useCallback(
    async (taskId: string, status: TaskStatus): Promise<void> => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      }));

      try {
        await tasksClient.updateTaskStatus(taskId, status);
        // Refresh counts
        const [overdueResult, dueSoonResult] = await Promise.all([
          tasksClient.getOverdueTasks(),
          tasksClient.getDueSoonTasks(),
        ]);
        setState((prev) => ({
          ...prev,
          overdueCount: overdueResult.items.length,
          dueSoonCount: dueSoonResult.items.length,
        }));
      } catch (error) {
        // Rollback on error
        await refreshTasks();
        throw error;
      }
    },
    [tasksClient, refreshTasks]
  );

  // Toggle checklist item
  const toggleChecklistItem = React.useCallback(
    async (taskId: string, itemId: string, completed: boolean): Promise<void> => {
      const baseTask = await tasksClient.toggleChecklistItem(taskId, itemId, completed);

      const checklist = baseTask.checklist ?? [];
      const total = checklist.length;
      const completedCount = checklist.filter((item: TaskChecklist) => item.completed).length;

      // Auto-update status based on checklist progress
      // This always applies regardless of any previous manual status changes
      let autoStatus: TaskStatus | undefined;
      if (total > 0 && completedCount === total) {
        autoStatus = 'completed';
      } else if (completedCount > 0) {
        autoStatus = 'in-progress';
      } else if (total > 0) {
        autoStatus = 'not-started';
      }

      const finalTask =
        autoStatus && autoStatus !== baseTask.status
          ? await tasksClient.updateTaskStatus(taskId, autoStatus)
          : baseTask;

      // Update selected task if viewing
      setState((prev) => ({
        ...prev,
        selectedTask: prev.selectedTask?.id === taskId ? finalTask : prev.selectedTask,
        // Update checklist progress and checklist items in list
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: finalTask.status,
                checklistProgress: finalTask.checklist
                  ? {
                      completed: finalTask.checklist.filter((c: TaskChecklist) => c.completed).length,
                      total: finalTask.checklist.length,
                    }
                  : t.checklistProgress,
                checklist: finalTask.checklist,
              }
            : t
        ),
      }));
    },
    [tasksClient]
  );

  // Clear error
  const clearError = React.useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  // Auto-load on mount
  React.useEffect(() => {
    if (autoLoad) {
      refreshTasks().catch(console.error);
    }
  }, [autoLoad, refreshTasks]);

  // Context value
  const contextValue: ITasksContext = React.useMemo(
    () => ({
      state,
      refreshTasks,
      loadMoreTasks,
      setFilters,
      setSort,
      setView,
      selectTask,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      toggleChecklistItem,
      clearError,
    }),
    [
      state,
      refreshTasks,
      loadMoreTasks,
      setFilters,
      setSort,
      setView,
      selectTask,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      toggleChecklistItem,
      clearError,
    ]
  );

  return <TasksContext.Provider value={contextValue}>{children}</TasksContext.Provider>;
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the tasks context.
 * Must be used within a TasksProvider.
 */
export function useTasks(): ITasksContext {
  const context = React.useContext(TasksContext);

  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }

  return context;
}

export default TasksContext;
