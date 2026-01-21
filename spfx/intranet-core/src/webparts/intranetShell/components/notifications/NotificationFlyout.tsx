/**
 * NotificationFlyout Component
 *
 * Flyout panel showing grouped notifications.
 * Opens from the NotificationButton in the navbar.
 */

import * as React from 'react';
import { Callout, DirectionalHint, Icon } from '@fluentui/react';
import { NotificationState, Notification, NotificationGroup, CATEGORY_CONFIG } from './types';
import styles from './NotificationFlyout.module.scss';

export interface INotificationFlyoutProps {
  /** Notification state from useUnifiedNotifications */
  state: NotificationState;
  /** Target element for the flyout */
  target: React.RefObject<HTMLDivElement>;
  /** Whether the flyout is visible */
  isVisible: boolean;
  /** Callback when flyout is dismissed */
  onDismiss: () => void;
  /** Callback when a notification is clicked */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback to mark a notification as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback to mark all notifications as read */
  onMarkAllAsRead?: () => void;
  /** Callback when "View All Tasks" is clicked */
  onViewAllTasks?: () => void;
}

/**
 * Formats a due date for display.
 */
function formatDueDate(dueDate: string): string {
  const due = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  if (due < today) {
    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
    return daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`;
  } else if (due < tomorrow) {
    return 'Due today';
  } else if (due < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
    return 'Due tomorrow';
  } else {
    return `Due ${due.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  }
}

/**
 * Renders a single notification item.
 */
const NotificationItem: React.FC<{
  notification: Notification;
  onClick?: (notification: Notification) => void;
}> = ({ notification, onClick }) => {
  const iconClassName = React.useMemo(() => {
    switch (notification.category) {
      case 'overdue':
        return `${styles.notificationIcon} ${styles.notificationIconOverdue}`;
      case 'due-today':
        return `${styles.notificationIcon} ${styles.notificationIconDueToday}`;
      default:
        return styles.notificationIcon;
    }
  }, [notification.category]);

  const handleClick = React.useCallback(() => {
    onClick?.(notification);
  }, [notification, onClick]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(notification);
      }
    },
    [notification, onClick]
  );

  return (
    <div
      className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${notification.title}. ${formatDueDate(notification.dueDate ?? '')}`}
    >
      <div className={iconClassName}>
        <Icon iconName={CATEGORY_CONFIG[notification.category].icon} />
      </div>
      <div className={styles.notificationContent}>
        <p className={styles.notificationTitle}>{notification.title}</p>
        <div className={styles.notificationMeta}>
          {notification.priority && (notification.priority === 'urgent' || notification.priority === 'high') && (
            <span className={`${styles.priorityIndicator} ${styles[notification.priority]}`}>
              <Icon iconName="Warning12" />
              {notification.priority === 'urgent' ? 'Urgent' : 'High'}
            </span>
          )}
          <span>{notification.dueDate ? formatDueDate(notification.dueDate) : ''}</span>
        </div>
      </div>
      {!notification.isRead && <div className={styles.unreadDot} aria-hidden="true" />}
    </div>
  );
};

/**
 * Renders a group of notifications.
 */
const NotificationGroupSection: React.FC<{
  group: NotificationGroup;
  onNotificationClick?: (notification: Notification) => void;
}> = ({ group, onNotificationClick }) => {
  const headerClassName = React.useMemo(() => {
    switch (group.category) {
      case 'overdue':
        return `${styles.groupHeader} ${styles.groupHeaderOverdue}`;
      case 'due-today':
        return `${styles.groupHeader} ${styles.groupHeaderDueToday}`;
      default:
        return styles.groupHeader;
    }
  }, [group.category]);

  return (
    <div className={styles.group}>
      <div className={headerClassName}>
        <Icon iconName={CATEGORY_CONFIG[group.category].icon} className={styles.groupIcon} />
        <span>{group.label}</span>
        <span className={styles.groupCount}>({group.count})</span>
      </div>
      {group.notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
};

/**
 * Empty state when there are no notifications.
 */
const EmptyState: React.FC = () => (
  <div className={styles.emptyState}>
    <Icon iconName="Ringer" className={styles.emptyIcon} />
    <h4>All caught up!</h4>
    <p>You have no pending notifications.</p>
  </div>
);

/**
 * Main flyout component.
 */
export const NotificationFlyout: React.FC<INotificationFlyoutProps> = ({
  state,
  target,
  isVisible,
  onDismiss,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAllTasks,
}) => {
  const handleNotificationClick = React.useCallback(
    (notification: Notification) => {
      // Mark as read
      onMarkAsRead?.(notification.id);
      // Navigate or open
      onNotificationClick?.(notification);
      // Dismiss flyout
      onDismiss();
    },
    [onMarkAsRead, onNotificationClick, onDismiss]
  );

  const handleViewAllTasks = React.useCallback(() => {
    onViewAllTasks?.();
    onDismiss();
  }, [onViewAllTasks, onDismiss]);

  if (!isVisible) return null;

  const hasNotifications = state.groups.length > 0;

  return (
    <Callout
      target={target.current}
      onDismiss={onDismiss}
      directionalHint={DirectionalHint.bottomRightEdge}
      isBeakVisible={false}
      gapSpace={4}
      setInitialFocus
      role="dialog"
      aria-label="Notifications"
    >
      <div className={styles.flyout}>
        <div className={styles.header}>
          <h3>Notifications</h3>
          <button
            className={styles.markAllRead}
            onClick={onMarkAllAsRead}
            disabled={state.unreadCount === 0}
            type="button"
          >
            Mark all as read
          </button>
        </div>

        <div className={styles.content}>
          {!hasNotifications ? (
            <EmptyState />
          ) : (
            state.groups.map((group) => (
              <NotificationGroupSection
                key={group.category}
                group={group}
                onNotificationClick={handleNotificationClick}
              />
            ))
          )}
        </div>

        {hasNotifications && onViewAllTasks && (
          <div className={styles.footer}>
            <button
              className={styles.viewAllLink}
              onClick={handleViewAllTasks}
              type="button"
            >
              View All Tasks
            </button>
          </div>
        )}
      </div>
    </Callout>
  );
};
