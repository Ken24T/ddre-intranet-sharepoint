/**
 * PM Dashboard – Mock PropertyMe service for the dev harness.
 *
 * Provides realistic Australian property management seed data so
 * the Phase 3 widgets can be developed and tested without a backend.
 * All data is in-memory — no persistence.
 */

import type {
  IPropertyMeService,
  Property,
  Tenant,
  Owner,
  MaintenanceRequest,
  DashboardSummary,
} from "./IPropertyMeService";

// ─────────────────────────────────────────────────────────────
// Seed Data
// ─────────────────────────────────────────────────────────────

const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    address: { street: "42 Smith Street", suburb: "Richmond", state: "VIC", postcode: "3121", country: "Australia" },
    propertyType: "residential",
    bedrooms: 3,
    bathrooms: 2,
    status: "active",
    ownerId: "own-001",
    currentTenantId: "ten-001",
    rentAmount: 650,
    rentFrequency: "weekly",
  },
  {
    id: "prop-002",
    address: { street: "7/18 Chapel Street", suburb: "Windsor", state: "VIC", postcode: "3181", country: "Australia" },
    propertyType: "residential",
    bedrooms: 2,
    bathrooms: 1,
    status: "active",
    ownerId: "own-002",
    currentTenantId: "ten-002",
    rentAmount: 480,
    rentFrequency: "weekly",
  },
  {
    id: "prop-003",
    address: { street: "156 High Street", suburb: "Prahran", state: "VIC", postcode: "3181", country: "Australia" },
    propertyType: "residential",
    bedrooms: 4,
    bathrooms: 2,
    status: "active",
    ownerId: "own-003",
    currentTenantId: "ten-003",
    rentAmount: 780,
    rentFrequency: "weekly",
  },
  {
    id: "prop-004",
    address: { street: "3/9 Park Avenue", suburb: "South Yarra", state: "VIC", postcode: "3141", country: "Australia" },
    propertyType: "residential",
    bedrooms: 1,
    bathrooms: 1,
    status: "active",
    ownerId: "own-004",
    currentTenantId: "ten-004",
    rentAmount: 420,
    rentFrequency: "weekly",
  },
  {
    id: "prop-005",
    address: { street: "88 Commercial Road", suburb: "Toorak", state: "VIC", postcode: "3142", country: "Australia" },
    propertyType: "residential",
    bedrooms: 5,
    bathrooms: 3,
    status: "active",
    ownerId: "own-005",
    currentTenantId: "ten-005",
    rentAmount: 1200,
    rentFrequency: "weekly",
  },
  {
    id: "prop-006",
    address: { street: "22 Albert Road", suburb: "South Melbourne", state: "VIC", postcode: "3205", country: "Australia" },
    propertyType: "residential",
    bedrooms: 3,
    bathrooms: 1,
    status: "active",
    ownerId: "own-001",
    currentTenantId: "ten-006",
    rentAmount: 550,
    rentFrequency: "weekly",
  },
  {
    id: "prop-007",
    address: { street: "5/44 Barkly Street", suburb: "St Kilda", state: "VIC", postcode: "3182", country: "Australia" },
    propertyType: "residential",
    bedrooms: 2,
    bathrooms: 1,
    status: "active",
    ownerId: "own-002",
    currentTenantId: "ten-007",
    rentAmount: 460,
    rentFrequency: "weekly",
  },
  {
    id: "prop-008",
    address: { street: "91 Fitzroy Street", suburb: "St Kilda", state: "VIC", postcode: "3182", country: "Australia" },
    propertyType: "residential",
    bedrooms: 2,
    bathrooms: 1,
    status: "active",
    ownerId: "own-006",
    currentTenantId: undefined,
    rentAmount: 490,
    rentFrequency: "weekly",
  },
  {
    id: "prop-009",
    address: { street: "12 Acland Street", suburb: "St Kilda", state: "VIC", postcode: "3182", country: "Australia" },
    propertyType: "commercial",
    bedrooms: 0,
    bathrooms: 1,
    status: "active",
    ownerId: "own-003",
    currentTenantId: "ten-008",
    rentAmount: 2800,
    rentFrequency: "monthly",
  },
  {
    id: "prop-010",
    address: { street: "67 Carlisle Street", suburb: "Balaclava", state: "VIC", postcode: "3183", country: "Australia" },
    propertyType: "residential",
    bedrooms: 3,
    bathrooms: 2,
    status: "active",
    ownerId: "own-004",
    currentTenantId: "ten-009",
    rentAmount: 580,
    rentFrequency: "weekly",
  },
  {
    id: "prop-011",
    address: { street: "33 Punt Road", suburb: "Windsor", state: "VIC", postcode: "3181", country: "Australia" },
    propertyType: "residential",
    bedrooms: 3,
    bathrooms: 2,
    status: "inactive",
    ownerId: "own-005",
    currentTenantId: undefined,
    rentAmount: 620,
    rentFrequency: "weekly",
  },
  {
    id: "prop-012",
    address: { street: "14 Domain Road", suburb: "South Yarra", state: "VIC", postcode: "3141", country: "Australia" },
    propertyType: "residential",
    bedrooms: 4,
    bathrooms: 3,
    status: "inactive",
    ownerId: "own-006",
    currentTenantId: undefined,
    rentAmount: 950,
    rentFrequency: "weekly",
  },
];

const MOCK_TENANTS: Tenant[] = [
  { id: "ten-001", firstName: "Sarah", lastName: "Mitchell", email: "sarah.m@email.com", phone: "0412 345 678", leaseStart: "2025-06-01", leaseEnd: "2026-05-31", propertyId: "prop-001" },
  { id: "ten-002", firstName: "James", lastName: "Nguyen", email: "j.nguyen@email.com", phone: "0423 456 789", leaseStart: "2025-03-15", leaseEnd: "2026-03-14", propertyId: "prop-002" },
  { id: "ten-003", firstName: "Emily", lastName: "Robertson", email: "e.robertson@email.com", phone: "0434 567 890", leaseStart: "2025-01-01", leaseEnd: "2026-12-31", propertyId: "prop-003" },
  { id: "ten-004", firstName: "Liam", lastName: "O'Brien", email: "liam.ob@email.com", phone: "0445 678 901", leaseStart: "2025-09-01", leaseEnd: "2026-08-31", propertyId: "prop-004" },
  { id: "ten-005", firstName: "Olivia", lastName: "Patel", email: "o.patel@email.com", phone: "0456 789 012", leaseStart: "2025-02-01", leaseEnd: "2026-01-31", propertyId: "prop-005" },
  { id: "ten-006", firstName: "Noah", lastName: "Williams", email: "n.williams@email.com", phone: "0467 890 123", leaseStart: "2025-07-01", leaseEnd: "2026-06-30", propertyId: "prop-006" },
  { id: "ten-007", firstName: "Ava", lastName: "Kim", email: "a.kim@email.com", phone: "0478 901 234", leaseStart: "2025-04-01", leaseEnd: "2026-03-31", propertyId: "prop-007" },
  { id: "ten-008", firstName: "William", lastName: "Chen", email: "w.chen@email.com", phone: "0489 012 345", leaseStart: "2025-01-01", leaseEnd: "2027-12-31", propertyId: "prop-009" },
  { id: "ten-009", firstName: "Sophie", lastName: "Taylor", email: "s.taylor@email.com", phone: "0490 123 456", leaseStart: "2025-08-01", leaseEnd: "2026-07-31", propertyId: "prop-010" },
];

const MOCK_OWNERS: Owner[] = [
  { id: "own-001", firstName: "Margaret", lastName: "Thompson", email: "m.thompson@email.com", phone: "0411 111 111", propertyCount: 2 },
  { id: "own-002", firstName: "Robert", lastName: "Anderson", email: "r.anderson@email.com", phone: "0422 222 222", propertyCount: 2 },
  { id: "own-003", firstName: "Patricia", lastName: "Lee", email: "p.lee@email.com", phone: "0433 333 333", propertyCount: 2 },
  { id: "own-004", firstName: "David", lastName: "Martin", email: "d.martin@email.com", phone: "0444 444 444", propertyCount: 2 },
  { id: "own-005", firstName: "Susan", lastName: "Clark", email: "s.clark@email.com", phone: "0455 555 555", propertyCount: 2 },
  { id: "own-006", firstName: "Michael", lastName: "White", email: "m.white@email.com", phone: "0466 666 666", propertyCount: 2 },
];

const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  { id: "maint-001", propertyId: "prop-001", description: "Leaking tap in kitchen — dripping constantly", status: "open", priority: "medium", createdAt: "2026-02-25T09:30:00Z" },
  { id: "maint-002", propertyId: "prop-003", description: "Hot water system not heating — no hot water at all", status: "open", priority: "high", createdAt: "2026-02-28T14:15:00Z" },
  { id: "maint-003", propertyId: "prop-005", description: "Broken window latch in master bedroom", status: "in_progress", priority: "low", createdAt: "2026-02-20T11:00:00Z" },
  { id: "maint-004", propertyId: "prop-002", description: "Dishwasher not draining — error code E4", status: "open", priority: "medium", createdAt: "2026-03-01T08:45:00Z" },
  { id: "maint-005", propertyId: "prop-007", description: "Smoke detector beeping — battery replacement needed", status: "in_progress", priority: "high", createdAt: "2026-02-27T16:00:00Z" },
  { id: "maint-006", propertyId: "prop-010", description: "Garage door remote stopped working", status: "open", priority: "low", createdAt: "2026-03-02T10:20:00Z" },
  { id: "maint-007", propertyId: "prop-001", description: "Blocked drain in bathroom shower", status: "completed", priority: "medium", createdAt: "2026-02-10T13:30:00Z", completedAt: "2026-02-15T10:00:00Z" },
  { id: "maint-008", propertyId: "prop-004", description: "Air conditioning unit not cooling — summer heat", status: "open", priority: "urgent", createdAt: "2026-03-03T07:00:00Z" },
  { id: "maint-009", propertyId: "prop-006", description: "Front door lock is stiff, difficult to turn", status: "completed", priority: "medium", createdAt: "2026-01-15T09:00:00Z", completedAt: "2026-01-20T14:30:00Z" },
  { id: "maint-010", propertyId: "prop-009", description: "Commercial tenancy — shopfront signage fallen off", status: "in_progress", priority: "high", createdAt: "2026-02-22T11:45:00Z" },
];

// ─────────────────────────────────────────────────────────────
// Mock Service
// ─────────────────────────────────────────────────────────────

/**
 * In-memory mock implementation of IPropertyMeService.
 * Provides realistic Australian property data for the dev harness.
 * Simulates a small network delay (50ms) for realistic behaviour.
 */
export class MockPropertyMeService implements IPropertyMeService {
  private async _delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  public async getDashboardSummary(): Promise<DashboardSummary> {
    await this._delay();

    const active = MOCK_PROPERTIES.filter((p) => p.status === "active");
    const openMaint = MOCK_MAINTENANCE.filter(
      (m) => m.status === "open" || m.status === "in_progress"
    );

    // Calculate monthly rent from weekly amounts (×4.33) for active tenanted properties
    const monthlyRent = active
      .filter((p) => p.currentTenantId)
      .reduce((sum, p) => {
        const amount = p.rentAmount || 0;
        if (p.rentFrequency === "monthly") return sum + amount;
        if (p.rentFrequency === "fortnightly") return sum + amount * 2.167;
        return sum + amount * 4.333; // weekly
      }, 0);

    return {
      totalProperties: MOCK_PROPERTIES.length,
      activeProperties: active.length,
      totalTenants: MOCK_TENANTS.length,
      occupancyRate: Math.round(
        (active.filter((p) => p.currentTenantId).length / Math.max(active.length, 1)) * 100
      ),
      openMaintenanceRequests: openMaint.length,
      rentCollectedThisMonth: Math.round(monthlyRent * 0.92), // 92% collected
      rentOutstandingThisMonth: Math.round(monthlyRent * 0.08), // 8% outstanding
    };
  }

  public async listProperties(params?: {
    status?: "active" | "inactive" | "all";
    search?: string;
  }): Promise<Property[]> {
    await this._delay();

    let result = [...MOCK_PROPERTIES];

    if (params?.status && params.status !== "all") {
      result = result.filter((p) => p.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.address.street.toLowerCase().indexOf(q) >= 0 ||
          p.address.suburb.toLowerCase().indexOf(q) >= 0
      );
    }

    return result;
  }

  public async getProperty(id: string): Promise<Property | undefined> {
    await this._delay();
    return MOCK_PROPERTIES.find((p) => p.id === id);
  }

  public async listTenants(params?: {
    propertyId?: string;
  }): Promise<Tenant[]> {
    await this._delay();

    if (params?.propertyId) {
      return MOCK_TENANTS.filter((t) => t.propertyId === params.propertyId);
    }
    return [...MOCK_TENANTS];
  }

  public async listOwners(): Promise<Owner[]> {
    await this._delay();
    return [...MOCK_OWNERS];
  }

  public async listMaintenance(params?: {
    propertyId?: string;
    status?: "open" | "in_progress" | "completed" | "cancelled";
  }): Promise<MaintenanceRequest[]> {
    await this._delay();

    let result = [...MOCK_MAINTENANCE];

    if (params?.propertyId) {
      result = result.filter((m) => m.propertyId === params.propertyId);
    }

    if (params?.status) {
      result = result.filter((m) => m.status === params.status);
    }

    return result;
  }
}
