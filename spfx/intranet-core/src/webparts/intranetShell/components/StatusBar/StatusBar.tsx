import * as React from 'react';
import { TooltipHost, Icon, DirectionalHint, IconButton } from '@fluentui/react';
import { useApiHealth, type ApiStatus, type IApiHealthState } from './useApiHealth';
import { useNotifications, type ISystemNotification, type NotificationSeverity } from './useNotifications';
import styles from './StatusBar.module.scss';

export interface IStatusBarProps {
  /** Current user's display name or email */
  userDisplayName: string;
  /** App version string */
  appVersion: string;
  /** Optional SPFx context for real API health checks */
  context?: unknown;
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
 * StatusBar - Fixed 24px bottom status bar.
 * Shows API health indicators, current user, and system notifications.
 */
export const StatusBar: React.FC<IStatusBarProps> = ({ userDisplayName, appVersion, context }) => {
  const { vault, propertyMe, checkHealth, isChecking } = useApiHealth(context);
  const { notifications, dismissedIds, dismissNotification, isLoading: notificationsLoading } = useNotifications(context);

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
          <span className={styles.userName}>{userDisplayName}</span>
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
