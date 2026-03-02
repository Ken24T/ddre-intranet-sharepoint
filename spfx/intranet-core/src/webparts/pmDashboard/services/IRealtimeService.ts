/**
 * IRealtimeService – Abstraction for real-time data synchronisation.
 *
 * Defines the contract for detecting external data changes and
 * coordinating multi-user state. Implementations:
 *
 * - PollingRealtimeService: polls SharePoint list Modified timestamp
 * - (Future) SignalRRealtimeService: Azure SignalR via proxy
 *
 * The service emits events when:
 * - External data changes are detected (another user saved)
 * - User presence changes (connect/disconnect/PM selection)
 */

export interface IRealtimeEvent {
  /** Type of real-time event. */
  type: "data-changed" | "presence-changed";
  /** ISO timestamp of when the event occurred. */
  timestamp: string;
}

export interface IDataChangedEvent extends IRealtimeEvent {
  type: "data-changed";
  /** The new version identifier (e.g. Modified timestamp). */
  version: string;
}

export interface IPresenceUser {
  /** Unique user identifier (email). */
  userId: string;
  /** Display name. */
  displayName: string;
  /** ISO timestamp of last heartbeat. */
  lastSeen: string;
  /** Which PM the user has selected (initials), or empty. */
  selectedPm: string;
  /** Assigned colour for the presence dot. */
  colour: string;
}

export interface IPresenceChangedEvent extends IRealtimeEvent {
  type: "presence-changed";
  /** All currently online users. */
  users: IPresenceUser[];
}

export type RealtimeEventHandler = (event: IRealtimeEvent) => void;

export interface IRealtimeService {
  /**
   * Start the real-time service. Begins polling or opens connection.
   * @param currentUserId The current user's email/ID for presence.
   * @param displayName The current user's display name.
   */
  start(currentUserId: string, displayName: string): void;

  /** Stop the service and clean up resources. */
  stop(): void;

  /** Whether the service is currently running. */
  readonly isRunning: boolean;

  /**
   * Subscribe to real-time events.
   * @returns An unsubscribe function.
   */
  subscribe(handler: RealtimeEventHandler): () => void;

  /**
   * Update the current user's selected PM.
   * This is broadcast to other users for presence display.
   */
  setSelectedPm(initials: string): void;

  /**
   * Signal that the current user just made a data change.
   * This triggers a version bump so other users detect the change.
   */
  notifyDataChanged(): void;
}
