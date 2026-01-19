/**
 * DDRE Intranet Task System
 *
 * React context, hooks, and types for task management.
 */

// Types
export type {
  TaskStatus,
  TaskPriority,
  OwnershipType,
  TaskRole,
  RecurrencePattern,
  DayOfWeek,
  WeekOfMonth,
  ReminderChannel,
  ReminderTiming,
  TaskOwnership,
  TaskAssignment,
  TaskHubLink,
  TaskRecurrence,
  TaskReminder,
  TaskComment,
  TaskChecklist,
  TaskAttachment,
  Task,
  TaskSummary,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateReminderRequest,
  TaskFilters,
  TaskSortField,
  SortOrder,
  TaskSort,
  TaskView,
  TasksState,
} from './types';

// Utility functions
export {
  isTaskOverdue,
  isTaskDueSoon,
  getPriorityWeight,
  getStatusLabel,
  getPriorityLabel,
} from './types';

// Context
export { TasksProvider, useTasks } from './TasksContext';
export type { ITasksContext, TasksProviderProps } from './TasksContext';

// Hooks
export {
  useTask,
  useTaskList,
  useTaskMutations,
  useTaskCounts,
  useTaskReminders,
  useHubTasks,
} from './hooks';
export type {
  UseTaskResult,
  UseTaskListOptions,
  UseTaskListResult,
  UseTaskMutationsResult,
  UseTaskCountsResult,
  UpcomingReminder,
  UseTaskRemindersResult,
  UseHubTasksResult,
} from './hooks';
