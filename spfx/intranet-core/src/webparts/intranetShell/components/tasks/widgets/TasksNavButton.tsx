/**
 * TasksNavButton Component
 *
 * Navbar button for tasks with pending count badge.
 * Click opens the Tasks panel.
 */

import * as React from 'react';
import {
  IconButton,
  IButtonStyles,
  TooltipHost,
  DirectionalHint,
} from '@fluentui/react';
import styles from './TasksNavButton.module.scss';

export interface ITasksNavButtonProps {
  /** Number of pending tasks to display as badge */
  pendingCount: number;
  /** Whether tasks are loading */
  isLoading?: boolean;
  /** Whether the tasks panel is currently open */
  isActive?: boolean;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Optional tooltip text override */
  tooltipText?: string;
  /** Optional accent colour for the badge */
  accentColor?: string;
}

/**
 * Navbar button showing tasks icon with pending count badge
 */
export const TasksNavButton: React.FC<ITasksNavButtonProps> = ({
  pendingCount,
  isLoading = false,
  isActive = false,
  onClick,
  tooltipText,
  accentColor,
}) => {
  const buttonStyles: IButtonStyles = {
    root: {
      position: 'relative',
      color: isActive ? 'var(--themePrimary)' : 'var(--neutralPrimary)',
      backgroundColor: isActive ? 'var(--themeLighter)' : 'transparent',
    },
    rootHovered: {
      color: 'var(--themePrimary)',
      backgroundColor: 'var(--themeLighter)',
    },
    rootPressed: {
      color: 'var(--themeDark)',
      backgroundColor: 'var(--themeLighterAlt)',
    },
    icon: {
      fontSize: 18,
    },
  };

  const tooltip =
    tooltipText ??
    (pendingCount > 0
      ? `Tasks (${pendingCount} pending)`
      : 'Tasks');

  const badgeStyle: React.CSSProperties = accentColor
    ? { backgroundColor: accentColor }
    : {};

  return (
    <TooltipHost
      content={tooltip}
      directionalHint={DirectionalHint.bottomCenter}
    >
      <div className={styles.buttonContainer}>
        <IconButton
          iconProps={{ iconName: 'TaskLogo' }}
          styles={buttonStyles}
          onClick={onClick}
          aria-label={tooltip}
          aria-pressed={isActive}
          disabled={isLoading}
        />
        {pendingCount > 0 && !isLoading && (
          <span
            className={styles.badge}
            style={badgeStyle}
            aria-hidden="true"
          >
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
        {isLoading && (
          <span className={styles.loadingDot} aria-hidden="true" />
        )}
      </div>
    </TooltipHost>
  );
};

export default TasksNavButton;
