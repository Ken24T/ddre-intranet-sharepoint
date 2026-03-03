/**
 * ComboCell – Editable cell with a dropdown of preset options
 * and free-text input.
 *
 * Clicking the cell opens a portal-rendered dropdown showing the
 * preset options. The user can pick one or type a custom value
 * in the text input at the top. Pressing Enter or blurring the
 * input commits the value; pressing Escape cancels.
 *
 * Used for the Vacates "Comments" column with presets like
 * "End of Lease", "Break Lease", etc.
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { sanitisePastedText } from "../../models/rowOperations";
import styles from "../PmDashboard.module.scss";

export interface IComboCellProps {
  /** Current value (free text or one of the presets). */
  value: string;
  /** Ordered list of preset options shown in the dropdown. */
  options: string[];
  /** Called when value changes. */
  onChange: (value: string) => void;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** If true, the cell is read-only. */
  readOnly?: boolean;
}

export const ComboCell: React.FC<IComboCellProps> = ({
  value,
  options,
  onChange,
  placeholder,
  readOnly,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const cellRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync with external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Position and open the dropdown
  const openDropdown = React.useCallback((): void => {
    if (readOnly) return;
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 2,
        left: rect.left,
      });
    }
    setShowDropdown(true);

    // Focus the input after the dropdown renders
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    });
  }, [readOnly]);

  // Close dropdown on outside click or scroll
  React.useEffect(() => {
    if (!showDropdown) return undefined;

    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node;
      const insideCell = cellRef.current ? cellRef.current.contains(target) : false;
      const insideDropdown = dropdownRef.current ? dropdownRef.current.contains(target) : false;
      if (!insideCell && !insideDropdown) {
        // Commit the current local value on outside click
        if (localValue !== value) {
          onChange(localValue);
        }
        setShowDropdown(false);
      }
    };

    const handleScroll = (): void => {
      if (localValue !== value) {
        onChange(localValue);
      }
      setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [showDropdown, localValue, value, onChange]);

  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") {
        if (localValue !== value) {
          onChange(localValue);
        }
        setShowDropdown(false);
      } else if (e.key === "Escape") {
        setLocalValue(value);
        setShowDropdown(false);
      }
    },
    [localValue, value, onChange],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>): void => {
      e.preventDefault();
      const text = sanitisePastedText(e.clipboardData.getData("text/plain"));
      setLocalValue(text);
    },
    [],
  );

  const handleOptionClick = React.useCallback(
    (option: string): void => {
      setLocalValue(option);
      onChange(option);
      setShowDropdown(false);
    },
    [onChange],
  );

  if (readOnly) {
    return <span>{value}</span>;
  }

  const dropdown = showDropdown
    ? ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className={styles.comboDropdown}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 10000,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className={styles.comboInput}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
          />
          <div className={styles.comboOptions}>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.comboOption} ${option === localValue ? styles.comboOptionSelected : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  handleOptionClick(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        ref={cellRef}
        className={styles.comboCellDisplay}
        onClick={openDropdown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDropdown();
          }
        }}
      >
        {value || <span className={styles.comboCellPlaceholder}>{placeholder}</span>}
      </div>
      {dropdown}
    </>
  );
};
