/**
 * useShellBridge — PostMessage bridge between the PM Dashboard and
 * the Intranet Shell sidebar.
 *
 * When embedded in an iframe or running inline in the dev harness
 * (forceActive), sends nav items to the shell and listens for
 * SIDEBAR_NAVIGATE messages. In standalone mode, the hook is inert.
 *
 * Pattern adapted from Marketing Budget's useShellBridge.
 */

import * as React from "react";
import type { IAppNavItem, AppToShellMessage } from "../../intranetShell/components/appBridge";
import { isShellToAppMessage } from "../../intranetShell/components/appBridge";

/** Views available in the PM Dashboard. */
export type PmDashboardView = "dashboard" | "settings";

/** Navigation items shown in the shell sidebar when PM Dashboard is active. */
const NAV_ITEMS: IAppNavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "ViewDashboard" },
  { key: "settings", label: "Settings", icon: "Settings" },
];

interface IShellBridge {
  /** Whether the bridge is active (embedded in iframe or forced). */
  isEmbedded: boolean;
}

interface IShellBridgeOptions {
  /**
   * When true the bridge is active even when not inside an iframe.
   * Used by the Vite dev harness to render inline within the shell
   * while still driving the sidebar via PostMessage on the same window.
   */
  forceActive?: boolean;
}

/**
 * Hook that manages the PostMessage bridge between the PM Dashboard
 * and the intranet shell. Sends SIDEBAR_SET_ITEMS on mount and
 * SIDEBAR_ACTIVE on view changes, and routes SIDEBAR_NAVIGATE
 * messages to the provided callback.
 */
export function useShellBridge(
  activeView: PmDashboardView,
  setActiveView: (view: PmDashboardView) => void,
  options?: IShellBridgeOptions,
): IShellBridge {
  /** Detect whether we are running inside an iframe (embedded in shell). */
  const isIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true; // Cross-origin = embedded
    }
  }, []);

  /** Bridge is active if in an iframe OR if the host forced it on. */
  const isActive = isIframe || !!options?.forceActive;

  /** Send a message to the host shell. */
  const postToShell = React.useCallback(
    (msg: AppToShellMessage): void => {
      if (!isActive) return;
      if (isIframe && window.parent) {
        window.parent.postMessage(msg, window.location.origin);
      } else {
        // Inline mode: post to same window (shell listens on window)
        window.postMessage(msg, window.location.origin);
      }
    },
    [isActive, isIframe],
  );

  /** On mount: send nav items to shell; listen for SIDEBAR_NAVIGATE. */
  React.useEffect(() => {
    if (!isActive) return;

    postToShell({
      type: "SIDEBAR_SET_ITEMS",
      items: NAV_ITEMS,
      activeKey: activeView,
    });

    const handleMessage = (event: MessageEvent): void => {
      if (!isShellToAppMessage(event.data)) return;
      if (event.data.type === "SIDEBAR_NAVIGATE") {
        setActiveView(event.data.key as PmDashboardView);
      }
    };

    window.addEventListener("message", handleMessage);

    return (): void => {
      window.removeEventListener("message", handleMessage);
      postToShell({ type: "SIDEBAR_RESTORE" });
    };
  }, [isActive, postToShell, setActiveView]);

  /** When activeView changes, notify shell to update active indicator. */
  React.useEffect(() => {
    if (isActive) {
      postToShell({ type: "SIDEBAR_ACTIVE", key: activeView });
    }
  }, [activeView, isActive, postToShell]);

  return { isEmbedded: isActive };
}
