/**
 * Dexie database schema for the PM Dashboard.
 *
 * Stores dashboard data (vacates/entries rows) and
 * property manager definitions. Uses a `-spfx` suffix to
 * avoid collisions with the standalone PWA.
 *
 * The dashboard data is stored as a single document (key "main")
 * rather than individual rows — this matches the standalone app's
 * JSON file approach and avoids complex relational mapping.
 */

import Dexie, { type Table } from "dexie";
import type { IDashboardData, IPropertyManager, IColumnWidthPreferences } from "../models/types";

/** Wrapper record for dashboard data stored in IndexedDB */
export interface IDashboardDataRecord {
  /** Fixed key — always "main" (single-document store) */
  key: string;
  /** The full dashboard data payload */
  data: IDashboardData;
}

/** Column width preferences stored in IndexedDB */
export interface IColumnWidthRecord {
  /** Fixed key — always "main" */
  key: string;
  /** Per-PM column width preferences */
  widths: IColumnWidthPreferences;
}

export class PmDashboardDb extends Dexie {
  dashboardData!: Table<IDashboardDataRecord, string>;
  propertyManagers!: Table<IPropertyManager, string>;
  columnWidths!: Table<IColumnWidthRecord, string>;

  constructor() {
    super("pm-dashboard-spfx");

    this.version(1).stores({
      dashboardData: "key",
      propertyManagers: "id",
    });

    this.version(2).stores({
      dashboardData: "key",
      propertyManagers: "id",
      columnWidths: "key",
    });
  }
}

/** Singleton database instance. */
export const db = new PmDashboardDb();
