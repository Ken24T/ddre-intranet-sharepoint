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
  SectionColumnWidths,
} from "./types";

/** Ordered column header labels for each section */
export const SECTION_COLUMNS: Record<DashboardSection, readonly string[]> = {
  vacates: ["Date", "Property", "VAC", "PM", "Comments"] as const,
  entries: ["Date", "Day", "Signed", "BOND", "2WKS", "Property", "ECR", "Bag", "ECR BY", "PM", "Comments"] as const,
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
  vac: 2,
  pm: 3,
  comments: 4,
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
  bag: 7,
  ecrBy: 8,
  pm: 9,
  comments: 10,
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
 * Default column widths (px) per section.
 *
 * Columns with a default width get a fixed initial size;
 * columns omitted from the map take the remaining space
 * (shared equally).  These defaults ensure `table-layout: fixed`
 * produces reasonable proportions even before the user
 * has resized anything.
 */
export const DEFAULT_COLUMN_WIDTHS: Record<DashboardSection, SectionColumnWidths> = {
  vacates: {
    [VACATES_COLS.date]: 50,
    [VACATES_COLS.vac]: 65,
    [VACATES_COLS.pm]: 36,
    // Property & Comments take remaining space
  },
  entries: {
    [ENTRIES_COLS.date]: 50,
    [ENTRIES_COLS.day]: 34,
    [ENTRIES_COLS.signed]: 38,
    [ENTRIES_COLS.bond]: 38,
    [ENTRIES_COLS.twoWks]: 38,
    [ENTRIES_COLS.ecr]: 32,
    [ENTRIES_COLS.bag]: 32,
    [ENTRIES_COLS.ecrBy]: 65,
    [ENTRIES_COLS.pm]: 36,
    // Property & Comments take remaining space
  },
};

/**
 * Create an empty columns array for a given section.
 */
export function createEmptyColumns(section: DashboardSection): string[] {
  return new Array(SECTION_COLUMN_COUNTS[section]).fill("");
}
