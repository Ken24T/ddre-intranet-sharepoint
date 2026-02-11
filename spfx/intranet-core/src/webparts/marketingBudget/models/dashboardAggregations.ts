/**
 * Dashboard Aggregation Helpers
 *
 * Pure functions for aggregating budget data into dashboard metrics.
 * No side effects — safe to unit test without mocking.
 */

import type {
  Budget,
  BudgetLineItem,
  BudgetStatus,
  BudgetTier,
  Service,
  ServiceCategory,
} from "./types";
import { getLineItemPrice } from "./budgetCalculations";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Monthly spend data point for trend charts. */
export interface MonthlySpend {
  /** ISO month label, e.g. "2026-01". */
  month: string;
  total: number;
  count: number;
}

// ─────────────────────────────────────────────────────────────
// Aggregations
// ─────────────────────────────────────────────────────────────

/**
 * Count budgets by lifecycle status.
 * Returns a record keyed by BudgetStatus with the count for each.
 */
export function countBudgetsByStatus(
  budgets: Budget[],
): Record<BudgetStatus, number> {
  const counts: Record<BudgetStatus, number> = {
    draft: 0,
    approved: 0,
    sent: 0,
    archived: 0,
  };
  for (const b of budgets) {
    if (counts[b.status] !== undefined) {
      counts[b.status]++;
    }
  }
  return counts;
}

/**
 * Sum of selected line item prices per budget, totalled by ServiceCategory.
 * Requires the services array to map serviceId → category.
 */
export function totalSpendByCategory(
  budgets: Budget[],
  services: Service[],
): Record<ServiceCategory, number> {
  const categoryMap = new Map<number, ServiceCategory>();
  for (const svc of services) {
    if (svc.id !== undefined) {
      categoryMap.set(svc.id, svc.category);
    }
  }

  const totals: Record<ServiceCategory, number> = {
    photography: 0,
    floorPlans: 0,
    aerial: 0,
    video: 0,
    virtualStaging: 0,
    internet: 0,
    legal: 0,
    print: 0,
    signage: 0,
    other: 0,
  };

  for (const budget of budgets) {
    for (const li of budget.lineItems) {
      if (!li.isSelected) continue;
      const cat = categoryMap.get(li.serviceId) || "other";
      totals[cat] += getLineItemPrice(li);
    }
  }

  return totals;
}

/**
 * Sum of selected line item prices per budget, totalled by BudgetTier.
 */
export function totalSpendByTier(
  budgets: Budget[],
): Record<BudgetTier, number> {
  const totals: Record<BudgetTier, number> = {
    basic: 0,
    standard: 0,
    premium: 0,
  };

  for (const budget of budgets) {
    const spend = selectedSpend(budget.lineItems);
    totals[budget.tier] += spend;
  }

  return totals;
}

/**
 * Monthly spend trend based on budget createdAt dates.
 * Returns an array sorted chronologically (oldest first).
 */
export function monthlySpendTrend(budgets: Budget[]): MonthlySpend[] {
  const monthMap = new Map<string, { total: number; count: number }>();

  for (const budget of budgets) {
    const month = budget.createdAt.slice(0, 7); // "YYYY-MM"
    const spend = selectedSpend(budget.lineItems);
    const existing = monthMap.get(month);
    if (existing) {
      existing.total += spend;
      existing.count++;
    } else {
      monthMap.set(month, { total: spend, count: 1 });
    }
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
    }));
}

/**
 * Overall spend summary across all budgets.
 */
export function overallSpendSummary(budgets: Budget[]): {
  totalBudgets: number;
  totalSpend: number;
  averageSpend: number;
} {
  let totalSpend = 0;
  for (const budget of budgets) {
    totalSpend += selectedSpend(budget.lineItems);
  }
  return {
    totalBudgets: budgets.length,
    totalSpend,
    averageSpend: budgets.length > 0 ? totalSpend / budgets.length : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

/** Sum of prices for selected line items. */
function selectedSpend(lineItems: BudgetLineItem[]): number {
  let total = 0;
  for (const li of lineItems) {
    if (li.isSelected) {
      total += getLineItemPrice(li);
    }
  }
  return total;
}
