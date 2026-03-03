/**
 * Column migration – Transforms row data from legacy column layouts
 * to the current schema.
 *
 * v0.13.3 → v0.14.0 column changes:
 *
 * Vacates (8 → 5 columns):
 *   Old: [Date, Property, STS, Sign, KEY, VAC, PM, Comments]
 *   New: [Date, Property, VAC, PM, Comments]
 *   Mapping: keep [0,1], drop [2,3,4], remap 5→2, 6→3, 7→4
 *
 * Entries (10 → 11 columns):
 *   Old: [Date, Day, Signed, BOND, 2WKS, Property, ECR, ECR BY, PM, Comments]
 *   New: [Date, Day, Signed, BOND, 2WKS, Property, ECR, Bag, ECR BY, PM, Comments]
 *   Mapping: keep [0–6], insert "" at 7 (Bag), remap 7→8, 8→9, 9→10
 *
 * The migration is idempotent — rows already at the correct length
 * pass through unchanged.
 */

import type { IDashboardData, IPropertyRow } from "./types";

/** Expected column count for each section after migration. */
export const EXPECTED_VACATES_COLS = 5;
export const EXPECTED_ENTRIES_COLS = 11;

/** Legacy column counts (pre-migration). */
const LEGACY_VACATES_COLS = 8;
const LEGACY_ENTRIES_COLS = 10;

/**
 * Migrate a single vacates row from 8-column to 5-column layout.
 *
 * Old indices:          New indices:
 *   0 Date        →    0 Date
 *   1 Property    →    1 Property
 *   2 STS         →    (dropped)
 *   3 Sign        →    (dropped)
 *   4 KEY         →    (dropped)
 *   5 VAC         →    2 VAC
 *   6 PM          →    3 PM
 *   7 Comments    →    4 Comments
 */
export function migrateVacatesRow(row: IPropertyRow): IPropertyRow {
  if (row.blank) return row;
  if (!row.columns || row.columns.length === 0) return row;
  if (row.columns.length === EXPECTED_VACATES_COLS) return row;

  if (row.columns.length === LEGACY_VACATES_COLS) {
    const old = row.columns;
    return {
      ...row,
      columns: [
        old[0], // Date
        old[1], // Property
        old[5], // VAC
        old[6], // PM
        old[7], // Comments
      ],
    };
  }

  // Unknown length — return as-is (will be padded/truncated by
  // createEmptyColumns if needed)
  return row;
}

/**
 * Migrate a single entries row from 10-column to 11-column layout.
 *
 * Old indices:          New indices:
 *   0 Date        →    0 Date
 *   1 Day         →    1 Day
 *   2 Signed      →    2 Signed
 *   3 BOND        →    3 BOND
 *   4 2WKS        →    4 2WKS
 *   5 Property    →    5 Property
 *   6 ECR         →    6 ECR
 *                      7 Bag (new — "")
 *   7 ECR BY      →    8 ECR BY
 *   8 PM          →    9 PM
 *   9 Comments    →   10 Comments
 */
export function migrateEntriesRow(row: IPropertyRow): IPropertyRow {
  if (row.blank) return row;
  if (!row.columns || row.columns.length === 0) return row;
  if (row.columns.length === EXPECTED_ENTRIES_COLS) return row;

  if (row.columns.length === LEGACY_ENTRIES_COLS) {
    const old = row.columns;
    return {
      ...row,
      columns: [
        old[0], // Date
        old[1], // Day
        old[2], // Signed
        old[3], // BOND
        old[4], // 2WKS
        old[5], // Property
        old[6], // ECR
        "",     // Bag (new)
        old[7], // ECR BY
        old[8], // PM
        old[9], // Comments
      ],
    };
  }

  // Unknown length — return as-is
  return row;
}

/**
 * Migrate an entire dashboard data set.
 *
 * Returns a new object only if any rows were actually changed;
 * otherwise returns the original reference (for identity checks).
 */
export function migrateColumns(data: IDashboardData): IDashboardData {
  let changed = false;

  const vacates = data.vacates.map((row) => {
    const migrated = migrateVacatesRow(row);
    if (migrated !== row) changed = true;
    return migrated;
  });

  const entries = data.entries.map((row) => {
    const migrated = migrateEntriesRow(row);
    if (migrated !== row) changed = true;
    return migrated;
  });

  if (!changed) return data;

  return { vacates, entries };
}
