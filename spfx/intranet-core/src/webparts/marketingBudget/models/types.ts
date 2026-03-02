/**
 * Marketing Budget – Domain Models
 *
 * Typed equivalents of the entities stored in Dexie (IndexedDB)
 * and the shapes used throughout the application.
 *
 * These types are storage-agnostic: they are used by both the
 * DexieBudgetRepository and the future SPListBudgetRepository.
 *
 * Note: Fields use `null` (not `undefined`) to match IndexedDB/Dexie storage semantics.
 */

/* eslint-disable @rushstack/no-new-null */

// ─────────────────────────────────────────────────────────────
// Enums & Literal Unions
// ─────────────────────────────────────────────────────────────

/** Service categories available in the system. */
export type ServiceCategory =
  | "photography"
  | "floorPlans"
  | "aerial"
  | "video"
  | "virtualStaging"
  | "internet"
  | "legal"
  | "print"
  | "signage"
  | "other";

/** How the correct variant is determined for a service. */
export type VariantSelector = "manual" | "propertySize" | "suburbTier";

/** Property type classification. */
export type PropertyType =
  | "house"
  | "unit"
  | "townhouse"
  | "land"
  | "rural"
  | "commercial";

/** Property size classification. */
export type PropertySize = "small" | "medium" | "large";

/** Suburb pricing tier (maps to REA internet listing tiers). */
export type PricingTier = "A" | "B" | "C" | "D";

/** Schedule / budget tier level. */
export type BudgetTier = "basic" | "standard" | "premium";

/** Lifecycle status of a budget. */
export type BudgetStatus = "draft" | "approved" | "sent" | "archived";

// ─────────────────────────────────────────────────────────────
// Vendor
// ─────────────────────────────────────────────────────────────

/** A marketing services vendor (e.g. Mountford Media, Urban Angles). */
export interface Vendor {
  id?: number;
  name: string;
  shortCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  /** 1 = active, 0 = soft-deleted. */
  isActive: number;
}

// ─────────────────────────────────────────────────────────────
// Service & Variants
// ─────────────────────────────────────────────────────────────

/**
 * A reference to a service that is bundled into a package variant.
 * For example, a photography package that includes a floor plan.
 */
export interface IncludedService {
  serviceId: number;
  serviceName: string;
  variantId?: string;
  variantName?: string;
}

/** A pricing variant for a service (e.g. "8 Photos", "Tier A Suburbs"). */
export interface ServiceVariant {
  id: string;
  name: string;
  basePrice: number;
  /** Matches PropertySize when variantSelector === 'propertySize'. */
  sizeMatch?: PropertySize;
  /** Matches PricingTier when variantSelector === 'suburbTier'. */
  tierMatch?: PricingTier;
  /** Services bundled into this variant (e.g. photography package includes floor plan). */
  includedServices?: IncludedService[];
}

/** A marketing service offered by a vendor or available system-wide. */
export interface Service {
  id?: number;
  name: string;
  category: ServiceCategory;
  /** Null for non-vendor services (e.g. internet listings, legal). */
  vendorId: number | null;
  /** How variants are selected — null means single default variant. */
  variantSelector: VariantSelector | null;
  variants: ServiceVariant[];
  /** Whether prices include GST. */
  includesGst: boolean;
  /** 1 = active, 0 = soft-deleted. */
  isActive: number;
}

// ─────────────────────────────────────────────────────────────
// Suburb
// ─────────────────────────────────────────────────────────────

/** A suburb with a pricing tier for internet listing packages. */
export interface Suburb {
  id?: number;
  name: string;
  pricingTier: PricingTier;
  postcode?: string;
  state?: string;
}

// ─────────────────────────────────────────────────────────────
// Schedule (Budget Template)
// ─────────────────────────────────────────────────────────────

/** A line item within a schedule template — references a service + variant. */
export interface ScheduleLineItem {
  serviceId: number;
  variantId: string | null;
  isSelected: boolean;
}

/**
 * A reusable budget template.
 * Defines a default set of services for a property type / size / tier combination.
 */
export interface Schedule {
  id?: number;
  name: string;
  propertyType: PropertyType;
  propertySize: PropertySize;
  tier: BudgetTier;
  defaultVendorId?: number;
  lineItems: ScheduleLineItem[];
  createdAt: string;
  updatedAt: string;
  /** 1 = active, 0 = soft-deleted. */
  isActive: number;
}

// ─────────────────────────────────────────────────────────────
// Budget
// ─────────────────────────────────────────────────────────────

/** A line item in a budget — tracks selection, variant, and price override. */
export interface BudgetLineItem {
  serviceId: number;
  serviceName?: string;
  variantId: string | null;
  variantName?: string | null;
  isSelected: boolean;
  /** The price from the schedule / service variant. */
  schedulePrice?: number;
  /** User-overridden price (null = use schedulePrice). */
  overridePrice: number | null;
  /** Whether the price has been manually overridden. */
  isOverridden: boolean;
}

/** A property marketing budget. */
export interface Budget {
  id?: number;
  propertyAddress: string;
  propertyType: PropertyType;
  propertySize: PropertySize;
  tier: BudgetTier;
  suburbId: number | null;
  vendorId: number | null;
  scheduleId: number | null;
  scheduleName?: string | null;
  lineItems: BudgetLineItem[];
  notes?: string;
  clientName?: string;
  agentName?: string;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Budget Template (user-saved)
// ─────────────────────────────────────────────────────────────

/** A line item snapshot within a saved budget template. */
export interface BudgetTemplateLineItem {
  serviceId: number;
  serviceName?: string;
  variantId: string | null;
  variantName?: string | null;
  isSelected: boolean;
  /** Price at time of template creation (informational). */
  savedPrice?: number;
  overridePrice: number | null;
  isOverridden: boolean;
}

/**
 * A user-saved budget template.
 * Created from an existing budget's configuration for quick reuse.
 */
export interface BudgetTemplate {
  id?: number;
  name: string;
  description?: string;
  /** Default property type when applying template. */
  propertyType?: PropertyType;
  /** Default property size when applying template. */
  propertySize?: PropertySize;
  /** Default tier when applying template. */
  tier?: BudgetTier;
  /** Schedule the template was derived from. */
  sourceScheduleId?: number;
  lineItems: BudgetTemplateLineItem[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Export Data Envelope
// ─────────────────────────────────────────────────────────────

/** Shape of a full data export / backup. */
export interface DataExport {
  exportVersion: string;
  exportDate: string;
  appVersion: string;
  vendors: Vendor[];
  services: Service[];
  suburbs: Suburb[];
  schedules: Schedule[];
  budgets: Budget[];
}

// ─────────────────────────────────────────────────────────────
// Variant Resolution Context
// ─────────────────────────────────────────────────────────────

/** Context for automatically resolving the correct service variant. */
export interface VariantContext {
  propertySize?: PropertySize;
  suburbTier?: PricingTier;
}
