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
  const {
    state,
    createTask,
    updateTask,
    deleteTask,
    toggleChecklistItem,
    setFilters,
    refreshTasks,
    selectTask,
  } = useTasks();
  const { tasks, selectedTask, isLoading, isLoadingTask, error } = state;
  const { overdueCount } = useTaskCounts();

  const handleTaskClick = React.useCallback(
    async (taskId: string) => {
      await selectTask(taskId);
    },
    [selectTask]
  );

  const handleTaskDetailClose = React.useCallback(() => {
    selectTask(undefined).catch(() => {
      // Ignore
    });
  }, [selectTask]);

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
      isSelectedTaskLoading={isLoadingTask}
      onTaskClick={handleTaskClick}
      onTaskDetailClose={handleTaskDetailClose}
      onAddTask={handleAddTask}
      onCreateTask={async (request) => {
        await createTask(request);
      }}
      onUpdateTask={async (taskId, request) => {
        await updateTask(taskId, request);
      }}
      onDeleteTask={async (taskId) => {
        await deleteTask(taskId);
      }}
      onChecklistToggle={async (taskId, itemId, completed) => {
        await toggleChecklistItem(taskId, itemId, completed);
      }}
      onFiltersChange={setFilters}
      onRefresh={refreshTasks}
      defaultOwnership={defaultOwnership}
      headerText={`My Tasks (${overdueCount} overdue)`}
    />
  );
};

export default TasksPanelContainer;
