/**
 * SharePoint List schemas for Marketing Budget data.
 *
 * Defines list names, field internal names, and mapping utilities
 * for converting between domain types and SP list items.
 *
 * All lists are prefixed with "MB_" to avoid collisions with other
 * site content. The Title field is always used for the entity's
 * primary name/label.
 *
 * Complex nested arrays (variants, lineItems) are stored as JSON
 * in multi-line text fields. This keeps the data model close to
 * the Dexie schema and avoids child-list complexity.
 */

/* eslint-disable @rushstack/no-new-null */

import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  ServiceVariant,
  ScheduleLineItem,
  BudgetLineItem,
  ServiceCategory,
  VariantSelector,
  PropertyType,
  PropertySize,
  PricingTier,
  BudgetTier,
  BudgetStatus,
} from '../models/types';

// ─────────────────────────────────────────────────────────────
// List Names
// ─────────────────────────────────────────────────────────────

export const SP_LISTS = {
  vendors: 'MB_Vendors',
  services: 'MB_Services',
  suburbs: 'MB_Suburbs',
  schedules: 'MB_Schedules',
  budgets: 'MB_Budgets',
} as const;

// ─────────────────────────────────────────────────────────────
// Select field arrays (for efficient REST queries)
// ─────────────────────────────────────────────────────────────

export const VENDOR_SELECT = [
  'Id', 'Title', 'ShortCode', 'ContactEmail', 'ContactPhone', 'IsActive',
] as const;

export const SERVICE_SELECT = [
  'Id', 'Title', 'Category', 'VendorId', 'VariantSelector',
  'Variants', 'IncludesGst', 'IsActive',
] as const;

export const SUBURB_SELECT = [
  'Id', 'Title', 'PricingTier', 'Postcode', 'State',
] as const;

export const SCHEDULE_SELECT = [
  'Id', 'Title', 'PropertyType', 'PropertySize', 'Tier',
  'DefaultVendorId', 'LineItems', 'Created', 'Modified', 'IsActive',
] as const;

export const BUDGET_SELECT = [
  'Id', 'Title', 'PropertyType', 'PropertySize', 'Tier',
  'SuburbId', 'VendorId', 'ScheduleId', 'ScheduleName',
  'LineItems', 'Notes', 'ClientName', 'AgentName', 'Status',
  'Created', 'Modified',
] as const;

// ─────────────────────────────────────────────────────────────
// SP Item Interfaces (raw shapes from SharePoint REST API)
// ─────────────────────────────────────────────────────────────

export interface SPVendorItem {
  Id: number;
  Title: string;
  ShortCode: string | null;
  ContactEmail: string | null;
  ContactPhone: string | null;
  IsActive: number;
}

export interface SPServiceItem {
  Id: number;
  Title: string;
  Category: string;
  VendorId: number | null;
  VariantSelector: string | null;
  /** JSON-serialised ServiceVariant[] */
  Variants: string;
  IncludesGst: boolean;
  IsActive: number;
}

export interface SPSuburbItem {
  Id: number;
  Title: string;
  PricingTier: string;
  Postcode: string | null;
  State: string | null;
}

export interface SPScheduleItem {
  Id: number;
  Title: string;
  PropertyType: string;
  PropertySize: string;
  Tier: string;
  DefaultVendorId: number | null;
  /** JSON-serialised ScheduleLineItem[] */
  LineItems: string;
  /** SP built-in Created field (ISO 8601) */
  Created: string;
  /** SP built-in Modified field (ISO 8601) */
  Modified: string;
  IsActive: number;
}

export interface SPBudgetItem {
  Id: number;
  /** Maps to propertyAddress */
  Title: string;
  PropertyType: string;
  PropertySize: string;
  Tier: string;
  SuburbId: number | null;
  VendorId: number | null;
  ScheduleId: number | null;
  ScheduleName: string | null;
  /** JSON-serialised BudgetLineItem[] */
  LineItems: string;
  Notes: string | null;
  ClientName: string | null;
  AgentName: string | null;
  Status: string;
  /** SP built-in Created field (ISO 8601) */
  Created: string;
  /** SP built-in Modified field (ISO 8601) */
  Modified: string;
}

// ─────────────────────────────────────────────────────────────
// JSON helpers
// ─────────────────────────────────────────────────────────────

/** Safely parse a JSON string, returning a fallback on failure. */
export function parseJson<T>(
  value: string | null | undefined,
  fallback: T,
): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────
// Mappers: SP → Domain
// ─────────────────────────────────────────────────────────────

export function mapVendorFromSP(item: SPVendorItem): Vendor {
  return {
    id: item.Id,
    name: item.Title,
    shortCode: item.ShortCode ?? undefined,
    contactEmail: item.ContactEmail ?? undefined,
    contactPhone: item.ContactPhone ?? undefined,
    isActive: item.IsActive ?? 1,
  };
}

export function mapServiceFromSP(item: SPServiceItem): Service {
  return {
    id: item.Id,
    name: item.Title,
    category: item.Category as ServiceCategory,
    vendorId: item.VendorId,
    variantSelector: item.VariantSelector as VariantSelector | null,
    variants: parseJson<ServiceVariant[]>(item.Variants, []),
    includesGst: item.IncludesGst,
    isActive: item.IsActive ?? 1,
  };
}

export function mapSuburbFromSP(item: SPSuburbItem): Suburb {
  return {
    id: item.Id,
    name: item.Title,
    pricingTier: item.PricingTier as PricingTier,
    postcode: item.Postcode ?? undefined,
    state: item.State ?? undefined,
  };
}

export function mapScheduleFromSP(item: SPScheduleItem): Schedule {
  return {
    id: item.Id,
    name: item.Title,
    propertyType: item.PropertyType as PropertyType,
    propertySize: item.PropertySize as PropertySize,
    tier: item.Tier as BudgetTier,
    defaultVendorId: item.DefaultVendorId ?? undefined,
    lineItems: parseJson<ScheduleLineItem[]>(item.LineItems, []),
    createdAt: item.Created,
    updatedAt: item.Modified,
    isActive: item.IsActive ?? 1,
  };
}

export function mapBudgetFromSP(item: SPBudgetItem): Budget {
  return {
    id: item.Id,
    propertyAddress: item.Title,
    propertyType: item.PropertyType as PropertyType,
    propertySize: item.PropertySize as PropertySize,
    tier: item.Tier as BudgetTier,
    suburbId: item.SuburbId,
    vendorId: item.VendorId,
    scheduleId: item.ScheduleId,
    scheduleName: item.ScheduleName,
    lineItems: parseJson<BudgetLineItem[]>(item.LineItems, []),
    notes: item.Notes ?? undefined,
    clientName: item.ClientName ?? undefined,
    agentName: item.AgentName ?? undefined,
    status: item.Status as BudgetStatus,
    createdAt: item.Created,
    updatedAt: item.Modified,
  };
}

// ─────────────────────────────────────────────────────────────
// Mappers: Domain → SP (for add/update operations)
// ─────────────────────────────────────────────────────────────

export function mapVendorToSP(
  vendor: Vendor,
): Record<string, unknown> {
  return {
    Title: vendor.name,
    ShortCode: vendor.shortCode ?? null,
    ContactEmail: vendor.contactEmail ?? null,
    ContactPhone: vendor.contactPhone ?? null,
    IsActive: vendor.isActive,
  };
}

export function mapServiceToSP(
  service: Service,
): Record<string, unknown> {
  return {
    Title: service.name,
    Category: service.category,
    VendorId: service.vendorId,
    VariantSelector: service.variantSelector,
    Variants: JSON.stringify(service.variants),
    IncludesGst: service.includesGst,
    IsActive: service.isActive,
  };
}

export function mapSuburbToSP(
  suburb: Suburb,
): Record<string, unknown> {
  return {
    Title: suburb.name,
    PricingTier: suburb.pricingTier,
    Postcode: suburb.postcode ?? null,
    State: suburb.state ?? null,
  };
}

export function mapScheduleToSP(
  schedule: Schedule,
): Record<string, unknown> {
  return {
    Title: schedule.name,
    PropertyType: schedule.propertyType,
    PropertySize: schedule.propertySize,
    Tier: schedule.tier,
    DefaultVendorId: schedule.defaultVendorId ?? null,
    LineItems: JSON.stringify(schedule.lineItems),
    IsActive: schedule.isActive,
  };
}

export function mapBudgetToSP(
  budget: Budget,
): Record<string, unknown> {
  return {
    Title: budget.propertyAddress,
    PropertyType: budget.propertyType,
    PropertySize: budget.propertySize,
    Tier: budget.tier,
    SuburbId: budget.suburbId,
    VendorId: budget.vendorId,
    ScheduleId: budget.scheduleId,
    ScheduleName: budget.scheduleName ?? null,
    LineItems: JSON.stringify(budget.lineItems),
    Notes: budget.notes ?? null,
    ClientName: budget.clientName ?? null,
    AgentName: budget.agentName ?? null,
    Status: budget.status,
  };
}
