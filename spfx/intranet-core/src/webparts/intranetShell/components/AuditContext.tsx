import * as React from 'react';

// =============================================================================
// TYPES - Matches AuditClient types from pkg-api-client
// =============================================================================

export type EventType =
  | 'navigation'
  | 'card_action'
  | 'settings'
  | 'content_view'
  | 'search'
  | 'user_interaction'
  | 'notification'
  | 'system'
  | 'error'
  | 'help_search';
export type HelpSearchAction =
  | 'search_executed'
  | 'search_no_results'
  | 'article_opened'
  | 'feedback_submitted'
  | 'article_printed'
  | 'article_link_copied'
  | 'article_pdf_requested'
  | 'related_article_clicked';

export type NavigationAction =
  | 'hub_changed'
  | 'page_view'
  | 'sidebar_expanded'
  | 'sidebar_collapsed'
  | 'breadcrumb_clicked'
  | 'back_navigation'
  | 'external_link_clicked';

export type CardAction =
  | 'card_opened'
  | 'card_closed'
  | 'card_favourited'
  | 'card_unfavourited'
  | 'card_settings_opened'
  | 'card_refreshed'
  | 'card_expanded'
  | 'card_collapsed';

export type SettingsAction =
  | 'theme_changed'
  | 'layout_changed'
  | 'preference_updated'
  | 'sidebar_pinned'
  | 'sidebar_unpinned'
  | 'notifications_toggled'
  | 'settings_panel_opened'
  | 'settings_panel_closed';

export type ContentViewAction =
  | 'document_opened'
  | 'document_downloaded'
  | 'dashboard_viewed'
  | 'report_viewed'
  | 'list_viewed'
  | 'detail_viewed'
  | 'preview_opened';

export type SearchAction =
  | 'search_executed'
  | 'search_result_clicked'
  | 'search_cleared'
  | 'filter_applied'
  | 'filter_cleared'
  | 'sort_changed';

export type UserInteractionAction =
  | 'chat_started'
  | 'chat_message_sent'
  | 'chat_ended'
  | 'message_sent'
  | 'message_read'
  | 'user_profile_viewed'
  | 'ai_query_submitted'
  | 'ai_response_received'
  | 'ai_feedback_given'
  | 'help_tooltip_viewed'
  | 'help_tooltip_learn_more'
  | 'feedback_form_submitted'
  | 'feedback_form_opened';

export type NotificationAction =
  | 'notification_received'
  | 'notification_clicked'
  | 'notification_dismissed'
  | 'notification_settings_changed'
  | 'notification_created'
  | 'notification_scheduled';

export type SystemAction =
  | 'session_started'
  | 'session_ended'
  | 'session_timeout'
  | 'app_loaded'
  | 'app_error'
  | 'api_call_made'
  | 'api_call_failed';

export type ErrorAction =
  | 'javascript_error'
  | 'api_error'
  | 'permission_denied'
  | 'resource_not_found'
  | 'validation_error';

// =============================================================================
// AUDIT LOGGER INTERFACE
// =============================================================================

export interface LogOptions {
  hub?: string;
  tool?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for audit logging.
 * Implemented by AuditClient (production) and ConsoleAuditLogger (dev).
 */
export interface IAuditLogger {
  /** Log a navigation event */
  logNavigation(action: NavigationAction, options?: LogOptions): void;
  /** Log a card action event */
  logCardAction(action: CardAction, options?: LogOptions): void;
  /** Log a settings change event */
  logSettings(action: SettingsAction, options?: LogOptions): void;
  /** Log a content view event */
  logContentView(action: ContentViewAction, options?: LogOptions): void;
  /** Log a search event */
  logSearch(action: SearchAction, options?: LogOptions): void;
  /** Log a user interaction event */
  logUserInteraction(action: UserInteractionAction, options?: LogOptions): void;
  /** Log a notification event */
  logNotification(action: NotificationAction, options?: LogOptions): void;
  /** Log a system event */
  logSystem(action: SystemAction, options?: LogOptions): void;
  /** Log an error event */
  logError(action: ErrorAction, options?: LogOptions): void;
  /** Log a help search event */
  logHelpSearch(action: HelpSearchAction, options?: LogOptions): void;
  /** Check if logging is enabled */
  isEnabled(): boolean;
  /** Enable/disable logging */
  setEnabled(enabled: boolean): void;
  /** Get session ID */
  getSessionId(): string;
}

// =============================================================================
// CONSOLE LOGGER (Dev/Mock)
// =============================================================================

/**
 * Console-based audit logger for development.
 * Logs events to console instead of sending to API.
 */
export class ConsoleAuditLogger implements IAuditLogger {
  private enabled: boolean = true;
  private readonly sessionId: string;

  constructor() {
    this.sessionId = this.generateUuid();
    console.log('[AuditLogger] Dev mode - logging to console. Session:', this.sessionId);
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private log(eventType: EventType, action: string, options?: LogOptions): void {
    if (!this.enabled) return;
    
    console.log(
      `%c[Audit] ${eventType}:${action}`,
      'color: #6264a7; font-weight: bold;',
      options ?? {}
    );
  }

  logNavigation(action: NavigationAction, options?: LogOptions): void {
    this.log('navigation', action, options);
  }

  logCardAction(action: CardAction, options?: LogOptions): void {
    this.log('card_action', action, options);
  }

  logSettings(action: SettingsAction, options?: LogOptions): void {
    this.log('settings', action, options);
  }

  logContentView(action: ContentViewAction, options?: LogOptions): void {
    this.log('content_view', action, options);
  }

  logSearch(action: SearchAction, options?: LogOptions): void {
    this.log('search', action, options);
  }

  logUserInteraction(action: UserInteractionAction, options?: LogOptions): void {
    this.log('user_interaction', action, options);
  }

  logNotification(action: NotificationAction, options?: LogOptions): void {
    this.log('notification', action, options);
  }

  logSystem(action: SystemAction, options?: LogOptions): void {
    this.log('system', action, options);
  }

  logError(action: ErrorAction, options?: LogOptions): void {
    this.log('error', action, options);
  }

  logHelpSearch(action: HelpSearchAction, options?: LogOptions): void {
    this.log('help_search', action, options);
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
}

// =============================================================================
// REACT CONTEXT
// =============================================================================

const AuditContext = React.createContext<IAuditLogger | null>(null);

export interface AuditProviderProps {
  logger: IAuditLogger;
  children: React.ReactNode;
}

/**
 * Provider for audit logging context.
 */
export const AuditProvider: React.FC<AuditProviderProps> = ({ logger, children }) => {
  return (
    <AuditContext.Provider value={logger}>
      {children}
    </AuditContext.Provider>
  );
};

/**
 * Hook to access the audit logger.
 * Returns a no-op logger if used outside provider (safe fallback).
 */
export function useAudit(): IAuditLogger {
  const logger = React.useContext(AuditContext);
  
  if (!logger) {
    // Return a no-op logger as fallback (for tests, etc.)
    return {
      logNavigation: () => {},
      logCardAction: () => {},
      logSettings: () => {},
      logContentView: () => {},
      logSearch: () => {},
      logUserInteraction: () => {},
      logNotification: () => {},
      logSystem: () => {},
      logError: () => {},
      logHelpSearch: () => {},
      isEnabled: () => false,
      setEnabled: () => {},
      getSessionId: () => 'no-session',
    };
  }
  
  return logger;
}

export default AuditContext;
