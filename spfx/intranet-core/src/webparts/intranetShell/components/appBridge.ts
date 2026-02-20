/**
 * App–Shell PostMessage Protocol
 *
 * Defines the message types exchanged between an embedded app (running
 * in an iframe via card-detail) and the Intranet Shell.
 *
 * Direction: App → Shell  = messages the iframe sends to the parent
 * Direction: Shell → App   = messages the parent sends into the iframe
 *
 * Both sides must validate `event.origin` before processing messages.
 */

// ─────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────

/** A navigation item that an app can inject into the shell sidebar. */
export interface IAppNavItem {
  /** Unique key for this nav item (scoped to the app). */
  key: string;
  /** Display label shown in the sidebar. */
  label: string;
  /** Fluent UI icon name. */
  icon: string;
}

// ─────────────────────────────────────────────────────────────
// App → Shell messages
// ─────────────────────────────────────────────────────────────

/** App requests the shell replace the sidebar with app-specific nav items. */
export interface ISidebarSetItemsMessage {
  type: 'SIDEBAR_SET_ITEMS';
  /** Nav items to show in the sidebar (below the always-present Home item). */
  items: IAppNavItem[];
  /** The initially active item key. */
  activeKey?: string;
}

/** App requests the shell restore the default hub sidebar. */
export interface ISidebarRestoreMessage {
  type: 'SIDEBAR_RESTORE';
}

/** App notifies the shell which sidebar item is now active. */
export interface ISidebarActiveMessage {
  type: 'SIDEBAR_ACTIVE';
  key: string;
}

/** Union of all App → Shell messages. */
export type AppToShellMessage =
  | ISidebarSetItemsMessage
  | ISidebarRestoreMessage
  | ISidebarActiveMessage;

// ─────────────────────────────────────────────────────────────
// Shell → App messages
// ─────────────────────────────────────────────────────────────

/** Shell notifies the app that a sidebar item was clicked. */
export interface ISidebarNavigateMessage {
  type: 'SIDEBAR_NAVIGATE';
  key: string;
}

/** Union of all Shell → App messages. */
export type ShellToAppMessage = ISidebarNavigateMessage;

// ─────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────

/** Check whether a message is a valid App → Shell message. */
export function isAppToShellMessage(data: unknown): data is AppToShellMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as { type?: string };
  return (
    msg.type === 'SIDEBAR_SET_ITEMS' ||
    msg.type === 'SIDEBAR_RESTORE' ||
    msg.type === 'SIDEBAR_ACTIVE'
  );
}

/** Check whether a message is a valid Shell → App message. */
export function isShellToAppMessage(data: unknown): data is ShellToAppMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as { type?: string };
  return msg.type === 'SIDEBAR_NAVIGATE';
}
