/**
 * usePropertyMeExtension – Listens for postMessage events
 * from the PropertyMe browser extension.
 *
 * The extension posts messages with `{ source: "pmdash-extension", ... }`
 * to the SharePoint page. This hook validates inbound messages and
 * forwards valid property drops to the provided callback.
 */

import * as React from "react";
import {
  validateExtensionMessage,
} from "../models/propertyMeDragHelpers";
import type { IPropertyMeDropResult } from "../models/propertyMeDragHelpers";
import { cleanPropertyAddress } from "../models/propertyMeHelpers";

export interface IUsePropertyMeExtensionOptions {
  /** Called when the extension sends valid property data. */
  onReceive: (result: IPropertyMeDropResult) => void;
  /** Whether the listener is disabled. */
  disabled?: boolean;
}

/**
 * Hook that listens for PropertyMe browser extension messages.
 *
 * @returns Whether the extension has been detected (sent at least one message).
 */
export function usePropertyMeExtension(
  options: IUsePropertyMeExtensionOptions,
): { extensionDetected: boolean } {
  const { onReceive, disabled = false } = options;
  const [extensionDetected, setExtensionDetected] = React.useState(false);

  React.useEffect(() => {
    if (disabled) return;

    const handler = (event: MessageEvent): void => {
      const msg = validateExtensionMessage(event.data);
      if (!msg) return;

      setExtensionDetected(true);

      const { payload } = msg;
      onReceive({
        url: payload.url,
        propertyId: payload.propertyId,
        address: payload.address ? cleanPropertyAddress(payload.address) : "",
      });
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [disabled, onReceive]);

  return { extensionDetected };
}
