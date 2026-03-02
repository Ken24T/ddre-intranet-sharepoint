/**
 * DateCell – Inline editable date cell for the PM Dashboard.
 *
 * Shows DD/MM format. On focus, converts to a native date input
 * for easy picking, then converts back on blur.
 */

import * as React from "react";
import { isoToDisplay, displayToIso } from "../../models/dateHelpers";
import styles from "../PmDashboard.module.scss";

export interface IDateCellProps {
  /** Value in DD/MM display format */
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const DateCell: React.FC<IDateCellProps> = ({
  value,
  onChange,
  readOnly,
}) => {
  const [editing, setEditing] = React.useState(false);
  const [isoValue, setIsoValue] = React.useState(() => displayToIso(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync with external value changes
  React.useEffect(() => {
    setIsoValue(displayToIso(value));
  }, [value]);

  const handleDisplayClick = React.useCallback((): void => {
    if (readOnly) return;
    setEditing(true);
  }, [readOnly]);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDateChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const newIso = e.target.value;
      setIsoValue(newIso);
    },
    [],
  );

  const handleBlur = React.useCallback((): void => {
    setEditing(false);
    const newDisplay = isoToDisplay(isoValue);
    if (newDisplay !== value) {
      onChange(newDisplay);
    }
  }, [isoValue, value, onChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.currentTarget.blur();
      }
    },
    [],
  );

  if (readOnly) {
    return <span className={styles.dateInput}>{value}</span>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        className={styles.dateInput}
        value={isoValue}
        onChange={handleDateChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span
      className={`${styles.dateInput} ${styles.cell}`}
      onClick={handleDisplayClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleDisplayClick();
      }}
    >
      {value || "—"}
    </span>
  );
};
