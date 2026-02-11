/**
 * AuditedBudgetRepository — Decorator that adds audit logging around
 * any IBudgetRepository implementation.
 *
 * Every write operation (save, delete, seed, import, clearAllData)
 * is logged through an IAuditLogger while the underlying repository
 * does the actual persistence.
 *
 * Reads are delegated directly with no overhead.
 */

import type { IBudgetRepository, BudgetFilters } from "./IBudgetRepository";
import type { IAuditLogger } from "./IAuditLogger";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from "../models/types";
import type { AuditAction, AuditEntityType } from "../models/auditTypes";

export class AuditedBudgetRepository implements IBudgetRepository {
  constructor(
    private readonly inner: IBudgetRepository,
    private readonly logger: IAuditLogger,
    private readonly userName: string,
  ) {}

  // ─── Private helpers ────────────────────────────────────

  private async logEntry(
    entityType: AuditEntityType,
    entityId: number | null,
    entityLabel: string,
    action: AuditAction,
    summary: string,
    before: unknown,
    after: unknown,
  ): Promise<void> {
    await this.logger.log({
      timestamp: new Date().toISOString(),
      user: this.userName,
      entityType,
      entityId,
      entityLabel,
      action,
      summary,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
    });
  }

  // ─── Vendors ────────────────────────────────────────────

  getVendors(): Promise<Vendor[]> {
    return this.inner.getVendors();
  }
  getVendor(id: number): Promise<Vendor | undefined> {
    return this.inner.getVendor(id);
  }

  async saveVendor(vendor: Vendor): Promise<Vendor> {
    const before = vendor.id
      ? await this.inner.getVendor(vendor.id)
      : undefined;
    const saved = await this.inner.saveVendor(vendor);
    await this.logEntry(
      "vendor",
      saved.id ?? null,
      saved.name,
      before ? "update" : "create",
      before ? `Updated vendor "${saved.name}"` : `Created vendor "${saved.name}"`,
      before ?? null,
      saved,
    );
    return saved;
  }

  async deleteVendor(id: number): Promise<void> {
    const before = await this.inner.getVendor(id);
    await this.inner.deleteVendor(id);
    await this.logEntry(
      "vendor",
      id,
      before?.name ?? `#${id}`,
      "delete",
      `Deleted vendor "${before?.name ?? id}"`,
      before ?? null,
      null,
    );
  }

  // ─── Services ───────────────────────────────────────────

  getServices(): Promise<Service[]> {
    return this.inner.getServices();
  }
  getAllServices(): Promise<Service[]> {
    return this.inner.getAllServices();
  }
  getServicesByVendor(vendorId: number): Promise<Service[]> {
    return this.inner.getServicesByVendor(vendorId);
  }
  getServicesByCategory(category: string): Promise<Service[]> {
    return this.inner.getServicesByCategory(category);
  }

  async saveService(service: Service): Promise<Service> {
    const before = service.id
      ? (await this.inner.getAllServices()).find((s) => s.id === service.id)
      : undefined;
    const saved = await this.inner.saveService(service);
    await this.logEntry(
      "service",
      saved.id ?? null,
      saved.name,
      before ? "update" : "create",
      before ? `Updated service "${saved.name}"` : `Created service "${saved.name}"`,
      before ?? null,
      saved,
    );
    return saved;
  }

  async deleteService(id: number): Promise<void> {
    const all = await this.inner.getAllServices();
    const before = all.find((s) => s.id === id);
    await this.inner.deleteService(id);
    await this.logEntry(
      "service",
      id,
      before?.name ?? `#${id}`,
      "delete",
      `Deleted service "${before?.name ?? id}"`,
      before ?? null,
      null,
    );
  }

  // ─── Suburbs ──────────────────────────────────────────

  getSuburbs(): Promise<Suburb[]> {
    return this.inner.getSuburbs();
  }
  getSuburbsByTier(tier: string): Promise<Suburb[]> {
    return this.inner.getSuburbsByTier(tier);
  }

  async saveSuburb(suburb: Suburb): Promise<Suburb> {
    const before = suburb.id
      ? (await this.inner.getSuburbs()).find((s) => s.id === suburb.id)
      : undefined;
    const saved = await this.inner.saveSuburb(suburb);
    await this.logEntry(
      "suburb",
      saved.id ?? null,
      saved.name,
      before ? "update" : "create",
      before ? `Updated suburb "${saved.name}"` : `Created suburb "${saved.name}"`,
      before ?? null,
      saved,
    );
    return saved;
  }

  async deleteSuburb(id: number): Promise<void> {
    const before = (await this.inner.getSuburbs()).find((s) => s.id === id);
    await this.inner.deleteSuburb(id);
    await this.logEntry(
      "suburb",
      id,
      before?.name ?? `#${id}`,
      "delete",
      `Deleted suburb "${before?.name ?? id}"`,
      before ?? null,
      null,
    );
  }

  // ─── Schedules ────────────────────────────────────────

  getSchedules(): Promise<Schedule[]> {
    return this.inner.getSchedules();
  }
  getSchedule(id: number): Promise<Schedule | undefined> {
    return this.inner.getSchedule(id);
  }

  async saveSchedule(schedule: Schedule): Promise<Schedule> {
    const before = schedule.id
      ? await this.inner.getSchedule(schedule.id)
      : undefined;
    const saved = await this.inner.saveSchedule(schedule);
    await this.logEntry(
      "schedule",
      saved.id ?? null,
      saved.name,
      before ? "update" : "create",
      before ? `Updated schedule "${saved.name}"` : `Created schedule "${saved.name}"`,
      before ?? null,
      saved,
    );
    return saved;
  }

  async deleteSchedule(id: number): Promise<void> {
    const before = await this.inner.getSchedule(id);
    await this.inner.deleteSchedule(id);
    await this.logEntry(
      "schedule",
      id,
      before?.name ?? `#${id}`,
      "delete",
      `Deleted schedule "${before?.name ?? id}"`,
      before ?? null,
      null,
    );
  }

  // ─── Budgets ──────────────────────────────────────────

  getBudgets(filters?: BudgetFilters): Promise<Budget[]> {
    return this.inner.getBudgets(filters);
  }
  getBudget(id: number): Promise<Budget | undefined> {
    return this.inner.getBudget(id);
  }

  async saveBudget(budget: Budget): Promise<Budget> {
    const before = budget.id
      ? await this.inner.getBudget(budget.id)
      : undefined;
    const saved = await this.inner.saveBudget(budget);

    const isStatusChange = before && before.status !== saved.status;
    await this.logEntry(
      "budget",
      saved.id ?? null,
      saved.propertyAddress,
      isStatusChange ? "statusChange" : before ? "update" : "create",
      isStatusChange
        ? `Status changed from "${before.status}" to "${saved.status}"`
        : before
          ? `Updated budget for "${saved.propertyAddress}"`
          : `Created budget for "${saved.propertyAddress}"`,
      before ?? null,
      saved,
    );
    return saved;
  }

  async deleteBudget(id: number): Promise<void> {
    const before = await this.inner.getBudget(id);
    await this.inner.deleteBudget(id);
    await this.logEntry(
      "budget",
      id,
      before?.propertyAddress ?? `#${id}`,
      "delete",
      `Deleted budget for "${before?.propertyAddress ?? id}"`,
      before ?? null,
      null,
    );
  }

  // ─── Bulk operations ─────────────────────────────────

  async clearAllData(): Promise<void> {
    await this.inner.clearAllData();
    await this.logger.clear();
  }

  async seedData(data: Partial<DataExport>): Promise<void> {
    await this.inner.seedData(data);
    await this.logEntry("budget", null, "Seed data", "seed", "Reference data seeded", null, null);
  }

  exportAll(): Promise<DataExport> {
    return this.inner.exportAll();
  }

  async importAll(data: DataExport): Promise<void> {
    await this.inner.importAll(data);
    await this.logEntry(
      "budget",
      null,
      "Full import",
      "import",
      `Imported ${data.budgets?.length ?? 0} budgets, ${data.vendors?.length ?? 0} vendors, ${data.services?.length ?? 0} services`,
      null,
      null,
    );
  }
}
