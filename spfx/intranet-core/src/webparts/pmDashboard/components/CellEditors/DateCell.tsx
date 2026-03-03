/**
 * DateCell – Calendar date picker cell for the PM Dashboard.
 *
 * Shows DD/MM format in the cell. Clicking opens a portal-rendered
 * calendar popover (Fluent UI DatePicker). Dates in the past are
 * disabled — vacates and entries cannot happen before today.
 *
 * The stored/returned value remains DD/MM display format.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Calendar, DayOfWeek, DateRangeType } from "@fluentui/react";
import {
  todayIso,
  parseDisplayDate,
  dateToDisplay,
} from "../../models/dateHelpers";
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
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [popoverPos, setPopoverPos] = React.useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const cellRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const today = React.useMemo(() => {
    const iso = todayIso();
    return new Date(iso + "T00:00:00");
  }, []);

  const selectedDate = React.useMemo((): Date | undefined => {
    return parseDisplayDate(value);
  }, [value]);

  const handleCellClick = React.useCallback((): void => {
    if (readOnly) return;
    if (!cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + 2,
      left: rect.left,
    });
    setShowCalendar(true);
  }, [readOnly]);

  const handleSelectDate = React.useCallback(
    (date: Date): void => {
      // Reject past dates
      if (date < today) return;
      const display = dateToDisplay(date);
      if (display !== value) {
        onChange(display);
      }
      setShowCalendar(false);
    },
    [today, value, onChange],
  );

  const handleClose = React.useCallback((): void => {
    setShowCalendar(false);
  }, []);

  // Close on outside click
  React.useEffect(() => {
    if (!showCalendar) return;
    const handleMouseDown = (e: MouseEvent): void => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showCalendar]);

  // Close on Escape
  React.useEffect(() => {
    if (!showCalendar) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setShowCalendar(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCalendar]);

  if (readOnly) {
    return <span className={styles.dateInput}>{value}</span>;
  }

  return (
    <>
      <div
        ref={cellRef}
        className={`${styles.dateInput} ${styles.cell}`}
        onClick={handleCellClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleCellClick();
        }}
      >
        {value || "—"}
      </div>
      {showCalendar &&
        ReactDOM.createPortal(
          <div
            ref={popoverRef}
            className={styles.datePopover}
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Calendar
              onSelectDate={handleSelectDate}
              onDismiss={handleClose}
              value={selectedDate || today}
              today={today}
              minDate={today}
              firstDayOfWeek={DayOfWeek.Monday}
              dateRangeType={DateRangeType.Day}
              showGoToToday={true}
              highlightSelectedMonth
            />
          </div>,
          document.body,
        )}
    </>
  );
};
