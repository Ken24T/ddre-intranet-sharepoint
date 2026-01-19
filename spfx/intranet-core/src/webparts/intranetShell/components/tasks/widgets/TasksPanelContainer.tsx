/**
 * TasksPanelContainer - Wrapper for TasksPanel that uses the TasksContext
 *
 * This functional component accesses task data via hooks and passes it
 * to the TasksPanel component.
 */

import * as React from 'react';
import { TasksPanel } from './TasksPanel';
import { useTasks } from '../TasksContext';
import { useTaskCounts } from '../hooks';
import type { TaskOwnership } from '../types';

export interface ITasksPanelContainerProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback to close the panel */
  onDismiss: () => void;
  /** Default ownership for new tasks (current user) */
  defaultOwnership?: TaskOwnership;
}

/**
 * Container component that wires TasksPanel to TasksContext
 */
export const TasksPanelContainer: React.FC<ITasksPanelContainerProps> = ({
  isOpen,
  onDismiss,
  defaultOwnership,
}) => {
  const { state } = useTasks();
  const { tasks, selectedTask, isLoading, error } = state;
  const { overdueCount } = useTaskCounts();

  const handleTaskClick = React.useCallback(
    (taskId: string) => {
      // In a real implementation, this would load the full task via context
      console.log('[Tasks] Task clicked:', taskId);
    },
    []
  );

  const handleTaskDetailClose = React.useCallback(() => {
    console.log('[Tasks] Task detail closed');
  }, []);

  const handleAddTask = React.useCallback(() => {
    console.log('[Tasks] Add task clicked');
  }, []);

  return (
    <TasksPanel
      isOpen={isOpen}
      onDismiss={onDismiss}
      tasks={tasks}
      isLoading={isLoading}
      error={error?.message}
      selectedTask={selectedTask}
      isSelectedTaskLoading={isLoading}
      onTaskClick={handleTaskClick}
      onTaskDetailClose={handleTaskDetailClose}
      onAddTask={handleAddTask}
      onCreateTask={async () => {
        // Task creation is handled via mutations
        return Promise.resolve();
      }}
      onUpdateTask={async () => {
        // Task update is handled via mutations
        return Promise.resolve();
      }}
      defaultOwnership={defaultOwnership}
      headerText={`My Tasks (${overdueCount} overdue)`}
    />
  );
};

export default TasksPanelContainer;
