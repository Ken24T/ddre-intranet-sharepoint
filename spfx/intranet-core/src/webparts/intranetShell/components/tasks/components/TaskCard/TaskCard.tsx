/**
 * TaskCard - Compact card for displaying a task in a list or grid.
 */
import * as React from 'react';
import {
  Checkbox,
  IconButton,
  IContextualMenuProps,
  IContextualMenuItem,
  Icon,
} from '@fluentui/react';
import type { Task, TaskStatus } from '../../types';
import { TaskStatusBadge } from '../TaskStatusBadge';
import { TaskPriorityIndicator } from '../TaskPriorityIndicator';
import { TaskDueDateLabel } from '../TaskDueDateLabel';
import { TaskChecklistProgress } from '../TaskChecklistProgress';
import styles from './TaskCard.module.scss';

export interface ITaskCardProps {
  /** The task to display */
  task: Task;
  /** Called when the task is clicked */
  onClick?: (task: Task) => void;
  /** Called when status changes (e.g., marked complete) */
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  /** Called when delete is requested */
  onDelete?: (taskId: string) => void;
  /** Called when edit is requested */
  onEdit?: (task: Task) => void;
  /** Show checkbox for quick complete toggle */
  showCheckbox?: boolean;
  /** Show context menu */
  showMenu?: boolean;
  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Selected state */
  isSelected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const TaskCard: React.FC<ITaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  onDelete,
  onEdit,
  showCheckbox = true,
  showMenu = true,
  variant = 'default',
  isSelected = false,
  disabled = false,
  className,
}) => {
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';
  const isInactive = isCompleted || isCancelled;

  const handleClick = React.useCallback((): void => {
    if (!disabled && onClick) {
      onClick(task);
    }
  }, [disabled, onClick, task]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const handleCheckboxChange = React.useCallback(
    (_ev?: React.FormEvent, checked?: boolean): void => {
      if (onStatusChange) {
        onStatusChange(task.id, checked ? 'completed' : 'not-started');
      }
    },
    [onStatusChange, task.id]
  );

  const menuItems: IContextualMenuItem[] = React.useMemo(
    () => [
      {
        key: 'edit',
        text: 'Edit',
        iconProps: { iconName: 'Edit' },
        onClick: () => onEdit?.(task),
      },
      {
        key: 'status',
        text: 'Change status',
        iconProps: { iconName: 'StatusCircleRing' },
        subMenuProps: {
          items: [
            {
              key: 'not-started',
              text: 'Not started',
              iconProps: { iconName: 'CircleRing' },
              onClick: () => onStatusChange?.(task.id, 'not-started'),
            },
            {
              key: 'in-progress',
              text: 'In progress',
              iconProps: { iconName: 'CircleHalfFull' },
              onClick: () => onStatusChange?.(task.id, 'in-progress'),
            },
            {
              key: 'completed',
              text: 'Completed',
              iconProps: { iconName: 'CheckMark' },
              onClick: () => onStatusChange?.(task.id, 'completed'),
            },
            {
              key: 'cancelled',
              text: 'Cancelled',
              iconProps: { iconName: 'Cancel' },
              onClick: () => onStatusChange?.(task.id, 'cancelled'),
            },
          ],
        },
      },
      {
        key: 'divider',
        itemType: 1, // ContextualMenuItemType.Divider
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete', style: { color: '#d13438' } },
        onClick: () => onDelete?.(task.id),
      },
    ],
    [onEdit, onStatusChange, onDelete, task]
  );

  const menuProps: IContextualMenuProps = React.useMemo(
    () => ({
      items: menuItems,
      directionalHintFixed: true,
    }),
    [menuItems]
  );

  // Get variant-specific class (SCSS uses 'compact' and 'detailed', 'default' has no extra class)
  const variantClass = variant !== 'default' ? styles[variant as 'compact' | 'detailed'] : '';

  const cardClass = [
    styles.card,
    variantClass,
    isSelected ? styles.selected : '',
    isInactive ? styles.inactive : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-selected={isSelected}
    >
      {/* Left side: checkbox and priority */}
      <div
        className={styles.leading}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        role="presentation"
      >
        {showCheckbox && (
          <Checkbox
            checked={isCompleted}
            onChange={handleCheckboxChange}
            disabled={disabled || isCancelled}
            className={styles.checkbox}
            ariaLabel={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          />
        )}
        <TaskPriorityIndicator
          priority={task.priority}
          size="small"
          showLabel={false}
        />
      </div>

      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{task.title}</span>
          {variant === 'detailed' && task.status !== 'completed' && (
            <TaskStatusBadge status={task.status} size="small" showIcon={false} />
          )}
        </div>

        {variant !== 'compact' && (
          <div className={styles.meta}>
            {task.dueDate && (
              <TaskDueDateLabel
                dueDate={task.dueDate}
                status={task.status}
                format="relative"
                size="small"
              />
            )}
            {task.checklist && task.checklist.length > 0 && (
              <TaskChecklistProgress
                checklist={task.checklist}
                variant="compact"
                size="small"
              />
            )}
            {task.hubLink && (
              <span className={styles.hub} title={`Hub: ${task.hubLink.hubDisplayName ?? 'Unknown'}`}>
                <Icon iconName="ViewDashboard" className={styles.hubIcon} />
                <span className={styles.hubName}>{task.hubLink.hubDisplayName ?? 'Hub'}</span>
              </span>
            )}
          </div>
        )}

        {variant === 'detailed' && task.description && (
          <p className={styles.description}>{task.description}</p>
        )}
      </div>

      {/* Right side: menu */}
      {showMenu && (
        <div className={styles.trailing}>
          <IconButton
            iconProps={{ iconName: 'More' }}
            title="More options"
            ariaLabel="More options"
            menuProps={menuProps}
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
            className={styles.menuButton}
          />
        </div>
      )}
    </div>
  );
};

export default TaskCard;
