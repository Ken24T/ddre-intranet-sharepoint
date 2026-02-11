/**
 * App–Shell PostMessage Protocol — Re-export barrel.
 *
 * The canonical source for these types now lives in the shared package
 * `@ddre/pkg-app-bridge` (packages/pkg-app-bridge). This file re-exports
 * everything so existing relative imports within the SPFx solution
 * continue to work without changes.
 */
export {
  type IAppNavItem,
  type ISidebarSetItemsMessage,
  type ISidebarRestoreMessage,
  type ISidebarActiveMessage,
  type IAppNotificationItem,
  type INotificationUpdateMessage,
  type AppToShellMessage,
  type ISidebarNavigateMessage,
  type ShellToAppMessage,
  isAppToShellMessage,
  isShellToAppMessage,
} from '@ddre/pkg-app-bridge';
