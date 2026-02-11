/**
 * DexieBudgetRepository — IndexedDB‑backed implementation of IBudgetRepository.
 *
 * This is the Phase A storage layer. All read/write operations go through Dexie
 * (IndexedDB). When the SharePoint tenant is provisioned, a new implementation
 * (SPListBudgetRepository) can replace this one behind the same interface.
 */

import type { IBudgetRepository, BudgetFilters } from "./IBudgetRepository";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from "../models/types";
import { db } from "./db";

export class DexieBudgetRepository implements IBudgetRepository {
  // ─── Vendors ──────────────────────────────────────────────

  async getVendors(): Promise<Vendor[]> {
    return db.vendors.toArray();
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return db.vendors.get(id);
  }

  async saveVendor(vendor: Vendor): Promise<Vendor> {
    if (vendor.id) {
      await db.vendors.update(vendor.id, vendor);
      return vendor;
    }
    const id = await db.vendors.add({ ...vendor, isActive: 1 });
    return { ...vendor, id };
  }

  async deleteVendor(id: number): Promise<void> {
    await db.vendors.delete(id);
  }

  // ─── Services ─────────────────────────────────────────────

  async getServices(): Promise<Service[]> {
    const all = await db.services.toArray();
    return all.filter((s) => s.isActive !== 0);
  }

  async getAllServices(): Promise<Service[]> {
    return db.services.toArray();
  }

  async getServicesByVendor(vendorId: number): Promise<Service[]> {
    return db.services
      .where("vendorId")
      .equals(vendorId)
      .and((s) => s.isActive === 1)
      .toArray();
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return db.services
      .where("category")
      .equals(category)
      .and((s) => s.isActive === 1)
      .toArray();
  }

  async saveService(service: Service): Promise<Service> {
    // Ensure variants array exists
    if (!service.variants || !Array.isArray(service.variants)) {
      service.variants = [{ id: "default", name: "Standard", basePrice: 0 }];
    }
    if (service.id) {
      await db.services.put(service);
      return service;
    }
    const id = await db.services.add({ ...service, isActive: 1 });
    return { ...service, id };
  }

  async deleteService(id: number): Promise<void> {
    // Soft delete
    await db.services.update(id, { isActive: 0 });
  }

  // ─── Suburbs ──────────────────────────────────────────────

  async getSuburbs(): Promise<Suburb[]> {
    return db.suburbs.orderBy("name").toArray();
  }

  async getSuburbsByTier(tier: string): Promise<Suburb[]> {
    return db.suburbs.where("pricingTier").equals(tier).toArray();
  }

  async saveSuburb(suburb: Suburb): Promise<Suburb> {
    if (suburb.id) {
      await db.suburbs.update(suburb.id, suburb);
      return suburb;
    }
    const id = await db.suburbs.add(suburb);
    return { ...suburb, id };
  }

  async deleteSuburb(id: number): Promise<void> {
    await db.suburbs.delete(id);
  }

  // ─── Schedules ────────────────────────────────────────────

  async getSchedules(): Promise<Schedule[]> {
    return db.schedules.filter((s) => s.isActive !== 0).toArray();
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    return db.schedules.get(id);
  }

  async saveSchedule(schedule: Schedule): Promise<Schedule> {
    const now = new Date().toISOString();
    if (schedule.id) {
      schedule.updatedAt = now;
      await db.schedules.put(schedule);
      return schedule;
    }
    schedule.createdAt = now;
    schedule.updatedAt = now;
    schedule.isActive = 1;
    const id = await db.schedules.add(schedule);
    return { ...schedule, id };
  }

  async deleteSchedule(id: number): Promise<void> {
    // Soft delete
    await db.schedules.update(id, { isActive: 0 });
  }

  // ─── Budgets ──────────────────────────────────────────────

  async getBudgets(filters: BudgetFilters = {}): Promise<Budget[]> {
    let collection = db.budgets.orderBy("createdAt").reverse();

    if (filters.status) {
      collection = collection.filter(
        (b) => b.status === filters.status,
      ) as typeof collection;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      collection = collection.filter((b) =>
        b.propertyAddress.toLowerCase().includes(search),
      ) as typeof collection;
    }

    return collection.toArray();
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return db.budgets.get(id);
  }

  async saveBudget(budget: Budget): Promise<Budget> {
    const now = new Date().toISOString();
    if (budget.id) {
      budget.updatedAt = now;
      await db.budgets.put(budget);
      return budget;
    }
    budget.createdAt = now;
    budget.updatedAt = now;
    budget.status = budget.status || "draft";
    const id = await db.budgets.add(budget);
    return { ...budget, id };
  }

  async deleteBudget(id: number): Promise<void> {
    await db.budgets.delete(id);
  }

  // ─── Bulk operations ─────────────────────────────────────

  async clearAllData(): Promise<void> {
    await db.transaction(
      "rw",
      [db.vendors, db.services, db.suburbs, db.schedules, db.budgets],
      async () => {
        await db.vendors.clear();
        await db.services.clear();
        await db.suburbs.clear();
        await db.schedules.clear();
        await db.budgets.clear();
      },
    );
  }

  async seedData(data: Partial<DataExport>): Promise<void> {
    await db.transaction(
      "rw",
      [db.vendors, db.services, db.suburbs, db.schedules],
      async () => {
        if (data.vendors?.length) await db.vendors.bulkPut(data.vendors);
        if (data.services?.length) await db.services.bulkPut(data.services);
        if (data.suburbs?.length) await db.suburbs.bulkPut(data.suburbs);
        if (data.schedules?.length) await db.schedules.bulkPut(data.schedules);
      },
    );
  }

  async exportAll(): Promise<DataExport> {
    return {
      exportVersion: "1.0",
      exportDate: new Date().toISOString(),
      appVersion: "0.1.0",
      vendors: await db.vendors.toArray(),
      services: await db.services.toArray(),
      suburbs: await db.suburbs.toArray(),
      schedules: await db.schedules.toArray(),
      budgets: await db.budgets.toArray(),
    };
  }

  async importAll(data: DataExport): Promise<void> {
    await this.clearAllData();
    await this.seedData(data);
    if (data.budgets?.length) {
      await db.budgets.bulkAdd(data.budgets);
    }
  }
}
