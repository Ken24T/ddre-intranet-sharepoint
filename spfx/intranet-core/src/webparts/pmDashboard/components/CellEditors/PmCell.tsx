/**
 * PmCell – Property manager badge cell.
 *
 * Shows the PM's initials on a coloured background.
 * Clicking opens the PM selector dropdown.
 */

import * as React from "react";
import type { IPropertyManager } from "../../models/types";
import { getContrastColor, getPmColor } from "../../models/pmHelpers";
import styles from "../PmDashboard.module.scss";

export interface IPmCellProps {
  /** Current PM initials (e.g. "KB") */
  value: string;
  /** All property managers for colour lookup */
  propertyManagers: IPropertyManager[];
  /** Called when a new PM is selected */
  onChange: (initials: string) => void;
  readOnly?: boolean;
}

export const PmCell: React.FC<IPmCellProps> = ({
  value,
  propertyManagers,
  onChange,
  readOnly,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const cellRef = React.useRef<HTMLDivElement>(null);

  const bgColor = getPmColor(value, propertyManagers) || "#cccccc";
  const textColor = getContrastColor(bgColor);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleBadgeClick = React.useCallback((): void => {
    if (readOnly) return;
    setShowDropdown((prev) => !prev);
  }, [readOnly]);

  const handleSelect = React.useCallback(
    (initials: string): void => {
      onChange(initials);
      setShowDropdown(false);
    },
    [onChange],
  );

  return (
    <div ref={cellRef} className={styles.pmCellWrapper}>
      <span
        className={styles.pmBadge}
        style={{ backgroundColor: bgColor, color: textColor }}
        onClick={handleBadgeClick}
        role="button"
        tabIndex={0}
        title={value || "Select PM"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleBadgeClick();
        }}
      >
        {value || "?"}
      </span>

      {showDropdown && (
        <div className={styles.pmDropdown}>
          {propertyManagers.map((pm) => {
            const initials = `${pm.firstName[0] || ""}${pm.lastName[0] || ""}`.toUpperCase();
            const pmBg = pm.color || "#cccccc";
            const pmText = getContrastColor(pmBg);
            const isActive = initials === value;
            return (
              <button
                key={pm.id}
                type="button"
                className={styles.pmDropdownItem}
                onClick={() => handleSelect(initials)}
                style={{
                  background: isActive ? "#e8e6e4" : undefined,
                }}
              >
                <span
                  className={styles.pmDropdownBadge}
                  style={{
                    backgroundColor: pmBg,
                    color: pmText,
                  }}
                >
                  {initials}
                </span>
                <span>{pm.preferredName || pm.firstName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
