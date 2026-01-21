/**
 * NotificationButton Component
 *
 * Bell icon button in the navbar with notification count badge.
 * Click opens the NotificationFlyout.
 */

import * as React from 'react';
import {
  IconButton,
  IButtonStyles,
  TooltipHost,
  DirectionalHint,
} from '@fluentui/react';
import styles from './NotificationButton.module.scss';

export interface INotificationButtonProps {
  /** Total unread notification count */
  unreadCount: number;
  /** Whether there are overdue items (shows warning color) */
  hasOverdue?: boolean;
  /** Whether notifications are loading */
  isLoading?: boolean;
  /** Whether the notification flyout is currently open */
  isActive?: boolean;
  /** Element ref for flyout target */
  buttonRef?: React.RefObject<HTMLDivElement>;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Optional tooltip text override */
  tooltipText?: string;
}

/**
 * Navbar button showing bell icon with notification count badge.
 */
export const NotificationButton: React.FC<INotificationButtonProps> = ({
  unreadCount,
  hasOverdue = false,
  isLoading = false,
  isActive = false,
  buttonRef,
  onClick,
  tooltipText,
}) => {
  const buttonStyles: IButtonStyles = {
    root: {
      position: 'relative',
      color: isActive ? 'var(--themePrimary)' : 'inherit',
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
    (unreadCount > 0
      ? `Notifications (${unreadCount} unread)`
      : 'Notifications');

  const badgeClassName = hasOverdue
    ? `${styles.badge} ${styles.badgeOverdue}`
    : styles.badge;

  return (
    <TooltipHost
      content={tooltip}
      directionalHint={DirectionalHint.bottomCenter}
    >
      <div className={styles.buttonContainer} ref={buttonRef}>
        <IconButton
          iconProps={{ iconName: 'Ringer' }}
          styles={buttonStyles}
          onClick={onClick}
          aria-label={tooltip}
          aria-pressed={isActive}
          aria-haspopup="true"
          disabled={isLoading}
        />
        {unreadCount > 0 && !isLoading && (
          <span className={badgeClassName} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {isLoading && (
          <span className={styles.loadingDot} aria-hidden="true" />
        )}
      </div>
    </TooltipHost>
  );
};
