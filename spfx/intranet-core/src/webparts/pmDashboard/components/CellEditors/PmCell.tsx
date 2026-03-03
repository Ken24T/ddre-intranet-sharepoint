/**
 * PmCell – Property manager badge cell.
 *
 * Shows the PM's initials on a coloured background.
 * Clicking opens a portal-rendered dropdown to select a PM,
 * ensuring visibility regardless of parent overflow styles.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
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
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const badgeRef = React.useRef<HTMLSpanElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const bgColor = getPmColor(value, propertyManagers) || "#cccccc";
  const textColor = getContrastColor(bgColor);

  // Close dropdown on outside click or scroll
  React.useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (
        badgeRef.current && !badgeRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    const handleScroll = (): void => {
      setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [showDropdown]);

  const handleBadgeClick = React.useCallback((): void => {
    if (readOnly) return;
    if (!showDropdown && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 2,
        left: rect.right,
      });
    }
    setShowDropdown((prev) => !prev);
  }, [readOnly, showDropdown]);

  const handleSelect = React.useCallback(
    (initials: string): void => {
      onChange(initials);
      setShowDropdown(false);
    },
    [onChange],
  );

  const dropdown = showDropdown
    ? ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className={styles.pmDropdown}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
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
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={styles.pmCellWrapper}>
      <span
        ref={badgeRef}
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
      {dropdown}
    </div>
  );
};
