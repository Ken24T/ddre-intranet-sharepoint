/**
 * VacCell – Smart composite cell for vacate assignment.
 *
 * Displays a compact string like "ES 10/2" (initials + day/month).
 * Clicking opens a portal-rendered popover with:
 *   - PM badge selector (who is doing the vacate)
 *   - Day/month date picker
 *
 * Clicking an empty cell pre-fills with the row's assigned PM
 * and today's date for quick one-click entry.
 *
 * Stored value remains a plain string (e.g. "ES 10/2") for
 * backward compatibility with existing data.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import type { IPropertyManager } from "../../models/types";
import { getContrastColor, getPmColor, getInitials } from "../../models/pmHelpers";
import styles from "../PmDashboard.module.scss";

export interface IVacCellProps {
  /** Current value (e.g. "ES 10/2" or "") */
  value: string;
  /** Initials of the PM assigned to this row (for pre-fill) */
  rowPmInitials: string;
  /** All property managers for the picker */
  propertyManagers: IPropertyManager[];
  /** Called when value changes */
  onChange: (value: string) => void;
  readOnly?: boolean;
}

/** Parse a VAC string like "ES 10/2" into { initials, day, month }. */
function parseVacValue(raw: string): { initials: string; day: string; month: string } {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { initials: "", day: "", month: "" };

  // Match pattern: INITIALS DAY/MONTH  (e.g. "ES 10/2" or "CW 2/3")
  const match = trimmed.match(/^([A-Za-z]{1,3})\s+(\d{1,2})\/(\d{1,2})$/);
  if (match) {
    return { initials: match[1].toUpperCase(), day: match[2], month: match[3] };
  }

  // Fallback: treat entire string as-is (initials only, or unrecognised format)
  return { initials: trimmed, day: "", month: "" };
}

/** Build display string from parts. */
function buildVacValue(initials: string, day: string, month: string): string {
  const i = initials.trim();
  const d = day.trim();
  const m = month.trim();
  if (!i && !d && !m) return "";
  if (d && m) return `${i} ${d}/${m}`.trim();
  if (i) return i;
  return "";
}

/** Get today's day and month numbers. */
function getTodayParts(): { day: string; month: string } {
  const now = new Date();
  return {
    day: String(now.getDate()),
    month: String(now.getMonth() + 1),
  };
}

export const VacCell: React.FC<IVacCellProps> = ({
  value,
  rowPmInitials,
  propertyManagers,
  onChange,
  readOnly,
}) => {
  const [showPopover, setShowPopover] = React.useState(false);
  const [popoverPos, setPopoverPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedInitials, setSelectedInitials] = React.useState("");
  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");

  const cellRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Keep refs in sync so callbacks always see latest state
  const stateRef = React.useRef({ selectedInitials: "", day: "", month: "" });
  stateRef.current = { selectedInitials, day, month };

  // Sync local state when value prop changes externally
  React.useEffect(() => {
    const parsed = parseVacValue(value);
    setSelectedInitials(parsed.initials);
    setDay(parsed.day);
    setMonth(parsed.month);
  }, [value]);

  const commitAndClose = React.useCallback((): void => {
    const s = stateRef.current;
    const newValue = buildVacValue(s.selectedInitials, s.day, s.month);
    if (newValue !== value) {
      onChange(newValue);
    }
    setShowPopover(false);
  }, [value, onChange]);

  // Close popover on outside click or scroll
  React.useEffect(() => {
    if (!showPopover) return;

    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (
        cellRef.current && !cellRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        commitAndClose();
      }
    };

    const handleScroll = (): void => {
      commitAndClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [showPopover, commitAndClose]);

  const handleCellClick = (): void => {
    if (readOnly) return;

    if (!showPopover && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 2,
        left: rect.right,
      });

      // Pre-fill if empty
      if (!value.trim()) {
        const today = getTodayParts();
        const prefill = rowPmInitials || "";
        setSelectedInitials(prefill);
        setDay(today.day);
        setMonth(today.month);
      }
    }

    setShowPopover((prev) => !prev);
  };

  const handlePmSelect = (initials: string): void => {
    setSelectedInitials(initials);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length <= 2) setDay(v);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length <= 2) setMonth(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      commitAndClose();
    } else if (e.key === "Escape") {
      // Revert to original
      const parsed = parseVacValue(value);
      setSelectedInitials(parsed.initials);
      setDay(parsed.day);
      setMonth(parsed.month);
      setShowPopover(false);
    }
  };

  const handleClear = (): void => {
    setSelectedInitials("");
    setDay("");
    setMonth("");
    onChange("");
    setShowPopover(false);
  };

  // Display badge colour
  const displayBg = getPmColor(selectedInitials || value.split(" ")[0], propertyManagers);

  const popover = showPopover
    ? ReactDOM.createPortal(
        <div
          ref={popoverRef}
          className={styles.vacPopover}
          style={{ top: popoverPos.top, left: popoverPos.left }}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className={styles.vacPopoverSection}>
            <label className={styles.vacPopoverLabel}>Who</label>
            <div className={styles.vacPmGrid}>
              {propertyManagers.map((pm) => {
                const initials = getInitials(pm);
                const pmBg = pm.color || "#cccccc";
                const pmText = getContrastColor(pmBg);
                const isActive = initials === selectedInitials;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    className={`${styles.vacPmOption} ${isActive ? styles.vacPmOptionActive : ""}`}
                    onClick={() => handlePmSelect(initials)}
                    title={pm.preferredName || pm.firstName}
                  >
                    <span
                      className={styles.vacPmBadge}
                      style={{ backgroundColor: pmBg, color: pmText }}
                    >
                      {initials}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.vacPopoverSection}>
            <label className={styles.vacPopoverLabel}>Date</label>
            <div className={styles.vacDateRow}>
              <input
                type="text"
                className={styles.vacDateInput}
                value={day}
                onChange={handleDayChange}
                placeholder="DD"
                maxLength={2}
                aria-label="Day"
              />
              <span className={styles.vacDateSeparator}>/</span>
              <input
                type="text"
                className={styles.vacDateInput}
                value={month}
                onChange={handleMonthChange}
                placeholder="MM"
                maxLength={2}
                aria-label="Month"
              />
            </div>
          </div>

          <div className={styles.vacPopoverActions}>
            <button
              type="button"
              className={styles.vacPopoverDone}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={commitAndClose}
            >
              Done
            </button>
            {value && (
              <button
                type="button"
                className={styles.vacPopoverClear}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  // Render display
  const displayValue = value.trim();
  const hasValue = displayValue.length > 0;

  return (
    <div
      ref={cellRef}
      className={`${styles.vacCellWrapper} ${hasValue ? styles.vacCellFilled : ""}`}
      onClick={handleCellClick}
      role="button"
      tabIndex={0}
      title={hasValue ? displayValue : "Click to assign vacate"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCellClick();
      }}
    >
      {hasValue ? (
        <span
          className={styles.vacCellDisplay}
          style={displayBg ? {
            backgroundColor: `${displayBg}33`,
            borderLeft: `3px solid ${displayBg}`,
          } : undefined}
        >
          {displayValue}
        </span>
      ) : (
        <span className={styles.vacCellEmpty}>+</span>
      )}
      {popover}
    </div>
  );
};
