/**
 * ContextMenu – Right-click context menu for dashboard rows.
 *
 * Actions: Add property row, Add blank row, Add URL from clipboard, Remove row.
 * Positioned at the mouse click coordinates.
 */

import * as React from "react";
import styles from "./PmDashboard.module.scss";

export interface IContextMenuAction {
  label: string;
  icon?: string;
  danger?: boolean;
  onClick: () => void;
}

export interface IContextMenuProps {
  x: number;
  y: number;
  actions: IContextMenuAction[];
  onDismiss: () => void;
}

export const ContextMenu: React.FC<IContextMenuProps> = ({
  x,
  y,
  actions,
  onDismiss,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss]);

  // Adjust position if menu would overflow viewport
  const adjustedStyle = React.useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {
      left: x,
      top: y,
    };

    // Basic viewport boundary check
    if (typeof window !== "undefined") {
      if (x + 200 > window.innerWidth) {
        style.left = x - 200;
      }
      if (y + 200 > window.innerHeight) {
        style.top = y - 200;
      }
    }

    return style;
  }, [x, y]);

  return (
    <div ref={menuRef} className={styles.contextMenu} style={adjustedStyle}>
      {actions.map((action, index) => (
        <button
          key={index}
          type="button"
          className={
            action.danger ? styles.contextMenuDanger : styles.contextMenuItem
          }
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
        >
          {action.icon && <span>{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
