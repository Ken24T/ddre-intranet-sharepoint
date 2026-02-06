/**
 * useShellBridge — PostMessage bridge between the Marketing Budget app
 * and the Intranet Shell sidebar.
 *
 * When embedded in an iframe, sends nav items to the shell and listens
 * for SIDEBAR_NAVIGATE messages. In standalone mode, this hook is inert.
 *
 * Extracted from MarketingBudget.tsx to keep files under ~300 lines.
 */

import * as React from "react";
import type { IAppNavItem, AppToShellMessage } from "../../../appBridge";
import { isShellToAppMessage } from "../../../appBridge";
import type { AppViewKey } from "./MarketingBudget";
import { APP_NAV_ITEMS } from "./MarketingBudget";

interface IShellBridge {
  /** Whether this app is embedded in the shell iframe. */
  isEmbedded: boolean;
}

/**
 * Hook that manages the PostMessage bridge between the app and the
 * intranet shell. Sends SIDEBAR_SET_ITEMS on mount and SIDEBAR_ACTIVE
 * on view changes, and routes SIDEBAR_NAVIGATE messages to setActiveView.
 */
export function useShellBridge(
  activeView: AppViewKey,
  setActiveView: (view: AppViewKey) => void,
): IShellBridge {
  /** Detect whether we are running inside an iframe (embedded in shell). */
  const isEmbedded = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true; // Cross-origin = embedded
    }
  }, []);

  /** Send a message to the parent shell. */
  const postToShell = React.useCallback(
    (msg: AppToShellMessage): void => {
      if (isEmbedded && window.parent) {
        window.parent.postMessage(msg, "*");
      }
    },
    [isEmbedded],
  );

  /** On mount: send nav items to shell; listen for SIDEBAR_NAVIGATE. */
  React.useEffect(() => {
    if (!isEmbedded) return;

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
  }, [isEmbedded, postToShell, setActiveView]);

  /** When activeView changes, notify shell to update active indicator. */
  React.useEffect(() => {
    if (isEmbedded) {
      postToShell({ type: "SIDEBAR_ACTIVE", key: activeView });
    }
  }, [activeView, isEmbedded, postToShell]);

  return { isEmbedded };
}
