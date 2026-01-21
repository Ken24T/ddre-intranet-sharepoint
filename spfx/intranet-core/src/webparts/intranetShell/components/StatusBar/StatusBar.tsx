import * as React from 'react';
import { TooltipHost, Icon, DirectionalHint, IconButton } from '@fluentui/react';
import { useApiHealth, type ApiStatus, type IApiHealthState } from './useApiHealth';
import { useNotifications, type ISystemNotification, type NotificationSeverity } from './useNotifications';
import styles from './StatusBar.module.scss';

/**
 * Task banner notification for StatusBar.
 */
export interface ITaskBannerItem {
  id: string;
  title: string;
  category: 'overdue' | 'due-today';
  dueDate?: string;
}

export interface IStatusBarProps {
  /** Current user's display name or email */
  userDisplayName: string;
  /** App version string */
  appVersion: string;
  /** Optional SPFx context for real API health checks */
  context?: unknown;
  /** Task banner items (overdue/due-today) */
  taskBannerItems?: ITaskBannerItem[];
  /** Called when user clicks on a task banner item */
  onTaskBannerClick?: (taskId: string) => void;
  /** Called when user dismisses the task banner */
  onTaskBannerDismiss?: () => void;
}

/**
 * Get CSS class for status indicator based on API status.
 */
function getStatusClass(status: ApiStatus): string {
  switch (status) {
    case 'healthy':
      return styles.statusHealthy;
    case 'degraded':
      return styles.statusDegraded;
    case 'unhealthy':
      return styles.statusUnhealthy;
    case 'checking':
      return styles.statusChecking;
    default:
      return styles.statusUnknown;
  }
}

/**
 * Get human-readable status label.
 */
function getStatusLabel(status: ApiStatus): string {
  switch (status) {
    case 'healthy':
      return 'Connected';
    case 'degraded':
      return 'Degraded';
    case 'unhealthy':
      return 'Disconnected';
    case 'checking':
      return 'Checking...';
    default:
      return 'Unknown';
  }
}

/**
 * Format tooltip content for API health indicator.
 */
function formatTooltip(apiName: string, state: IApiHealthState): string {
  const statusLabel = getStatusLabel(state.status);
  const lines = [`${apiName}: ${statusLabel}`];
  
  if (state.lastChecked) {
    lines.push(`Last checked: ${state.lastChecked.toLocaleTimeString()}`);
  }
  
  if (state.responseTimeMs !== undefined) {
    lines.push(`Response time: ${state.responseTimeMs}ms`);
  }
  
  if (state.error) {
    lines.push(`Error: ${state.error}`);
  }
  
  return lines.join('\n');
}

/**
 * Health indicator component for a single API.
 */
interface IHealthIndicatorProps {
  apiName: string;
  state: IApiHealthState;
}

const HealthIndicator: React.FC<IHealthIndicatorProps> = ({ apiName, state }) => {
  const tooltipContent = formatTooltip(apiName, state);
  const statusClass = getStatusClass(state.status);
  const ariaLabel = `${apiName} API: ${getStatusLabel(state.status)}`;
  
  return (
    <TooltipHost
      content={tooltipContent}
      directionalHint={DirectionalHint.topCenter}
      calloutProps={{ gapSpace: 4 }}
    >
      <div className={styles.healthIndicator} aria-label={ariaLabel}>
        <span className={`${styles.statusDot} ${statusClass}`} />
        <span className={styles.apiName}>{apiName}</span>
      </div>
    </TooltipHost>
  );
};

/**
 * Get CSS class for notification severity.
 */
function getNotificationSeverityClass(severity: NotificationSeverity): string {
  switch (severity) {
    case 'error':
      return styles.notificationError;
    case 'warning':
      return styles.notificationWarning;
    default:
      return styles.notificationInfo;
  }
}

/**
 * Get icon for notification severity.
 */
function getNotificationIcon(severity: NotificationSeverity): string {
  switch (severity) {
    case 'error':
      return 'ErrorBadge';
    case 'warning':
      return 'Warning';
    default:
      return 'Info';
  }
}

/**
 * Single notification item component.
 */
interface INotificationItemProps {
  notification: ISystemNotification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<INotificationItemProps> = ({ notification, onDismiss }) => {
  const severityClass = getNotificationSeverityClass(notification.severity);
  const iconName = getNotificationIcon(notification.severity);
  const tooltipContent = `${notification.message}\n\nPublished by: ${notification.publishedBy}\n${notification.publishedAt.toLocaleString()}`;
  
  return (
    <TooltipHost
      content={tooltipContent}
      directionalHint={DirectionalHint.topCenter}
      calloutProps={{ gapSpace: 4 }}
    >
      <div className={`${styles.notificationItem} ${severityClass}`}>
        <Icon iconName={iconName} className={styles.notificationIcon} />
        <span className={styles.notificationMessage}>{notification.message}</span>
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          className={styles.dismissButton}
          title="Dismiss notification"
          ariaLabel="Dismiss notification"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        />
      </div>
    </TooltipHost>
  );
};

/**
 * Task banner component for overdue/due-today notifications.
 */
interface ITaskBannerProps {
  items: ITaskBannerItem[];
  onItemClick?: (taskId: string) => void;
  onDismiss?: () => void;
}

const TaskBanner: React.FC<ITaskBannerProps> = ({ items, onItemClick, onDismiss }) => {
  if (items.length === 0) return null;

  const overdueCount = items.filter((i) => i.category === 'overdue').length;
  const dueTodayCount = items.filter((i) => i.category === 'due-today').length;

  // Build message
  const parts: string[] = [];
  if (overdueCount > 0) {
    parts.push(`${overdueCount} overdue`);
  }
  if (dueTodayCount > 0) {
    parts.push(`${dueTodayCount} due today`);
  }
  const message = `You have ${parts.join(' and ')} task${items.length > 1 ? 's' : ''}`;

  const handleClick = (): void => {
    // Click the first item to open tasks panel
    if (items.length > 0 && onItemClick) {
      onItemClick(items[0].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`${styles.taskBanner} ${overdueCount > 0 ? styles.taskBannerOverdue : styles.taskBannerDueToday}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={message}
    >
      <Icon iconName={overdueCount > 0 ? 'Warning' : 'Clock'} className={styles.taskBannerIcon} />
      <span className={styles.taskBannerMessage}>{message}</span>
      {onDismiss && (
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          className={styles.taskBannerDismiss}
          title="Dismiss for now"
          ariaLabel="Dismiss task reminder"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        />
      )}
    </div>
  );
};

/**
 * StatusBar - Fixed 24px bottom status bar.
 * Shows API health indicators, current user, and system notifications.
 */
export const StatusBar: React.FC<IStatusBarProps> = ({
  userDisplayName,
  appVersion,
  context,
  taskBannerItems = [],
  onTaskBannerClick,
  onTaskBannerDismiss,
}) => {
  const { vault, propertyMe, checkHealth, isChecking } = useApiHealth(context);
  const { notifications, dismissedIds, dismissNotification, isLoading: notificationsLoading } = useNotifications(context);
  const otherActiveUsers = [
    { name: 'Sophie Nguyen', status: 'Viewing Sales hub', activeFor: '4m' },
    { name: 'Liam Harris', status: 'Editing Help Centre', activeFor: '9m' },
    { name: 'Amelia Jones', status: 'Browsing Property Management', activeFor: '2m' },
  ];
  const totalUserCount = otherActiveUsers.length + 1; // +1 for current user
  const userCountLabel = otherActiveUsers.length > 0 ? ` (${totalUserCount})` : '';
  const userTooltipContent = otherActiveUsers.length > 0 ? (
    <div className={styles.userTooltip}>
      <div className={styles.userTooltipTitle}>Other active users</div>
      <div className={styles.userTooltipList}>
        {otherActiveUsers.map((user) => (
          <div key={user.name} className={styles.userTooltipItem}>
            <div className={styles.userTooltipName}>{user.name}</div>
            <div className={styles.userTooltipMeta}>
              {user.status} · {user.activeFor}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    'No other active users'
  );

  const handleRefresh = (): void => {
    if (!isChecking) {
      checkHealth().catch(console.error);
    }
  };

  // Filter out dismissed notifications and sort by severity (error > warning > info)
  const visibleNotifications = notifications
    .filter(n => !dismissedIds.has(n.id))
    .sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  return (
    <footer className={styles.statusBar} role="contentinfo">
      <div className={styles.leftSection}>
        {/* API Health Section */}
        <div className={styles.healthSection}>
          <HealthIndicator apiName="Vault" state={vault} />
          <HealthIndicator apiName="PropertyMe" state={propertyMe} />
          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={isChecking}
            title="Refresh API status"
            aria-label="Refresh API status"
          >
            <Icon iconName={isChecking ? 'Sync' : 'Refresh'} className={isChecking ? styles.spinning : ''} />
          </button>
        </div>

        {/* Task Banner - overdue/due-today tasks */}
        {taskBannerItems.length > 0 && (
          <TaskBanner
            items={taskBannerItems}
            onItemClick={onTaskBannerClick}
            onDismiss={onTaskBannerDismiss}
          />
        )}

        {/* Notifications Section */}
        <div className={styles.notificationsSection} aria-live="polite">
          {notificationsLoading ? (
            <span className={styles.notificationsLoading}>Loading notifications...</span>
          ) : visibleNotifications.length > 0 ? (
            <div className={styles.notificationsScroller}>
              {visibleNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={dismissNotification}
                />
              ))}
            </div>
          ) : (
            <span className={styles.noNotifications}>No notifications</span>
          )}
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* User Section */}
        <div className={styles.userSection}>
          <Icon iconName="Contact" className={styles.userIcon} />
          <TooltipHost
            content={userTooltipContent}
            directionalHint={DirectionalHint.topCenter}
            calloutProps={{ gapSpace: 6 }}
          >
            <span className={styles.userName}>
              {userDisplayName}{userCountLabel}
            </span>
          </TooltipHost>
        </div>

        {appVersion && (
          <div className={styles.versionSection}>
            <span className={styles.versionLabel}>v{appVersion}</span>
          </div>
        )}
      </div>
    </footer>
  );
};
