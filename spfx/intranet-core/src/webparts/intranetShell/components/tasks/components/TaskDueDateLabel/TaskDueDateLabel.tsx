/**
 * TaskDueDateLabel - Displays due date with visual urgency indicators.
 */
import * as React from 'react';
import { Icon } from '@fluentui/react';
import type { TaskStatus } from '../../types';
import styles from './TaskDueDateLabel.module.scss';

export interface ITaskDueDateLabelProps {
  /** Due date string (ISO format) or undefined if no due date */
  dueDate: string | undefined;
  /** Task status (to determine if completed/cancelled - no urgency shown) */
  status?: TaskStatus;
  /** Format to display */
  format?: 'short' | 'medium' | 'long' | 'relative';
  /** Show calendar icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS class */
  className?: string;
}

/** Format date based on format option */
function formatDate(date: Date, format: 'short' | 'medium' | 'long' | 'relative'): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (format === 'relative') {
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      if (absDays === 1) return 'Yesterday';
      if (absDays < 7) return `${absDays} days ago`;
      if (absDays < 14) return '1 week ago';
      return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    }
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 14) return 'Next week';
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { day: 'numeric', month: 'numeric' }
      : format === 'medium'
        ? { day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'long', year: 'numeric' };

  return date.toLocaleDateString('en-AU', options);
}

/** Check if a date is overdue */
function isOverdue(dueDateStr: string): boolean {
  return new Date(dueDateStr) < new Date();
}

/** Check if a date is due within specified days */
function isDueSoon(dueDateStr: string, withinDays: number): boolean {
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  return dueDate > now && dueDate <= threshold;
}

/** Determine urgency level */
function getUrgency(
  dueDate: string | undefined,
  status?: TaskStatus
): 'none' | 'soon' | 'overdue' {
  if (!dueDate) return 'none';
  if (status === 'completed' || status === 'cancelled') return 'none';

  if (isOverdue(dueDate)) return 'overdue';
  if (isDueSoon(dueDate, 3)) return 'soon';
  return 'none';
}

export const TaskDueDateLabel: React.FC<ITaskDueDateLabelProps> = ({
  dueDate,
  status,
  format = 'relative',
  showIcon = true,
  size = 'medium',
  className,
}) => {
  if (!dueDate) {
    return null;
  }

  const date = new Date(dueDate);
  const urgency = getUrgency(dueDate, status);
  const formattedDate = formatDate(date, format);

  const labelClass = [
    styles.dueDate,
    styles[urgency],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconName =
    urgency === 'overdue' ? 'Warning' : urgency === 'soon' ? 'Clock' : 'Calendar';

  return (
    <span className={labelClass} title={date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}>
      {showIcon && <Icon iconName={iconName} className={styles.icon} />}
      <span className={styles.text}>{formattedDate}</span>
    </span>
  );
};

export default TaskDueDateLabel;
