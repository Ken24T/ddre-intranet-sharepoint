import * as React from 'react';
import { TooltipHost, Icon, DirectionalHint, IconButton, Callout } from '@fluentui/react';
import { useApiHealth, type ApiStatus, type IApiHealthState } from './useApiHealth';
import { useNotifications, type ISystemNotification, type NotificationSeverity } from './useNotifications';
import styles from './StatusBar.module.scss';

/**
 * Task banner notification for StatusBar.
 */
export interface ITaskBannerItem {
  id: string;
  title: string;
  description?: string;
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

/**
 * Format date for display in tooltip.
 */
function formatDueDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time for comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() === today.getTime()) {
    return 'Due today';
  } else if (due < today) {
    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
  }
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const TaskBanner: React.FC<ITaskBannerProps> = ({ items, onItemClick, onDismiss }) => {
  const [isCalloutVisible, setIsCalloutVisible] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const overdueItems = items.filter((i) => i.category === 'overdue');
  const dueTodayItems = items.filter((i) => i.category === 'due-today');
  const overdueCount = overdueItems.length;
  const dueTodayCount = dueTodayItems.length;

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

  const handleTaskItemClick = (taskId: string): void => {
    setIsCalloutVisible(false);
    if (onItemClick) {
      onItemClick(taskId);
    }
  };

  const renderTaskItem = (item: ITaskBannerItem): React.ReactNode => {
    const dueInfo = formatDueDate(item.dueDate);
    return (
      <div
        key={item.id}
        className={styles.taskCalloutItem}
        onClick={() => handleTaskItemClick(item.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTaskItemClick(item.id);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className={styles.taskCalloutDue}>{dueInfo || 'Due today'}</span>
        <span className={styles.taskCalloutTitle}>{item.title}</span>
        {item.description && (
          <span className={styles.taskCalloutDescription}>{item.description}</span>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={bannerRef}
        className={`${styles.taskBanner} ${overdueCount > 0 ? styles.taskBannerOverdue : styles.taskBannerDueToday}`}
        onClick={handleClick}
        onMouseEnter={() => setIsCalloutVisible(true)}
        onMouseLeave={() => setIsCalloutVisible(false)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={message}
        aria-haspopup="true"
        aria-expanded={isCalloutVisible}
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
      {isCalloutVisible && bannerRef.current && (
        <Callout
          target={bannerRef.current}
          directionalHint={DirectionalHint.topCenter}
          gapSpace={8}
          isBeakVisible={true}
          beakWidth={12}
          onMouseEnter={() => setIsCalloutVisible(true)}
          onMouseLeave={() => setIsCalloutVisible(false)}
          onDismiss={() => setIsCalloutVisible(false)}
          setInitialFocus={false}
          className={styles.taskCallout}
        >
          <div className={styles.taskCalloutContent}>
            {overdueItems.length > 0 && (
              <div className={styles.taskCalloutSection}>
                <div className={styles.taskCalloutHeader}>
                  <Icon iconName="Warning" className={styles.taskCalloutHeaderIconOverdue} />
                  <span>Overdue</span>
                </div>
                {overdueItems.slice(0, 5).map(renderTaskItem)}
                {overdueItems.length > 5 && (
                  <div className={styles.taskCalloutMore}>
                    ... and {overdueItems.length - 5} more
                  </div>
                )}
              </div>
            )}
            {dueTodayItems.length > 0 && (
              <div className={styles.taskCalloutSection}>
                <div className={styles.taskCalloutHeader}>
                  <Icon iconName="Clock" className={styles.taskCalloutHeaderIconDueToday} />
                  <span>Due Today</span>
                </div>
                {dueTodayItems.slice(0, 5).map(renderTaskItem)}
                {dueTodayItems.length > 5 && (
                  <div className={styles.taskCalloutMore}>
                    ... and {dueTodayItems.length - 5} more
                  </div>
                )}
              </div>
            )}
            <div className={styles.taskCalloutFooter}>
              Click to view all tasks
            </div>
          </div>
        </Callout>
      )}
    </>
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
