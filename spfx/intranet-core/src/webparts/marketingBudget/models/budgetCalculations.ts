/**
 * Budget Calculation Helpers
 *
 * Pure functions for computing budget totals, GST, and line item prices.
 * No side effects — safe to unit test without mocking.
 */

/* eslint-disable @rushstack/no-new-null */

import type { Budget, BudgetLineItem, Service, VariantContext } from "./types";
import { getServiceVariant } from "./variantHelpers";

// Australian GST rate (10%)
const GST_RATE = 0.1;
const GST_DIVISOR = 1 + GST_RATE; // 1.1

/**
 * Get the effective price for a budget line item.
 * Uses the override price if set, otherwise falls back to the schedule price.
 */
export function getLineItemPrice(lineItem: BudgetLineItem): number {
  if (lineItem.isOverridden && lineItem.overridePrice !== null) {
    return lineItem.overridePrice;
  }
  return lineItem.schedulePrice ?? 0;
}

/**
 * Calculate the subtotal for selected line items.
 */
export function calculateSubtotal(lineItems: BudgetLineItem[]): number {
  return lineItems
    .filter((li) => li.isSelected)
    .reduce((sum, li) => sum + getLineItemPrice(li), 0);
}

/**
 * Calculate the GST component (inclusive) from a GST-inclusive total.
 * Australian GST is 10%, so GST = total - (total / 1.1).
 */
export function calculateGstInclusive(total: number): number {
  return total - total / GST_DIVISOR;
}

/**
 * Get a full budget summary.
 */
export function calculateBudgetSummary(lineItems: BudgetLineItem[]): {
  subtotal: number;
  gst: number;
  total: number;
  selectedCount: number;
  totalCount: number;
} {
  const subtotal = calculateSubtotal(lineItems);
  const gst = calculateGstInclusive(subtotal);

  return {
    subtotal,
    gst: Math.round(gst * 100) / 100,
    total: subtotal,
    selectedCount: lineItems.filter((li) => li.isSelected).length,
    totalCount: lineItems.length,
  };
}

/**
 * Resolve line items for a budget from the service catalogue.
 *
 * This takes budget line items (which only store serviceId / variantId)
 * and enriches them with current service names and schedule prices.
 */
export function resolveLineItems(
  lineItems: BudgetLineItem[],
  services: Service[],
  context: VariantContext,
): BudgetLineItem[] {
  return lineItems.map((li) => {
    const service = services.find((s) => s.id === li.serviceId);
    if (!service) return li;

    const variant = getServiceVariant(service, context, li.variantId);

    return {
      ...li,
      serviceName: service.name,
      variantId: variant.id,
      variantName: variant.name,
      schedulePrice: li.isOverridden ? li.schedulePrice : variant.basePrice,
    };
  });
}

/**
 * Get the effective price for a line item given the source service and context.
 * Uses override price if set, otherwise resolves the variant price from the service.
 */
export function getEffectivePrice(
  lineItem: BudgetLineItem,
  service: Service,
  context: VariantContext,
): number {
  if (lineItem.isOverridden && lineItem.overridePrice !== null) {
    return lineItem.overridePrice;
  }
  const variant = getServiceVariant(
    service,
    context,
    lineItem.variantId ?? undefined,
  );
  return variant.basePrice;
}

/**
 * Create default budget values.
 */
export function createDefaultBudget(
  vendorId?: number | null,
): Omit<Budget, "createdAt" | "updatedAt"> {
  return {
    propertyAddress: "",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    suburbId: null,
    vendorId: vendorId ?? null,
    scheduleId: null,
    scheduleName: null,
    lineItems: [],
    status: "draft",
  };
}
