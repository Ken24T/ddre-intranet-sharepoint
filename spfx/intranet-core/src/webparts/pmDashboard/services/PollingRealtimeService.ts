/**
 * PollingRealtimeService – Polling-based real-time sync.
 *
 * Polls the dashboard repository's data version at regular intervals.
 * When the version changes (another user saved), emits a "data-changed"
 * event so the UI can reload.
 *
 * Also manages user presence via an optional IPresenceRepository:
 * - Sends heartbeats every poll cycle
 * - Loads online users and emits "presence-changed" events
 *
 * This is the Phase 2 fallback until Azure SignalR is deployed.
 * Once SignalR is available, this class can be replaced by
 * SignalRRealtimeService behind the same IRealtimeService interface.
 */

import type { IDashboardRepository } from "./IDashboardRepository";
import type { IPresenceRepository, IPresenceRecord } from "./IPresenceRepository";
import type {
  IRealtimeService,
  IRealtimeEvent,
  IDataChangedEvent,
  IPresenceChangedEvent,
  IPresenceUser,
  RealtimeEventHandler,
} from "./IRealtimeService";

/** Default polling interval in milliseconds. */
const DEFAULT_POLL_INTERVAL = 15000; // 15 seconds

/** Users not seen within this window are considered offline. */
const PRESENCE_TIMEOUT_MS = 60000; // 60 seconds

/** Colour palette for user presence dots. */
const PRESENCE_COLOURS = [
  "#001CAD", "#E81123", "#00B294", "#FF8C00",
  "#8764B8", "#0078D4", "#C239B3", "#498205",
];

export class PollingRealtimeService implements IRealtimeService {
  private _running = false;
  private _timer: ReturnType<typeof setInterval> | undefined;
  private _lastVersion = "";
  private _selectedPm = "";
  private _currentUserId = "";
  private _displayName = "";
  private _colour = "";
  private readonly _handlers: Set<RealtimeEventHandler> = new Set();
  private readonly _pollInterval: number;

  constructor(
    private readonly repository: IDashboardRepository,
    private readonly presenceRepository?: IPresenceRepository,
    pollInterval: number = DEFAULT_POLL_INTERVAL,
  ) {
    this._pollInterval = pollInterval;
  }

  get isRunning(): boolean {
    return this._running;
  }

  start(currentUserId: string, displayName: string): void {
    if (this._running) return;
    this._running = true;
    this._currentUserId = currentUserId;
    this._displayName = displayName;
    this._colour = this._assignColour(currentUserId);

    // Do an initial version check + presence heartbeat
    this._poll().catch((err) => {
      console.error("[PollingRealtimeService] Initial poll failed:", err);
    });

    // Start polling
    this._timer = setInterval(() => {
      this._poll().catch((err) => {
        console.error("[PollingRealtimeService] Poll failed:", err);
      });
    }, this._pollInterval);
  }

  stop(): void {
    this._running = false;
    if (this._timer !== undefined) {
      clearInterval(this._timer);
      this._timer = undefined;
    }
    // Remove presence record on stop
    if (this.presenceRepository && this._currentUserId) {
      this.presenceRepository.remove(this._currentUserId).catch((err) => {
        console.error("[PollingRealtimeService] Presence cleanup failed:", err);
      });
    }
  }

  subscribe(handler: RealtimeEventHandler): () => void {
    this._handlers.add(handler);
    return () => {
      this._handlers.delete(handler);
    };
  }

  setSelectedPm(initials: string): void {
    this._selectedPm = initials;
    // Immediately heartbeat with new PM selection
    if (this.presenceRepository && this._currentUserId) {
      this._sendHeartbeat().catch((err) => {
        console.error("[PollingRealtimeService] Heartbeat after PM change failed:", err);
      });
    }
  }

  notifyDataChanged(): void {
    // Update local version to avoid self-triggering a reload.
    // The next poll will fetch the new version from the server,
    // which will match our local copy (no event emitted).
    this.repository
      .getDataVersion()
      .then((v) => {
        this._lastVersion = v;
      })
      .catch(() => {
        // Ignore — next poll will detect the change
      });
  }

  // ─── Private ────────────────────────────────────────────

  /**
   * Combined poll: check data version + presence heartbeat/load.
   */
  private async _poll(): Promise<void> {
    await Promise.all([
      this._checkVersion(),
      this._handlePresence(),
    ]);
  }

  /**
   * Send heartbeat and load online users.
   */
  private async _handlePresence(): Promise<void> {
    if (!this.presenceRepository || !this._currentUserId) return;

    await this._sendHeartbeat();
    await this._checkPresence();
  }

  /**
   * Write a heartbeat record for the current user.
   */
  private async _sendHeartbeat(): Promise<void> {
    if (!this.presenceRepository || !this._currentUserId) return;

    const record: IPresenceRecord = {
      userId: this._currentUserId,
      displayName: this._displayName,
      lastSeen: new Date().toISOString(),
      selectedPm: this._selectedPm,
      colour: this._colour,
    };

    await this.presenceRepository.heartbeat(record);
  }

  /**
   * Load all presence records, filter to online users, and emit event.
   */
  private async _checkPresence(): Promise<void> {
    if (!this.presenceRepository) return;

    const allRecords = await this.presenceRepository.loadAll();
    const now = Date.now();

    // Filter to users seen within the timeout window
    const onlineUsers: IPresenceUser[] = [];
    for (let i = 0; i < allRecords.length; i++) {
      const rec = allRecords[i];
      const lastSeen = new Date(rec.lastSeen).getTime();
      if (now - lastSeen < PRESENCE_TIMEOUT_MS) {
        onlineUsers.push({
          userId: rec.userId,
          displayName: rec.displayName,
          lastSeen: rec.lastSeen,
          selectedPm: rec.selectedPm,
          colour: rec.colour,
        });
      }
    }

    const event: IPresenceChangedEvent = {
      type: "presence-changed",
      timestamp: new Date().toISOString(),
      users: onlineUsers,
    };

    this._emit(event);
  }

  private async _checkVersion(): Promise<void> {
    const version = await this.repository.getDataVersion();

    // Skip if version is empty (not supported, e.g. Dexie)
    if (!version) return;

    // First check — store baseline, don't emit
    if (!this._lastVersion) {
      this._lastVersion = version;
      return;
    }

    // Version changed — another user saved
    if (version !== this._lastVersion) {
      this._lastVersion = version;
      const event: IDataChangedEvent = {
        type: "data-changed",
        timestamp: new Date().toISOString(),
        version,
      };
      this._emit(event);
    }
  }

  private _emit(event: IRealtimeEvent): void {
    this._handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error("[PollingRealtimeService] Handler error:", err);
      }
    });
  }

  /**
   * Assign a consistent colour based on a simple hash of the user ID.
   */
  private _assignColour(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % PRESENCE_COLOURS.length;
    return PRESENCE_COLOURS[index];
  }
}
