/**
 * Dashboard Aggregations – Unit Tests
 */

import type { Budget, Service, BudgetLineItem } from "./types";
import {
  countBudgetsByStatus,
  totalSpendByCategory,
  totalSpendByTier,
  monthlySpendTrend,
  overallSpendSummary,
} from "./dashboardAggregations";

// ─── Factories ────────────────────────────────────────────────

function makeLi(
  serviceId: number,
  price: number,
  selected: boolean = true,
): BudgetLineItem {
  return {
    serviceId,
    variantId: "v1",
    isSelected: selected,
    schedulePrice: price,
    overridePrice: null,
    isOverridden: false,
  };
}

function makeBudget(
  overrides: Partial<Budget> & { lineItems?: BudgetLineItem[] } = {},
): Budget {
  return {
    id: 1,
    propertyAddress: "1 Test St",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    suburbId: null,
    vendorId: null,
    scheduleId: null,
    lineItems: [],
    status: "draft",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    ...overrides,
  };
}

function makeService(
  id: number,
  category: Service["category"],
): Service {
  return {
    id,
    name: `Service ${id}`,
    category,
    vendorId: null,
    variantSelector: null,
    variants: [{ id: "v1", name: "Default", basePrice: 100 }],
    includesGst: true,
    isActive: 1,
  };
}

// ─── Tests ────────────────────────────────────────────────────

describe("countBudgetsByStatus", () => {
  it("returns zeroes for empty array", () => {
    const result = countBudgetsByStatus([]);
    expect(result).toEqual({ draft: 0, approved: 0, sent: 0, archived: 0 });
  });

  it("counts budgets by status correctly", () => {
    const budgets = [
      makeBudget({ status: "draft" }),
      makeBudget({ status: "draft" }),
      makeBudget({ status: "approved" }),
      makeBudget({ status: "sent" }),
      makeBudget({ status: "sent" }),
      makeBudget({ status: "sent" }),
      makeBudget({ status: "archived" }),
    ];
    expect(countBudgetsByStatus(budgets)).toEqual({
      draft: 2,
      approved: 1,
      sent: 3,
      archived: 1,
    });
  });
});

describe("totalSpendByCategory", () => {
  const services: Service[] = [
    makeService(1, "photography"),
    makeService(2, "floorPlans"),
    makeService(3, "video"),
  ];

  it("returns zeroes when no budgets", () => {
    const result = totalSpendByCategory([], services);
    expect(result.photography).toBe(0);
    expect(result.floorPlans).toBe(0);
  });

  it("sums selected line item prices by service category", () => {
    const budgets = [
      makeBudget({
        lineItems: [
          makeLi(1, 500, true),
          makeLi(2, 200, true),
          makeLi(3, 300, false), // not selected
        ],
      }),
      makeBudget({
        lineItems: [
          makeLi(1, 400, true),
        ],
      }),
    ];
    const result = totalSpendByCategory(budgets, services);
    expect(result.photography).toBe(900);
    expect(result.floorPlans).toBe(200);
    expect(result.video).toBe(0); // deselected
  });

  it("falls back to 'other' for unknown service IDs", () => {
    const budgets = [
      makeBudget({ lineItems: [makeLi(999, 100, true)] }),
    ];
    const result = totalSpendByCategory(budgets, services);
    expect(result.other).toBe(100);
  });

  it("uses override price when set", () => {
    const budgets = [
      makeBudget({
        lineItems: [{
          serviceId: 1,
          variantId: "v1",
          isSelected: true,
          schedulePrice: 500,
          overridePrice: 350,
          isOverridden: true,
        }],
      }),
    ];
    const result = totalSpendByCategory(budgets, services);
    expect(result.photography).toBe(350);
  });
});

describe("totalSpendByTier", () => {
  it("returns zeroes for empty array", () => {
    expect(totalSpendByTier([])).toEqual({ basic: 0, standard: 0, premium: 0 });
  });

  it("sums spend per budget tier", () => {
    const budgets = [
      makeBudget({ tier: "basic", lineItems: [makeLi(1, 200)] }),
      makeBudget({ tier: "standard", lineItems: [makeLi(1, 500)] }),
      makeBudget({ tier: "premium", lineItems: [makeLi(1, 800)] }),
      makeBudget({ tier: "standard", lineItems: [makeLi(1, 300)] }),
    ];
    const result = totalSpendByTier(budgets);
    expect(result.basic).toBe(200);
    expect(result.standard).toBe(800);
    expect(result.premium).toBe(800);
  });
});

describe("monthlySpendTrend", () => {
  it("returns empty array for no budgets", () => {
    expect(monthlySpendTrend([])).toEqual([]);
  });

  it("groups by YYYY-MM and sorts chronologically", () => {
    const budgets = [
      makeBudget({ createdAt: "2026-03-10T00:00:00Z", lineItems: [makeLi(1, 100)] }),
      makeBudget({ createdAt: "2026-01-05T00:00:00Z", lineItems: [makeLi(1, 200)] }),
      makeBudget({ createdAt: "2026-01-20T00:00:00Z", lineItems: [makeLi(1, 300)] }),
      makeBudget({ createdAt: "2026-02-15T00:00:00Z", lineItems: [makeLi(1, 150)] }),
    ];
    const result = monthlySpendTrend(budgets);
    expect(result).toEqual([
      { month: "2026-01", total: 500, count: 2 },
      { month: "2026-02", total: 150, count: 1 },
      { month: "2026-03", total: 100, count: 1 },
    ]);
  });
});

describe("overallSpendSummary", () => {
  it("returns zeroes for empty array", () => {
    expect(overallSpendSummary([])).toEqual({
      totalBudgets: 0,
      totalSpend: 0,
      averageSpend: 0,
    });
  });

  it("calculates totals and average", () => {
    const budgets = [
      makeBudget({ lineItems: [makeLi(1, 600)] }),
      makeBudget({ lineItems: [makeLi(1, 400)] }),
    ];
    const result = overallSpendSummary(budgets);
    expect(result.totalBudgets).toBe(2);
    expect(result.totalSpend).toBe(1000);
    expect(result.averageSpend).toBe(500);
  });
});
