/**
 * Dexie database schema for the Marketing Budget app.
 *
 * Mirrors the standalone PWA's db-schema.js but uses the npm
 * Dexie package instead of a CDN import.
 *
 * The database name includes a `-spfx` suffix so it won't
 * collide with the standalone PWA's IndexedDB store if both
 * happen to run on the same origin during development.
 */

import Dexie, { type Table } from "dexie";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  BudgetTemplate,
} from "../models/types";
import type { AuditEntry } from "../models/auditTypes";

export class MarketingBudgetDb extends Dexie {
  vendors!: Table<Vendor, number>;
  services!: Table<Service, number>;
  suburbs!: Table<Suburb, number>;
  schedules!: Table<Schedule, number>;
  budgets!: Table<Budget, number>;
  auditLog!: Table<AuditEntry, number>;
  budgetTemplates!: Table<BudgetTemplate, number>;

  constructor() {
    super("salesmarketing-spfx");

    // Version 1 — matches the standalone PWA's v2 schema
    // (we skip v1 since the SPFx app starts fresh).
    this.version(1).stores({
      vendors: "++id, name, shortCode, isActive",
      services: "++id, name, category, vendorId, variantSelector, isActive",
      suburbs: "++id, name, pricingTier",
      schedules: "++id, name, propertyType, propertySize, tier, isActive",
      budgets:
        "++id, createdAt, updatedAt, propertyAddress, scheduleId, status",
    });

    // Version 2 — add audit log table
    this.version(2).stores({
      vendors: "++id, name, shortCode, isActive",
      services: "++id, name, category, vendorId, variantSelector, isActive",
      suburbs: "++id, name, pricingTier",
      schedules: "++id, name, propertyType, propertySize, tier, isActive",
      budgets:
        "++id, createdAt, updatedAt, propertyAddress, scheduleId, status",
      auditLog:
        "++id, timestamp, entityType, entityId, action, [entityType+entityId]",
    });

    // Version 3 — add budget templates table
    this.version(3).stores({
      vendors: "++id, name, shortCode, isActive",
      services: "++id, name, category, vendorId, variantSelector, isActive",
      suburbs: "++id, name, pricingTier",
      schedules: "++id, name, propertyType, propertySize, tier, isActive",
      budgets:
        "++id, createdAt, updatedAt, propertyAddress, scheduleId, status",
      auditLog:
        "++id, timestamp, entityType, entityId, action, [entityType+entityId]",
      budgetTemplates: "++id, name, createdAt",
    });
  }
}

/** Singleton database instance. */
export const db = new MarketingBudgetDb();
