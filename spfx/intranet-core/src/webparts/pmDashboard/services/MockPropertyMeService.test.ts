/**
 * Unit tests for MockPropertyMeService.
 */

import { MockPropertyMeService } from "./MockPropertyMeService";

describe("MockPropertyMeService", () => {
  let service: MockPropertyMeService;

  beforeEach(() => {
    service = new MockPropertyMeService();
  });

  // ─── getDashboardSummary ────────────────────────────────

  describe("getDashboardSummary", () => {
    it("returns a summary with all fields populated", async () => {
      const summary = await service.getDashboardSummary();

      expect(summary.totalProperties).toBeGreaterThan(0);
      expect(summary.activeProperties).toBeLessThanOrEqual(summary.totalProperties);
      expect(summary.totalTenants).toBeGreaterThan(0);
      expect(summary.occupancyRate).toBeGreaterThanOrEqual(0);
      expect(summary.occupancyRate).toBeLessThanOrEqual(100);
      expect(summary.openMaintenanceRequests).toBeGreaterThanOrEqual(0);
      expect(summary.rentCollectedThisMonth).toBeGreaterThan(0);
      expect(summary.rentOutstandingThisMonth).toBeGreaterThanOrEqual(0);
    });

    it("rent collected + outstanding approximates total rent", async () => {
      const summary = await service.getDashboardSummary();
      const total = summary.rentCollectedThisMonth + summary.rentOutstandingThisMonth;
      // Total should be > 0
      expect(total).toBeGreaterThan(0);
      // Collected should be most of total (92%)
      expect(summary.rentCollectedThisMonth).toBeGreaterThan(summary.rentOutstandingThisMonth);
    });
  });

  // ─── listProperties ─────────────────────────────────────

  describe("listProperties", () => {
    it("returns all properties with no filter", async () => {
      const properties = await service.listProperties();
      expect(properties.length).toBe(12);
    });

    it("filters by active status", async () => {
      const active = await service.listProperties({ status: "active" });
      expect(active.length).toBe(10);
      active.forEach((p) => expect(p.status).toBe("active"));
    });

    it("filters by inactive status", async () => {
      const inactive = await service.listProperties({ status: "inactive" });
      expect(inactive.length).toBe(2);
      inactive.forEach((p) => expect(p.status).toBe("inactive"));
    });

    it("returns all when status=all", async () => {
      const all = await service.listProperties({ status: "all" });
      expect(all.length).toBe(12);
    });

    it("filters by search term (suburb)", async () => {
      const results = await service.listProperties({ search: "St Kilda" });
      expect(results.length).toBe(3);
      results.forEach((p) => expect(p.address.suburb).toBe("St Kilda"));
    });

    it("filters by search term (street)", async () => {
      const results = await service.listProperties({ search: "Smith" });
      expect(results.length).toBe(1);
      expect(results[0].address.street).toContain("Smith");
    });

    it("search is case-insensitive", async () => {
      const upper = await service.listProperties({ search: "RICHMOND" });
      const lower = await service.listProperties({ search: "richmond" });
      expect(upper.length).toBe(lower.length);
      expect(upper.length).toBe(1);
    });

    it("combines status and search filters", async () => {
      const results = await service.listProperties({ status: "active", search: "Windsor" });
      expect(results.length).toBe(1); // Only active Windsor (prop-002), not inactive (prop-011)
    });
  });

  // ─── getProperty ─────────────────────────────────────────

  describe("getProperty", () => {
    it("returns property by ID", async () => {
      const prop = await service.getProperty("prop-001");
      expect(prop).toBeDefined();
      expect(prop!.id).toBe("prop-001");
      expect(prop!.address.suburb).toBe("Richmond");
    });

    it("returns undefined for non-existent ID", async () => {
      const prop = await service.getProperty("prop-999");
      expect(prop).toBeUndefined();
    });
  });

  // ─── listTenants ──────────────────────────────────────────

  describe("listTenants", () => {
    it("returns all tenants with no filter", async () => {
      const tenants = await service.listTenants();
      expect(tenants.length).toBe(9);
    });

    it("filters by propertyId", async () => {
      const tenants = await service.listTenants({ propertyId: "prop-001" });
      expect(tenants.length).toBe(1);
      expect(tenants[0].propertyId).toBe("prop-001");
    });

    it("returns empty array for property with no tenants", async () => {
      const tenants = await service.listTenants({ propertyId: "prop-008" });
      expect(tenants.length).toBe(0);
    });
  });

  // ─── listOwners ───────────────────────────────────────────

  describe("listOwners", () => {
    it("returns all owners", async () => {
      const owners = await service.listOwners();
      expect(owners.length).toBe(6);
    });

    it("each owner has required fields", async () => {
      const owners = await service.listOwners();
      owners.forEach((o) => {
        expect(o.id).toBeDefined();
        expect(o.firstName).toBeDefined();
        expect(o.lastName).toBeDefined();
        expect(o.propertyCount).toBeGreaterThan(0);
      });
    });
  });

  // ─── listMaintenance ──────────────────────────────────────

  describe("listMaintenance", () => {
    it("returns all maintenance requests with no filter", async () => {
      const requests = await service.listMaintenance();
      expect(requests.length).toBe(10);
    });

    it("filters by propertyId", async () => {
      const requests = await service.listMaintenance({ propertyId: "prop-001" });
      expect(requests.length).toBe(2);
      requests.forEach((r) => expect(r.propertyId).toBe("prop-001"));
    });

    it("filters by status=open", async () => {
      const requests = await service.listMaintenance({ status: "open" });
      requests.forEach((r) => expect(r.status).toBe("open"));
      expect(requests.length).toBeGreaterThan(0);
    });

    it("filters by status=completed", async () => {
      const requests = await service.listMaintenance({ status: "completed" });
      requests.forEach((r) => {
        expect(r.status).toBe("completed");
        expect(r.completedAt).toBeDefined();
      });
      expect(requests.length).toBe(2);
    });

    it("combines propertyId and status filters", async () => {
      const requests = await service.listMaintenance({
        propertyId: "prop-001",
        status: "open",
      });
      expect(requests.length).toBe(1);
      expect(requests[0].propertyId).toBe("prop-001");
      expect(requests[0].status).toBe("open");
    });

    it("returns empty for property with no maintenance", async () => {
      const requests = await service.listMaintenance({ propertyId: "prop-011" });
      expect(requests.length).toBe(0);
    });
  });
});
