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
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  IconButton,
  Icon,
  Dropdown,
  IDropdownOption,
  useTheme,
  IPanelStyles,
} from '@fluentui/react';
import type { IStyle } from '@fluentui/merge-styles';
import { SearchBox as IntranetSearchBox } from '../../SearchBox';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { TaskEditor } from '../components/TaskEditor';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { TaskPriorityIndicator } from '../components/TaskPriorityIndicator';
import { TaskDueDateLabel } from '../components/TaskDueDateLabel';
import { TaskChecklistProgress } from '../components/TaskChecklistProgress';
import { hubInfo } from '../../data';
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
  onTaskClick: (taskId: string) => Promise<void>;
  /** Callback to close task detail */
  onTaskDetailClose: () => void;
  /** Callback when add task is clicked */
  onAddTask: () => void;
  /** Callback to save a new task */
  onCreateTask: (data: CreateTaskRequest) => Promise<void>;
  /** Callback to update an existing task */
  onUpdateTask: (taskId: string, data: UpdateTaskRequest) => Promise<void>;
  /** Callback to delete an existing task */
  onDeleteTask: (taskId: string) => Promise<void>;
  /** Callback when filters change */
  onFiltersChange?: (filters: TaskFilters) => void;
  /** Callback when checklist item toggled */
  onChecklistToggle?: (taskId: string, itemId: string, completed: boolean) => void;
  /** Callback to refresh tasks */
  onRefresh?: () => void;
  /** Default ownership for new tasks */
  defaultOwnership?: TaskOwnership;
  /** Optional custom header title */
  headerText?: string;
}

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const priorityFilterOptions: IDropdownOption[] = [
  { key: 'all', text: 'All priorities' },
  { key: 'urgent', text: 'Urgent' },
  { key: 'high', text: 'High' },
  { key: 'medium', text: 'Medium' },
  { key: 'low', text: 'Low' },
];

const hubFilterOptions: IDropdownOption[] = [
  { key: 'all', text: 'All hubs' },
  ...Object.keys(hubInfo)
    .filter((key) => key !== 'help' && key !== 'favourites')
    .map((key) => ({
      key,
      text: hubInfo[key as keyof typeof hubInfo].title,
    })),
];

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
  onDeleteTask,
  onFiltersChange,
  onChecklistToggle,
  onRefresh,
  defaultOwnership,
  headerText = 'My Tasks',
}) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPivotKey, setSelectedPivotKey] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [hubFilter, setHubFilter] = React.useState<string>('all');
  const [isSaving, setIsSaving] = React.useState(false);
  const [duplicateSourceId, setDuplicateSourceId] = React.useState<string | undefined>(
    undefined
  );
  const [cloneDraft, setCloneDraft] = React.useState<CreateTaskRequest | undefined>(
    undefined
  );
  const theme = useTheme();
  const panelStyles = React.useMemo<Partial<IPanelStyles>>(
    () => ({
      root: {
        ['--panel-bg' as string]: theme.palette.neutralLighterAlt,
        ['--panel-section-bg' as string]: theme.palette.neutralLight,
        ['--panel-section-hover' as string]: theme.palette.neutralQuaternaryAlt,
        ['--panel-border' as string]: theme.palette.neutralQuaternary,
        ['--panel-accent' as string]: theme.palette.themePrimary,
        ['--panel-text' as string]: theme.palette.neutralPrimary,
        ['--panel-muted' as string]: theme.palette.neutralSecondary,
      } as IStyle,
      main: {
        background: theme.palette.neutralLighterAlt,
        borderLeft: `3px solid ${theme.palette.themePrimary}`,
      },
      headerText: {
        color: theme.palette.themePrimary,
      },
    }),
    [theme]
  );

  const handleTaskClickSafe = React.useCallback(
    (taskId: string) => {
      onTaskClick(taskId).catch(() => {
        // Error handled by parent
      });
    },
    [onTaskClick]
  );

  // Reset view when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setViewMode('list');
      setSearchQuery('');
      setPriorityFilter('all');
      setHubFilter('all');
      setSelectedPivotKey('all');
    }
  }, [isOpen]);

  // Handle refresh - reset all filters and reload tasks
  const handleRefresh = React.useCallback(() => {
    setSearchQuery('');
    setPriorityFilter('all');
    setHubFilter('all');
    setSelectedPivotKey('all');
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Switch to detail view when a task is selected
  React.useEffect(() => {
    if (selectedTask && viewMode !== 'edit' && viewMode !== 'create') {
      setViewMode('detail');
    }
  }, [selectedTask, viewMode]);

  React.useEffect(() => {
    if (!duplicateSourceId) return;
    if (!selectedTask || selectedTask.id !== duplicateSourceId) return;

    const existingTitles = tasks.map((t) => t.title.toLowerCase());
    const makeDuplicateTitle = (title: string): string => {
      const base = `${title} (Copy)`;
      if (existingTitles.indexOf(base.toLowerCase()) === -1) return base;
      let i = 2;
      while (existingTitles.indexOf(`${base} ${i}`.toLowerCase()) !== -1) {
        i += 1;
      }
      return `${base} ${i}`;
    };

    setCloneDraft({
      title: makeDuplicateTitle(selectedTask.title),
      description: selectedTask.description,
      status: selectedTask.status,
      priority: selectedTask.priority,
      ownership: selectedTask.ownership,
      assignments: selectedTask.assignments?.map((assignment) => ({
        userId: assignment.userId,
        role: assignment.role,
      })),
      hubLink: selectedTask.hubLink,
      dueDate: selectedTask.dueDate,
      startDate: selectedTask.startDate,
      recurrence: selectedTask.recurrence,
      reminders: selectedTask.reminders?.map((reminder) => ({
        timing: reminder.timing,
        offsetMinutes: reminder.offsetMinutes,
        customDateTime: reminder.customDateTime,
        channels: reminder.channels,
        recipientUserIds: reminder.recipientUserIds,
      })),
      checklist: selectedTask.checklist?.map((item) => ({
        title: item.title,
      })),
      tags: selectedTask.tags,
    });
  }, [duplicateSourceId, selectedTask, tasks]);

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
      setDuplicateSourceId(undefined);
      setCloneDraft(undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (): void => {
    setViewMode('list');
    onTaskDetailClose();
  };

  const handleStatusChange = (taskId: string, status: TaskStatus): void => {
    onUpdateTask(taskId, { status }).catch(() => {
      // Error handled by parent
    });
  };

  const handleEditTaskFromList = (taskId: string): void => {
    handleTaskClickSafe(taskId);
    setViewMode('edit');
  };

  const handleDeleteTask = (taskId: string, title: string): void => {
    const confirmDelete = window.confirm(
      `Delete "${title}"? This can’t be undone.`
    );
    if (!confirmDelete) return;

    onDeleteTask(taskId)
      .then(() => {
        onTaskDetailClose();
        setViewMode('list');
      })
      .catch(() => {
        // Error handled by parent
      });
  };

  const handleDuplicateTaskFromList = (taskId: string): void => {
    setDuplicateSourceId(taskId);
    setCloneDraft(undefined);
    handleTaskClickSafe(taskId);
    setViewMode('create');
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
      onClick: handleRefresh,
      disabled: isLoading,
    },
  ];

  const filteredTasks = React.useMemo(() => {
    const now = new Date();
    let scopedTasks = tasks;

    switch (selectedPivotKey) {
      case 'pending':
        scopedTasks = tasks.filter(
          (t) => t.status === 'not-started' || t.status === 'in-progress'
        );
        break;
      case 'completed':
        scopedTasks = tasks.filter((t) => t.status === 'completed');
        break;
      case 'overdue':
        scopedTasks = tasks.filter(
          (t) =>
            t.dueDate &&
            new Date(t.dueDate) < now &&
            t.status !== 'completed' &&
            t.status !== 'cancelled'
        );
        break;
      default:
        break;
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      scopedTasks = scopedTasks.filter((t) => t.priority === priorityFilter);
    }

    // Apply hub filter
    if (hubFilter !== 'all') {
      scopedTasks = scopedTasks.filter((t) => t.hubId === hubFilter);
    }

    if (!searchQuery) return scopedTasks;
    const query = searchQuery.toLowerCase();
    return scopedTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.hubDisplayName?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery, selectedPivotKey, priorityFilter, hubFilter]);

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
    <Stack className={styles.listView}>
      <div className={styles.listHeader}>
        <CommandBar items={commandBarItems} styles={{ root: { padding: 0 } }} />
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <IntranetSearchBox
              placeholder="Search tasks..."
              value={searchQuery}
              onQueryChange={handleSearch}
              defaultExpanded={true}
              collapseOnBlur={false}
              showResults={false}
              themeVars={{
                width: '100%',
                ['--search-input-bg' as string]: theme.palette.white,
                ['--search-icon-color' as string]: theme.palette.neutralPrimary,
                ['--search-input-text' as string]: theme.palette.neutralPrimary,
                ['--search-input-placeholder' as string]: theme.palette.neutralSecondary,
                ['--search-clear-color' as string]: theme.palette.neutralSecondary,
                ['--search-clear-hover-color' as string]: theme.palette.neutralPrimary,
              }}
            />
          </div>
          <Dropdown
            placeholder="Priority"
            options={priorityFilterOptions}
            selectedKey={priorityFilter}
            onChange={(_, option) => option && setPriorityFilter(option.key as string)}
            className={styles.filterDropdown}
            styles={{ title: { borderRadius: 6 } }}
          />
          <Dropdown
            placeholder="Hub"
            options={hubFilterOptions}
            selectedKey={hubFilter}
            onChange={(_, option) => option && setHubFilter(option.key as string)}
            className={styles.filterDropdown}
            styles={{ title: { borderRadius: 6 } }}
          />
        </div>
      </div>

      <div className={styles.listBody}>
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
                onClick={() => handleTaskClickSafe(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTaskClickSafe(task.id);
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
                {task.description && (
                  <div className={styles.summaryDescription}>
                    {task.description}
                  </div>
                )}
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
                  {task.checklistProgress && task.checklist && task.checklist.length > 0 && (
                    <TaskChecklistProgress
                      checklist={task.checklist}
                      variant="compact"
                      size="small"
                    />
                  )}
                </div>
              </div>
              <div className={styles.summaryActions}>
                <TaskStatusBadge
                  status={task.status}
                  size="small"
                  showIcon={true}
                />
                <IconButton
                  iconProps={{ iconName: 'Copy' }}
                  title="Duplicate task"
                  ariaLabel="Duplicate task"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateTaskFromList(task.id);
                  }}
                />
                <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  title="Delete task"
                  ariaLabel="Delete task"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task.id, task.title);
                  }}
                />
                <IconButton
                  iconProps={{ iconName: 'Edit' }}
                  title="Edit task"
                  ariaLabel="Edit task"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTaskFromList(task.id);
                  }}
                />
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
            onChecklistToggle={onChecklistToggle}
          />
        )}
      </Stack>
    );
  };

  const renderEditView = (): React.ReactElement => {
    const hubOptions = Object.keys(hubInfo)
      .filter((key) => key !== 'help' && key !== 'favourites')
      .map((key) => ({
        key,
        text: hubInfo[key as keyof typeof hubInfo].title,
      }));

    const isDuplicating = viewMode === 'create' && !!duplicateSourceId && !cloneDraft;

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

        {(viewMode === 'edit' && !selectedTask) || isDuplicating ? (
          <Stack horizontalAlign="center" className={styles.loading}>
            <Spinner
              size={SpinnerSize.medium}
              label={isDuplicating ? 'Preparing duplicate...' : 'Loading task...'}
            />
          </Stack>
        ) : (
          <TaskEditor
            task={viewMode === 'edit' ? selectedTask : undefined}
            isOpen={true}
            onDismiss={handleCancelEdit}
            onSave={handleSave}
            defaultOwnership={defaultOwnership}
            availableHubs={hubOptions}
            loading={isSaving}
            initialDraft={viewMode === 'create' ? cloneDraft : undefined}
            existingTitles={tasks.map((t) => t.title)}
          />
        )}
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
      styles={panelStyles}
      isLightDismiss={viewMode === 'list'}
    >
      <div className={styles.panelContent}>{renderContent()}</div>
    </Panel>
  );
};

export default TasksPanel;
