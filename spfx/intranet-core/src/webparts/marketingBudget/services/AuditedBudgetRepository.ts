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
import type { FieldChange } from "../models/diffChanges";
import { diffChanges, summariseChanges } from "../models/diffChanges";
import type { BudgetLineItem } from "../models/types";

/**
 * Lightweight event emitted to an external audit system (e.g. the
 * intranet shell's global audit log).  Keeps the dependency one-way.
 */
export interface BudgetAuditEvent {
  entityType: AuditEntityType;
  action: AuditAction;
  summary: string;
  /** Field-level changes when action is 'update' or 'statusChange'. */
  changes?: FieldChange[];
}

export class AuditedBudgetRepository implements IBudgetRepository {
  constructor(
    private readonly inner: IBudgetRepository,
    private readonly logger: IAuditLogger,
    private readonly userName: string,
    /** Optional callback to relay high-level events to an external audit system. */
    private readonly onAuditEvent?: (event: BudgetAuditEvent) => void,
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
    changes?: FieldChange[],
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

    // Relay to external audit system if wired.
    if (this.onAuditEvent) {
      try {
        this.onAuditEvent({ entityType, action, summary, changes });
      } catch {
        // External relay is non-critical — swallow errors.
      }
    }
  }

  /**
   * Diff two line-item arrays and return human-readable FieldChange entries
   * describing added/removed services, selection toggles, and price changes.
   */
  private static diffLineItems(
    before: BudgetLineItem[],
    after: BudgetLineItem[],
  ): FieldChange[] {
    const result: FieldChange[] = [];
    const beforeMap = new Map(before.map((li) => [li.serviceId, li]));
    const afterMap = new Map(after.map((li) => [li.serviceId, li]));

    // Removed services
    before.forEach((li) => {
      if (!afterMap.has(li.serviceId)) {
        result.push({
          field: `service "${li.serviceName || li.serviceId}"`,
          from: "included",
          to: "removed",
        });
      }
    });

    // Added or changed services
    after.forEach((li) => {
      const old = beforeMap.get(li.serviceId);
      const label = li.serviceName || String(li.serviceId);
      if (!old) {
        result.push({ field: `service "${label}"`, from: "\u2014", to: "added" });
        return;
      }
      if (old.isSelected !== li.isSelected) {
        result.push({
          field: `service "${label}"`,
          from: old.isSelected ? "selected" : "deselected",
          to: li.isSelected ? "selected" : "deselected",
        });
      }
      if (old.variantId !== li.variantId) {
        result.push({
          field: `variant for "${label}"`,
          from: old.variantName || old.variantId || "\u2014",
          to: li.variantName || li.variantId || "\u2014",
        });
      }
      if (old.overridePrice !== li.overridePrice) {
        result.push({
          field: `price for "${label}"`,
          from: old.overridePrice !== null ? `$${old.overridePrice}` : "\u2014",
          to: li.overridePrice !== null ? `$${li.overridePrice}` : "\u2014",
        });
      }
    });

    return result;
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
    const isUpdate = !!before;
    const changes = isUpdate
      ? diffChanges(before as unknown as Record<string, unknown>, saved as unknown as Record<string, unknown>)
      : undefined;
    const summary = isUpdate
      ? summariseChanges(`Updated vendor "${saved.name}"`, changes!)
      : `Created vendor "${saved.name}"`;
    await this.logEntry(
      "vendor",
      saved.id ?? null,
      saved.name,
      isUpdate ? "update" : "create",
      summary,
      before ?? null,
      saved,
      changes,
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
    const isUpdate = !!before;
    const changes = isUpdate
      ? diffChanges(
          before as unknown as Record<string, unknown>,
          saved as unknown as Record<string, unknown>,
          new Set(["variants"]),
        )
      : undefined;
    const summary = isUpdate
      ? summariseChanges(`Updated service "${saved.name}"`, changes!)
      : `Created service "${saved.name}"`;
    await this.logEntry(
      "service",
      saved.id ?? null,
      saved.name,
      isUpdate ? "update" : "create",
      summary,
      before ?? null,
      saved,
      changes,
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
    const isUpdate = !!before;
    const changes = isUpdate
      ? diffChanges(before as unknown as Record<string, unknown>, saved as unknown as Record<string, unknown>)
      : undefined;
    const summary = isUpdate
      ? summariseChanges(`Updated suburb "${saved.name}"`, changes!)
      : `Created suburb "${saved.name}"`;
    await this.logEntry(
      "suburb",
      saved.id ?? null,
      saved.name,
      isUpdate ? "update" : "create",
      summary,
      before ?? null,
      saved,
      changes,
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
    const isUpdate = !!before;
    const changes = isUpdate
      ? diffChanges(
          before as unknown as Record<string, unknown>,
          saved as unknown as Record<string, unknown>,
          new Set(["lineItems"]),
        )
      : undefined;
    const summary = isUpdate
      ? summariseChanges(`Updated schedule "${saved.name}"`, changes!)
      : `Created schedule "${saved.name}"`;
    await this.logEntry(
      "schedule",
      saved.id ?? null,
      saved.name,
      isUpdate ? "update" : "create",
      summary,
      before ?? null,
      saved,
      changes,
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

    const isUpdate = !!before;
    let changes: FieldChange[] | undefined;
    if (isUpdate) {
      // Field-level diff (skip lineItems — handled separately)
      changes = diffChanges(
        before as unknown as Record<string, unknown>,
        saved as unknown as Record<string, unknown>,
        new Set(["lineItems"]),
      );
      // Line item diff (services added/removed, prices, selections)
      const lineItemChanges = AuditedBudgetRepository.diffLineItems(
        before!.lineItems ?? [],
        saved.lineItems ?? [],
      );
      changes = [...changes, ...lineItemChanges];
    }

    const isStatusChange = isUpdate && before!.status !== saved.status;
    let summary: string;
    if (isStatusChange) {
      summary = summariseChanges(
        `Budget "${saved.propertyAddress}" status ${before!.status} \u2192 ${saved.status}`,
        (changes ?? []).filter((c) => c.field !== "status"),
      );
    } else if (isUpdate) {
      summary = summariseChanges(`Updated budget "${saved.propertyAddress}"`, changes!);
    } else {
      summary = `Created budget for "${saved.propertyAddress}"`;
    }

    await this.logEntry(
      "budget",
      saved.id ?? null,
      saved.propertyAddress,
      isStatusChange ? "statusChange" : isUpdate ? "update" : "create",
      summary,
      before ?? null,
      saved,
      changes,
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
