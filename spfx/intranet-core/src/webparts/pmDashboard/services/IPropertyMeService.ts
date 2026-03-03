/**
 * PM Dashboard – PropertyMe service interface.
 *
 * Abstracts access to PropertyMe data. Implementations:
 * - MockPropertyMeService (dev harness — realistic seed data)
 * - PropertyMeService (production — delegates to PropertyMeClient via Azure proxy)
 *
 * All methods return read-only data; PropertyMe API is read-only.
 *
 * Types are inlined here to avoid a dependency on @ddre-intranet/api-client
 * inside the SPFx build. They mirror the canonical definitions in
 * packages/pkg-api-client/src/clients/PropertyMeClient.ts.
 */

// ─── Inlined types (mirror pkg-api-client) ───────────────

export interface Address {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface Property {
  id: string;
  address: Address;
  propertyType: "residential" | "commercial" | "industrial";
  bedrooms?: number;
  bathrooms?: number;
  status: "active" | "inactive";
  ownerId: string;
  currentTenantId?: string;
  rentAmount?: number;
  rentFrequency?: "weekly" | "fortnightly" | "monthly";
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  leaseStart: string;
  leaseEnd: string;
  propertyId: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  propertyCount: number;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  description: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  completedAt?: string;
}

export interface DashboardSummary {
  totalProperties: number;
  activeProperties: number;
  totalTenants: number;
  occupancyRate: number;
  openMaintenanceRequests: number;
  rentCollectedThisMonth: number;
  rentOutstandingThisMonth: number;
}

// ─── Service interface ────────────────────────────────────

export interface IPropertyMeService {
  /** Get aggregated dashboard KPI metrics. */
  getDashboardSummary(): Promise<DashboardSummary>;

  /** List properties with optional search/status filter. */
  listProperties(params?: {
    status?: "active" | "inactive" | "all";
    search?: string;
  }): Promise<Property[]>;

  /** Get a single property by ID. */
  getProperty(id: string): Promise<Property | undefined>;

  /** List tenants, optionally filtered by property. */
  listTenants(params?: { propertyId?: string }): Promise<Tenant[]>;

  /** List owners. */
  listOwners(): Promise<Owner[]>;

  /** List maintenance requests with optional filters. */
  listMaintenance(params?: {
    propertyId?: string;
    status?: "open" | "in_progress" | "completed" | "cancelled";
  }): Promise<MaintenanceRequest[]>;
}
