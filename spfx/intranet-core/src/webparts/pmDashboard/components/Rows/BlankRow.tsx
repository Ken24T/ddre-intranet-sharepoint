/**
 * BlankRow – A thin spacer row used to separate date groups.
 *
 * Right-click opens the context menu (same as property rows).
 */

import * as React from "react";
import type { DashboardSection } from "../../models/types";
import { SECTION_COLUMNS } from "../../models/columnSchemas";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "../PmDashboard.module.scss";

export interface IBlankRowProps {
  rowId: string;
  section: DashboardSection;
  onContextMenu: (e: React.MouseEvent, rowId: string) => void;
}

export const BlankRow: React.FC<IBlankRowProps> = ({
  rowId,
  section,
  onContextMenu,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowId });

  const colSpan = SECTION_COLUMNS[section].length + 1; // +1 for drag handle

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContextMenu = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e, rowId);
    },
    [rowId, onContextMenu],
  );

  return (
    <tr
      ref={setNodeRef}
      className={styles.blankRow}
      style={rowStyle}
      onContextMenu={handleContextMenu}
    >
      <td
        colSpan={colSpan}
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
      >
        &nbsp;
      </td>
    </tr>
  );
};
