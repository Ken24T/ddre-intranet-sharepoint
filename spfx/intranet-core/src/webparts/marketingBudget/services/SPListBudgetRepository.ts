/**
 * SPListBudgetRepository — SharePoint List–backed implementation
 * of IBudgetRepository.
 *
 * This is the Phase 2A (production) storage layer. All read/write
 * operations go through the SharePoint REST API via PnPjs.
 *
 * Design decisions:
 *  - Complex arrays (variants, lineItems) stored as JSON in
 *    multi-line text fields (pragmatic for a small-scale dataset).
 *  - SP's built-in Created/Modified fields map to createdAt/updatedAt.
 *  - Uses PnPjs v4 invokable collections for list queries.
 *  - Soft deletes on Services/Schedules (isActive = 0) match Dexie
 *    behaviour; hard deletes on Vendors/Budgets also match.
 *  - seedData() remaps IDs since SP auto-increments — cross-entity
 *    references (vendorId, serviceId) are updated after each insert.
 */

import type { SPFI } from '@pnp/sp';
import type { IList } from '@pnp/sp/lists';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';

import type { IBudgetRepository, BudgetFilters } from './IBudgetRepository';
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from '../models/types';
import {
  SP_LISTS,
  VENDOR_SELECT,
  SERVICE_SELECT,
  SUBURB_SELECT,
  SCHEDULE_SELECT,
  BUDGET_SELECT,
  mapVendorFromSP,
  mapVendorToSP,
  mapServiceFromSP,
  mapServiceToSP,
  mapSuburbFromSP,
  mapSuburbToSP,
  mapScheduleFromSP,
  mapScheduleToSP,
  mapBudgetFromSP,
  mapBudgetToSP,
} from './listSchemas';
import type { SPVendorItem, SPServiceItem, SPSuburbItem, SPScheduleItem, SPBudgetItem } from './listSchemas';

// ─────────────────────────────────────────────────────────────
// Valid status values (for OData filter sanitisation)
// ─────────────────────────────────────────────────────────────

const VALID_STATUSES = new Set([
  'draft', 'approved', 'sent', 'archived',
]);

// ─────────────────────────────────────────────────────────────
// Repository Implementation
// ─────────────────────────────────────────────────────────────

export class SPListBudgetRepository implements IBudgetRepository {
  constructor(private readonly sp: SPFI) {}

  // ─── List helpers ───────────────────────────────────────

  private get vendorList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.vendors);
  }

  private get serviceList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.services);
  }

  private get suburbList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.suburbs);
  }

  private get scheduleList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.schedules);
  }

  private get budgetList(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.budgets);
  }

  // ─── Vendors ────────────────────────────────────────────

  async getVendors(): Promise<Vendor[]> {
    const items: SPVendorItem[] = await this.vendorList.items
      .select(...VENDOR_SELECT)
      ();
    return items.map(mapVendorFromSP);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    try {
      const item: SPVendorItem = await this.vendorList.items
        .getById(id)
        .select(...VENDOR_SELECT)();
      return mapVendorFromSP(item);
    } catch {
      return undefined;
    }
  }

  async saveVendor(vendor: Vendor): Promise<Vendor> {
    const data = mapVendorToSP(vendor);
    if (vendor.id) {
      await this.vendorList.items.getById(vendor.id).update(data);
      return vendor;
    }
    const result = await this.vendorList.items.add(data);
    return { ...vendor, id: (result as { Id: number }).Id };
  }

  async deleteVendor(id: number): Promise<void> {
    await this.vendorList.items.getById(id).delete();
  }

  // ─── Services ───────────────────────────────────────────

  async getServices(): Promise<Service[]> {
    const items: SPServiceItem[] = await this.serviceList.items
      .select(...SERVICE_SELECT)
      .filter('IsActive eq 1')
      ();
    return items.map(mapServiceFromSP);
  }

  async getAllServices(): Promise<Service[]> {
    const items: SPServiceItem[] = await this.serviceList.items
      .select(...SERVICE_SELECT)
      ();
    return items.map(mapServiceFromSP);
  }

  async getServicesByVendor(vendorId: number): Promise<Service[]> {
    const items: SPServiceItem[] = await this.serviceList.items
      .select(...SERVICE_SELECT)
      .filter(`VendorId eq ${vendorId} and IsActive eq 1`)
      ();
    return items.map(mapServiceFromSP);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const items: SPServiceItem[] = await this.serviceList.items
      .select(...SERVICE_SELECT)
      .filter(`Category eq '${category.replace(/'/g, "''")}' and IsActive eq 1`)
      ();
    return items.map(mapServiceFromSP);
  }

  async saveService(service: Service): Promise<Service> {
    // Ensure variants array exists (matches Dexie behaviour)
    const svc = { ...service };
    if (!svc.variants || !Array.isArray(svc.variants)) {
      svc.variants = [
        { id: 'default', name: 'Standard', basePrice: 0 },
      ];
    }

    const data = mapServiceToSP(svc);
    if (svc.id) {
      await this.serviceList.items.getById(svc.id).update(data);
      return svc;
    }
    const result = await this.serviceList.items.add(data);
    return {
      ...svc,
      id: (result as { Id: number }).Id,
    };
  }

  async deleteService(id: number): Promise<void> {
    // Soft delete — matches Dexie behaviour
    await this.serviceList.items.getById(id).update({ IsActive: 0 });
  }

  // ─── Suburbs ──────────────────────────────────────────

  async getSuburbs(): Promise<Suburb[]> {
    const items: SPSuburbItem[] = await this.suburbList.items
      .select(...SUBURB_SELECT)
      .orderBy('Title', true)
      ();
    return items.map(mapSuburbFromSP);
  }

  async getSuburbsByTier(tier: string): Promise<Suburb[]> {
    const items: SPSuburbItem[] = await this.suburbList.items
      .select(...SUBURB_SELECT)
      .filter(`PricingTier eq '${tier.replace(/'/g, "''")}'`)
      ();
    return items.map(mapSuburbFromSP);
  }

  async saveSuburb(suburb: Suburb): Promise<Suburb> {
    const data = mapSuburbToSP(suburb);
    if (suburb.id) {
      await this.suburbList.items.getById(suburb.id).update(data);
      return suburb;
    }
    const result = await this.suburbList.items.add(data);
    return {
      ...suburb,
      id: (result as { Id: number }).Id,
    };
  }

  async deleteSuburb(id: number): Promise<void> {
    await this.suburbList.items.getById(id).delete();
  }

  // ─── Schedules ────────────────────────────────────────

  async getSchedules(): Promise<Schedule[]> {
    const items: SPScheduleItem[] = await this.scheduleList.items
      .select(...SCHEDULE_SELECT)
      .filter('IsActive eq 1')
      ();
    return items.map(mapScheduleFromSP);
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    try {
      const item: SPScheduleItem = await this.scheduleList.items
        .getById(id)
        .select(...SCHEDULE_SELECT)();
      return mapScheduleFromSP(item);
    } catch {
      return undefined;
    }
  }

  async saveSchedule(schedule: Schedule): Promise<Schedule> {
    const data = mapScheduleToSP(schedule);
    if (schedule.id) {
      await this.scheduleList.items
        .getById(schedule.id)
        .update(data);
      // SP updates Modified automatically
      return schedule;
    }
    const result = await this.scheduleList.items.add({
      ...data,
      IsActive: 1,
    });
    return {
      ...schedule,
      id: (result as { Id: number }).Id,
    };
  }

  async deleteSchedule(id: number): Promise<void> {
    // Soft delete — matches Dexie behaviour
    await this.scheduleList.items
      .getById(id)
      .update({ IsActive: 0 });
  }

  // ─── Budgets ──────────────────────────────────────────

  async getBudgets(filters: BudgetFilters = {}): Promise<Budget[]> {
    let query = this.budgetList.items
      .select(...BUDGET_SELECT)
      .orderBy('Created', false);

    // Apply OData filter for status (sanitised)
    if (filters.status && VALID_STATUSES.has(filters.status)) {
      query = query.filter(
        `Status eq '${filters.status}'`,
      ) as typeof query;
    }

    const items: SPBudgetItem[] = await query();

    // Client-side search filter (matches Dexie behaviour)
    let mapped = items.map(mapBudgetFromSP);
    if (filters.search) {
      const search = filters.search.toLowerCase();
      mapped = mapped.filter((b) =>
        b.propertyAddress.toLowerCase().includes(search),
      );
    }

    return mapped;
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    try {
      const item: SPBudgetItem = await this.budgetList.items
        .getById(id)
        .select(...BUDGET_SELECT)();
      return mapBudgetFromSP(item);
    } catch {
      return undefined;
    }
  }

  async saveBudget(budget: Budget): Promise<Budget> {
    const data = mapBudgetToSP(budget);
    if (budget.id) {
      await this.budgetList.items.getById(budget.id).update(data);
      return budget;
    }
    // Set default status for new budgets
    if (!budget.status) {
      (data as Record<string, unknown>).Status = 'draft';
    }
    const result = await this.budgetList.items.add(data);
    return {
      ...budget,
      id: (result as { Id: number }).Id,
      status: budget.status || 'draft',
    };
  }

  async deleteBudget(id: number): Promise<void> {
    await this.budgetList.items.getById(id).delete();
  }

  // ─── Bulk operations ─────────────────────────────────

  async clearAllData(): Promise<void> {
    const listNames = [
      SP_LISTS.budgets,
      SP_LISTS.schedules,
      SP_LISTS.services,
      SP_LISTS.suburbs,
      SP_LISTS.vendors,
    ];

    for (const listName of listNames) {
      const items = await this.sp.web.lists
        .getByTitle(listName)
        .items.select('Id')
        ();

      if (items.length === 0) continue;

      // Delete in batches of 100 to stay within SP limits
      for (let i = 0; i < items.length; i += 100) {
        const batch = items.slice(i, i + 100);
        const [batchedSP, execute] = this.sp.batched();
        for (const item of batch) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          batchedSP.web.lists
            .getByTitle(listName)
            .items.getById(item.Id)
            .delete();
        }
        await execute();
      }
    }
  }

  /**
   * Seed reference data into SharePoint Lists.
   *
   * SP auto-assigns IDs, so cross-entity references (vendorId in
   * services, serviceId in schedule lineItems) are remapped after
   * each entity batch is inserted.
   */
  async seedData(data: Partial<DataExport>): Promise<void> {
    const vendorIdMap = new Map<number, number>();
    const serviceIdMap = new Map<number, number>();

    // 1. Vendors first (no cross-references)
    if (data.vendors?.length) {
      for (const vendor of data.vendors) {
        const oldId = vendor.id!;
        const spData = mapVendorToSP(vendor);
        const result = await this.vendorList.items.add(spData);
        const newId = (result as { Id: number }).Id;
        vendorIdMap.set(oldId, newId);
      }
    }

    // 2. Services (remap vendorId)
    if (data.services?.length) {
      for (const service of data.services) {
        const oldId = service.id!;
        const remapped: Service = {
          ...service,
          vendorId: service.vendorId
            ? (vendorIdMap.get(service.vendorId) ??
              service.vendorId)
            : null,
        };
        const spData = mapServiceToSP(remapped);
        const result = await this.serviceList.items.add(spData);
        const newId = (result as { Id: number }).Id;
        serviceIdMap.set(oldId, newId);
      }
    }

    // 3. Suburbs (no cross-references)
    if (data.suburbs?.length) {
      for (const suburb of data.suburbs) {
        await this.suburbList.items.add(mapSuburbToSP(suburb));
      }
    }

    // 4. Schedules (remap defaultVendorId and lineItem serviceIds)
    if (data.schedules?.length) {
      for (const schedule of data.schedules) {
        const remapped: Schedule = {
          ...schedule,
          defaultVendorId: schedule.defaultVendorId
            ? (vendorIdMap.get(schedule.defaultVendorId) ??
              schedule.defaultVendorId)
            : undefined,
          lineItems: schedule.lineItems.map((li) => ({
            ...li,
            serviceId:
              serviceIdMap.get(li.serviceId) ?? li.serviceId,
          })),
        };
        await this.scheduleList.items.add({
          ...mapScheduleToSP(remapped),
          IsActive: 1,
        });
      }
    }
  }

  async exportAll(): Promise<DataExport> {
    const [vendors, services, suburbs, schedules, budgets] =
      await Promise.all([
        this.getVendors(),
        this.getAllServices(),
        this.getSuburbs(),
        this.getSchedules(),
        this.getBudgets(),
      ]);

    return {
      exportVersion: '1.0',
      exportDate: new Date().toISOString(),
      appVersion: '0.2.0',
      vendors,
      services,
      suburbs,
      schedules,
      budgets,
    };
  }

  async importAll(data: DataExport): Promise<void> {
    await this.clearAllData();
    await this.seedData(data);

    // Budgets need full ID remapping (suburb, vendor, schedule,
    // lineItem serviceIds). Since importAll is a rare admin
    // operation, we handle it sequentially.
    if (data.budgets?.length) {
      // Build ID maps from the freshly-seeded reference data
      const freshVendors = await this.getVendors();
      const freshServices = await this.getAllServices();
      const freshSchedules = await this.getSchedules();
      const freshSuburbs = await this.getSuburbs();

      // Map old names → new IDs for best-effort matching
      const vendorByName = new Map(
        freshVendors.map((v) => [v.name, v.id!]),
      );
      const serviceByName = new Map(
        freshServices.map((s) => [s.name, s.id!]),
      );
      const scheduleByName = new Map(
        freshSchedules.map((s) => [s.name, s.id!]),
      );
      const suburbByName = new Map(
        freshSuburbs.map((s) => [s.name, s.id!]),
      );

      // Map old IDs → names from the import data
      const oldVendorNames = new Map(
        (data.vendors ?? []).map((v) => [v.id!, v.name]),
      );
      const oldServiceNames = new Map(
        (data.services ?? []).map((s) => [s.id!, s.name]),
      );
      const oldScheduleNames = new Map(
        (data.schedules ?? []).map((s) => [s.id!, s.name]),
      );
      const oldSuburbNames = new Map(
        (data.suburbs ?? []).map((s) => [s.id!, s.name]),
      );

      for (const budget of data.budgets) {
        const remapped: Budget = {
          ...budget,
          id: undefined,
          vendorId: budget.vendorId
            ? (vendorByName.get(
                oldVendorNames.get(budget.vendorId) ?? '',
              ) ?? null)
            : null,
          suburbId: budget.suburbId
            ? (suburbByName.get(
                oldSuburbNames.get(budget.suburbId) ?? '',
              ) ?? null)
            : null,
          scheduleId: budget.scheduleId
            ? (scheduleByName.get(
                oldScheduleNames.get(budget.scheduleId) ?? '',
              ) ?? null)
            : null,
          lineItems: budget.lineItems.map((li) => ({
            ...li,
            serviceId:
              serviceByName.get(
                oldServiceNames.get(li.serviceId) ?? '',
              ) ?? li.serviceId,
          })),
        };
        await this.budgetList.items.add(mapBudgetToSP(remapped));
      }
    }
  }
}
