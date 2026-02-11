/**
 * Unit tests for variantHelpers.
 *
 * Tests the pure variant-resolution functions that determine which
 * ServiceVariant applies for a given property context.
 */

import {
  getServiceVariant,
  getVariantPrice,
  hasSelectableVariants,
  hasAutoVariants,
} from "../models/variantHelpers";
import { getEffectivePrice } from "../models/budgetCalculations";
import type { Service, BudgetLineItem, VariantContext } from "../models/types";

// ─── Test fixtures ──────────────────────────────────────────

const makeService = (overrides: Partial<Service> = {}): Service => ({
  name: "Test Service",
  category: "photography",
  vendorId: 1,
  variantSelector: null,
  variants: [{ id: "default", name: "Standard", basePrice: 100 }],
  includesGst: true,
  isActive: 1,
  ...overrides,
});

const sizeService: Service = makeService({
  name: "Photography",
  variantSelector: "propertySize",
  variants: [
    { id: "small", name: "Small Package", basePrice: 200, sizeMatch: "small" },
    {
      id: "medium",
      name: "Medium Package",
      basePrice: 350,
      sizeMatch: "medium",
    },
    { id: "large", name: "Large Package", basePrice: 550, sizeMatch: "large" },
  ],
});

const tierService: Service = makeService({
  name: "Internet Listing",
  variantSelector: "suburbTier",
  variants: [
    { id: "tierA", name: "Tier A", basePrice: 1500, tierMatch: "A" },
    { id: "tierB", name: "Tier B", basePrice: 1100, tierMatch: "B" },
    { id: "tierC", name: "Tier C", basePrice: 800, tierMatch: "C" },
    { id: "tierD", name: "Tier D", basePrice: 500, tierMatch: "D" },
  ],
});

const manualService: Service = makeService({
  name: "Video",
  variantSelector: "manual",
  variants: [
    { id: "basic", name: "Basic Video", basePrice: 400 },
    { id: "premium", name: "Premium Video", basePrice: 900 },
  ],
});

// ─── getServiceVariant ──────────────────────────────────────

describe("getServiceVariant", () => {
  it("returns the first variant when no selector and no context", () => {
    const service = makeService();
    const result = getServiceVariant(service);
    expect(result.id).toBe("default");
    expect(result.basePrice).toBe(100);
  });

  it("resolves by propertySize when selector is propertySize", () => {
    const context: VariantContext = { propertySize: "medium" };
    const result = getServiceVariant(sizeService, context);
    expect(result.id).toBe("medium");
    expect(result.basePrice).toBe(350);
  });

  it("resolves by suburbTier when selector is suburbTier", () => {
    const context: VariantContext = { suburbTier: "C" };
    const result = getServiceVariant(tierService, context);
    expect(result.id).toBe("tierC");
    expect(result.basePrice).toBe(800);
  });

  it("uses explicit variantId over auto-resolution", () => {
    const context: VariantContext = { propertySize: "small" };
    const result = getServiceVariant(sizeService, context, "large");
    expect(result.id).toBe("large");
    expect(result.basePrice).toBe(550);
  });

  it("falls back to first variant when auto-resolution finds no match", () => {
    const context: VariantContext = { propertySize: "large" };
    // tierService uses suburbTier, so propertySize won't match anything
    const result = getServiceVariant(tierService, context);
    expect(result.id).toBe("tierA");
  });

  it("returns first variant for manual selector with no explicit selection", () => {
    const result = getServiceVariant(manualService);
    expect(result.id).toBe("basic");
  });

  it("returns explicit variant for manual selector when provided", () => {
    const result = getServiceVariant(manualService, undefined, "premium");
    expect(result.id).toBe("premium");
    expect(result.basePrice).toBe(900);
  });
});

// ─── getVariantPrice ────────────────────────────────────────

describe("getVariantPrice", () => {
  it("returns the resolved variant price", () => {
    const context: VariantContext = { propertySize: "large" };
    expect(getVariantPrice(sizeService, context)).toBe(550);
  });

  it("returns default variant price when no context", () => {
    const service = makeService();
    expect(getVariantPrice(service)).toBe(100);
  });
});

// ─── hasSelectableVariants ──────────────────────────────────

describe("hasSelectableVariants", () => {
  it("returns true for manual selector", () => {
    expect(hasSelectableVariants(manualService)).toBe(true);
  });

  it("returns false for propertySize selector", () => {
    expect(hasSelectableVariants(sizeService)).toBe(false);
  });

  it("returns false for null selector", () => {
    expect(hasSelectableVariants(makeService())).toBe(false);
  });
});

// ─── hasAutoVariants ────────────────────────────────────────

describe("hasAutoVariants", () => {
  it("returns true for propertySize selector", () => {
    expect(hasAutoVariants(sizeService)).toBe(true);
  });

  it("returns true for suburbTier selector", () => {
    expect(hasAutoVariants(tierService)).toBe(true);
  });

  it("returns false for manual selector", () => {
    expect(hasAutoVariants(manualService)).toBe(false);
  });

  it("returns false for null selector", () => {
    expect(hasAutoVariants(makeService())).toBe(false);
  });
});

// ─── getEffectivePrice ──────────────────────────────────────

describe("getEffectivePrice", () => {
  it("returns override price when line item is overridden", () => {
    const lineItem: BudgetLineItem = {
      serviceId: 1,
      variantId: "medium",
      isSelected: true,
      schedulePrice: 350,
      overridePrice: 299,
      isOverridden: true,
    };
    const context: VariantContext = { propertySize: "medium" };
    expect(getEffectivePrice(lineItem, sizeService, context)).toBe(299);
  });

  it("returns variant price when line item is not overridden", () => {
    const lineItem: BudgetLineItem = {
      serviceId: 1,
      variantId: "medium",
      isSelected: true,
      schedulePrice: 350,
      overridePrice: null,
      isOverridden: false,
    };
    const context: VariantContext = { propertySize: "medium" };
    expect(getEffectivePrice(lineItem, sizeService, context)).toBe(350);
  });

  it("falls back to schedule price for non-overridden items", () => {
    const lineItem: BudgetLineItem = {
      serviceId: 999,
      variantId: null,
      isSelected: true,
      schedulePrice: 123,
      overridePrice: null,
      isOverridden: false,
    };
    expect(getEffectivePrice(lineItem, makeService(), {})).toBe(100);
  });
});
