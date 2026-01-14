import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { BaseClient } from "../core/BaseClient";
import type { ApiClientConfig, PaginationMeta, PaginationParams } from "../core/types";

// =============================================================================
// TYPES
// =============================================================================

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

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListPropertiesParams extends PaginationParams {
  status?: "active" | "inactive" | "all";
  search?: string;
}

export interface ListTenantsParams extends PaginationParams {
  propertyId?: string;
}

export interface ListMaintenanceParams extends PaginationParams {
  propertyId?: string;
  status?: "open" | "in_progress" | "completed" | "cancelled";
}

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Client for the PropertyMe proxy (read-only).
 */
class PropertyMeClient extends BaseClient {
  protected getHealthPath(): string {
    return "/api/v1/propertyme/health";
  }

  // ---------------------------------------------------------------------------
  // PROPERTIES
  // ---------------------------------------------------------------------------

  /**
   * List properties with pagination.
   */
  public async listProperties(
    params?: ListPropertiesParams
  ): Promise<PaginatedResponse<Property>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;

    return this.get<PaginatedResponse<Property>>(
      "/api/v1/propertyme/properties",
      queryParams
    );
  }

  /**
   * Get a property by ID.
   */
  public async getProperty(id: string): Promise<Property> {
    return this.get<Property>(`/api/v1/propertyme/properties/${id}`);
  }

  // ---------------------------------------------------------------------------
  // TENANTS
  // ---------------------------------------------------------------------------

  /**
   * List tenants with pagination.
   */
  public async listTenants(
    params?: ListTenantsParams
  ): Promise<PaginatedResponse<Tenant>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params?.propertyId) queryParams.propertyId = params.propertyId;

    return this.get<PaginatedResponse<Tenant>>(
      "/api/v1/propertyme/tenants",
      queryParams
    );
  }

  /**
   * Get a tenant by ID.
   */
  public async getTenant(id: string): Promise<Tenant> {
    return this.get<Tenant>(`/api/v1/propertyme/tenants/${id}`);
  }

  // ---------------------------------------------------------------------------
  // OWNERS
  // ---------------------------------------------------------------------------

  /**
   * List owners with pagination.
   */
  public async listOwners(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Owner>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);

    return this.get<PaginatedResponse<Owner>>(
      "/api/v1/propertyme/owners",
      queryParams
    );
  }

  /**
   * Get an owner by ID.
   */
  public async getOwner(id: string): Promise<Owner> {
    return this.get<Owner>(`/api/v1/propertyme/owners/${id}`);
  }

  // ---------------------------------------------------------------------------
  // MAINTENANCE
  // ---------------------------------------------------------------------------

  /**
   * List maintenance requests with pagination.
   */
  public async listMaintenance(
    params?: ListMaintenanceParams
  ): Promise<PaginatedResponse<MaintenanceRequest>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
    if (params?.propertyId) queryParams.propertyId = params.propertyId;
    if (params?.status) queryParams.status = params.status;

    return this.get<PaginatedResponse<MaintenanceRequest>>(
      "/api/v1/propertyme/maintenance",
      queryParams
    );
  }

  // ---------------------------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------------------------

  /**
   * Get dashboard summary metrics.
   */
  public async getDashboardSummary(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>("/api/v1/propertyme/dashboard/summary");
  }
}

/**
 * Create a PropertyMe client instance.
 */
export function createPropertyMeClient(
  context: WebPartContext,
  baseUrl?: string
): PropertyMeClient {
  return new PropertyMeClient({ context, baseUrl });
}
