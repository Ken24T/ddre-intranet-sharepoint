/**
 * PropertyRow – A single data row in a dashboard section table.
 *
 * Renders the drag handle, PM badge, and all column cells
 * appropriate to the section type (vacates or entries).
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
} from "../../models/columnSchemas";
import { getDayOfWeek } from "../../models/dateHelpers";
import { getPmColor } from "../../models/pmHelpers";
import { DateCell } from "../CellEditors/DateCell";
import { TextCell } from "../CellEditors/TextCell";
import { DayCell } from "../CellEditors/DayCell";
import { PmCell } from "../CellEditors/PmCell";
import { CheckboxCell } from "../CellEditors/CheckboxCell";
import { PropertyCell } from "../CellEditors/PropertyCell";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "../PmDashboard.module.scss";

export interface IPropertyRowProps {
  row: IPropertyRow;
  section: DashboardSection;
  propertyManagers: IPropertyManager[];
  onCellChange: (rowId: string, colIndex: number, value: string) => void;
  onPmChange: (rowId: string, initials: string) => void;
  onDateChange: (rowId: string, value: string) => void;
  onContextMenu: (e: React.MouseEvent, rowId: string) => void;
  /** When true, all editing and drag are disabled. */
  readOnly?: boolean;
}

export const PropertyRowComponent: React.FC<IPropertyRowProps> = ({
  row,
  section,
  propertyManagers,
  onCellChange,
  onPmChange,
  onDateChange,
  onContextMenu,
  readOnly = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, disabled: readOnly });

  const bgColor = getPmColor(row.pm, propertyManagers) || "transparent";
  const rowStyle: React.CSSProperties = {
    backgroundColor: bgColor !== "transparent" ? `${bgColor}33` : undefined,
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? ("relative" as const) : undefined,
    zIndex: isDragging ? 10 : undefined,
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
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colProperty}>
        <PropertyCell
          value={row.columns[VACATES_COLS.property] || ""}
          propertyUrl={row.propertyUrl}
          onChange={handleCellChange(VACATES_COLS.property)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colPm}>
        <PmCell
          value={row.columns[VACATES_COLS.pm] || ""}
          propertyManagers={propertyManagers}
          onChange={handlePmChange}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[VACATES_COLS.sts] || ""}
          onChange={handleCellChange(VACATES_COLS.sts)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[VACATES_COLS.sign] || ""}
          onChange={handleCellChange(VACATES_COLS.sign)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[VACATES_COLS.key] || ""}
          onChange={handleCellChange(VACATES_COLS.key)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colVac}>
        <TextCell
          value={row.columns[VACATES_COLS.vac] || ""}
          onChange={handleCellChange(VACATES_COLS.vac)}
          placeholder="VAC"
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colComments}>
        <TextCell
          value={row.columns[VACATES_COLS.comments] || ""}
          onChange={handleCellChange(VACATES_COLS.comments)}
          placeholder="Comments"
          readOnly={readOnly}
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
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colDay}>
        <DayCell value={row.columns[ENTRIES_COLS.day] || getDayOfWeek(row.columns[ENTRIES_COLS.date] || "")} />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.signed] || ""}
          onChange={handleCellChange(ENTRIES_COLS.signed)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.bond] || ""}
          onChange={handleCellChange(ENTRIES_COLS.bond)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.twoWks] || ""}
          onChange={handleCellChange(ENTRIES_COLS.twoWks)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colProperty}>
        <PropertyCell
          value={row.columns[ENTRIES_COLS.property] || ""}
          propertyUrl={row.propertyUrl}
          onChange={handleCellChange(ENTRIES_COLS.property)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colPm}>
        <PmCell
          value={row.columns[ENTRIES_COLS.pm] || ""}
          propertyManagers={propertyManagers}
          onChange={handlePmChange}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colCheckbox}>
        <CheckboxCell
          value={row.columns[ENTRIES_COLS.ecr] || ""}
          onChange={handleCellChange(ENTRIES_COLS.ecr)}
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colEcrBy}>
        <TextCell
          value={row.columns[ENTRIES_COLS.ecrBy] || ""}
          onChange={handleCellChange(ENTRIES_COLS.ecrBy)}
          placeholder="ECR BY"
          readOnly={readOnly}
        />
      </td>
      <td className={styles.colComments}>
        <TextCell
          value={row.columns[ENTRIES_COLS.comments] || ""}
          onChange={handleCellChange(ENTRIES_COLS.comments)}
          placeholder="Comments"
          readOnly={readOnly}
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
    }
  };

  return (
    <tr
      ref={setNodeRef}
      className={styles.propertyRow}
      style={rowStyle}
      onContextMenu={handleContextMenu}
    >
      <td className={styles.dragHandle} {...attributes} {...listeners}>
        ☰
      </td>
      {renderCells()}
    </tr>
  );
};
