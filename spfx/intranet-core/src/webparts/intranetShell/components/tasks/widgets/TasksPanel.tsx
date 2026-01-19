/**
 * TasksPanel Component
 *
 * Slide-out panel for full task management.
 * Displays task list with filters, allows viewing/editing tasks.
 */

import * as React from 'react';
import {
  Panel,
  PanelType,
  Stack,
  Text,
  CommandBar,
  ICommandBarItemProps,
  Pivot,
  PivotItem,
  SearchBox,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  IconButton,
  Icon,
} from '@fluentui/react';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { TaskEditor } from '../components/TaskEditor';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { TaskPriorityIndicator } from '../components/TaskPriorityIndicator';
import { TaskDueDateLabel } from '../components/TaskDueDateLabel';
import type {
  TaskSummary,
  Task,
  TaskFilters,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskOwnership,
} from '../types';
import styles from './TasksPanel.module.scss';

export interface ITasksPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback to close the panel */
  onDismiss: () => void;
  /** Current tasks to display */
  tasks: TaskSummary[];
  /** Whether tasks are loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | undefined;
  /** Currently selected task for detail view */
  selectedTask?: Task;
  /** Whether the selected task is loading */
  isSelectedTaskLoading?: boolean;
  /** Callback when a task is clicked */
  onTaskClick: (taskId: string) => void;
  /** Callback to close task detail */
  onTaskDetailClose: () => void;
  /** Callback when add task is clicked */
  onAddTask: () => void;
  /** Callback to save a new task */
  onCreateTask: (data: CreateTaskRequest) => Promise<void>;
  /** Callback to update an existing task */
  onUpdateTask: (taskId: string, data: UpdateTaskRequest) => Promise<void>;
  /** Callback when filters change */
  onFiltersChange?: (filters: TaskFilters) => void;
  /** Callback to refresh tasks */
  onRefresh?: () => void;
  /** Default ownership for new tasks */
  defaultOwnership?: TaskOwnership;
  /** Optional custom header title */
  headerText?: string;
}

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

/**
 * Full task management panel with list, filters, and detail views
 */
export const TasksPanel: React.FC<ITasksPanelProps> = ({
  isOpen,
  onDismiss,
  tasks,
  isLoading,
  error,
  selectedTask,
  isSelectedTaskLoading,
  onTaskClick,
  onTaskDetailClose,
  onAddTask,
  onCreateTask,
  onUpdateTask,
  onFiltersChange,
  onRefresh,
  defaultOwnership,
  headerText = 'My Tasks',
}) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPivotKey, setSelectedPivotKey] = React.useState<string>('all');
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset view when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setViewMode('list');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Switch to detail view when a task is selected
  React.useEffect(() => {
    if (selectedTask) {
      setViewMode('detail');
    }
  }, [selectedTask]);

  const handleBackToList = (): void => {
    setViewMode('list');
    onTaskDetailClose();
  };

  const handleCreateTask = (): void => {
    setViewMode('create');
    onAddTask();
  };

  const handleEditTask = (): void => {
    if (selectedTask) {
      setViewMode('edit');
    }
  };

  const handleSave = async (
    data: CreateTaskRequest | UpdateTaskRequest
  ): Promise<void> => {
    setIsSaving(true);
    try {
      if (viewMode === 'create') {
        await onCreateTask(data as CreateTaskRequest);
      } else if (selectedTask) {
        await onUpdateTask(selectedTask.id, data as UpdateTaskRequest);
      }
      setViewMode('list');
      onTaskDetailClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (): void => {
    if (selectedTask && viewMode === 'edit') {
      setViewMode('detail');
    } else {
      setViewMode('list');
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus): void => {
    onUpdateTask(taskId, { status }).catch(() => {
      // Error handled by parent
    });
  };

  const handlePivotChange = (item?: PivotItem): void => {
    if (!item?.props.itemKey) return;

    const key = item.props.itemKey;
    setSelectedPivotKey(key);

    // Update filters based on pivot selection
    if (onFiltersChange) {
      const filters: TaskFilters = {};
      switch (key) {
        case 'pending':
          filters.status = ['not-started', 'in-progress'];
          break;
        case 'completed':
          filters.status = ['completed'];
          break;
        case 'overdue':
          filters.dueDateTo = new Date().toISOString().split('T')[0];
          filters.status = ['not-started', 'in-progress'];
          break;
        default:
          // All tasks - no filter
          break;
      }
      onFiltersChange(filters);
    }
  };

  const handleSearch = (newValue?: string): void => {
    setSearchQuery(newValue ?? '');
    if (onFiltersChange) {
      onFiltersChange({
        searchQuery: newValue ?? undefined,
      });
    }
  };

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'newTask',
      text: 'New Task',
      iconProps: { iconName: 'Add' },
      onClick: handleCreateTask,
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      onClick: onRefresh,
      disabled: isLoading,
    },
  ];

  const filteredTasks = React.useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.hubDisplayName?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Count tasks by category
  const counts = React.useMemo(() => {
    const now = new Date();
    return {
      all: tasks.length,
      pending: tasks.filter(
        (t) => t.status === 'not-started' || t.status === 'in-progress'
      ).length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== 'completed' &&
          t.status !== 'cancelled'
      ).length,
    };
  }, [tasks]);

  const renderListView = (): React.ReactElement => (
    <Stack className={styles.listView} tokens={{ childrenGap: 16 }}>
      <CommandBar items={commandBarItems} styles={{ root: { padding: 0 } }} />

      <SearchBox
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(_, newValue) => handleSearch(newValue)}
        className={styles.searchBox}
      />

      <Pivot
        selectedKey={selectedPivotKey}
        onLinkClick={handlePivotChange}
        className={styles.pivot}
      >
        <PivotItem
          headerText={`All (${counts.all})`}
          itemKey="all"
          itemIcon="TaskLogo"
        />
        <PivotItem
          headerText={`Pending (${counts.pending})`}
          itemKey="pending"
          itemIcon="Clock"
        />
        <PivotItem
          headerText={`Completed (${counts.completed})`}
          itemKey="completed"
          itemIcon="Completed"
        />
        {counts.overdue > 0 && (
          <PivotItem
            headerText={`Overdue (${counts.overdue})`}
            itemKey="overdue"
            itemIcon="Warning"
          />
        )}
      </Pivot>

      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      {isLoading && (
        <Stack horizontalAlign="center" className={styles.loading}>
          <Spinner size={SpinnerSize.medium} label="Loading tasks..." />
        </Stack>
      )}

      {!isLoading && !error && filteredTasks.length === 0 && (
        <Stack className={styles.emptyState} horizontalAlign="center">
          <Text variant="large">No tasks found</Text>
          <Text variant="small" className={styles.emptySubtext}>
            {searchQuery
              ? 'Try a different search term'
              : 'Create a task to get started'}
          </Text>
        </Stack>
      )}

      {!isLoading && filteredTasks.length > 0 && (
        <div className={styles.summaryList}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={styles.summaryItem}
              onClick={() => onTaskClick(task.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTaskClick(task.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={styles.summaryLeading}>
                <TaskPriorityIndicator
                  priority={task.priority}
                  size="small"
                  showLabel={false}
                />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryTitle}>
                  <span>{task.title}</span>
                  <TaskStatusBadge
                    status={task.status}
                    size="small"
                    showIcon={false}
                  />
                </div>
                <div className={styles.summaryMeta}>
                  {task.dueDate && (
                    <TaskDueDateLabel
                      dueDate={task.dueDate}
                      status={task.status}
                      format="relative"
                      size="small"
                    />
                  )}
                  {task.hubDisplayName && (
                    <span className={styles.summaryHub}>
                      <Icon iconName="ViewDashboard" />
                      {task.hubDisplayName}
                    </span>
                  )}
                  {task.checklistProgress && (
                    <span className={styles.summaryProgress}>
                      {task.checklistProgress.completed}/
                      {task.checklistProgress.total}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Stack>
  );

  const renderDetailView = (): React.ReactElement | null => {
    if (!selectedTask) return null;

    return (
      <Stack className={styles.detailView}>
        <Stack
          horizontal
          verticalAlign="center"
          className={styles.detailHeader}
        >
          <IconButton
            iconProps={{ iconName: 'Back' }}
            onClick={handleBackToList}
            ariaLabel="Back to list"
          />
          <Text variant="mediumPlus" className={styles.detailTitle}>
            Task Details
          </Text>
          <Stack
            horizontal
            tokens={{ childrenGap: 8 }}
            className={styles.detailActions}
          >
            <IconButton
              iconProps={{ iconName: 'Edit' }}
              onClick={handleEditTask}
              ariaLabel="Edit task"
            />
          </Stack>
        </Stack>

        {isSelectedTaskLoading ? (
          <Stack horizontalAlign="center" className={styles.loading}>
            <Spinner size={SpinnerSize.medium} label="Loading task..." />
          </Stack>
        ) : (
          <TaskDetailPanel
            task={selectedTask}
            isOpen={true}
            onDismiss={handleBackToList}
            onEdit={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </Stack>
    );
  };

  const renderEditView = (): React.ReactElement => {
    return (
      <Stack className={styles.editView}>
        <Stack
          horizontal
          verticalAlign="center"
          className={styles.detailHeader}
        >
          <IconButton
            iconProps={{ iconName: 'Back' }}
            onClick={handleCancelEdit}
            ariaLabel="Cancel"
          />
          <Text variant="mediumPlus" className={styles.detailTitle}>
            {viewMode === 'create' ? 'New Task' : 'Edit Task'}
          </Text>
        </Stack>

        <TaskEditor
          task={viewMode === 'edit' ? selectedTask : undefined}
          isOpen={true}
          onDismiss={handleCancelEdit}
          onSave={handleSave}
          defaultOwnership={defaultOwnership}
          loading={isSaving}
        />
      </Stack>
    );
  };

  const renderContent = (): React.ReactElement | null => {
    switch (viewMode) {
      case 'list':
        return renderListView();
      case 'detail':
        return renderDetailView();
      case 'create':
      case 'edit':
        return renderEditView();
      default:
        return null;
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText={headerText}
      closeButtonAriaLabel="Close tasks panel"
      className={styles.panel}
      isLightDismiss={viewMode === 'list'}
    >
      <div className={styles.panelContent}>{renderContent()}</div>
    </Panel>
  );
};

export default TasksPanel;
