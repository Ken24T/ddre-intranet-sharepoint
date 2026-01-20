/**
 * MyTasksWidgetContainer - Wrapper for MyTasksWidget that uses TasksContext
 *
 * Provides live task data and actions from TasksContext to the widget.
 */

import * as React from 'react';
import { MyTasksWidget } from './MyTasksWidget';
import { useTasks } from '../TasksContext';
import type { TaskStatus } from '../types';

export interface IMyTasksWidgetContainerProps {
  /** Hub accent colour for theming */
  accentColor?: string;
  /** Max tasks to show */
  maxTasks?: number;
  /** Called when user wants to view all tasks */
  onViewAll?: () => void;
  /** Called when user wants to add a task */
  onAddTask?: () => void;
  /** Optional class name */
  className?: string;
}

export const MyTasksWidgetContainer: React.FC<IMyTasksWidgetContainerProps> = ({
  accentColor,
  maxTasks,
  onViewAll,
  onAddTask,
  className,
}) => {
  const { state, updateTaskStatus, selectTask } = useTasks();
  const { tasks, isLoading, error } = state;

  const handleTaskClick = React.useCallback(
    async (taskId: string) => {
      await selectTask(taskId);
      onViewAll?.();
    },
    [selectTask, onViewAll]
  );

  const handleStatusChange = React.useCallback(
    async (taskId: string, status: TaskStatus) => {
      await updateTaskStatus(taskId, status);
    },
    [updateTaskStatus]
  );

  return (
    <MyTasksWidget
      tasks={tasks}
      isLoading={isLoading}
      error={error?.message}
      maxTasks={maxTasks}
      onTaskClick={handleTaskClick}
      onViewAll={onViewAll}
      onAddTask={onAddTask}
      onStatusChange={handleStatusChange}
      accentColor={accentColor}
      className={className}
    />
  );
};

export default MyTasksWidgetContainer;
