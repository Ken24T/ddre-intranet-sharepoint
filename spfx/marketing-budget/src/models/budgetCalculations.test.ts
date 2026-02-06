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
} from '../models/budgetCalculations';
import type { BudgetLineItem } from '../models/types';

// ─── Test fixtures ──────────────────────────────────────────

const makeLineItem = (overrides: Partial<BudgetLineItem> = {}): BudgetLineItem => ({
  serviceId: 1,
  variantId: 'default',
  isSelected: true,
  schedulePrice: 100,
  overridePrice: null,
  isOverridden: false,
  ...overrides,
});

// ─── getLineItemPrice ───────────────────────────────────────

describe('getLineItemPrice', () => {
  it('returns schedule price when not overridden', () => {
    const li = makeLineItem({ schedulePrice: 250 });
    expect(getLineItemPrice(li)).toBe(250);
  });

  it('returns override price when overridden', () => {
    const li = makeLineItem({
      schedulePrice: 250,
      overridePrice: 199,
      isOverridden: true,
    });
    expect(getLineItemPrice(li)).toBe(199);
  });

  it('returns 0 when schedule price is undefined and not overridden', () => {
    const li = makeLineItem({ schedulePrice: undefined });
    expect(getLineItemPrice(li)).toBe(0);
  });
});

// ─── calculateSubtotal ─────────────────────────────────────

describe('calculateSubtotal', () => {
  it('sums only selected line items', () => {
    const items: BudgetLineItem[] = [
      makeLineItem({ schedulePrice: 100, isSelected: true }),
      makeLineItem({ schedulePrice: 200, isSelected: false }),
      makeLineItem({ schedulePrice: 300, isSelected: true }),
    ];
    expect(calculateSubtotal(items)).toBe(400);
  });

  it('returns 0 for empty array', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('returns 0 when no items are selected', () => {
    const items: BudgetLineItem[] = [
      makeLineItem({ isSelected: false }),
      makeLineItem({ isSelected: false }),
    ];
    expect(calculateSubtotal(items)).toBe(0);
  });
});

// ─── calculateGstInclusive ─────────────────────────────────

describe('calculateGstInclusive', () => {
  it('extracts 10% GST from GST-inclusive price', () => {
    // $110 inclusive => $10 GST
    const gst = calculateGstInclusive(110);
    expect(gst).toBeCloseTo(10, 2);
  });

  it('returns 0 for 0 total', () => {
    expect(calculateGstInclusive(0)).toBe(0);
  });

  it('calculates correctly for $1100', () => {
    // $1100 inclusive => $100 GST
    const gst = calculateGstInclusive(1100);
    expect(gst).toBeCloseTo(100, 2);
  });
});

// ─── calculateBudgetSummary ────────────────────────────────

describe('calculateBudgetSummary', () => {
  it('returns correct summary for mixed selection', () => {
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

  it('handles empty line items', () => {
    const summary = calculateBudgetSummary([]);
    expect(summary.subtotal).toBe(0);
    expect(summary.gst).toBe(0);
    expect(summary.total).toBe(0);
    expect(summary.selectedCount).toBe(0);
    expect(summary.totalCount).toBe(0);
  });
});

// ─── createDefaultBudget ───────────────────────────────────

describe('createDefaultBudget', () => {
  it('creates a draft budget with default values', () => {
    const budget = createDefaultBudget();
    expect(budget.propertyAddress).toBe('');
    expect(budget.propertyType).toBe('house');
    expect(budget.propertySize).toBe('medium');
    expect(budget.tier).toBe('standard');
    expect(budget.status).toBe('draft');
    expect(budget.lineItems).toEqual([]);
    expect(budget.vendorId).toBeNull();
  });

  it('accepts a vendor ID', () => {
    const budget = createDefaultBudget(5);
    expect(budget.vendorId).toBe(5);
  });
});
