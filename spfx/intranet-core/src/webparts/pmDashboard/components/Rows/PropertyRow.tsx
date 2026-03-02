/**
 * PropertyRow – A single data row in a dashboard section table.
 *
 * Renders the drag handle, PM badge, and all column cells
 * appropriate to the section type (vacates, entries, or lost).
 */

import * as React from "react";
import type {
  IPropertyRow,
  IPropertyManager,
  DashboardSection,
} from "../../models/types";
import {
  VACATES_COLS,
  ENTRIES_COLS,
  LOST_COLS,
} from "../../models/columnSchemas";
import { getDayOfWeek } from "../../models/dateHelpers";
import { getPmColor } from "../../models/pmHelpers";
import { DateCell } from "../CellEditors/DateCell";
import { TextCell } from "../CellEditors/TextCell";
import { DayCell } from "../CellEditors/DayCell";
import { PmCell } from "../CellEditors/PmCell";
import { CheckboxCell } from "../CellEditors/CheckboxCell";
import { PropertyCell } from "../CellEditors/PropertyCell";
import styles from "../PmDashboard.module.scss";

export interface IPropertyRowProps {
  row: IPropertyRow;
  section: DashboardSection;
  propertyManagers: IPropertyManager[];
  onCellChange: (rowId: string, colIndex: number, value: string) => void;
  onPmChange: (rowId: string, initials: string) => void;
  onDateChange: (rowId: string, value: string) => void;
  onContextMenu: (e: React.MouseEvent, rowId: string) => void;
  /** Drag handle attributes from @dnd-kit */
  dragHandleProps?: Record<string, unknown>;
}

export const PropertyRowComponent: React.FC<IPropertyRowProps> = ({
  row,
  section,
  propertyManagers,
  onCellChange,
  onPmChange,
  onDateChange,
  onContextMenu,
  dragHandleProps,
}) => {
  const bgColor = getPmColor(row.pm, propertyManagers) || "transparent";
  const rowStyle: React.CSSProperties = {
    backgroundColor: bgColor !== "transparent" ? `${bgColor}33` : undefined,
  };

  const handleCellChange = React.useCallback(
    (colIndex: number) => (value: string) => {
      onCellChange(row.id, colIndex, value);
    },
    [row.id, onCellChange],
  );

  const handleContextMenu = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e, row.id);
    },
    [row.id, onContextMenu],
  );

  const handlePmChange = React.useCallback(
    (initials: string) => {
      onPmChange(row.id, initials);
    },
    [row.id, onPmChange],
  );

  const handleDateChange = React.useCallback(
    (value: string) => {
      onDateChange(row.id, value);
    },
    [row.id, onDateChange],
  );

  const renderVacatesCells = (): React.ReactNode => (
    <>
      <td className={styles.colDate}>
        <DateCell
          value={row.columns[VACATES_COLS.date] || ""}
          onChange={handleDateChange}
        />
      </td>
      <td className={styles.colProperty}>
        <PropertyCell
          value={row.columns[VACATES_COLS.property] || ""}
          propertyUrl={row.propertyUrl}
          onChange={handleCellChange(VACATES_COLS.property)}
        />
      </td>
      <td className={styles.colPm}>
        <PmCell
          value={row.columns[VACATES_COLS.pm] || ""}
          propertyManagers={propertyManagers}
          onChange={handlePmChange}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[VACATES_COLS.vac] || ""}
          onChange={handleCellChange(VACATES_COLS.vac)}
        />
      </td>
      <td className={styles.colReason}>
        <TextCell
          value={row.columns[VACATES_COLS.reason] || ""}
          onChange={handleCellChange(VACATES_COLS.reason)}
          placeholder="Reason"
        />
      </td>
    </>
  );

  const renderEntriesCells = (): React.ReactNode => (
    <>
      <td className={styles.colDate}>
        <DateCell
          value={row.columns[ENTRIES_COLS.date] || ""}
          onChange={handleDateChange}
        />
      </td>
      <td className={styles.colDay}>
        <DayCell value={row.columns[ENTRIES_COLS.day] || getDayOfWeek(row.columns[ENTRIES_COLS.date] || "")} />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.signed] || ""}
          onChange={handleCellChange(ENTRIES_COLS.signed)}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.bond] || ""}
          onChange={handleCellChange(ENTRIES_COLS.bond)}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.twoWks] || ""}
          onChange={handleCellChange(ENTRIES_COLS.twoWks)}
        />
      </td>
      <td className={styles.colProperty}>
        <PropertyCell
          value={row.columns[ENTRIES_COLS.property] || ""}
          propertyUrl={row.propertyUrl}
          onChange={handleCellChange(ENTRIES_COLS.property)}
        />
      </td>
      <td className={styles.colPm}>
        <PmCell
          value={row.columns[ENTRIES_COLS.pm] || ""}
          propertyManagers={propertyManagers}
          onChange={handlePmChange}
        />
      </td>
      <td className={styles.colComments}>
        <TextCell
          value={row.columns[ENTRIES_COLS.comments] || ""}
          onChange={handleCellChange(ENTRIES_COLS.comments)}
          placeholder="Comments"
        />
      </td>
    </>
  );

  const renderLostCells = (): React.ReactNode => (
    <>
      <td className={styles.colDate}>
        <DateCell
          value={row.columns[LOST_COLS.date] || ""}
          onChange={handleDateChange}
        />
      </td>
      <td className={styles.colProperty}>
        <PropertyCell
          value={row.columns[LOST_COLS.property] || ""}
          propertyUrl={row.propertyUrl}
          onChange={handleCellChange(LOST_COLS.property)}
        />
      </td>
      <td className={styles.colReason}>
        <TextCell
          value={row.columns[LOST_COLS.reason] || ""}
          onChange={handleCellChange(LOST_COLS.reason)}
          placeholder="Reason"
        />
      </td>
      <td className={styles.colPm}>
        <PmCell
          value={row.columns[LOST_COLS.pm] || ""}
          propertyManagers={propertyManagers}
          onChange={handlePmChange}
        />
      </td>
    </>
  );

  const renderCells = (): React.ReactNode => {
    switch (section) {
      case "vacates":
        return renderVacatesCells();
      case "entries":
        return renderEntriesCells();
      case "lost":
        return renderLostCells();
    }
  };

  return (
    <tr
      className={styles.propertyRow}
      style={rowStyle}
      onContextMenu={handleContextMenu}
    >
      <td className={styles.dragHandle} {...(dragHandleProps || {})}>
        ☰
      </td>
      {renderCells()}
    </tr>
  );
};
