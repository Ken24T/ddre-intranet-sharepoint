/**
 * TaskStatusBadge - Visual indicator for task status.
 */
import * as React from 'react';
import { Icon } from '@fluentui/react';
import type { TaskStatus } from '../../types';
import { getStatusLabel } from '../../types';
import styles from './TaskStatusBadge.module.scss';

export interface ITaskStatusBadgeProps {
  /** Task status to display */
  status: TaskStatus;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show icon alongside text */
  showIcon?: boolean;
  /** Show text label */
  showLabel?: boolean;
  /** Additional CSS class */
  className?: string;
}

/** Get icon name for status */
function getStatusIcon(status: TaskStatus): string {
  switch (status) {
    case 'not-started':
      return 'CircleRing';
    case 'in-progress':
      return 'CircleHalfFull';
    case 'completed':
      return 'CheckMark';
    case 'cancelled':
      return 'Cancel';
    default:
      return 'CircleRing';
  }
}

export const TaskStatusBadge: React.FC<ITaskStatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  showLabel = true,
  className,
}) => {
  const badgeClass = [
    styles.badge,
    styles[status],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClass} role="status" aria-label={`Status: ${getStatusLabel(status)}`}>
      {showIcon && <Icon iconName={getStatusIcon(status)} className={styles.icon} />}
      {showLabel && <span className={styles.label}>{getStatusLabel(status)}</span>}
    </span>
  );
};

export default TaskStatusBadge;
