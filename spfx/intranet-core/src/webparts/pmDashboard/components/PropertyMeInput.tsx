/**
 * PropertyMeInput – A text input for pasting PropertyMe URLs.
 *
 * The user can paste or type a PropertyMe property card URL.
 * The component validates it, extracts the property ID and
 * (if available) a fallback address from the URL slug, then
 * calls `onAdd` with the extracted data.
 *
 * In future, this will call the Azure PropertyMe proxy to
 * resolve a full address from the property ID.
 */

import * as React from "react";
import {
  TextField,
  PrimaryButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {
  isPropertyMeUrl,
  extractPropertyId,
  extractAddressFromSlug,
  cleanPropertyAddress,
} from "../models/propertyMeHelpers";
import styles from "./PmDashboard.module.scss";

export interface IPropertyMeInputResult {
  /** The full PropertyMe URL. */
  url: string;
  /** The extracted property ID (from the URL path). */
  propertyId: string;
  /** The best-effort property address (from slug or proxy). */
  address: string;
}

export interface IPropertyMeInputProps {
  /** Called when the user submits a valid PropertyMe URL. */
  onAdd: (result: IPropertyMeInputResult) => void;
  /** Whether the input is disabled (e.g. no PM selected). */
  disabled?: boolean;
}

export const PropertyMeInput: React.FC<IPropertyMeInputProps> = ({
  onAdd,
  disabled = false,
}) => {
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      setUrl(newValue || "");
      if (error) setError(undefined);
    },
    [error],
  );

  const handleSubmit = React.useCallback((): void => {
    const trimmed = url.trim();

    if (!trimmed) {
      setError("Please enter a PropertyMe URL.");
      return;
    }

    if (!isPropertyMeUrl(trimmed)) {
      setError(
        "That doesn't look like a PropertyMe URL. Expected format: manager.propertyme.com/#/property/card/...",
      );
      return;
    }

    const propertyId = extractPropertyId(trimmed);
    if (!propertyId) {
      setError("Could not extract a property ID from that URL.");
      return;
    }

    // Try to get an address from the URL slug
    const slugAddress = extractAddressFromSlug(trimmed);
    const address = slugAddress ? cleanPropertyAddress(slugAddress) : "";

    onAdd({ url: trimmed, propertyId, address });
    setUrl("");
    setError(undefined);
  }, [url, onAdd]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className={styles.propertyMeInput}>
      <div className={styles.propertyMeInputRow}>
        <TextField
          value={url}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Paste a PropertyMe URL…"
          disabled={disabled}
          autoComplete="off"
          styles={{ root: { flexGrow: 1 } }}
        />
        <PrimaryButton
          text="Add"
          onClick={handleSubmit}
          disabled={disabled || !url.trim()}
          title="Add property from PropertyMe URL"
        />
      </div>
      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          onDismiss={() => setError(undefined)}
          dismissButtonAriaLabel="Dismiss"
        >
          {error}
        </MessageBar>
      )}
    </div>
  );
};
