/**
 * Unit tests for budgetCalculations.
 *
 * Tests the pure calculation functions for budget totals, GST, and line items.
 */

import {
  getLineItemPrice,
  calculateSubtotal,
  calculateGstInclusive,
  calculateBudgetSummary,
  createDefaultBudget,
  resolveLineItems,
  getEffectivePrice,
} from "../models/budgetCalculations";
import type { BudgetLineItem, Service, VariantContext } from "../models/types";

// ─── Test fixtures ──────────────────────────────────────────

const makeLineItem = (
  overrides: Partial<BudgetLineItem> = {},
): BudgetLineItem => ({
  serviceId: 1,
  variantId: "default",
  isSelected: true,
  schedulePrice: 100,
  overridePrice: null,
  isOverridden: false,
  ...overrides,
});

// ─── getLineItemPrice ───────────────────────────────────────

describe("getLineItemPrice", () => {
  it("returns schedule price when not overridden", () => {
    const li = makeLineItem({ schedulePrice: 250 });
    expect(getLineItemPrice(li)).toBe(250);
  });

  it("returns override price when overridden", () => {
    const li = makeLineItem({
      schedulePrice: 250,
      overridePrice: 199,
      isOverridden: true,
    });
    expect(getLineItemPrice(li)).toBe(199);
  });

  it("returns 0 when schedule price is undefined and not overridden", () => {
    const li = makeLineItem({ schedulePrice: undefined });
    expect(getLineItemPrice(li)).toBe(0);
  });
});

// ─── calculateSubtotal ─────────────────────────────────────

describe("calculateSubtotal", () => {
  it("sums only selected line items", () => {
    const items: BudgetLineItem[] = [
      makeLineItem({ schedulePrice: 100, isSelected: true }),
      makeLineItem({ schedulePrice: 200, isSelected: false }),
      makeLineItem({ schedulePrice: 300, isSelected: true }),
    ];
    expect(calculateSubtotal(items)).toBe(400);
  });

  it("returns 0 for empty array", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("returns 0 when no items are selected", () => {
    const items: BudgetLineItem[] = [
      makeLineItem({ isSelected: false }),
      makeLineItem({ isSelected: false }),
    ];
    expect(calculateSubtotal(items)).toBe(0);
  });
});

// ─── calculateGstInclusive ─────────────────────────────────

describe("calculateGstInclusive", () => {
  it("extracts 10% GST from GST-inclusive price", () => {
    // $110 inclusive => $10 GST
    const gst = calculateGstInclusive(110);
    expect(gst).toBeCloseTo(10, 2);
  });

  it("returns 0 for 0 total", () => {
    expect(calculateGstInclusive(0)).toBe(0);
  });

  it("calculates correctly for $1100", () => {
    // $1100 inclusive => $100 GST
    const gst = calculateGstInclusive(1100);
    expect(gst).toBeCloseTo(100, 2);
  });
});

// ─── calculateBudgetSummary ────────────────────────────────

describe("calculateBudgetSummary", () => {
  it("returns correct summary for mixed selection", () => {
    const items: BudgetLineItem[] = [
      makeLineItem({ schedulePrice: 550, isSelected: true }),
      makeLineItem({ schedulePrice: 200, isSelected: false }),
      makeLineItem({ schedulePrice: 550, isSelected: true }),
    ];

    const summary = calculateBudgetSummary(items);
    expect(summary.subtotal).toBe(1100);
    expect(summary.gst).toBeCloseTo(100, 2);
    expect(summary.total).toBe(1100);
    expect(summary.selectedCount).toBe(2);
    expect(summary.totalCount).toBe(3);
  });

  it("handles empty line items", () => {
    const summary = calculateBudgetSummary([]);
    expect(summary.subtotal).toBe(0);
    expect(summary.gst).toBe(0);
    expect(summary.total).toBe(0);
    expect(summary.selectedCount).toBe(0);
    expect(summary.totalCount).toBe(0);
  });
});

// ─── createDefaultBudget ───────────────────────────────────

describe("createDefaultBudget", () => {
  it("creates a draft budget with default values", () => {
    const budget = createDefaultBudget();
    expect(budget.propertyAddress).toBe("");
    expect(budget.propertyType).toBe("house");
    expect(budget.propertySize).toBe("medium");
    expect(budget.tier).toBe("standard");
    expect(budget.status).toBe("draft");
    expect(budget.lineItems).toEqual([]);
    expect(budget.vendorId).toBeNull();
  });

  it("accepts a vendor ID", () => {
    const budget = createDefaultBudget(5);
    expect(budget.vendorId).toBe(5);
  });
});

// ─── resolveLineItems ──────────────────────────────────────

const testServices: Service[] = [
  {
    id: 1,
    name: "Photography",
    category: "photography",
    vendorId: 1,
    variantSelector: "manual",
    variants: [
      { id: "4-photos", name: "4 Photos", basePrice: 220 },
      { id: "8-photos", name: "8 Photos", basePrice: 330 },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 2,
    name: "Floor Plan",
    category: "floorPlans",
    vendorId: 1,
    variantSelector: "propertySize",
    variants: [
      { id: "small", name: "Small", basePrice: 150, sizeMatch: "small" },
      { id: "medium", name: "Medium", basePrice: 180, sizeMatch: "medium" },
    ],
    includesGst: true,
    isActive: 1,
  },
];

const testContext: VariantContext = { propertySize: "medium" };

describe("resolveLineItems", () => {
  it("enriches line items with service names and variant details", () => {
    const lineItems: BudgetLineItem[] = [
      makeLineItem({
        serviceId: 1,
        variantId: "8-photos",
        schedulePrice: 330,
      }),
    ];

    const resolved = resolveLineItems(lineItems, testServices, testContext);
    expect(resolved[0].serviceName).toBe("Photography");
    expect(resolved[0].variantName).toBe("8 Photos");
    expect(resolved[0].schedulePrice).toBe(330);
  });

  it("returns line item unchanged when service is not found", () => {
    const lineItems: BudgetLineItem[] = [
      makeLineItem({ serviceId: 999, variantId: "default" }),
    ];

    const resolved = resolveLineItems(lineItems, testServices, testContext);
    expect(resolved[0]).toEqual(lineItems[0]);
  });

  it("resolves auto variant when variantSelector is propertySize", () => {
    const lineItems: BudgetLineItem[] = [
      makeLineItem({
        serviceId: 2,
        variantId: "medium",
        schedulePrice: 180,
      }),
    ];

    const resolved = resolveLineItems(lineItems, testServices, testContext);
    expect(resolved[0].serviceName).toBe("Floor Plan");
    expect(resolved[0].variantName).toBe("Medium");
  });
});

// ─── getEffectivePrice ─────────────────────────────────────

describe("getEffectivePrice", () => {
  it("returns override price when overridden", () => {
    const li = makeLineItem({
      serviceId: 1,
      variantId: "8-photos",
      isOverridden: true,
      overridePrice: 299,
    });
    const price = getEffectivePrice(li, testServices[0], testContext);
    expect(price).toBe(299);
  });

  it("returns variant price when not overridden", () => {
    const li = makeLineItem({
      serviceId: 1,
      variantId: "8-photos",
      isOverridden: false,
    });
    const price = getEffectivePrice(li, testServices[0], testContext);
    expect(price).toBe(330);
  });
});
