/**
 * PollingRealtimeService – Polling-based real-time sync.
 *
 * Polls the dashboard repository's data version at regular intervals.
 * When the version changes (another user saved), emits a "data-changed"
 * event so the UI can reload.
 *
 * This is the Phase 2 fallback until Azure SignalR is deployed.
 * Once SignalR is available, this class can be replaced by
 * SignalRRealtimeService behind the same IRealtimeService interface.
 */

import type { IDashboardRepository } from "./IDashboardRepository";
import type {
  IRealtimeService,
  IRealtimeEvent,
  IDataChangedEvent,
  RealtimeEventHandler,
} from "./IRealtimeService";

/** Default polling interval in milliseconds. */
const DEFAULT_POLL_INTERVAL = 15000; // 15 seconds

export class PollingRealtimeService implements IRealtimeService {
  private _running = false;
  private _timer: ReturnType<typeof setInterval> | undefined;
  private _lastVersion = "";
  private _selectedPm = "";
  private readonly _handlers: Set<RealtimeEventHandler> = new Set();
  private readonly _pollInterval: number;

  constructor(
    private readonly repository: IDashboardRepository,
    pollInterval: number = DEFAULT_POLL_INTERVAL,
  ) {
    this._pollInterval = pollInterval;
  }

  get isRunning(): boolean {
    return this._running;
  }

  start(_currentUserId: string, _displayName: string): void {
    if (this._running) return;
    this._running = true;

    // Do an initial version check
    this._checkVersion().catch((err) => {
      console.error("[PollingRealtimeService] Initial version check failed:", err);
    });

    // Start polling
    this._timer = setInterval(() => {
      this._checkVersion().catch((err) => {
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
  }

  subscribe(handler: RealtimeEventHandler): () => void {
    this._handlers.add(handler);
    return () => {
      this._handlers.delete(handler);
    };
  }

  setSelectedPm(initials: string): void {
    this._selectedPm = initials;
    // Polling service doesn't broadcast presence (Phase 3: SignalR)
    // eslint-disable-next-line no-void
    void this._selectedPm;
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
}
