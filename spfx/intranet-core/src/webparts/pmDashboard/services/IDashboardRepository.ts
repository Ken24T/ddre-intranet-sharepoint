/**
 * PM Dashboard – Dashboard repository interface.
 *
 * Abstraction over the data storage layer. Implementations:
 * - DexieDashboardRepository (IndexedDB for dev harness)
 * - SPListDashboardRepository (SharePoint Lists for production)
 */

import type { IDashboardData, IPropertyManager } from "../models/types";

export interface IDashboardRepository {
  /** Load all dashboard data (vacates, entries, lost sections). */
  loadData(): Promise<IDashboardData>;

  /** Persist the full dashboard data set. */
  saveData(data: IDashboardData): Promise<void>;

  /** Load all property managers. */
  loadPropertyManagers(): Promise<IPropertyManager[]>;

  /** Persist the full list of property managers. */
  savePropertyManagers(pms: IPropertyManager[]): Promise<void>;
}
