/**
 * TaskChecklistProgress - Visual progress indicator for task checklists.
 */
import * as React from 'react';
import { Icon, ProgressIndicator, Callout, DirectionalHint } from '@fluentui/react';
import { useId, useBoolean } from '@fluentui/react-hooks';
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
  const targetId = useId('checklist-target');
  const [isCalloutVisible, { setTrue: showCallout, setFalse: hideCallout }] = useBoolean(false);

  // Debug logging
  React.useEffect(() => {
    if (checklist && checklist.length > 0) {
      console.log('[TaskChecklistProgress] Rendered with', checklist.length, 'items, targetId:', targetId);
    }
  }, [checklist, targetId]);

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

  // Render checklist callout content
  const renderCallout = (): JSX.Element | null => {
    if (!isCalloutVisible) return null;
    
    return (
      <Callout
        target={`#${targetId}`}
        onDismiss={hideCallout}
        directionalHint={DirectionalHint.bottomCenter}
        gapSpace={4}
        isBeakVisible={true}
        beakWidth={8}
        setInitialFocus={false}
        preventDismissOnEvent={(ev) => {
          // Keep callout open while mouse is over target or callout
          const target = ev.target as HTMLElement;
          const isOverTarget = target.closest(`#${targetId}`) !== null;
          const isOverCallout = target.closest('.ms-Callout') !== null;
          return isOverTarget || isOverCallout;
        }}
      >
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipHeader}>
            Checklist ({completed}/{total})
          </div>
          <ul className={styles.tooltipList}>
            {checklist.map((item: TaskChecklist, index: number) => (
              <li key={item.id ?? index} className={item.completed ? styles.tooltipItemCompleted : styles.tooltipItem}>
                <span className={styles.tooltipItemText}>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </Callout>
    );
  };

  if (variant === 'bar') {
    return (
      <>
        <div 
          id={targetId}
          className={containerClass}
          onMouseEnter={showCallout}
          onMouseLeave={hideCallout}
        >
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
        {renderCallout()}
      </>
    );
  }

  if (variant === 'text') {
    return (
      <>
        <span 
          id={targetId}
          className={containerClass}
          onMouseEnter={showCallout}
          onMouseLeave={hideCallout}
        >
          <Icon iconName="CheckList" className={styles.icon} />
          <span className={styles.label}>
            {completed} of {total} complete
          </span>
        </span>
        {renderCallout()}
      </>
    );
  }

  // Compact variant (default)
  return (
    <>
      <span 
        id={targetId}
        className={containerClass}
        onMouseEnter={showCallout}
        onMouseLeave={hideCallout}
      >
        <Icon iconName="CheckList" className={styles.icon} />
        <span className={styles.label}>
          {completed}/{total}
        </span>
      </span>
      {renderCallout()}
    </>
  );
};

export default TaskChecklistProgress;
