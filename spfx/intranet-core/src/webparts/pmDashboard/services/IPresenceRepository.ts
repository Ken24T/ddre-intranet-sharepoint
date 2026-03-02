/**
 * IPresenceRepository – Abstraction for user presence storage.
 *
 * Manages per-user presence records (heartbeats) that track
 * who is online and what PM they have selected.
 */

export interface IPresenceRecord {
  userId: string;
  displayName: string;
  lastSeen: string;
  selectedPm: string;
  colour: string;
  /** ISO timestamp of the user's last data change (save). */
  lastChanged: string;
}

export interface IPresenceRepository {
  /**
   * Write a heartbeat for the current user.
   * Creates or updates the user's presence record.
   */
  heartbeat(record: IPresenceRecord): Promise<void>;

  /**
   * Load all presence records.
   * Returns all users (caller should filter by lastSeen for "online" status).
   */
  loadAll(): Promise<IPresenceRecord[]>;

  /**
   * Remove the current user's presence record (disconnect).
   */
  remove(userId: string): Promise<void>;
}
