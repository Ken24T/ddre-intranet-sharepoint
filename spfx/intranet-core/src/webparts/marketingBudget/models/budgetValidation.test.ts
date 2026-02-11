/**
 * Budget Validation — Unit Tests
 */

import type { Budget, BudgetLineItem } from "./types";
import {
  validateAddress,
  validateHasLineItems,
  validateSelectedItems,
  validateItemPrices,
  validateSchedule,
  validateForApproval,
  validateTransition,
} from "./budgetValidation";

// ─── Helpers ──────────────────────────────────────────────

/** Build a minimal valid budget for testing. */
function makeValidBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 1,
    propertyAddress: "42 Wallaby Way, Sydney",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    suburbId: 1,
    vendorId: 1,
    scheduleId: 1,
    scheduleName: "Standard House",
    lineItems: [
      {
        serviceId: 1,
        serviceName: "Photography",
        variantId: "v1",
        variantName: "8 Photos",
        isSelected: true,
        schedulePrice: 250,
        overridePrice: null,
        isOverridden: false,
      },
    ],
    notes: "",
    clientName: "Test Client",
    agentName: "Test Agent",
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeLineItem(overrides: Partial<BudgetLineItem> = {}): BudgetLineItem {
  return {
    serviceId: 1,
    serviceName: "Photography",
    variantId: "v1",
    variantName: "8 Photos",
    isSelected: true,
    schedulePrice: 250,
    overridePrice: null,
    isOverridden: false,
    ...overrides,
  };
}

// ─── validateAddress ──────────────────────────────────────

describe("validateAddress", () => {
  it("returns null for a valid address", () => {
    const budget = makeValidBudget();
    expect(validateAddress(budget)).toBeUndefined();
  });

  it("returns error for empty address", () => {
    const budget = makeValidBudget({ propertyAddress: "" });
    const err = validateAddress(budget);
    expect(err).toBeDefined();
    expect(err!.rule).toBe("address_required");
  });

  it("returns error for whitespace-only address", () => {
    const budget = makeValidBudget({ propertyAddress: "   " });
    expect(validateAddress(budget)).toBeDefined();
  });
});

// ─── validateHasLineItems ─────────────────────────────────

describe("validateHasLineItems", () => {
  it("returns null when line items exist", () => {
    const budget = makeValidBudget();
    expect(validateHasLineItems(budget)).toBeUndefined();
  });

  it("returns error for empty line items array", () => {
    const budget = makeValidBudget({ lineItems: [] });
    const err = validateHasLineItems(budget);
    expect(err).toBeDefined();
    expect(err!.rule).toBe("line_items_required");
  });
});

// ─── validateSelectedItems ────────────────────────────────

describe("validateSelectedItems", () => {
  it("returns null when at least one item is selected", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: false }),
        makeLineItem({ isSelected: true }),
      ],
    });
    expect(validateSelectedItems(budget)).toBeUndefined();
  });

  it("returns error when no items are selected", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: false }),
        makeLineItem({ isSelected: false }),
      ],
    });
    const err = validateSelectedItems(budget);
    expect(err).toBeDefined();
    expect(err!.rule).toBe("selected_items_required");
  });
});

// ─── validateItemPrices ───────────────────────────────────

describe("validateItemPrices", () => {
  it("returns null when all selected items have positive prices", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: true, schedulePrice: 100 }),
        makeLineItem({ isSelected: false, schedulePrice: 0 }), // unselected — ignored
      ],
    });
    expect(validateItemPrices(budget)).toBeUndefined();
  });

  it("returns error when a selected item has zero price", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: true, schedulePrice: 0, overridePrice: null, isOverridden: false }),
      ],
    });
    const err = validateItemPrices(budget);
    expect(err).toBeDefined();
    expect(err!.rule).toBe("item_prices_required");
  });

  it("accepts override price when schedule price is zero", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: true, schedulePrice: 0, overridePrice: 150, isOverridden: true }),
      ],
    });
    expect(validateItemPrices(budget)).toBeUndefined();
  });

  it("returns error message with correct count for multiple zero-price items", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: true, schedulePrice: 0 }),
        makeLineItem({ isSelected: true, schedulePrice: 0 }),
      ],
    });
    const err = validateItemPrices(budget);
    expect(err).toBeDefined();
    expect(err!.message).toContain("2 selected line items have");
  });

  it("returns singular message for one zero-price item", () => {
    const budget = makeValidBudget({
      lineItems: [
        makeLineItem({ isSelected: true, schedulePrice: 0 }),
      ],
    });
    const err = validateItemPrices(budget);
    expect(err).toBeDefined();
    expect(err!.message).toContain("1 selected line item has");
  });
});

// ─── validateSchedule ─────────────────────────────────────

describe("validateSchedule", () => {
  it("returns null when schedule is selected", () => {
    const budget = makeValidBudget({ scheduleId: 1 });
    expect(validateSchedule(budget)).toBeUndefined();
  });

  it("returns error when scheduleId is null", () => {
    const budget = makeValidBudget({ scheduleId: null });
    const err = validateSchedule(budget);
    expect(err).toBeDefined();
    expect(err!.rule).toBe("schedule_required");
  });
});

// ─── validateForApproval ──────────────────────────────────

describe("validateForApproval", () => {
  it("returns valid for a complete budget", () => {
    const budget = makeValidBudget();
    const result = validateForApproval(budget);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("collects all errors for a completely invalid budget", () => {
    const budget = makeValidBudget({
      propertyAddress: "",
      scheduleId: null,
      lineItems: [],
    });
    const result = validateForApproval(budget);
    expect(result.isValid).toBe(false);
    // address_required, line_items_required, selected_items_required, schedule_required
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("collects multiple independent errors", () => {
    const budget = makeValidBudget({
      propertyAddress: "",
      scheduleId: null,
    });
    const result = validateForApproval(budget);
    expect(result.isValid).toBe(false);
    const rules = result.errors.map((e) => e.rule);
    expect(rules).toContain("address_required");
    expect(rules).toContain("schedule_required");
  });
});

// ─── validateTransition ───────────────────────────────────

describe("validateTransition", () => {
  it("validates draft → approved", () => {
    const budget = makeValidBudget();
    const result = validateTransition(budget, "draft", "approved");
    expect(result.isValid).toBe(true);
  });

  it("blocks draft → approved for incomplete budget", () => {
    const budget = makeValidBudget({ propertyAddress: "", scheduleId: null });
    const result = validateTransition(budget, "draft", "approved");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("allows approved → sent without validation", () => {
    const budget = makeValidBudget({ status: "approved", propertyAddress: "" }); // address empty but allowed
    const result = validateTransition(budget, "approved", "sent");
    expect(result.isValid).toBe(true);
  });

  it("allows approved → draft revert without validation", () => {
    const budget = makeValidBudget({ status: "approved" });
    const result = validateTransition(budget, "approved", "draft");
    expect(result.isValid).toBe(true);
  });

  it("allows sent → archived without validation", () => {
    const budget = makeValidBudget({ status: "sent" });
    const result = validateTransition(budget, "sent", "archived");
    expect(result.isValid).toBe(true);
  });
});
