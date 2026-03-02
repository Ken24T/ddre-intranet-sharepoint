/**
 * Export Helpers – Unit Tests
 */

import type { Budget, BudgetLineItem, DataExport } from "./types";
import {
  budgetListToCsv,
  budgetLineItemsToCsv,
  analyseImport,
  ALL_ENTITY_TYPES,
} from "./exportHelpers";

// ─── Factories ────────────────────────────────────────────────

function makeLi(
  overrides: Partial<BudgetLineItem> = {},
): BudgetLineItem {
  return {
    serviceId: 1,
    serviceName: "Photography",
    variantId: "v1",
    variantName: "Standard",
    isSelected: true,
    schedulePrice: 500,
    overridePrice: null,
    isOverridden: false,
    ...overrides,
  };
}

function makeBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 1,
    propertyAddress: "1 Test Street, Sydney",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    suburbId: null,
    vendorId: null,
    scheduleId: null,
    lineItems: [makeLi()],
    status: "draft",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    ...overrides,
  };
}

// ─── CSV Tests ────────────────────────────────────────────────

describe("budgetListToCsv", () => {
  it("produces header row for empty array", () => {
    const csv = budgetListToCsv([]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Address");
    expect(lines[0]).toContain("Status");
    expect(lines[0]).toContain("Subtotal");
  });

  it("produces one data row per budget", () => {
    const csv = budgetListToCsv([makeBudget(), makeBudget({ id: 2 })]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3); // header + 2 rows
  });

  it("includes correct values in data row", () => {
    const csv = budgetListToCsv([
      makeBudget({
        propertyAddress: "42 Wallaby Way",
        clientName: "Nemo",
        agentName: "Dory",
        status: "approved",
        tier: "premium",
      }),
    ]);
    const dataRow = csv.split("\n")[1];
    expect(dataRow).toContain("42 Wallaby Way");
    expect(dataRow).toContain("Nemo");
    expect(dataRow).toContain("Dory");
    expect(dataRow).toContain("approved");
    expect(dataRow).toContain("premium");
    expect(dataRow).toContain("500.00"); // subtotal from makeLi
  });

  it("escapes commas in values", () => {
    const csv = budgetListToCsv([
      makeBudget({ propertyAddress: "1 Test, Street" }),
    ]);
    const dataRow = csv.split("\n")[1];
    expect(dataRow).toContain('"1 Test, Street"');
  });
});

describe("budgetLineItemsToCsv", () => {
  it("produces header row and one row per line item", () => {
    const budget = makeBudget({
      lineItems: [
        makeLi({ serviceName: "Photography", schedulePrice: 500 }),
        makeLi({ serviceName: "Floor Plans", schedulePrice: 200, isSelected: false }),
      ],
    });
    const csv = budgetLineItemsToCsv(budget);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3); // header + 2 items
    expect(lines[0]).toContain("Service");
    expect(lines[0]).toContain("Effective Price");
  });

  it("shows override price when overridden", () => {
    const budget = makeBudget({
      lineItems: [
        makeLi({
          schedulePrice: 500,
          overridePrice: 350,
          isOverridden: true,
        }),
      ],
    });
    const csv = budgetLineItemsToCsv(budget);
    const dataRow = csv.split("\n")[1];
    expect(dataRow).toContain("350.00"); // effective price
    expect(dataRow).toContain("Yes"); // overridden
  });
});

// ─── Import Analysis ──────────────────────────────────────────

describe("analyseImport", () => {
  it("identifies available types from partial export", () => {
    const data: Partial<DataExport> = {
      vendors: [{ id: 1, name: "V", isActive: 1 }],
      services: [],
      suburbs: [
        { id: 1, name: "S", pricingTier: "A" },
        { id: 2, name: "S2", pricingTier: "B" },
      ],
    };
    const summary = analyseImport(data);
    expect(summary.vendors).toBe(1);
    expect(summary.services).toBe(0);
    expect(summary.suburbs).toBe(2);
    expect(summary.schedules).toBe(0);
    expect(summary.budgets).toBe(0);
    expect(summary.availableTypes).toEqual(["vendors", "suburbs"]);
  });

  it("returns empty for completely empty data", () => {
    const summary = analyseImport({});
    expect(summary.availableTypes).toEqual([]);
    expect(summary.vendors).toBe(0);
  });
});

describe("ALL_ENTITY_TYPES", () => {
  it("contains all five entity types", () => {
    expect(ALL_ENTITY_TYPES).toHaveLength(5);
    expect(ALL_ENTITY_TYPES).toContain("vendors");
    expect(ALL_ENTITY_TYPES).toContain("services");
    expect(ALL_ENTITY_TYPES).toContain("suburbs");
    expect(ALL_ENTITY_TYPES).toContain("schedules");
    expect(ALL_ENTITY_TYPES).toContain("budgets");
  });
});
