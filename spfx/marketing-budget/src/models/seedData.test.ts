/**
 * Unit tests for the seedData module.
 *
 * Validates the typed seed data matches expected counts and shapes,
 * and that getSeedData() returns deep copies (no mutation of source).
 */

import { getSeedData, SEED_COUNTS } from "./seedData";
import type { Vendor, Service, Suburb, Schedule } from "./types";

describe("seedData module", () => {
  describe("SEED_COUNTS", () => {
    it("reports 2 vendors", () => {
      expect(SEED_COUNTS.vendors).toBe(2);
    });

    it("reports 15 services", () => {
      expect(SEED_COUNTS.services).toBe(15);
    });

    it("reports 10 suburbs", () => {
      expect(SEED_COUNTS.suburbs).toBe(10);
    });

    it("reports 3 schedules", () => {
      expect(SEED_COUNTS.schedules).toBe(3);
    });
  });

  describe("getSeedData()", () => {
    it("returns the correct number of vendors", () => {
      const data = getSeedData();
      expect(data.vendors).toHaveLength(SEED_COUNTS.vendors);
    });

    it("returns the correct number of services", () => {
      const data = getSeedData();
      expect(data.services).toHaveLength(SEED_COUNTS.services);
    });

    it("returns the correct number of suburbs", () => {
      const data = getSeedData();
      expect(data.suburbs).toHaveLength(SEED_COUNTS.suburbs);
    });

    it("returns the correct number of schedules", () => {
      const data = getSeedData();
      expect(data.schedules).toHaveLength(SEED_COUNTS.schedules);
    });

    it("returns deep copies (mutations do not affect source)", () => {
      const first = getSeedData();
      const second = getSeedData();
      (first.vendors as Vendor[])[0].name = "MUTATED";
      expect((second.vendors as Vendor[])[0].name).toBe("Mountford Media");
    });

    it("does not include budgets (seed data is reference data only)", () => {
      const data = getSeedData();
      expect(data.budgets).toBeUndefined();
    });
  });

  describe("vendor data shape", () => {
    it("Mountford Media has correct shortCode", () => {
      const data = getSeedData();
      const mm = (data.vendors as Vendor[]).find(
        (v) => v.name === "Mountford Media",
      );
      expect(mm).toBeDefined();
      expect(mm!.shortCode).toBe("MM");
      expect(mm!.isActive).toBe(1);
    });

    it("Urban Angles has correct shortCode", () => {
      const data = getSeedData();
      const ua = (data.vendors as Vendor[]).find(
        (v) => v.name === "Urban Angles",
      );
      expect(ua).toBeDefined();
      expect(ua!.shortCode).toBe("UA");
    });
  });

  describe("service data integrity", () => {
    it("all services have a category", () => {
      const data = getSeedData();
      for (const s of data.services as Service[]) {
        expect(s.category).toBeTruthy();
      }
    });

    it("all services have at least one variant", () => {
      const data = getSeedData();
      for (const s of data.services as Service[]) {
        expect(s.variants.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("all variant prices are positive numbers", () => {
      const data = getSeedData();
      for (const s of data.services as Service[]) {
        for (const v of s.variants) {
          expect(v.basePrice).toBeGreaterThan(0);
        }
      }
    });

    it("includes GST on all services", () => {
      const data = getSeedData();
      for (const s of data.services as Service[]) {
        expect(s.includesGst).toBe(true);
      }
    });

    it("Photography (Mountford) package-12 includes a floor plan", () => {
      const data = getSeedData();
      const photo = (data.services as Service[]).find((s) => s.id === 1);
      expect(photo).toBeDefined();
      const pkg = photo!.variants.find((v) => v.id === "package-12");
      expect(pkg).toBeDefined();
      expect(pkg!.includedServices).toHaveLength(1);
      expect(pkg!.includedServices![0].serviceId).toBe(2);
    });

    it("REA Premiere has 4 suburb-tier variants", () => {
      const data = getSeedData();
      const rea = (data.services as Service[]).find((s) => s.id === 10);
      expect(rea).toBeDefined();
      expect(rea!.variantSelector).toBe("suburbTier");
      expect(rea!.variants).toHaveLength(4);
    });
  });

  describe("suburb data integrity", () => {
    it("all suburbs have a pricing tier", () => {
      const data = getSeedData();
      for (const s of data.suburbs as Suburb[]) {
        expect(["A", "B", "C", "D"]).toContain(s.pricingTier);
      }
    });

    it("Bardon is Tier A", () => {
      const data = getSeedData();
      const bardon = (data.suburbs as Suburb[]).find(
        (s) => s.name === "Bardon",
      );
      expect(bardon).toBeDefined();
      expect(bardon!.pricingTier).toBe("A");
    });

    it("Chapel Hill is Tier D", () => {
      const data = getSeedData();
      const ch = (data.suburbs as Suburb[]).find(
        (s) => s.name === "Chapel Hill",
      );
      expect(ch).toBeDefined();
      expect(ch!.pricingTier).toBe("D");
    });
  });

  describe("schedule data integrity", () => {
    it("all schedules have line items", () => {
      const data = getSeedData();
      for (const s of data.schedules as Schedule[]) {
        expect(s.lineItems.length).toBeGreaterThan(0);
      }
    });

    it("House - Large - Premium has 6 line items", () => {
      const data = getSeedData();
      const premium = (data.schedules as Schedule[]).find((s) => s.id === 1);
      expect(premium).toBeDefined();
      expect(premium!.lineItems).toHaveLength(6);
      expect(premium!.propertyType).toBe("house");
      expect(premium!.propertySize).toBe("large");
      expect(premium!.tier).toBe("premium");
    });

    it("Unit - Small - Basic uses Urban Angles (vendor 2)", () => {
      const data = getSeedData();
      const basic = (data.schedules as Schedule[]).find((s) => s.id === 3);
      expect(basic).toBeDefined();
      expect(basic!.defaultVendorId).toBe(2);
    });
  });
});
