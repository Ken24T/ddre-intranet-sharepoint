/**
 * PM Dashboard – Dashboard repository interface.
 *
 * Abstraction over the data storage layer. Implementations:
 * - DexieDashboardRepository (IndexedDB for dev harness)
 * - SPListDashboardRepository (SharePoint Lists for production)
 */

import type { IDashboardData, IPropertyManager, IColumnWidthPreferences } from "../models/types";

export interface IDashboardRepository {
  /** Load all dashboard data (vacates, entries, lost sections). */
  loadData(): Promise<IDashboardData>;

  /** Persist the full dashboard data set. */
  saveData(data: IDashboardData): Promise<void>;

  /** Load all property managers. */
  loadPropertyManagers(): Promise<IPropertyManager[]>;

  /** Persist the full list of property managers. */
  savePropertyManagers(pms: IPropertyManager[]): Promise<void>;

  /** Load per-PM column width preferences. */
  loadColumnWidths(): Promise<IColumnWidthPreferences>;

  /** Persist per-PM column width preferences. */
  saveColumnWidths(widths: IColumnWidthPreferences): Promise<void>;

  /**
   * Return a version token for the dashboard data.
   *
   * Used by polling-based real-time sync to detect external changes.
   * Returns a string that changes whenever the underlying data is modified
   * (e.g. the SharePoint list item's Modified timestamp).
   *
   * Implementations that don't support versioning may return an empty string.
   */
  getDataVersion(): Promise<string>;
}
