/**
 * useRealtimeSync – Hook for real-time data synchronisation.
 *
 * Connects to an IRealtimeService and triggers a data reload
 * callback when external changes are detected. Also tracks
 * online user presence for the PresenceBar component.
 * Manages the service lifecycle (start/stop) tied to the component mount.
 */

import * as React from "react";
import type {
  IRealtimeService,
  IRealtimeEvent,
  IDataChangedEvent,
  IPresenceChangedEvent,
  IPresenceUser,
} from "../services/IRealtimeService";

export interface IUseRealtimeSyncOptions {
  /** The real-time service instance. */
  service: IRealtimeService | undefined;
  /** Current user's email/ID. */
  currentUserId: string;
  /** Current user's display name. */
  displayName: string;
  /** Called when external data changes are detected. */
  onDataChanged: () => void;
  /** Whether the service should be active. */
  enabled?: boolean;
}

export interface IRealtimeSyncState {
  /** Whether the real-time service is connected. */
  isConnected: boolean;
  /** The last data version token received. */
  lastVersion: string;
  /** Currently online users. */
  onlineUsers: IPresenceUser[];
}

/**
 * Hook that manages a real-time sync service lifecycle.
 *
 * Starts the service on mount, stops on unmount, and
 * triggers `onDataChanged` when external modifications
 * are detected. Tracks online users via presence events.
 */
export function useRealtimeSync(
  options: IUseRealtimeSyncOptions,
): IRealtimeSyncState {
  const {
    service,
    currentUserId,
    displayName,
    onDataChanged,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = React.useState(false);
  const [lastVersion, setLastVersion] = React.useState("");
  const [onlineUsers, setOnlineUsers] = React.useState<IPresenceUser[]>([]);

  // Keep onDataChanged stable via ref to avoid re-subscribing
  const onDataChangedRef = React.useRef(onDataChanged);
  onDataChangedRef.current = onDataChanged;

  React.useEffect(() => {
    if (!service || !enabled || !currentUserId) return;

    // Subscribe to events
    const unsubscribe = service.subscribe((event: IRealtimeEvent) => {
      if (event.type === "data-changed") {
        setLastVersion(
          (event as IDataChangedEvent).version,
        );
        onDataChangedRef.current();
      } else if (event.type === "presence-changed") {
        setOnlineUsers(
          (event as IPresenceChangedEvent).users,
        );
      }
    });

    // Start the service
    service.start(currentUserId, displayName);
    setIsConnected(true);

    return () => {
      unsubscribe();
      service.stop();
      setIsConnected(false);
      setOnlineUsers([]);
    };
  }, [service, currentUserId, displayName, enabled]);

  return { isConnected, lastVersion, onlineUsers };
}
