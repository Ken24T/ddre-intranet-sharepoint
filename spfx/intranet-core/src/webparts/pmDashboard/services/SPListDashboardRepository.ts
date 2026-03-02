/**
 * SPListDashboardRepository — SharePoint List–backed implementation
 * of IDashboardRepository.
 *
 * Production storage layer. All read/write operations go through
 * the SharePoint REST API via PnPjs.
 *
 * Design decisions:
 *  - PMD_Data uses a single-document pattern (one item, key "main").
 *    Section arrays are JSON-serialised into Note (multi-line text)
 *    fields. This mirrors the Dexie approach and keeps the data
 *    model simple for a small-scale dataset.
 *  - PMD_PropertyManagers has one item per PM with simple fields.
 *  - On first load, if no data exists the list is seeded with
 *    sample data from seedData.ts (matching Dexie behaviour).
 *  - List provisioning (field creation) runs once per instance
 *    via ensurePmDashboardLists().
 */

import type { SPFI } from "@pnp/sp";
import type { IList } from "@pnp/sp/lists";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import type { IDashboardRepository } from "./IDashboardRepository";
import type { IDashboardData, IPropertyManager, IColumnWidthPreferences } from "../models/types";
import { ensurePmDashboardLists } from "./listProvisioning";
import {
  SP_LISTS,
  DATA_SELECT,
  PM_SELECT,
  mapDataFromSP,
  mapDataToSP,
  mapPmFromSP,
  mapPmToSP,
  mapColWidthsFromSP,
  mapColWidthsToSP,
} from "./listSchemas";
import type { SPDataItem, SPPropertyManagerItem } from "./listSchemas";
import {
  SEED_PROPERTY_MANAGERS,
  SEED_DASHBOARD_DATA,
} from "../models/seedData";

const DATA_KEY = "main";

export class SPListDashboardRepository implements IDashboardRepository {
  private _listsEnsured: Promise<void> | undefined;
  private _seeded = false;

  constructor(private readonly sp: SPFI) {}

  // ─── Provisioning ──────────────────────────────────────

  /**
   * Ensure all PMD_* lists and their custom fields exist.
   * Runs once per repository instance; subsequent calls are no-ops.
   */
  private ensureLists(): Promise<void> {
    if (!this._listsEnsured) {
      this._listsEnsured = ensurePmDashboardLists(this.sp);
    }
    return this._listsEnsured;
  }

  // ─── List helpers ──────────────────────────────────────

  private get dataList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.data);
  }

  private get pmList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.propertyManagers);
  }

  // ─── Seeding ───────────────────────────────────────────

  /**
   * Seed the lists with sample data on first load if empty.
   * Matches the DexieDashboardRepository auto-seed behaviour.
   */
  private async _ensureSeeded(): Promise<void> {
    if (this._seeded) return;
    this._seeded = true;

    // Check if data exists
    const existing: SPDataItem[] = await this.dataList.items
      .select(...DATA_SELECT)
      .filter(`Title eq '${DATA_KEY}'`)
      .top(1)
      ();

    if (existing.length > 0) return;

    // First load — seed with sample data
    await this.dataList.items.add(mapDataToSP(SEED_DASHBOARD_DATA));

    // Seed PMs if none exist
    const pmCount = await this.pmList.items.select("Id").top(1)();
    if (pmCount.length === 0) {
      for (const pm of SEED_PROPERTY_MANAGERS) {
        await this.pmList.items.add(mapPmToSP(pm));
      }
    }
  }

  // ─── IDashboardRepository ─────────────────────────────

  async loadData(): Promise<IDashboardData> {
    await this.ensureLists();
    await this._ensureSeeded();

    const items: SPDataItem[] = await this.dataList.items
      .select(...DATA_SELECT)
      .filter(`Title eq '${DATA_KEY}'`)
      .top(1)
      ();

    if (items.length === 0) {
      return { vacates: [], entries: [] };
    }

    return mapDataFromSP(items[0]);
  }

  async saveData(data: IDashboardData): Promise<void> {
    await this.ensureLists();

    // Find the existing "main" item
    const items = await this.dataList.items
      .select("Id", "Title")
      .filter(`Title eq '${DATA_KEY}'`)
      .top(1)
      ();

    const spData = mapDataToSP(data);

    if (items.length > 0) {
      // Update existing record
      await this.dataList.items.getById(items[0].Id).update(spData);
    } else {
      // Create new record
      await this.dataList.items.add(spData);
    }
  }

  async loadPropertyManagers(): Promise<IPropertyManager[]> {
    await this.ensureLists();
    await this._ensureSeeded();

    const items: SPPropertyManagerItem[] = await this.pmList.items
      .select(...PM_SELECT)
      ();

    return items.map(mapPmFromSP);
  }

  async savePropertyManagers(pms: IPropertyManager[]): Promise<void> {
    await this.ensureLists();

    // Get existing items to determine adds vs updates
    const existing: Array<{ Id: number; PmId: string }> =
      await this.pmList.items.select("Id", "PmId")();

    const existingByPmId = new Map<string, number>();
    for (const item of existing) {
      existingByPmId.set(item.PmId, item.Id);
    }

    // Track which PmIds are in the new set
    const newPmIds = new Set(pms.map((pm) => pm.id));

    // Delete PMs that no longer exist
    // Use existing array directly (ES5-safe — no Map.entries() iteration)
    for (const item of existing) {
      if (!newPmIds.has(item.PmId)) {
        await this.pmList.items.getById(item.Id).delete();
      }
    }

    // Add or update PMs
    for (const pm of pms) {
      const spId = existingByPmId.get(pm.id);
      const spData = mapPmToSP(pm);

      if (spId !== undefined) {
        await this.pmList.items.getById(spId).update(spData);
      } else {
        await this.pmList.items.add(spData);
      }
    }
  }

  // ─── Column Widths ─────────────────────────────────────

  async loadColumnWidths(): Promise<IColumnWidthPreferences> {
    await this.ensureLists();

    const items: SPDataItem[] = await this.dataList.items
      .select(...DATA_SELECT)
      .filter(`Title eq '${DATA_KEY}'`)
      .top(1)
      ();

    if (items.length === 0) {
      return {};
    }

    return mapColWidthsFromSP(items[0]);
  }

  async saveColumnWidths(widths: IColumnWidthPreferences): Promise<void> {
    await this.ensureLists();

    const items = await this.dataList.items
      .select("Id", "Title")
      .filter(`Title eq '${DATA_KEY}'`)
      .top(1)
      ();

    const spData = mapColWidthsToSP(widths);

    if (items.length > 0) {
      await this.dataList.items.getById(items[0].Id).update(spData);
    } else {
      await this.dataList.items.add({ Title: DATA_KEY, ...spData });
    }
  }

  // ─── Data Version ──────────────────────────────────────

  async getDataVersion(): Promise<string> {
    await this.ensureLists();

    const items = await this.dataList.items
      .select("Modified")
      .filter(`Title eq '${DATA_KEY}'`)
      .top(1)
      ();

    if (items.length === 0) return "";

    return (items[0] as { Modified?: string }).Modified || "";
  }
}
