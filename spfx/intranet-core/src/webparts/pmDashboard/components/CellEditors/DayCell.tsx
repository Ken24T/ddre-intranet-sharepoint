/**
 * DayCell – Read-only day-of-week display cell.
 *
 * Shows the abbreviated day name (Mon, Tue, etc.) based on
 * the date value. Used only in the Entries section.
 */

import * as React from "react";
import styles from "../PmDashboard.module.scss";

export interface IDayCellProps {
  /** Abbreviated day name (e.g. "Mon", "Tue") */
  value: string;
}

export const DayCell: React.FC<IDayCellProps> = ({ value }) => {
  return <span className={styles.dayCell}>{value}</span>;
};
