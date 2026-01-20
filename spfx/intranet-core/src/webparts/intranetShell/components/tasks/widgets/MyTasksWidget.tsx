import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
  Text,
  Icon,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Link,
  Stack,
} from '@fluentui/react';
import { TaskSummary, TaskStatus, TaskPriority } from '../types';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { TaskPriorityIndicator } from '../components/TaskPriorityIndicator';
import { TaskDueDateLabel } from '../components/TaskDueDateLabel';
import styles from './MyTasksWidget.module.scss';

/**
 * Props for the MyTasksWidget component
 */
export interface IMyTasksWidgetProps {
  /**
   * Tasks to display (should be pre-filtered to user's pending tasks)
   */
  tasks: TaskSummary[];

  /**
   * Whether tasks are loading
   */
  isLoading?: boolean;

  /**
   * Error message if loading failed
   */
  error?: string;

  /**
   * Maximum number of tasks to show
   * @default 5
   */
  maxTasks?: number;

  /**
   * Callback when a task is clicked
   */
  onTaskClick?: (taskId: string) => void;

  /**
   * Callback when "View All" is clicked
   */
  onViewAll?: () => void;

  /**
   * Callback when "Add Task" is clicked
   */
  onAddTask?: () => void;

  /**
   * Callback when task status is changed (quick complete)
   */
  onStatusChange?: (taskId: string, status: TaskStatus) => void;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Hub accent color for theming
   */
  accentColor?: string;
}

/**
 * Sort tasks by priority and due date
 */
function sortTasks(tasks: TaskSummary[]): TaskSummary[] {
  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...tasks].sort((a, b) => {
    // First by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date (earlier first, undefined last)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

/**
 * MyTasksWidget component
 *
 * A dashboard widget showing the user's top pending tasks with quick actions.
 */
export const MyTasksWidget: React.FC<IMyTasksWidgetProps> = ({
  tasks,
  isLoading = false,
  error,
  maxTasks = 5,
  onTaskClick,
  onViewAll,
  onAddTask,
  onStatusChange,
  className,
  accentColor,
}) => {
  // Filter to pending tasks and sort
  const pendingTasks = useMemo(() => {
    const pending = tasks.filter(
      (t) => t.status === 'not-started' || t.status === 'in-progress'
    );
    return sortTasks(pending).slice(0, maxTasks);
  }, [tasks, maxTasks]);

  const totalPending = useMemo(
    () => tasks.filter((t) => t.status === 'not-started' || t.status === 'in-progress').length,
    [tasks]
  );

  /**
   * Handle quick complete toggle
   */
  const handleQuickComplete = useCallback(
    (e: React.MouseEvent, taskId: string, currentStatus: TaskStatus) => {
      e.stopPropagation();
      if (onStatusChange) {
        const newStatus: TaskStatus =
          currentStatus === 'completed' ? 'not-started' : 'completed';
        onStatusChange(taskId, newStatus);
      }
    },
    [onStatusChange]
  );

  const headerStyle = accentColor
    ? { borderBottomColor: accentColor }
    : undefined;

  return (
    <div className={`${styles.myTasksWidget} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header} style={headerStyle}>
        <div className={styles.headerLeft}>
          <Icon iconName="TaskList" className={styles.headerIcon} />
          <Text variant="mediumPlus" className={styles.headerTitle}>
            My Tasks
          </Text>
          {totalPending > 0 && (
            <span className={styles.badge}>{totalPending}</span>
          )}
        </div>
        <div className={styles.headerActions}>
          {onAddTask && (
            <button
              className={styles.actionButton}
              onClick={onAddTask}
              title="Add new task"
              aria-label="Add new task"
            >
              <Icon iconName="Add" />
            </button>
          )}
          {onViewAll && (
            <Link onClick={onViewAll} className={styles.viewAllLink}>
              View all
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loading}>
            <Spinner size={SpinnerSize.medium} label="Loading tasks..." />
          </div>
        )}

        {error && (
          <MessageBar messageBarType={MessageBarType.error}>
            {error}
          </MessageBar>
        )}

        {!isLoading && !error && pendingTasks.length === 0 && (
          <div className={styles.emptyState}>
            <Icon iconName="Completed" className={styles.emptyIcon} />
            <Text variant="medium">You&apos;re all caught up!</Text>
            <Text variant="small" className={styles.emptySubtext}>
              No pending tasks
            </Text>
            {onAddTask && (
              <button className={styles.emptyAction} onClick={onAddTask}>
                <Icon iconName="Add" />
                Create a task
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && pendingTasks.length > 0 && (
          <Stack className={styles.taskList} tokens={{ childrenGap: 0 }}>
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className={styles.taskItem}
                onClick={() => onTaskClick?.(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTaskClick?.(task.id);
                  }
                }}
              >
                {/* Quick complete checkbox */}
                <div
                  className={styles.checkbox}
                  onClick={(e) => handleQuickComplete(e, task.id, task.status)}
                  role="checkbox"
                  aria-checked={task.status === 'completed'}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleQuickComplete(e as unknown as React.MouseEvent, task.id, task.status);
                    }
                  }}
                >
                  <Icon
                    iconName={
                      task.status === 'completed'
                        ? 'CheckboxComposite'
                        : 'Checkbox'
                    }
                  />
                </div>

                {/* Task info */}
                <div className={styles.taskInfo}>
                  <div className={styles.taskTitle}>
                    <TaskPriorityIndicator priority={task.priority} size="small" showLabel={false} />
                    <Text className={styles.titleText}>{task.title}</Text>
                  </div>
                  <div className={styles.taskMeta}>
                    <TaskStatusBadge status={task.status} size="small" />
                    {task.dueDate && (
                      <TaskDueDateLabel dueDate={task.dueDate} size="small" />
                    )}
                    {task.hubDisplayName && (
                      <Text variant="tiny" className={styles.hubLabel}>
                        {task.hubDisplayName}
                      </Text>
                    )}
                  </div>
                </div>

                {/* Checklist progress */}
                {task.checklistProgress && task.checklistProgress.total > 0 && (
                  <div className={styles.progress}>
                    <Text variant="tiny">
                      {task.checklistProgress.completed}/{task.checklistProgress.total}
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </Stack>
        )}
      </div>

      {/* Footer */}
      {totalPending > maxTasks && (
        <div className={styles.footer}>
          <Text variant="small" className={styles.moreText}>
            +{totalPending - maxTasks} more tasks
          </Text>
        </div>
      )}
    </div>
  );
};

export default MyTasksWidget;
