/**
 * BlankRow – A thin spacer row used to separate date groups.
 *
 * Right-click opens the context menu (same as property rows).
 */

import * as React from "react";
import type { DashboardSection } from "../../models/types";
import { SECTION_COLUMNS } from "../../models/columnSchemas";
import styles from "../PmDashboard.module.scss";

export interface IBlankRowProps {
  rowId: string;
  section: DashboardSection;
  onContextMenu: (e: React.MouseEvent, rowId: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

export const BlankRow: React.FC<IBlankRowProps> = ({
  rowId,
  section,
  onContextMenu,
  dragHandleProps,
}) => {
  const colSpan = SECTION_COLUMNS[section].length + 1; // +1 for drag handle

  const handleContextMenu = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e, rowId);
    },
    [rowId, onContextMenu],
  );

  return (
    <tr className={styles.blankRow} onContextMenu={handleContextMenu}>
      <td
        colSpan={colSpan}
        className={styles.dragHandle}
        {...(dragHandleProps || {})}
      >
        &nbsp;
      </td>
    </tr>
  );
};
