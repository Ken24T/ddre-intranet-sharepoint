/**
 * TaskPriorityIndicator - Visual indicator for task priority.
 */
import * as React from 'react';
import { Icon } from '@fluentui/react';
import type { TaskPriority } from '../../types';
import { getPriorityLabel } from '../../types';
import styles from './TaskPriorityIndicator.module.scss';

export interface ITaskPriorityIndicatorProps {
  /** Task priority to display */
  priority: TaskPriority;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show icon */
  showIcon?: boolean;
  /** Show text label */
  showLabel?: boolean;
  /** Show as flag icon (true) or filled circle (false) */
  variant?: 'flag' | 'dot';
  /** Additional CSS class */
  className?: string;
}

/** Get icon name for priority */
function getPriorityIcon(priority: TaskPriority, variant: 'flag' | 'dot'): string {
  if (variant === 'dot') {
    return 'StatusCircleInner';
  }

  switch (priority) {
    case 'urgent':
      return 'FlagSolid';
    case 'high':
      return 'Flag';
    case 'medium':
      return 'Flag';
    case 'low':
      return 'FlagDash';
    default:
      return 'Flag';
  }
}

export const TaskPriorityIndicator: React.FC<ITaskPriorityIndicatorProps> = ({
  priority,
  size = 'medium',
  showIcon = true,
  showLabel = false,
  variant = 'flag',
  className,
}) => {
  const indicatorClass = [
    styles.indicator,
    styles[priority],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const label = getPriorityLabel(priority);

  return (
    <span
      className={indicatorClass}
      role="img"
      aria-label={`Priority: ${label}`}
      title={label}
    >
      {showIcon && (
        <Icon iconName={getPriorityIcon(priority, variant)} className={styles.icon} />
      )}
      {showLabel && <span className={styles.label}>{label}</span>}
    </span>
  );
};

export default TaskPriorityIndicator;
