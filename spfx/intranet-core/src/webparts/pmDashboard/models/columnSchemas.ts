/**
 * PM Dashboard – Column schemas and indices per section.
 *
 * These column layouts match the original PM Dashboard Excel
 * spreadsheet (sheet "PM Dashboard").
 */

import type {
  DashboardSection,
  IVacatesColumnIndex,
  IEntriesColumnIndex,
} from "./types";

/** Ordered column header labels for each section */
export const SECTION_COLUMNS: Record<DashboardSection, readonly string[]> = {
  vacates: ["Date", "Property", "STS", "Sign", "KEY", "VAC", "PM", "Comments"] as const,
  entries: ["Date", "Day", "Signed", "BOND", "2WKS", "Property", "ECR", "ECR BY", "PM", "Comments"] as const,
};

/** Column count per section (for creating empty rows) */
export const SECTION_COLUMN_COUNTS: Record<DashboardSection, number> = {
  vacates: SECTION_COLUMNS.vacates.length,
  entries: SECTION_COLUMNS.entries.length,
};

/** Named column indices for the Vacates section */
export const VACATES_COLS: IVacatesColumnIndex = {
  date: 0,
  property: 1,
  sts: 2,
  sign: 3,
  key: 4,
  vac: 5,
  pm: 6,
  comments: 7,
};

/** Named column indices for the Entries section */
export const ENTRIES_COLS: IEntriesColumnIndex = {
  date: 0,
  day: 1,
  signed: 2,
  bond: 3,
  twoWks: 4,
  property: 5,
  ecr: 6,
  ecrBy: 7,
  pm: 8,
  comments: 9,
};

/**
 * Return the index of the Date column for a given section.
 * All sections have Date at index 0.
 */
export function getDateColumnIndex(_section: DashboardSection): number {
  return 0;
}

/**
 * Return the index of the PM column for a given section.
 */
export function getPmColumnIndex(section: DashboardSection): number {
  switch (section) {
    case "vacates":
      return VACATES_COLS.pm;
    case "entries":
      return ENTRIES_COLS.pm;
  }
}

/**
 * Return the index of the Property column for a given section.
 */
export function getPropertyColumnIndex(section: DashboardSection): number {
  switch (section) {
    case "vacates":
      return VACATES_COLS.property;
    case "entries":
      return ENTRIES_COLS.property;
  }
}

/**
 * Create an empty columns array for a given section.
 */
export function createEmptyColumns(section: DashboardSection): string[] {
  return new Array(SECTION_COLUMN_COUNTS[section]).fill("");
}
