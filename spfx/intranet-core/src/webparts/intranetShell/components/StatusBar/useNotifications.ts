import * as React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type NotificationSeverity = 'info' | 'warning' | 'error';

export interface ISystemNotification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  publishedBy: string;
  publishedAt: Date;
  expiresAt?: Date;
}

export interface INotificationsResult {
  notifications: ISystemNotification[];
  dismissedIds: Set<string>;
  dismissNotification: (id: string) => void;
  isLoading: boolean;
  error: string | undefined;
}

// =============================================================================
// MOCK DATA (for Vite dev harness)
// =============================================================================

const mockNotifications: ISystemNotification[] = [
  {
    id: 'notif-1',
    message: 'System maintenance scheduled for Saturday 10pm-2am',
    severity: 'warning',
    publishedBy: 'IT Department',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  {
    id: 'notif-2',
    message: 'New PropertyMe integration now available in PM Dashboard',
    severity: 'info',
    publishedBy: 'Admin',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'notif-3',
    message: 'Vault CRM experiencing intermittent connectivity issues',
    severity: 'error',
    publishedBy: 'IT Department',
    publishedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
];

/**
 * Simulate fetching notifications from an API.
 */
async function fetchMockNotifications(): Promise<ISystemNotification[]> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filter out expired notifications
  const now = new Date();
  return mockNotifications.filter(n => !n.expiresAt || n.expiresAt > now);
}

// =============================================================================
// SESSION STORAGE KEY
// =============================================================================

const DISMISSED_KEY = 'ddre-intranet-dismissedNotifications';

/**
 * Load dismissed notification IDs from session storage.
 */
function loadDismissedIds(): Set<string> {
  try {
    const stored = sessionStorage.getItem(DISMISSED_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Session storage not available or parse error
  }
  return new Set();
}

/**
 * Save dismissed notification IDs to session storage.
 */
function saveDismissedIds(ids: Set<string>): void {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Session storage not available or quota exceeded
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for managing system notifications.
 * 
 * In the Vite dev harness (no SPFx context), uses mock data.
 * In SharePoint, will fetch from a SharePoint List or API.
 * 
 * Dismissed notifications are stored in sessionStorage (cleared on browser close).
 * 
 * @param context - Optional SPFx WebPartContext (undefined in dev harness)
 */
export function useNotifications(context?: unknown): INotificationsResult {
  const [notifications, setNotifications] = React.useState<ISystemNotification[]>([]);
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(() => loadDismissedIds());
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Fetch notifications on mount
  React.useEffect(() => {
    const fetchNotifications = async (): Promise<void> => {
      setIsLoading(true);
      setError(undefined);

      try {
        if (context) {
          // Real SPFx context - fetch from SharePoint List or API
          // TODO: Implement when SharePoint List is created
          // const listItems = await sp.web.lists.getByTitle('System Notifications').items
          //   .filter(`ExpiresAt ge datetime'${new Date().toISOString()}' or ExpiresAt eq null`)
          //   .orderBy('PublishedAt', false)
          //   .get();
          
          // For now, use mock data in all cases
          const data = await fetchMockNotifications();
          setNotifications(data);
        } else {
          // Dev harness - use mock data
          const data = await fetchMockNotifications();
          setNotifications(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications().catch(console.error);
  }, [context]);

  // Dismiss a notification (session-scoped)
  const dismissNotification = React.useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedIds(next);
      return next;
    });
  }, []);

  return { notifications, dismissedIds, dismissNotification, isLoading, error };
}
