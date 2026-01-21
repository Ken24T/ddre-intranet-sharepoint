import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { BaseClient } from "../core/BaseClient";
import type { ApiClientConfig } from "../core/types";

// =============================================================================
// TYPES - Event Taxonomy (from audit-log-events.schema.json)
// =============================================================================

/**
 * High-level event categories.
 */
export type EventType =
  | "navigation"
  | "card_action"
  | "settings"
  | "content_view"
  | "search"
  | "user_interaction"
  | "notification"
  | "system"
  | "error"
  | "help_search";
/**
 * Help search actions.
 */
export type HelpSearchAction =
  | "search_executed"
  | "search_no_results"
  | "article_opened"
  | "feedback_submitted";

/**
 * Navigation actions.
 */
export type NavigationAction =
  | "hub_changed"
  | "page_view"
  | "sidebar_expanded"
  | "sidebar_collapsed"
  | "breadcrumb_clicked"
  | "back_navigation"
  | "external_link_clicked";

/**
 * Card actions.
 */
export type CardAction =
  | "card_opened"
  | "card_closed"
  | "card_favourited"
  | "card_unfavourited"
  | "card_settings_opened"
  | "card_refreshed"
  | "card_expanded"
  | "card_collapsed";

/**
 * Settings actions.
 */
export type SettingsAction =
  | "theme_changed"
  | "layout_changed"
  | "preference_updated"
  | "sidebar_pinned"
  | "sidebar_unpinned"
  | "notifications_toggled"
  | "settings_panel_opened"
  | "settings_panel_closed";

/**
 * Content view actions.
 */
export type ContentViewAction =
  | "document_opened"
  | "document_downloaded"
  | "dashboard_viewed"
  | "report_viewed"
  | "list_viewed"
  | "detail_viewed"
  | "preview_opened";

/**
 * Search actions.
 */
export type SearchAction =
  | "search_executed"
  | "search_result_clicked"
  | "search_cleared"
  | "filter_applied"
  | "filter_cleared"
  | "sort_changed";

/**
 * User interaction actions.
 */
export type UserInteractionAction =
  | "chat_started"
  | "chat_message_sent"
  | "chat_ended"
  | "message_sent"
  | "message_read"
  | "user_profile_viewed"
  | "ai_query_submitted"
  | "ai_response_received"
  | "ai_feedback_given";

/**
 * Notification actions.
 */
export type NotificationAction =
  | "notification_received"
  | "notification_clicked"
  | "notification_dismissed"
  | "notification_settings_changed"
  | "notification_created"
  | "notification_scheduled";

/**
 * System actions.
 */
export type SystemAction =
  | "session_started"
  | "session_ended"
  | "session_timeout"
  | "app_loaded"
  | "app_error"
  | "api_call_made"
  | "api_call_failed";

/**
 * Error actions.
 */
export type ErrorAction =
  | "javascript_error"
  | "api_error"
  | "permission_denied"
  | "resource_not_found"
  | "validation_error";

/**
 * All possible actions by event type.
 */
export type ActionByEventType = {
  navigation: NavigationAction;
  card_action: CardAction;
  settings: SettingsAction;
  content_view: ContentViewAction;
  search: SearchAction;
  user_interaction: UserInteractionAction;
  notification: NotificationAction;
  system: SystemAction;
  error: ErrorAction;
  help_search: HelpSearchAction;
};

// =============================================================================
// TYPES - Event Payload
// =============================================================================

/**
 * Base audit event structure.
 */
export interface AuditEvent<T extends EventType = EventType> {
  eventId: string;
  eventType: T;
  action: ActionByEventType[T];
  timestamp: string;
  userId: string;
  userDisplayName?: string;
  sessionId: string;
  appVersion: string;
  hub?: string;
  tool?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  screenResolution?: string;
  referrer?: string;
}

/**
 * Batch submission request.
 */
export interface EventBatch {
  events: AuditEvent[];
  clientTimestamp: string;
}

/**
 * Batch submission response.
 */
export interface EventBatchResponse {
  accepted: number;
  failed: number;
  errors?: Array<{
    eventId: string;
    error: string;
  }>;
}

/**
 * Configuration for the audit client.
 */
export interface AuditClientConfig extends ApiClientConfig {
  /**
   * Application version to include in all events.
   */
  appVersion: string;

  /**
   * Maximum events to batch before auto-flush.
   * @default 20
   */
  batchSize?: number;

  /**
   * Maximum time (ms) to hold events before auto-flush.
   * @default 5000
   */
  flushInterval?: number;

  /**
   * Number of retry attempts for failed submissions.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Enable/disable logging (can be toggled at runtime).
   * @default true
   */
  enabled?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate a UUID v4.
 */
function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current screen resolution.
 */
function getScreenResolution(): string {
  if (typeof window !== "undefined" && window.screen) {
    return `${window.screen.width}x${window.screen.height}`;
  }
  return "unknown";
}

/**
 * Get user agent string.
 */
function getUserAgent(): string {
  if (typeof navigator !== "undefined") {
    return navigator.userAgent;
  }
  return "unknown";
}

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Client for audit log submission.
 * Provides typed event builders, automatic batching, and retry logic.
 */
class AuditClient extends BaseClient {
  private readonly appVersion: string;
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private readonly maxRetries: number;
  private enabled: boolean;

  private sessionId: string;
  private eventQueue: AuditEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isFlushing: boolean = false;

  constructor(config: AuditClientConfig) {
    super(config);
    this.appVersion = config.appVersion;
    this.batchSize = config.batchSize ?? 20;
    this.flushInterval = config.flushInterval ?? 5000;
    this.maxRetries = config.maxRetries ?? 3;
    this.enabled = config.enabled ?? true;
    this.sessionId = generateUuid();

    // Auto-flush on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.flush();
      });

      // Also flush on visibility change (tab hidden)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      });
    }
  }

  protected getHealthPath(): string {
    return "/api/v1/audit/health";
  }

  // ===========================================================================
  // PUBLIC API - Configuration
  // ===========================================================================

  /**
   * Enable or disable logging.
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.eventQueue = [];
      this.stopFlushTimer();
    }
  }

  /**
   * Check if logging is enabled.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the current session ID.
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start a new session (e.g., after logout/login).
   */
  public newSession(): string {
    this.sessionId = generateUuid();
    return this.sessionId;
  }

  // ===========================================================================
  // PUBLIC API - Typed Event Loggers
  // ===========================================================================

  /**
   * Log a navigation event.
   */
  public logNavigation(
    action: NavigationAction,
    options?: {
      hub?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("navigation", action, options);
  }

  /**
   * Log a card action event.
   */
  public logCardAction(
    action: CardAction,
    options?: {
      hub?: string;
      tool?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("card_action", action, options);
  }

  /**
   * Log a settings change event.
   */
  public logSettings(
    action: SettingsAction,
    options?: {
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("settings", action, options);
  }

  /**
   * Log a content view event.
   */
  public logContentView(
    action: ContentViewAction,
    options?: {
      hub?: string;
      tool?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("content_view", action, options);
  }

  /**
   * Log a search event.
   */
  public logSearch(
    action: SearchAction,
    options?: {
      hub?: string;
      tool?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("search", action, options);
  }

  /**
   * Log a user interaction event.
   */
  public logUserInteraction(
    action: UserInteractionAction,
    options?: {
      hub?: string;
      tool?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("user_interaction", action, options);
  }

  /**
   * Log a notification event.
   */
  public logNotification(
    action: NotificationAction,
    options?: {
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("notification", action, options);
  }

  /**
   * Log a system event.
   */
  public logSystem(
    action: SystemAction,
    options?: {
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("system", action, options);
  }

  /**
   * Log an error event.
   */
  public logError(
    action: ErrorAction,
    options?: {
      hub?: string;
      tool?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.log("error", action, options);
  }

  // ===========================================================================
  // PUBLIC API - Flush
  // ===========================================================================

  /**
   * Manually flush pending events.
   * Returns the number of events submitted.
   */
  public async flush(): Promise<number> {
    if (this.eventQueue.length === 0 || this.isFlushing) {
      return 0;
    }

    this.stopFlushTimer();
    this.isFlushing = true;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.submitWithRetry(eventsToSend);
      return eventsToSend.length;
    } catch (error) {
      // Re-queue failed events (at the front) for next attempt
      this.eventQueue = [...eventsToSend, ...this.eventQueue];
      console.error("[AuditClient] Failed to submit events:", error);
      return 0;
    } finally {
      this.isFlushing = false;
      this.startFlushTimer();
    }
  }

  // ===========================================================================
  // PRIVATE - Core Logging
  // ===========================================================================

  private log<T extends EventType>(
    eventType: T,
    action: ActionByEventType[T],
    options?: {
      hub?: string;
      tool?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    if (!this.enabled) {
      return;
    }

    const user = this.context.pageContext.user;

    const event: AuditEvent<T> = {
      eventId: generateUuid(),
      eventType,
      action,
      timestamp: new Date().toISOString(),
      userId: user.loginName,
      userDisplayName: user.displayName,
      sessionId: this.sessionId,
      appVersion: this.appVersion,
      hub: options?.hub,
      tool: options?.tool,
      metadata: options?.metadata,
      userAgent: getUserAgent(),
      screenResolution: getScreenResolution(),
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    };

    this.eventQueue.push(event);

    // Auto-flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flush().catch(console.error);
    } else {
      this.startFlushTimer();
    }
  }

  // ===========================================================================
  // PRIVATE - Submission with Retry
  // ===========================================================================

  private async submitWithRetry(events: AuditEvent[]): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const batch: EventBatch = {
          events,
          clientTimestamp: new Date().toISOString(),
        };

        const response = await this.post<EventBatchResponse>(
          "/api/v1/audit/events",
          batch
        );

        if (response.failed > 0) {
          console.warn(
            `[AuditClient] ${response.failed} events failed validation:`,
            response.errors
          );
        }

        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw lastError ?? new Error("Failed to submit events after retries");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===========================================================================
  // PRIVATE - Timer Management
  // ===========================================================================

  private startFlushTimer(): void {
    if (this.flushTimer === null && this.eventQueue.length > 0) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flush().catch(console.error);
      }, this.flushInterval);
    }
  }

  private stopFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create an audit client instance.
 *
 * @example
 * ```typescript
 * const auditClient = createAuditClient(this.context, this.manifest.version);
 *
 * // Log a navigation event
 * auditClient.logNavigation('hub_changed', {
 *   hub: 'sales',
 *   metadata: { previousHub: 'home' }
 * });
 *
 * // Log a card action
 * auditClient.logCardAction('card_opened', {
 *   hub: 'sales',
 *   tool: 'vault-dashboard',
 *   metadata: { cardId: 'contacts' }
 * });
 * ```
 */
export function createAuditClient(
  context: WebPartContext,
  appVersion: string,
  options?: {
    baseUrl?: string;
    batchSize?: number;
    flushInterval?: number;
    maxRetries?: number;
    enabled?: boolean;
  }
): AuditClient {
  return new AuditClient({
    context,
    appVersion,
    baseUrl: options?.baseUrl,
    batchSize: options?.batchSize,
    flushInterval: options?.flushInterval,
    maxRetries: options?.maxRetries,
    enabled: options?.enabled,
  });
}
