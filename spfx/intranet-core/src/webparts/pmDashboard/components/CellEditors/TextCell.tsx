/**
 * TextCell – Inline editable text cell for the PM Dashboard.
 *
 * Renders a plain text input that auto-selects on focus and
 * commits on blur/Enter. Used for Reason, Comments, and similar text columns.
 */

import * as React from "react";
import { sanitisePastedText } from "../../models/rowOperations";
import styles from "../PmDashboard.module.scss";

export interface ITextCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  /** If true, the cell is read-only */
  readOnly?: boolean;
}

export const TextCell: React.FC<ITextCellProps> = ({
  value,
  onChange,
  className,
  placeholder,
  readOnly,
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync with external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = React.useCallback((): void => {
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, value, onChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        setLocalValue(value);
        e.currentTarget.blur();
      }
    },
    [value],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>): void => {
      e.preventDefault();
      const text = sanitisePastedText(e.clipboardData.getData("text/plain"));
      setLocalValue(text);
    },
    [],
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>): void => {
      e.target.select();
    },
    [],
  );

  if (readOnly) {
    return (
      <span className={className}>
        {value}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className={`${styles.cellInput} ${className || ""}`}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      placeholder={placeholder}
    />
  );
};
