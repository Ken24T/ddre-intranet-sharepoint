/**
 * IBudgetRepository — Storage-agnostic repository interface.
 *
 * Phase A: Implemented by DexieBudgetRepository (IndexedDB).
 * Phase B: Will be implemented by SPListBudgetRepository (SharePoint Lists).
 *
 * All methods return Promises so implementations can be async regardless
 * of whether the underlying store is local or remote.
 */

import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  BudgetStatus,
  DataExport,
} from "../models/types";

// ─────────────────────────────────────────────────────────────
// Filter types
// ─────────────────────────────────────────────────────────────

export interface BudgetFilters {
  status?: BudgetStatus;
  search?: string;
}

// ─────────────────────────────────────────────────────────────
// Repository interface
// ─────────────────────────────────────────────────────────────

export interface IBudgetRepository {
  // ─── Vendors ────────────────────────────────────────────
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  saveVendor(vendor: Vendor): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;

  // ─── Services ───────────────────────────────────────────
  getServices(): Promise<Service[]>;
  getAllServices(): Promise<Service[]>;
  getServicesByVendor(vendorId: number): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  saveService(service: Service): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // ─── Suburbs ──────────────────────────────────────────
  getSuburbs(): Promise<Suburb[]>;
  getSuburbsByTier(tier: string): Promise<Suburb[]>;
  saveSuburb(suburb: Suburb): Promise<Suburb>;
  deleteSuburb(id: number): Promise<void>;

  // ─── Schedules ────────────────────────────────────────
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  saveSchedule(schedule: Schedule): Promise<Schedule>;
  deleteSchedule(id: number): Promise<void>;

  // ─── Budgets ──────────────────────────────────────────
  getBudgets(filters?: BudgetFilters): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  saveBudget(budget: Budget): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // ─── Bulk operations ─────────────────────────────────
  clearAllData(): Promise<void>;
  seedData(data: Partial<DataExport>): Promise<void>;
  exportAll(): Promise<DataExport>;
  importAll(data: DataExport): Promise<void>;
}
