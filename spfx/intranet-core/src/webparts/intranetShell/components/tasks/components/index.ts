/**
 * Task UI Components
 *
 * This module exports all task-related UI components for use throughout
 * the intranet shell.
 */

// Badge and indicator components
export { TaskStatusBadge } from './TaskStatusBadge';
export type { ITaskStatusBadgeProps } from './TaskStatusBadge';

export { TaskPriorityIndicator } from './TaskPriorityIndicator';
export type { ITaskPriorityIndicatorProps } from './TaskPriorityIndicator';

export { TaskDueDateLabel } from './TaskDueDateLabel';
export type { ITaskDueDateLabelProps } from './TaskDueDateLabel';

export { TaskChecklistProgress } from './TaskChecklistProgress';
export type { ITaskChecklistProgressProps } from './TaskChecklistProgress';

// Card and list components
export { TaskCard } from './TaskCard';
export type { ITaskCardProps } from './TaskCard';

export { TaskList } from './TaskList';
export type { ITaskListProps } from './TaskList';

// Panel components
export { TaskDetailPanel } from './TaskDetailPanel';
export type { ITaskDetailPanelProps } from './TaskDetailPanel';

export { TaskEditor } from './TaskEditor';
export type { ITaskEditorProps } from './TaskEditor';

// Picker and editor components
export { TaskAssignmentPicker } from './TaskAssignmentPicker';
export type { ITaskAssignmentPickerProps } from './TaskAssignmentPicker';

export { TaskRecurrenceEditor } from './TaskRecurrenceEditor';
export type { ITaskRecurrenceEditorProps } from './TaskRecurrenceEditor';

export { TaskReminderConfig } from './TaskReminderConfig';
export type { ITaskReminderConfigProps } from './TaskReminderConfig';
