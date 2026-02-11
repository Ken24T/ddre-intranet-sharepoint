/**
 * Unit tests for AuditedBudgetRepository.
 *
 * Verifies that write operations log the correct audit entries
 * and that reads are delegated without logging.
 */

import type { IBudgetRepository } from "./IBudgetRepository";
import type { IAuditLogger } from "./IAuditLogger";
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

const createMockLogger = (): IAuditLogger => ({
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
});
