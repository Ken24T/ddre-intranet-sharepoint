/**
 * TaskChecklistProgress - Visual progress indicator for task checklists.
 */
import * as React from 'react';
import { Icon, ProgressIndicator } from '@fluentui/react';
import type { TaskChecklist } from '../../types';
import styles from './TaskChecklistProgress.module.scss';

export interface ITaskChecklistProgressProps {
  /** Checklist items */
  checklist: TaskChecklist[];
  /** Display variant */
  variant?: 'bar' | 'text' | 'compact';
  /** Size */
  size?: 'small' | 'medium';
  /** Additional CSS class */
  className?: string;
}

export const TaskChecklistProgress: React.FC<ITaskChecklistProgressProps> = ({
  checklist,
  variant = 'compact',
  size = 'medium',
  className,
}) => {
  if (!checklist || checklist.length === 0) {
    return null;
  }

  const total = checklist.length;
  const completed = checklist.filter((item: TaskChecklist) => item.completed).length;
  const percentComplete = total > 0 ? completed / total : 0;
  const isComplete = completed === total;

  const containerClass = [
    styles.container,
    styles[variant],
    styles[size],
    isComplete ? styles.complete : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'bar') {
    return (
      <div className={containerClass}>
        <ProgressIndicator
          percentComplete={percentComplete}
          barHeight={size === 'small' ? 4 : 6}
          styles={{
            root: { width: '100%' },
            progressBar: {
              background: isComplete ? '#107c10' : '#0078d4',
            },
          }}
        />
        <span className={styles.label}>
          {completed}/{total}
        </span>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={containerClass}>
        <Icon iconName="CheckList" className={styles.icon} />
        <span className={styles.label}>
          {completed} of {total} complete
        </span>
      </span>
    );
  }

  // Compact variant (default)
  return (
    <span className={containerClass} title={`${completed} of ${total} items complete`}>
      <Icon iconName="CheckList" className={styles.icon} />
      <span className={styles.label}>
        {completed}/{total}
      </span>
    </span>
  );
};

export default TaskChecklistProgress;
