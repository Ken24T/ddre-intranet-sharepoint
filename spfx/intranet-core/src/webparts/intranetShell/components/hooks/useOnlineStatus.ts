import { useState, useEffect, useCallback, useRef } from 'react';

export interface IOnlineStatusOptions {
  /** Callback when going online */
  onOnline?: () => void;
  /** Callback when going offline */
  onOffline?: () => void;
  /** Interval to verify connectivity (ms, 0 to disable) */
  pollInterval?: number;
}

export interface IOnlineStatusReturn {
  /** Current online status */
  isOnline: boolean;
  /** Whether status was previously offline (for reconnection detection) */
  wasOffline: boolean;
  /** Reset wasOffline flag after handling reconnection */
  clearWasOffline: () => void;
}

/**
 * Hook to monitor online/offline status with reconnection detection.
 * 
 * @example
 * ```tsx
 * const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus({
 *   onOnline: () => toast.success("You're back online!"),
 *   onOffline: () => console.log('Connection lost')
 * });
 * 
 * useEffect(() => {
 *   if (wasOffline && isOnline) {
 *     refreshData();
 *     clearWasOffline();
 *   }
 * }, [isOnline, wasOffline]);
 * ```
 */
export function useOnlineStatus(options: IOnlineStatusOptions = {}): IOnlineStatusReturn {
  const { onOnline, onOffline, pollInterval = 0 } = options;
  
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  
  // Track previous state to detect transitions
  const prevOnlineRef = useRef(isOnline);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (!prevOnlineRef.current) {
      // Was offline, now online = reconnection
      setWasOffline(true);
      onOnline?.();
    }
    prevOnlineRef.current = true;
  }, [onOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    prevOnlineRef.current = false;
    onOffline?.();
  }, [onOffline]);

  const clearWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Optional connectivity polling (some networks falsely report online)
  useEffect(() => {
    if (pollInterval <= 0) return;

    const checkConnectivity = async (): Promise<void> => {
      try {
        // Try to fetch a tiny resource to verify real connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-store',
        });
        if (response.ok && !isOnline) {
          handleOnline();
        }
      } catch {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    const intervalId = setInterval(checkConnectivity, pollInterval);
    return () => clearInterval(intervalId);
  }, [pollInterval, isOnline, handleOnline, handleOffline]);

  return { isOnline, wasOffline, clearWasOffline };
}
