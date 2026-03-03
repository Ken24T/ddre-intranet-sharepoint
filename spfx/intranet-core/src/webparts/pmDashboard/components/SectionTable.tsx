/**
 * SectionTable – Renders one of the two dashboard sections
 * (Vacates or Entries) as a coloured card with a table.
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
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  IPropertyRow,
  IPropertyManager,
  DashboardSection,
  SectionColumnWidths,
} from "../models/types";
import type { IPropertyMeDropResult } from "../models/propertyMeDragHelpers";
import { SECTION_COLUMNS, DEFAULT_COLUMN_WIDTHS } from "../models/columnSchemas";
import { PropertyRowComponent } from "./Rows/PropertyRow";
import { BlankRow } from "./Rows/BlankRow";
import { useColumnResize } from "./useColumnResize";
import { usePropertyMeDrop } from "./usePropertyMeDrop";
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
  /** Current column widths for this section (from PM preferences). */
  columnWidths?: SectionColumnWidths;
  /** Called when the user finishes resizing a column. */
  onColumnResize?: (
    section: DashboardSection,
    colIndex: number,
    width: number,
  ) => void;
  /** Called when a PropertyMe property is dropped onto this section. */
  onPropertyMeDrop?: (
    section: DashboardSection,
    result: IPropertyMeDropResult,
  ) => void;
  /** When true, all editing is disabled (no PM selected). */
  readOnly?: boolean;
}

const SECTION_HEADER_STYLES: Record<DashboardSection, string> = {
  vacates: styles.sectionHeaderVacates,
  entries: styles.sectionHeaderEntries,
};

const SECTION_TH_STYLES: Record<DashboardSection, string> = {
  vacates: styles.thVacates,
  entries: styles.thEntries,
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
  columnWidths,
  onColumnResize,
  onPropertyMeDrop,
  readOnly = false,
}) => {
  const columns = SECTION_COLUMNS[section];

  // ─── Column resize ───────────────────────────────────
  const handleResize = React.useCallback(
    (colIndex: number, width: number): void => {
      if (onColumnResize) {
        onColumnResize(section, colIndex, width);
      }
    },
    [section, onColumnResize],
  );

  const { getHeaderStyle, onResizeStart } = useColumnResize({
    columnCount: columns.length,
    widths: columnWidths || {},
    defaultWidths: DEFAULT_COLUMN_WIDTHS[section],
    onChange: handleResize,
  });

  // ─── PropertyMe drag-and-drop ────────────────────────
  const noopDrop = React.useCallback(
    () => { /* noop — onPropertyMeDrop not provided */ },
    [],
  );

  const { state: dropState, handlers: dropHandlers } = usePropertyMeDrop({
    section,
    onDrop: onPropertyMeDrop || noopDrop,
    disabled: readOnly || !onPropertyMeDrop,
  });

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

  // ─── Drop indicator state ─────────────────────────────
  const [dragActiveId, setDragActiveId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleDragStart = React.useCallback(
    (event: DragStartEvent): void => {
      setDragActiveId(event.active.id as string);
    },
    [],
  );

  const handleDragOver = React.useCallback(
    (event: DragOverEvent): void => {
      const overId = event.over ? (event.over.id as string) : null;
      setDragOverId(overId);
    },
    [],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent): void => {
      setDragActiveId(null);
      setDragOverId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onReorder(section, active.id as string, over.id as string);
    },
    [section, onReorder],
  );

  const handleDragCancel = React.useCallback((): void => {
    setDragActiveId(null);
    setDragOverId(null);
  }, []);

  /**
   * Determine the drop indicator position for a given row.
   * Shows a line above or below the hovered row to indicate
   * where the dragged row will be inserted.
   */
  const getDropIndicator = React.useCallback(
    (rowId: string): "above" | "below" | undefined => {
      if (!dragActiveId || !dragOverId || dragActiveId === dragOverId) return undefined;
      if (rowId !== dragOverId) return undefined;

      const activeIdx = rowIds.indexOf(dragActiveId);
      const overIdx = rowIds.indexOf(dragOverId);
      if (activeIdx === -1 || overIdx === -1) return undefined;

      return activeIdx < overIdx ? "below" : "above";
    },
    [dragActiveId, dragOverId, rowIds],
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
    <div
      className={styles.sectionCard}
      onDragOver={dropHandlers.onDragOver}
      onDragEnter={dropHandlers.onDragEnter}
      onDragLeave={dropHandlers.onDragLeave}
      onDrop={dropHandlers.onDrop}
    >
      {dropState.isDragOver && (
        <div className={styles.dropZoneOverlay}>
          <span className={styles.dropZoneLabel}>
            Drop PropertyMe property here
          </span>
        </div>
      )}
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            <table className={styles.dashboardTable}>
              <thead>
                <tr>
                  <th style={{ width: 20 }} className={SECTION_TH_STYLES[section]} />
                  {columns.map((col, idx) => (
                    <th key={col} style={getHeaderStyle(idx)} className={SECTION_TH_STYLES[section]}>
                      <div className={styles.thInner}>
                        <span>{col}</span>
                        <div
                          className={styles.resizeHandle}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const th = (e.target as HTMLElement).closest("th");
                            const headerRow = th?.parentElement;

                            // Snapshot ALL column widths (border-box) so
                            // the hook can lock non-involved columns and
                            // compute adjacent-column compensation.
                            const allWidths: Record<number, number> = {};
                            if (headerRow) {
                              const ths = headerRow.querySelectorAll("th");
                              // Skip first <th> (drag-handle column at DOM index 0)
                              for (let i = 1; i < ths.length; i++) {
                                allWidths[i - 1] = ths[i].getBoundingClientRect().width;
                              }
                            }

                            onResizeStart(idx, e.clientX, allWidths);
                          }}
                        />
                      </div>
                    </th>
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
                        dropIndicator={getDropIndicator(row.id)}
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
