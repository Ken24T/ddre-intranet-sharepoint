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
import { ITaskBannerItem } from '../StatusBar/StatusBar';

export interface INotificationsContainerProps {
  /** Whether the flyout is open */
  isOpen: boolean;
  /** Target element ref for the flyout */
  targetRef: React.RefObject<HTMLDivElement>;
  /** Hub accent color for dynamic theming */
  hubAccentColor?: string;
  /** Callback when flyout is dismissed */
  onDismiss: () => void;
  /** Callback when a notification is clicked (for deep linking) */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback when "View All Tasks" is clicked */
  onViewAllTasks?: () => void;
  /** Render prop to provide notification state to parent */
  onStateChange?: (state: {
    unreadCount: number;
    hasOverdue: boolean;
    isLoading: boolean;
    bannerItems: ITaskBannerItem[];
    markBannerAsRead: () => void;
  }) => void;
}

/**
 * Container component that manages notification state and renders the flyout.
 */
export const NotificationsContainer: React.FC<INotificationsContainerProps> = ({
  isOpen,
  targetRef,
  hubAccentColor,
  onDismiss,
  onNotificationClick,
  onViewAllTasks,
  onStateChange,
}) => {
  const { state, markAsRead, markAllAsRead, getBannerNotifications } = useUnifiedNotifications();

  // Function to mark all banner notifications as read
  const markBannerAsRead = React.useCallback(() => {
    const bannerNotifications = getBannerNotifications();
    bannerNotifications.forEach((n) => markAsRead(n.id));
  }, [getBannerNotifications, markAsRead]);

  // Report state changes to parent
  React.useEffect(() => {
    const hasOverdue = state.groups.some((g) => g.category === 'overdue');
    const bannerNotifications = getBannerNotifications();
    const bannerItems: ITaskBannerItem[] = bannerNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category as 'overdue' | 'due-today',
      dueDate: n.dueDate,
    }));

    onStateChange?.({
      unreadCount: state.unreadCount,
      hasOverdue,
      isLoading: state.isLoading,
      bannerItems,
      markBannerAsRead,
    });
  }, [state.unreadCount, state.groups, state.isLoading, onStateChange, getBannerNotifications, markBannerAsRead]);

  return (
    <NotificationFlyout
      state={state}
      target={targetRef}
      isVisible={isOpen}
      hubAccentColor={hubAccentColor}
      onDismiss={onDismiss}
      onNotificationClick={onNotificationClick}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onViewAllTasks={onViewAllTasks}
    />
  );
};
