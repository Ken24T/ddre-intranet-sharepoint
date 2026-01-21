/**
 * NotificationsContainer Component
 *
 * Bridges the useUnifiedNotifications hook with the Navbar.
 * Renders the NotificationFlyout with all necessary state and handlers.
 */

import * as React from 'react';
import { useUnifiedNotifications } from './useUnifiedNotifications';
import { NotificationFlyout } from './NotificationFlyout';
import { Notification } from './types';

export interface INotificationsContainerProps {
  /** Whether the flyout is open */
  isOpen: boolean;
  /** Target element ref for the flyout */
  targetRef: React.RefObject<HTMLDivElement>;
  /** Callback when flyout is dismissed */
  onDismiss: () => void;
  /** Callback when a notification is clicked (for deep linking) */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback when "View All Tasks" is clicked */
  onViewAllTasks?: () => void;
  /** Render prop to provide notification state to parent */
  onStateChange?: (state: { unreadCount: number; hasOverdue: boolean; isLoading: boolean }) => void;
}

/**
 * Container component that manages notification state and renders the flyout.
 */
export const NotificationsContainer: React.FC<INotificationsContainerProps> = ({
  isOpen,
  targetRef,
  onDismiss,
  onNotificationClick,
  onViewAllTasks,
  onStateChange,
}) => {
  const { state, markAsRead, markAllAsRead } = useUnifiedNotifications();

  // Report state changes to parent
  React.useEffect(() => {
    const hasOverdue = state.groups.some((g) => g.category === 'overdue');
    onStateChange?.({
      unreadCount: state.unreadCount,
      hasOverdue,
      isLoading: state.isLoading,
    });
  }, [state.unreadCount, state.groups, state.isLoading, onStateChange]);

  return (
    <NotificationFlyout
      state={state}
      target={targetRef}
      isVisible={isOpen}
      onDismiss={onDismiss}
      onNotificationClick={onNotificationClick}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onViewAllTasks={onViewAllTasks}
    />
  );
};
