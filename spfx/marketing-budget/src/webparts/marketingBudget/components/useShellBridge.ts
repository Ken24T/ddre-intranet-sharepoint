/**
 * useShellBridge — PostMessage bridge between the Marketing Budget app
 * and the Intranet Shell sidebar.
 *
 * When embedded in an iframe, sends nav items to the shell and listens
 * for SIDEBAR_NAVIGATE messages. When `forceActive` is set (inline
 * rendering in the shell's dev harness), posts to the same window so
 * the shell's listener picks up the messages. In standalone mode this
 * hook is inert.
 *
 * Extracted from MarketingBudget.tsx to keep files under ~300 lines.
 */

import * as React from "react";
import type { IAppNavItem, AppToShellMessage } from "../../../appBridge";
import { isShellToAppMessage } from "../../../appBridge";
import type { AppViewKey } from "./MarketingBudget";
import { APP_NAV_ITEMS } from "./MarketingBudget";

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
 * Hook that manages the PostMessage bridge between the app and the
 * intranet shell. Sends SIDEBAR_SET_ITEMS on mount and SIDEBAR_ACTIVE
 * on view changes, and routes SIDEBAR_NAVIGATE messages to setActiveView.
 */
export function useShellBridge(
  activeView: AppViewKey,
  setActiveView: (view: AppViewKey) => void,
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
        window.parent.postMessage(msg, "*");
      } else {
        // Inline mode: post to same window (shell listens on window)
        window.postMessage(msg, "*");
      }
    },
    [isActive, isIframe],
  );

  /** On mount: send nav items to shell; listen for SIDEBAR_NAVIGATE. */
  React.useEffect(() => {
    if (!isActive) return;

    postToShell({
      type: "SIDEBAR_SET_ITEMS",
      items: APP_NAV_ITEMS as IAppNavItem[],
      activeKey: "budgets",
    });

    const handleMessage = (event: MessageEvent): void => {
      if (!isShellToAppMessage(event.data)) return;
      if (event.data.type === "SIDEBAR_NAVIGATE") {
        setActiveView(event.data.key as AppViewKey);
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
