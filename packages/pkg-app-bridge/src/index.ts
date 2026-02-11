/**
 * @ddre/pkg-app-bridge — Barrel export
 *
 * Re-exports all protocol types and type guards for the
 * App–Shell PostMessage bridge.
 */
export {
  type IAppNavItem,
  type ISidebarSetItemsMessage,
  type ISidebarRestoreMessage,
  type ISidebarActiveMessage,
  type IAppNotificationItem,
  type INotificationUpdateMessage,
  type IAuditEventMessage,
  type AppToShellMessage,
  type ISidebarNavigateMessage,
  type ShellToAppMessage,
  isAppToShellMessage,
  isShellToAppMessage,
} from './protocol';
