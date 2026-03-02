/**
 * PmSelector – Property Manager selection bar.
 *
 * Displays coloured initials badges for each PM. Selecting a PM
 * sets it as the "active" PM for new rows. "All" shows all rows.
 */

import * as React from "react";
import type { IPropertyManager } from "../models/types";
import { getInitials, getContrastColor } from "../models/pmHelpers";
import styles from "./PmDashboard.module.scss";

export interface IPmSelectorProps {
  propertyManagers: IPropertyManager[];
  /** Currently selected PM initials, or "" for "All" */
  selectedPm: string;
  onSelect: (initials: string) => void;
}

export const PmSelector: React.FC<IPmSelectorProps> = ({
  propertyManagers,
  selectedPm,
  onSelect,
}) => {
  return (
    <div className={styles.pmSelector}>
      <span
        className={
          selectedPm === "" ? styles.pmOptionSelected : styles.pmOption
        }
        onClick={() => onSelect("")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect("");
        }}
        style={{
          backgroundColor: "#f3f2f1",
          color: "#323130",
        }}
      >
        All
      </span>

      {propertyManagers.map((pm) => {
        const initials = getInitials(pm);
        const textColor = getContrastColor(pm.color);
        const isSelected = selectedPm === initials;

        return (
          <span
            key={pm.id}
            className={isSelected ? styles.pmOptionSelected : styles.pmOption}
            onClick={() => onSelect(initials)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(initials);
            }}
            style={{
              backgroundColor: pm.color,
              color: textColor,
            }}
            title={pm.preferredName || pm.firstName}
          >
            {initials}
          </span>
        );
      })}
    </div>
  );
};
