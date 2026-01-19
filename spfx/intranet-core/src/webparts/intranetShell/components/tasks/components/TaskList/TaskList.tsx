/**
 * TaskList - Displays a filterable, sortable list of tasks.
 */
import * as React from 'react';
import {
  SearchBox,
  Dropdown,
  IDropdownOption,
  CommandBar,
  ICommandBarItemProps,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import type { Task, TaskStatus, TaskFilters, TaskSortField } from '../../types';
import { getPriorityWeight } from '../../types';
import { TaskCard } from '../TaskCard';
import styles from './TaskList.module.scss';

export interface ITaskListProps {
  /** Tasks to display */
  tasks: Task[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Called when a task is clicked */
  onTaskClick?: (task: Task) => void;
  /** Called when task status changes */
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  /** Called when task is deleted */
  onTaskDelete?: (taskId: string) => void;
  /** Called when task edit is requested */
  onTaskEdit?: (task: Task) => void;
  /** Called when new task is requested */
  onNewTask?: () => void;
  /** Initial filters */
  initialFilters?: Partial<TaskFilters>;
  /** Show filter controls */
  showFilters?: boolean;
  /** Show search */
  showSearch?: boolean;
  /** Show command bar */
  showCommandBar?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Card variant */
  cardVariant?: 'default' | 'compact' | 'detailed';
  /** Title for the list */
  title?: string;
  /** Additional CSS class */
  className?: string;
}

const statusOptions: IDropdownOption[] = [
  { key: 'all', text: 'All statuses' },
  { key: 'not-started', text: 'Not started' },
  { key: 'in-progress', text: 'In progress' },
  { key: 'completed', text: 'Completed' },
  { key: 'cancelled', text: 'Cancelled' },
];

const priorityOptions: IDropdownOption[] = [
  { key: 'all', text: 'All priorities' },
  { key: 'urgent', text: 'Urgent' },
  { key: 'high', text: 'High' },
  { key: 'normal', text: 'Normal' },
  { key: 'low', text: 'Low' },
];

const sortOptions: IDropdownOption[] = [
  { key: 'dueDate', text: 'Due date' },
  { key: 'priority', text: 'Priority' },
  { key: 'title', text: 'Title' },
  { key: 'createdAt', text: 'Created' },
  { key: 'updatedAt', text: 'Updated' },
];

export const TaskList: React.FC<ITaskListProps> = ({
  tasks,
  loading = false,
  error,
  onTaskClick,
  onTaskStatusChange,
  onTaskDelete,
  onTaskEdit,
  onNewTask,
  initialFilters,
  showFilters = true,
  showSearch = true,
  showCommandBar = true,
  emptyMessage = 'No tasks found',
  cardVariant = 'default',
  title,
  className,
}) => {
  // Filter state
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>(
    initialFilters?.status?.[0] ?? 'all'
  );
  const [priorityFilter, setPriorityFilter] = React.useState<string>(
    initialFilters?.priority?.[0] ?? 'all'
  );
  const [sortField, setSortField] = React.useState<TaskSortField>('dueDate');
  const [sortAscending, setSortAscending] = React.useState(true);

  // Filter and sort tasks
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'dueDate':
          // Tasks without due dates go to the end
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
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          // Handle optional updatedAt
          if (!a.updatedAt && !b.updatedAt) comparison = 0;
          else if (!a.updatedAt) comparison = 1;
          else if (!b.updatedAt) comparison = -1;
          else comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortAscending ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchText, statusFilter, priorityFilter, sortField, sortAscending]);

  // Command bar items
  const commandBarItems: ICommandBarItemProps[] = React.useMemo(
    () => [
      {
        key: 'newTask',
        text: 'New task',
        iconProps: { iconName: 'Add' },
        onClick: onNewTask,
      },
    ],
    [onNewTask]
  );

  const commandBarFarItems: ICommandBarItemProps[] = React.useMemo(
    () => [
      {
        key: 'sort',
        text: 'Sort',
        iconProps: { iconName: sortAscending ? 'SortUp' : 'SortDown' },
        subMenuProps: {
          items: sortOptions.map((opt) => ({
            key: opt.key as string,
            text: opt.text,
            canCheck: true,
            checked: sortField === opt.key,
            onClick: () => setSortField(opt.key as TaskSortField),
          })),
        },
      },
      {
        key: 'toggleSort',
        iconOnly: true,
        iconProps: { iconName: sortAscending ? 'SortUp' : 'SortDown' },
        onClick: () => setSortAscending(!sortAscending),
        title: sortAscending ? 'Sort descending' : 'Sort ascending',
      },
    ],
    [sortField, sortAscending]
  );

  const handleStatusChange = React.useCallback(
    (_: React.FormEvent, option?: IDropdownOption) => {
      if (option) {
        setStatusFilter(option.key as string);
      }
    },
    []
  );

  const handlePriorityChange = React.useCallback(
    (_: React.FormEvent, option?: IDropdownOption) => {
      if (option) {
        setPriorityFilter(option.key as string);
      }
    },
    []
  );

  const containerClass = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {/* Header */}
      {(title || showCommandBar) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {showCommandBar && (
            <CommandBar
              items={commandBarItems}
              farItems={commandBarFarItems}
              className={styles.commandBar}
            />
          )}
        </div>
      )}

      {/* Filters */}
      {(showSearch || showFilters) && (
        <div className={styles.filters}>
          {showSearch && (
            <SearchBox
              placeholder="Search tasks..."
              value={searchText}
              onChange={(_, value) => setSearchText(value ?? '')}
              className={styles.searchBox}
            />
          )}
          {showFilters && (
            <>
              <Dropdown
                placeholder="Status"
                options={statusOptions}
                selectedKey={statusFilter}
                onChange={handleStatusChange}
                className={styles.filterDropdown}
              />
              <Dropdown
                placeholder="Priority"
                options={priorityOptions}
                selectedKey={priorityFilter}
                onChange={handlePriorityChange}
                className={styles.filterDropdown}
              />
            </>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.error}>
          {error}
        </MessageBar>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles.loading}>
          <Spinner size={SpinnerSize.medium} label="Loading tasks..." />
        </div>
      )}

      {/* Task list */}
      {!loading && !error && (
        <div className={styles.list}>
          {filteredTasks.length === 0 ? (
            <div className={styles.empty}>
              <p>{emptyMessage}</p>
              {onNewTask && (
                <button onClick={onNewTask} className={styles.emptyAction}>
                  Create a new task
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant={cardVariant}
                onClick={onTaskClick}
                onStatusChange={onTaskStatusChange}
                onDelete={onTaskDelete}
                onEdit={onTaskEdit}
              />
            ))
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredTasks.length > 0 && (
        <div className={styles.footer}>
          <span className={styles.count}>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskList;
