/**
 * PM Dashboard – Core Type Definitions
 *
 * These types mirror the standalone app's data model while adding
 * TypeScript strictness. The column schemas use the post-migration
 * layout (legacy ST/Sign/KEY/ECR columns removed).
 */

/** The three table sections in the dashboard */
export type DashboardSection = "vacates" | "entries" | "lost";

/** A single property row in any section */
export interface IPropertyRow {
  /** Unique identifier (GUID) */
  id: string;
  /** Initials of the assigned property manager */
  pm: string;
  /** Optional PropertyMe URL for the property */
  propertyUrl?: string;
  /** Column values, ordered per SECTION_COLUMNS */
  columns: string[];
  /** If true, this is a blank spacer row */
  blank?: boolean;
}

/** Full dashboard data — one array per section */
export interface IDashboardData {
  vacates: IPropertyRow[];
  entries: IPropertyRow[];
  lost: IPropertyRow[];
}

/** A property manager user */
export interface IPropertyManager {
  /** Unique identifier (GUID) */
  id: string;
  firstName: string;
  lastName: string;
  /** Short/preferred display name (e.g. "Ken") */
  preferredName: string;
  /** Hex colour for row backgrounds (e.g. "#ffc0cb") */
  color: string;
}

/** Column index maps for quick lookup within each section */
export interface IColumnIndex {
  readonly date: number;
  readonly property: number;
  readonly pm: number;
}

/** Vacates-specific column indices */
export interface IVacatesColumnIndex extends IColumnIndex {
  readonly vac: number;
  readonly reason: number;
}

/** Entries-specific column indices */
export interface IEntriesColumnIndex extends IColumnIndex {
  readonly day: number;
  readonly signed: number;
  readonly bond: number;
  readonly twoWks: number;
  readonly comments: number;
}

/** Lost-specific column indices */
export interface ILostColumnIndex extends IColumnIndex {
  readonly reason: number;
}
