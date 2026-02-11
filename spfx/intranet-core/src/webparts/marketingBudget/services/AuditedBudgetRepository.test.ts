/**
 * Unit tests for AuditedBudgetRepository.
 *
 * Verifies that write operations log the correct audit entries
 * and that reads are delegated without logging.
 */

import type { IBudgetRepository } from "./IBudgetRepository";
import type { IBudgetAuditLogger } from "./IAuditLogger";
import { AuditedBudgetRepository } from "./AuditedBudgetRepository";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from "../models/types";

// ─── Test helpers ───────────────────────────────────────────

const createMockInner = (): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue([]),
  getVendor: jest.fn().mockResolvedValue(undefined),
  saveVendor: jest
    .fn()
    .mockImplementation((v: Vendor) =>
      Promise.resolve({ ...v, id: v.id ?? 10 }),
    ),
  deleteVendor: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue([]),
  getAllServices: jest.fn().mockResolvedValue([]),
  getServicesByVendor: jest.fn().mockResolvedValue([]),
  getServicesByCategory: jest.fn().mockResolvedValue([]),
  saveService: jest
    .fn()
    .mockImplementation((s: Service) =>
      Promise.resolve({ ...s, id: s.id ?? 20 }),
    ),
  deleteService: jest.fn().mockResolvedValue(undefined),
  getSuburbs: jest.fn().mockResolvedValue([]),
  getSuburbsByTier: jest.fn().mockResolvedValue([]),
  saveSuburb: jest
    .fn()
    .mockImplementation((s: Suburb) =>
      Promise.resolve({ ...s, id: s.id ?? 30 }),
    ),
  deleteSuburb: jest.fn().mockResolvedValue(undefined),
  getSchedules: jest.fn().mockResolvedValue([]),
  getSchedule: jest.fn().mockResolvedValue(undefined),
  saveSchedule: jest
    .fn()
    .mockImplementation((s: Schedule) =>
      Promise.resolve({ ...s, id: s.id ?? 40 }),
    ),
  deleteSchedule: jest.fn().mockResolvedValue(undefined),
  getBudgets: jest.fn().mockResolvedValue([]),
  getBudget: jest.fn().mockResolvedValue(undefined),
  saveBudget: jest
    .fn()
    .mockImplementation((b: Budget) =>
      Promise.resolve({ ...b, id: b.id ?? 50 }),
    ),
  deleteBudget: jest.fn().mockResolvedValue(undefined),
  clearAllData: jest.fn().mockResolvedValue(undefined),
  seedData: jest.fn().mockResolvedValue(undefined),
  exportAll: jest.fn().mockResolvedValue({} as DataExport),
  importAll: jest.fn().mockResolvedValue(undefined),
});

const createMockLogger = (): IBudgetAuditLogger => ({
  log: jest.fn().mockImplementation((entry) =>
    Promise.resolve({ ...entry, id: 1 }),
  ),
  getByEntity: jest.fn().mockResolvedValue([]),
  getAll: jest.fn().mockResolvedValue([]),
  clear: jest.fn().mockResolvedValue(undefined),
});

// ─── Tests ──────────────────────────────────────────────────

describe("AuditedBudgetRepository", () => {
  // ── Reads delegate without logging ────────────────────

  it("delegates getVendors without logging", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.getVendors();

    expect(inner.getVendors).toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });

  it("delegates getBudgets without logging", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.getBudgets();

    expect(inner.getBudgets).toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });

  // ── Vendor writes ─────────────────────────────────────

  it("logs create when saving a new vendor", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    const vendor: Vendor = { name: "TestCo", shortCode: "TC", isActive: 1 };
    await repo.saveVendor(vendor);

    expect(inner.saveVendor).toHaveBeenCalledWith(vendor);
    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "vendor",
        action: "create",
        user: "tester",
      }),
    );
  });

  it("logs update when saving an existing vendor", async () => {
    const inner = createMockInner();
    const existing: Vendor = { id: 5, name: "OldCo", shortCode: "OC", isActive: 1 };
    (inner.getVendor as jest.Mock).mockResolvedValue(existing);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.saveVendor({ ...existing, name: "NewCo" });

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "vendor",
        action: "update",
      }),
    );
  });

  it("logs delete vendor", async () => {
    const inner = createMockInner();
    const existing: Vendor = { id: 7, name: "DelCo", shortCode: "DC", isActive: 1 };
    (inner.getVendor as jest.Mock).mockResolvedValue(existing);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.deleteVendor(7);

    expect(inner.deleteVendor).toHaveBeenCalledWith(7);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "vendor",
        action: "delete",
        entityId: 7,
      }),
    );
  });

  // ── Budget writes ─────────────────────────────────────

  it("logs create when saving a new budget", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    const budget: Budget = {
      propertyAddress: "1 Test St",
      propertyType: "house",
      propertySize: "medium",
      tier: "standard",
      suburbId: 1,
      vendorId: 1,
      scheduleId: 1,
      status: "draft",
      lineItems: [],
      notes: "",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };
    await repo.saveBudget(budget);

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "budget",
        action: "create",
        user: "admin",
      }),
    );
  });

  it("logs statusChange when budget status changes", async () => {
    const inner = createMockInner();
    const existing: Budget = {
      id: 99,
      propertyAddress: "2 Change St",
      propertyType: "house",
      propertySize: "small",
      tier: "standard",
      suburbId: 1,
      vendorId: 1,
      scheduleId: 1,
      status: "draft",
      lineItems: [],
      notes: "",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };
    (inner.getBudget as jest.Mock).mockResolvedValue(existing);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    await repo.saveBudget({ ...existing, status: "approved" });

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "budget",
        action: "statusChange",
      }),
    );
  });

  // ── Bulk operations ───────────────────────────────────

  it("logs seed operation", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    await repo.seedData({});

    expect(inner.seedData).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "seed",
      }),
    );
  });

  it("logs import operation", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    await repo.importAll({} as DataExport);

    expect(inner.importAll).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "import",
      }),
    );
  });

  it("clears audit log along with data", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    await repo.clearAllData();

    expect(inner.clearAllData).toHaveBeenCalled();
    expect(logger.clear).toHaveBeenCalled();
  });

  // ── Username propagation ──────────────────────────────

  it("passes the configured username to every log entry", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "jdoe");

    await repo.saveVendor({ name: "V", shortCode: "V", isActive: 1 });
    await repo.seedData({});

    const calls = (logger.log as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0].user).toBe("jdoe");
    expect(calls[1][0].user).toBe("jdoe");
  });

  // ── onAuditEvent callback ─────────────────────────────

  it("calls onAuditEvent callback when provided", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const onAuditEvent = jest.fn();
    const repo = new AuditedBudgetRepository(inner, logger, "admin", onAuditEvent);

    await repo.saveVendor({ name: "TestCo", shortCode: "TC", isActive: 1 });

    expect(onAuditEvent).toHaveBeenCalledTimes(1);
    expect(onAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "vendor",
        action: "create",
        summary: expect.stringContaining("TestCo"),
      }),
    );
  });

  it("works without onAuditEvent callback", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    // No fourth argument — should not throw
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    await repo.saveVendor({ name: "V", shortCode: "V", isActive: 1 });

    expect(logger.log).toHaveBeenCalledTimes(1);
  });

  it("swallows errors from onAuditEvent callback", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const onAuditEvent = jest.fn().mockImplementation(() => {
      throw new Error("Shell audit failed");
    });
    const repo = new AuditedBudgetRepository(inner, logger, "admin", onAuditEvent);

    // Should not throw despite callback error
    await expect(
      repo.saveVendor({ name: "V", shortCode: "V", isActive: 1 }),
    ).resolves.toBeDefined();
  });

  // ── Service writes ────────────────────────────────────

  it("logs create when saving a new service", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    const service: Service = {
      name: "Photography",
      category: "photography",
      vendorId: 1,
      variantSelector: null,
      variants: [],
      includesGst: false,
      isActive: 1,
    };
    await repo.saveService(service);

    expect(inner.saveService).toHaveBeenCalledWith(service);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "service",
        action: "create",
        user: "tester",
      }),
    );
  });

  it("logs update when saving an existing service", async () => {
    const inner = createMockInner();
    const existing: Service = {
      id: 20,
      name: "Photography",
      category: "photography",
      vendorId: 1,
      variantSelector: null,
      variants: [],
      includesGst: false,
      isActive: 1,
    };
    (inner.getAllServices as jest.Mock).mockResolvedValue([existing]);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.saveService({ ...existing, name: "Updated Photography" });

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "service",
        action: "update",
      }),
    );
  });

  it("logs delete service", async () => {
    const inner = createMockInner();
    const existing: Service = {
      id: 22,
      name: "Staging",
      category: "photography",
      vendorId: null,
      variantSelector: null,
      variants: [],
      includesGst: false,
      isActive: 1,
    };
    (inner.getAllServices as jest.Mock).mockResolvedValue([existing]);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.deleteService(22);

    expect(inner.deleteService).toHaveBeenCalledWith(22);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "service",
        action: "delete",
        entityId: 22,
      }),
    );
  });

  // ── Suburb writes ─────────────────────────────────────

  it("logs create when saving a new suburb", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    const suburb: Suburb = { name: "Mosman", pricingTier: "A" };
    await repo.saveSuburb(suburb);

    expect(inner.saveSuburb).toHaveBeenCalledWith(suburb);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "suburb",
        action: "create",
        user: "tester",
      }),
    );
  });

  it("logs update when saving an existing suburb", async () => {
    const inner = createMockInner();
    const existing: Suburb = { id: 30, name: "Mosman", pricingTier: "A" };
    (inner.getSuburbs as jest.Mock).mockResolvedValue([existing]);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.saveSuburb({ ...existing, pricingTier: "B" });

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "suburb",
        action: "update",
      }),
    );
  });

  it("logs delete suburb", async () => {
    const inner = createMockInner();
    const existing: Suburb = { id: 33, name: "Bondi", pricingTier: "A" };
    (inner.getSuburbs as jest.Mock).mockResolvedValue([existing]);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.deleteSuburb(33);

    expect(inner.deleteSuburb).toHaveBeenCalledWith(33);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "suburb",
        action: "delete",
        entityId: 33,
      }),
    );
  });

  // ── Schedule writes ───────────────────────────────────

  it("logs create when saving a new schedule", async () => {
    const inner = createMockInner();
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    const schedule: Schedule = {
      name: "Standard House",
      propertyType: "house",
      propertySize: "medium",
      tier: "standard",
      lineItems: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      isActive: 1,
    };
    await repo.saveSchedule(schedule);

    expect(inner.saveSchedule).toHaveBeenCalledWith(schedule);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "schedule",
        action: "create",
        user: "tester",
      }),
    );
  });

  it("logs update when saving an existing schedule", async () => {
    const inner = createMockInner();
    const existing: Schedule = {
      id: 40,
      name: "Standard House",
      propertyType: "house",
      propertySize: "medium",
      tier: "standard",
      lineItems: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      isActive: 1,
    };
    (inner.getSchedule as jest.Mock).mockResolvedValue(existing);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.saveSchedule({ ...existing, name: "Premium House" });

    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "schedule",
        action: "update",
      }),
    );
  });

  it("logs delete schedule", async () => {
    const inner = createMockInner();
    const existing: Schedule = {
      id: 44,
      name: "Economy Apartment",
      propertyType: "unit",
      propertySize: "small",
      tier: "basic",
      lineItems: [],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      isActive: 1,
    };
    (inner.getSchedule as jest.Mock).mockResolvedValue(existing);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.deleteSchedule(44);

    expect(inner.deleteSchedule).toHaveBeenCalledWith(44);
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "schedule",
        action: "delete",
        entityId: 44,
      }),
    );
  });

  // ── Diff / change tracking ────────────────────────────

  it("captures field-level changes on vendor update", async () => {
    const inner = createMockInner();
    const before: Vendor = { id: 5, name: "OldCo", shortCode: "OC", isActive: 1 };
    (inner.getVendor as jest.Mock).mockResolvedValue(before);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "tester");

    await repo.saveVendor({ ...before, name: "NewCo" });

    const entry = (logger.log as jest.Mock).mock.calls[0][0];
    // Summary should mention the change
    expect(entry.summary).toContain("name");
    // before/after snapshots should be serialised
    expect(entry.before).toBeDefined();
    expect(entry.after).toBeDefined();
  });

  it("captures status transition as a statusChange action", async () => {
    const inner = createMockInner();
    const before: Budget = {
      id: 99,
      propertyAddress: "1 Diff St",
      propertyType: "house",
      propertySize: "medium",
      tier: "standard",
      suburbId: 1,
      vendorId: 1,
      scheduleId: 1,
      status: "draft",
      lineItems: [],
      notes: "",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };
    (inner.getBudget as jest.Mock).mockResolvedValue(before);
    const logger = createMockLogger();
    const repo = new AuditedBudgetRepository(inner, logger, "admin");

    await repo.saveBudget({ ...before, status: "approved" });

    const entry = (logger.log as jest.Mock).mock.calls[0][0];
    expect(entry.action).toBe("statusChange");
    expect(entry.summary).toContain("draft");
    expect(entry.summary).toContain("approved");
  });
});
