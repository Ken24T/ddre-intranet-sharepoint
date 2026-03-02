/**
 * DexieDashboardRepository — IndexedDB-backed implementation of IDashboardRepository.
 *
 * Phase 1 storage layer. All read/write operations go through Dexie (IndexedDB).
 * On first load, the database is seeded with sample data from seedData.ts.
 *
 * When the SharePoint tenant integration is ready, SPListDashboardRepository
 * will replace this implementation behind the same interface.
 */

import type { IDashboardRepository } from "./IDashboardRepository";
import type { IDashboardData, IPropertyManager, IColumnWidthPreferences } from "../models/types";
import { db } from "./db";
import {
  SEED_PROPERTY_MANAGERS,
  SEED_DASHBOARD_DATA,
} from "../models/seedData";

const DASHBOARD_KEY = "main";

export class DexieDashboardRepository implements IDashboardRepository {
  private _seeded = false;

  /**
   * Ensure the database is seeded with sample data on first load.
   * This is a no-op if data already exists.
   */
  private async _ensureSeeded(): Promise<void> {
    if (this._seeded) return;
    this._seeded = true;

    const existing = await db.dashboardData.get(DASHBOARD_KEY);
    if (existing) return;

    // First load — seed with sample data
    await db.dashboardData.put({
      key: DASHBOARD_KEY,
      data: SEED_DASHBOARD_DATA,
    });

    const existingPms = await db.propertyManagers.count();
    if (existingPms === 0) {
      await db.propertyManagers.bulkPut(SEED_PROPERTY_MANAGERS);
    }
  }

  async loadData(): Promise<IDashboardData> {
    await this._ensureSeeded();

    const record = await db.dashboardData.get(DASHBOARD_KEY);
    if (!record) {
      return { vacates: [], entries: [], lost: [] };
    }
    return record.data;
  }

  async saveData(data: IDashboardData): Promise<void> {
    await db.dashboardData.put({
      key: DASHBOARD_KEY,
      data,
    });
  }

  async loadPropertyManagers(): Promise<IPropertyManager[]> {
    await this._ensureSeeded();
    return db.propertyManagers.toArray();
  }

  async savePropertyManagers(pms: IPropertyManager[]): Promise<void> {
    await db.transaction("rw", db.propertyManagers, async () => {
      await db.propertyManagers.clear();
      await db.propertyManagers.bulkPut(pms);
    });
  }

  async loadColumnWidths(): Promise<IColumnWidthPreferences> {
    const record = await db.columnWidths.get(DASHBOARD_KEY);
    if (!record) {
      return {};
    }
    return record.widths;
  }

  async saveColumnWidths(widths: IColumnWidthPreferences): Promise<void> {
    await db.columnWidths.put({
      key: DASHBOARD_KEY,
      widths,
    });
  }
}
