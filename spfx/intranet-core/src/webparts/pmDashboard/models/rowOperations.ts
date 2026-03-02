/**
 * PM Dashboard – Row operation utilities.
 *
 * Pure functions for adding, removing, reordering, and validating
 * property rows. These are used by the dashboard reducer and
 * do not mutate their inputs (immutable updates).
 */

import type { IPropertyRow, IDashboardData, DashboardSection } from "./types";
import { createEmptyColumns, getPmColumnIndex } from "./columnSchemas";
import { displayToIso, getDayOfWeek, todayDisplay } from "./dateHelpers";

/**
 * Generate a unique ID for a new row.
 * Uses crypto.randomUUID() where available, with a fallback.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─────────────────────────────────────────────────────────────
// Row Creation
// ─────────────────────────────────────────────────────────────

/**
 * Create a new property row for a given section.
 *
 * @param section - Target section
 * @param pmInitials - Initials of the currently selected PM
 * @param inheritedDate - Date to inherit from the context row (DD/MM), or today's date
 */
export function createPropertyRow(
  section: DashboardSection,
  pmInitials: string,
  inheritedDate?: string,
): IPropertyRow {
  const columns = createEmptyColumns(section);
  const dateValue = inheritedDate || todayDisplay();

  // Set Date column (always index 0)
  columns[0] = dateValue;

  // Auto-calculate Day column for entries
  if (section === "entries") {
    columns[1] = getDayOfWeek(dateValue);
  }

  // Set PM column
  const pmIdx = getPmColumnIndex(section);
  columns[pmIdx] = pmInitials;

  return {
    id: generateId(),
    pm: pmInitials,
    columns,
  };
}

/**
 * Create a blank spacer row.
 */
export function createBlankRow(): IPropertyRow {
  return {
    id: generateId(),
    pm: "",
    columns: [],
    blank: true,
  };
}

// ─────────────────────────────────────────────────────────────
// Row Insertion
// ─────────────────────────────────────────────────────────────

/**
 * Insert a row into a section's row array after a specified row.
 * If afterRowId is not found or undefined, the row is appended.
 *
 * @returns A new array with the row inserted (does not mutate input).
 */
export function insertRow(
  rows: IPropertyRow[],
  newRow: IPropertyRow,
  afterRowId?: string,
): IPropertyRow[] {
  if (!afterRowId) return [...rows, newRow];

  const idx = rows.findIndex((r) => r.id === afterRowId);
  if (idx === -1) return [...rows, newRow];

  const result = [...rows];
  result.splice(idx + 1, 0, newRow);
  return result;
}

// ─────────────────────────────────────────────────────────────
// Row Removal
// ─────────────────────────────────────────────────────────────

/**
 * Remove a row by ID.
 *
 * @returns A new array without the specified row.
 */
export function removeRow(rows: IPropertyRow[], rowId: string): IPropertyRow[] {
  return rows.filter((r) => r.id !== rowId);
}

// ─────────────────────────────────────────────────────────────
// Row Reordering
// ─────────────────────────────────────────────────────────────

/**
 * Reorder rows to match a new ID ordering (from drag-and-drop).
 *
 * @param rows - Current rows
 * @param newOrder - Array of row IDs in the desired order
 * @returns A new array in the specified order
 */
export function reorderRows(
  rows: IPropertyRow[],
  newOrder: string[],
): IPropertyRow[] {
  const rowMap = new Map(rows.map((r) => [r.id, r]));
  const result: IPropertyRow[] = [];

  for (const id of newOrder) {
    const row = rowMap.get(id);
    if (row) result.push(row);
  }

  return result;
}

/**
 * Reorder a row by date: remove the row from its current position
 * and insert it after the last row with the same date.
 *
 * Used when a row's date is changed to move it into the correct
 * chronological position within its date group.
 *
 * @returns A new array with the row repositioned.
 */
export function reorderByDate(
  rows: IPropertyRow[],
  rowId: string,
  newDate: string,
): IPropertyRow[] {
  const rowIndex = rows.findIndex((r) => r.id === rowId);
  if (rowIndex === -1) return rows;

  const changedRow = rows[rowIndex];
  const remaining = rows.filter((_, i) => i !== rowIndex);

  // Find the last row with the same date to insert after
  let insertPosition = -1;
  for (let i = remaining.length - 1; i >= 0; i--) {
    const row = remaining[i];
    if (!row.blank && row.columns && row.columns[0] === newDate) {
      insertPosition = i + 1;
      break;
    }
  }

  if (insertPosition === -1) {
    // No matching date found — find insertion point by chronological order
    const newDateIso = displayToIso(newDate);
    insertPosition = remaining.findIndex(
      (r) =>
        !r.blank &&
        r.columns &&
        r.columns[0] &&
        displayToIso(r.columns[0]) > newDateIso,
    );
    if (insertPosition === -1) insertPosition = remaining.length;
  }

  const result = [...remaining];
  result.splice(insertPosition, 0, changedRow);
  return result;
}

/**
 * Update a dragged row's date based on its new position among neighbours.
 * Looks up to 3 rows in both directions for a row with a different date,
 * and adopts that date. Also recalculates Day column for entries.
 *
 * @param rows - The reordered rows (post-drag)
 * @param draggedRowId - ID of the dragged row
 * @param section - The section being dragged in
 * @returns A new array with the dragged row's date updated (or unchanged).
 */
export function updateDateFromDragPosition(
  rows: IPropertyRow[],
  draggedRowId: string,
  section: DashboardSection,
): IPropertyRow[] {
  const draggedIndex = rows.findIndex((r) => r.id === draggedRowId);
  if (draggedIndex === -1) return rows;

  const draggedRow = rows[draggedIndex];
  if (draggedRow.blank || !draggedRow.columns || !draggedRow.columns[0]) {
    return rows;
  }

  const currentDate = draggedRow.columns[0];
  let targetDate: string | null = null;

  // Search up to 3 neighbours in both directions
  for (let offset = 1; offset <= 3; offset++) {
    const afterIndex = draggedIndex + offset;
    if (afterIndex < rows.length) {
      const afterRow = rows[afterIndex];
      if (
        afterRow &&
        !afterRow.blank &&
        afterRow.columns &&
        afterRow.columns[0] &&
        afterRow.columns[0] !== currentDate
      ) {
        targetDate = afterRow.columns[0];
        break;
      }
    }

    const beforeIndex = draggedIndex - offset;
    if (beforeIndex >= 0) {
      const beforeRow = rows[beforeIndex];
      if (
        beforeRow &&
        !beforeRow.blank &&
        beforeRow.columns &&
        beforeRow.columns[0] &&
        beforeRow.columns[0] !== currentDate
      ) {
        targetDate = beforeRow.columns[0];
        break;
      }
    }
  }

  if (!targetDate || targetDate === currentDate) return rows;

  // Update the dragged row's date
  const updatedRow: IPropertyRow = {
    ...draggedRow,
    columns: [...draggedRow.columns],
  };
  updatedRow.columns[0] = targetDate;

  // Recalculate Day column for entries
  if (section === "entries" && updatedRow.columns.length > 1) {
    updatedRow.columns[1] = getDayOfWeek(targetDate);
  }

  const result = [...rows];
  result[draggedIndex] = updatedRow;
  return result;
}

// ─────────────────────────────────────────────────────────────
// Row Update
// ─────────────────────────────────────────────────────────────

/**
 * Update a single row's columns array.
 *
 * @returns A new array with the specified row's columns replaced.
 */
export function updateRowColumns(
  rows: IPropertyRow[],
  rowId: string,
  columns: string[],
): IPropertyRow[] {
  return rows.map((r) =>
    r.id === rowId ? { ...r, columns: [...columns] } : r,
  );
}

/**
 * Update a single column value within a row.
 *
 * @returns A new array with the specified cell updated.
 */
export function updateCell(
  rows: IPropertyRow[],
  rowId: string,
  columnIndex: number,
  value: string,
): IPropertyRow[] {
  return rows.map((r) => {
    if (r.id !== rowId) return r;
    const newColumns = [...r.columns];
    newColumns[columnIndex] = value;
    return { ...r, columns: newColumns };
  });
}

/**
 * Update a row's PM assignment (both the `pm` field and the PM column).
 *
 * @returns A new array with the row's PM updated.
 */
export function updateRowPm(
  rows: IPropertyRow[],
  rowId: string,
  section: DashboardSection,
  newPmInitials: string,
): IPropertyRow[] {
  const pmColIdx = getPmColumnIndex(section);
  return rows.map((r) => {
    if (r.id !== rowId) return r;
    const newColumns = [...r.columns];
    newColumns[pmColIdx] = newPmInitials;
    return { ...r, pm: newPmInitials, columns: newColumns };
  });
}

/**
 * Update a row's propertyUrl.
 *
 * @returns A new array with the row's URL updated.
 */
export function updateRowPropertyUrl(
  rows: IPropertyRow[],
  rowId: string,
  propertyUrl: string,
): IPropertyRow[] {
  return rows.map((r) =>
    r.id === rowId ? { ...r, propertyUrl } : r,
  );
}

// ─────────────────────────────────────────────────────────────
// Data Validation
// ─────────────────────────────────────────────────────────────

/**
 * Validate and clean dashboard data by removing null/undefined rows
 * and rows without IDs.
 *
 * @returns A new IDashboardData with invalid rows stripped.
 */
export function validateAndCleanData(data: IDashboardData): IDashboardData {
  const cleanSection = (rows: IPropertyRow[]): IPropertyRow[] => {
    if (!Array.isArray(rows)) return [];
    return rows.filter((row) => {
      if (!row) return false;
      if (!row.id) return false;
      return true;
    });
  };

  return {
    vacates: cleanSection(data.vacates),
    entries: cleanSection(data.entries),
    lost: cleanSection(data.lost),
  };
}

// ─────────────────────────────────────────────────────────────
// Paste Sanitiser
// ─────────────────────────────────────────────────────────────

/**
 * Strip pasted text to plain text with normalised whitespace.
 * Removes HTML tags, normalises whitespace, and trims.
 */
export function sanitisePastedText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/\s+/g, " ") // Normalise whitespace
    .trim();
}
