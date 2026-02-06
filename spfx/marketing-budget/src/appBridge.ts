/**
 * App–Shell PostMessage Protocol
 *
 * Shared type definitions for messages exchanged between this embedded
 * app (running inside an iframe) and the Intranet Shell (parent window).
 *
 * This file is an exact copy of the protocol defined in intranet-core's
 * appBridge.ts. When a shared package is available, both will import
 * from the same source.
 */

// ─────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────

/** A navigation item that an app can inject into the shell sidebar. */
export interface IAppNavItem {
  key: string;
  label: string;
  icon: string;
}

// ─────────────────────────────────────────────────────────────
// App → Shell messages
// ─────────────────────────────────────────────────────────────

export interface ISidebarSetItemsMessage {
  type: 'SIDEBAR_SET_ITEMS';
  items: IAppNavItem[];
  activeKey?: string;
}

export interface ISidebarRestoreMessage {
  type: 'SIDEBAR_RESTORE';
}

export interface ISidebarActiveMessage {
  type: 'SIDEBAR_ACTIVE';
  key: string;
}

export type AppToShellMessage =
  | ISidebarSetItemsMessage
  | ISidebarRestoreMessage
  | ISidebarActiveMessage;

// ─────────────────────────────────────────────────────────────
// Shell → App messages
// ─────────────────────────────────────────────────────────────

export interface ISidebarNavigateMessage {
  type: 'SIDEBAR_NAVIGATE';
  key: string;
}

export type ShellToAppMessage = ISidebarNavigateMessage;

// ─────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────

export function isShellToAppMessage(data: unknown): data is ShellToAppMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as { type?: string };
  return msg.type === 'SIDEBAR_NAVIGATE';
}
