/**
 * CheckboxCell – Toggle cell for Y/blank values.
 *
 * Used for VAC, Signed, BOND, 2WKS columns.
 * Click toggles between "Y" and "".
 */

import * as React from "react";
import styles from "../PmDashboard.module.scss";

export interface ICheckboxCellProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const CheckboxCell: React.FC<ICheckboxCellProps> = ({
  value,
  onChange,
  readOnly,
}) => {
  const isChecked = value === "Y";

  const handleClick = React.useCallback((): void => {
    if (readOnly) return;
    onChange(isChecked ? "" : "Y");
  }, [isChecked, readOnly, onChange]);

  return (
    <span
      className={styles.checkboxCell}
      onClick={handleClick}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isChecked ? "✓" : ""}
    </span>
  );
};
