/**
 * SectionTable – Renders one of the three dashboard sections
 * (Vacates, Entries, or Lost) as a coloured card with a table.
 *
 * Includes the section header, column headers, and all rows.
 * Rows are sortable via @dnd-kit drag-and-drop reordering.
 */

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  IPropertyRow,
  IPropertyManager,
  DashboardSection,
} from "../models/types";
import { SECTION_COLUMNS } from "../models/columnSchemas";
import { PropertyRowComponent } from "./Rows/PropertyRow";
import { BlankRow } from "./Rows/BlankRow";
import styles from "./PmDashboard.module.scss";

export interface ISectionTableProps {
  section: DashboardSection;
  title: string;
  rows: IPropertyRow[];
  propertyManagers: IPropertyManager[];
  onCellChange: (
    section: DashboardSection,
    rowId: string,
    colIndex: number,
    value: string,
  ) => void;
  onPmChange: (
    section: DashboardSection,
    rowId: string,
    initials: string,
  ) => void;
  onDateChange: (
    section: DashboardSection,
    rowId: string,
    value: string,
  ) => void;
  onContextMenu: (
    e: React.MouseEvent,
    section: DashboardSection,
    rowId: string,
  ) => void;
  onAddRow: (section: DashboardSection) => void;
  onReorder: (
    section: DashboardSection,
    activeId: string,
    overId: string,
  ) => void;
  /** When true, all editing is disabled (no PM selected). */
  readOnly?: boolean;
}

const SECTION_HEADER_STYLES: Record<DashboardSection, string> = {
  vacates: styles.sectionHeaderVacates,
  entries: styles.sectionHeaderEntries,
  lost: styles.sectionHeaderLost,
};

export const SectionTable: React.FC<ISectionTableProps> = ({
  section,
  title,
  rows,
  propertyManagers,
  onCellChange,
  onPmChange,
  onDateChange,
  onContextMenu,
  onAddRow,
  onReorder,
  readOnly = false,
}) => {
  const columns = SECTION_COLUMNS[section];

  // ─── DnD sensors ──────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onReorder(section, active.id as string, over.id as string);
    },
    [section, onReorder],
  );

  const handleCellChange = React.useCallback(
    (rowId: string, colIndex: number, value: string) =>
      onCellChange(section, rowId, colIndex, value),
    [section, onCellChange],
  );

  const handlePmChange = React.useCallback(
    (rowId: string, initials: string) => onPmChange(section, rowId, initials),
    [section, onPmChange],
  );

  const handleDateChange = React.useCallback(
    (rowId: string, value: string) => onDateChange(section, rowId, value),
    [section, onDateChange],
  );

  const handleContextMenu = React.useCallback(
    (e: React.MouseEvent, rowId: string) =>
      onContextMenu(e, section, rowId),
    [section, onContextMenu],
  );

  const handleAddRow = React.useCallback(
    () => onAddRow(section),
    [section, onAddRow],
  );

  const rowCount = rows.filter((r) => !r.blank).length;

  return (
    <div className={styles.sectionCard}>
      <div className={SECTION_HEADER_STYLES[section]}>
        <span>
          {title} ({rowCount})
        </span>
        <button
          type="button"
          className={styles.addRowButton}
          onClick={handleAddRow}
          title={`Add row to ${title}`}
          style={{ color: "inherit" }}
          disabled={readOnly}
        >
          + Add row
        </button>
      </div>
      <div className={styles.sectionBody}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            <table className={styles.dashboardTable}>
              <thead>
                <tr>
                  <th style={{ width: 20 }} />
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <div className={styles.emptyState}>
                        <p>No {title.toLowerCase()} to show</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) =>
                    row.blank ? (
                      <BlankRow
                        key={row.id}
                        rowId={row.id}
                        section={section}
                        onContextMenu={handleContextMenu}
                      />
                    ) : (
                      <PropertyRowComponent
                        key={row.id}
                        row={row}
                        section={section}
                        propertyManagers={propertyManagers}
                        onCellChange={handleCellChange}
                        onPmChange={handlePmChange}
                        onDateChange={handleDateChange}
                        onContextMenu={handleContextMenu}
                        readOnly={readOnly}
                      />
                    ),
                  )
                )}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
