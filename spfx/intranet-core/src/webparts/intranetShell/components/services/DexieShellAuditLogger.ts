/**
 * DexieShellAuditLogger — IndexedDB-backed audit logger for the
 * intranet shell.  Implements the same IAuditLogger interface as
 * ConsoleAuditLogger / AuditClient so it's a drop-in replacement.
 *
 * Used in the local dev workbench so that audit events persist
 * across page reloads and are visible in the AuditLogViewer.
 *
 * In production, IntranetShellWrapper passes an AuditClient
 * instead — no component code changes required.
 */

import type {
  IAuditLogger,
  EventType,
  NavigationAction,
  CardAction,
  SettingsAction,
  ContentViewAction,
  SearchAction,
  UserInteractionAction,
  NotificationAction,
  SystemAction,
  ErrorAction,
  HelpSearchAction,
  LogOptions,
} from "../AuditContext";
import { shellAuditDb } from "./shellAuditDb";
import type { ShellAuditEntry } from "./shellAuditDb";

export class DexieShellAuditLogger implements IAuditLogger {
  private enabled: boolean = true;
  private readonly sessionId: string;
  private readonly userId: string;
  private readonly userDisplayName: string;
  private readonly appVersion: string;

  constructor(
    userId: string = "dev-user@localhost",
    userDisplayName: string = "Dev User",
    appVersion: string = "0.0.0-dev",
  ) {
    this.userId = userId;
    this.userDisplayName = userDisplayName;
    this.appVersion = appVersion;
    this.sessionId = this.generateUuid();
  }

  // ─── Core write ──────────────────────────────────────────

  private write(
    eventType: EventType,
    action: string,
    options?: LogOptions,
  ): void {
    if (!this.enabled) return;

    const entry: ShellAuditEntry = {
      eventId: this.generateUuid(),
      eventType,
      action,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      userDisplayName: this.userDisplayName,
      sessionId: this.sessionId,
      appVersion: this.appVersion,
      hub: options?.hub,
      tool: options?.tool,
      metadata: options?.metadata,
    };

    // Fire-and-forget — don't block the UI.
    shellAuditDb.events.add(entry).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[DexieShellAuditLogger] write failed:", err);
    });
  }

  // ─── IAuditLogger methods ────────────────────────────────

  logNavigation(action: NavigationAction, options?: LogOptions): void {
    this.write("navigation", action, options);
  }

  logCardAction(action: CardAction, options?: LogOptions): void {
    this.write("card_action", action, options);
  }

  logSettings(action: SettingsAction, options?: LogOptions): void {
    this.write("settings", action, options);
  }

  logContentView(action: ContentViewAction, options?: LogOptions): void {
    this.write("content_view", action, options);
  }

  logSearch(action: SearchAction, options?: LogOptions): void {
    this.write("search", action, options);
  }

  logUserInteraction(
    action: UserInteractionAction,
    options?: LogOptions,
  ): void {
    this.write("user_interaction", action, options);
  }

  logNotification(action: NotificationAction, options?: LogOptions): void {
    this.write("notification", action, options);
  }

  logSystem(action: SystemAction, options?: LogOptions): void {
    this.write("system", action, options);
  }

  logError(action: ErrorAction, options?: LogOptions): void {
    this.write("error", action, options);
  }

  logHelpSearch(action: HelpSearchAction, options?: LogOptions): void {
    this.write("help_search", action, options);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // ─── Helpers ─────────────────────────────────────────────

  private generateUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
