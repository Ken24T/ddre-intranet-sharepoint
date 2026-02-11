/**
 * Budget Validation Rules
 *
 * Enforces completeness rules before a budget can advance from draft → approved.
 * Pure functions — no side effects, safe to unit test without mocking.
 *
 * Rules:
 *  1. Property address is required and non-empty.
 *  2. At least one line item must exist.
 *  3. At least one line item must be selected (toggled on).
 *  4. Every selected line item must have a positive price (schedule or override).
 *  5. A schedule must be selected (scheduleId is not null).
 *
 * Additional rules for sent → archived are intentionally lax (no extra validation).
 */

import type { Budget, BudgetStatus } from "./types";
import { getLineItemPrice } from "./budgetCalculations";

// ─────────────────────────────────────────────────────────────
// Validation result
// ─────────────────────────────────────────────────────────────

/** A single validation failure. */
export interface ValidationError {
  /** Machine-readable rule key (e.g. "address_required"). */
  rule: string;
  /** Human-readable error message. */
  message: string;
}

/** Result of validating a budget for a status transition. */
export interface ValidationResult {
  /** Whether the budget passes all rules. */
  isValid: boolean;
  /** List of failures (empty when valid). */
  errors: ValidationError[];
}

// ─────────────────────────────────────────────────────────────
// Individual rule checkers
// ─────────────────────────────────────────────────────────────

/** Property address must be non-empty. */
export function validateAddress(budget: Budget): ValidationError | undefined {
  if (!budget.propertyAddress || !budget.propertyAddress.trim()) {
    return {
      rule: "address_required",
      message: "Property address is required.",
    };
  }
  return undefined;
}

/** Budget must have at least one line item. */
export function validateHasLineItems(budget: Budget): ValidationError | undefined {
  if (!budget.lineItems || budget.lineItems.length === 0) {
    return {
      rule: "line_items_required",
      message: "Budget must have at least one line item.",
    };
  }
  return undefined;
}

/** At least one line item must be selected. */
export function validateSelectedItems(budget: Budget): ValidationError | undefined {
  const selected = (budget.lineItems ?? []).filter((li) => li.isSelected);
  if (selected.length === 0) {
    return {
      rule: "selected_items_required",
      message: "At least one line item must be selected.",
    };
  }
  return undefined;
}

/** Every selected line item must have a positive price. */
export function validateItemPrices(budget: Budget): ValidationError | undefined {
  const selected = (budget.lineItems ?? []).filter((li) => li.isSelected);
  const zeroPriceItems = selected.filter((li) => getLineItemPrice(li) <= 0);
  if (zeroPriceItems.length > 0) {
    const count = zeroPriceItems.length;
    return {
      rule: "item_prices_required",
      message: `${count} selected line item${count > 1 ? "s have" : " has"} no price. Set a price or deselect ${count > 1 ? "them" : "it"}.`,
    };
  }
  return undefined;
}

/** A schedule must be linked to the budget. */
export function validateSchedule(budget: Budget): ValidationError | undefined {
  if (budget.scheduleId === null || budget.scheduleId === undefined) {
    return {
      rule: "schedule_required",
      message: "A schedule template must be selected.",
    };
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────
// Composite validators
// ─────────────────────────────────────────────────────────────

/**
 * All rules that must pass before a budget can be approved.
 * Returns a ValidationResult with all failures collected.
 */
export function validateForApproval(budget: Budget): ValidationResult {
  const checkers = [
    validateAddress,
    validateHasLineItems,
    validateSelectedItems,
    validateItemPrices,
    validateSchedule,
  ];

  const errors: ValidationError[] = [];
  for (const check of checkers) {
    const err = check(budget);
    if (err) errors.push(err);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a budget for a specific status transition.
 *
 * - draft → approved: full validation (all rules)
 * - approved → sent: no additional validation
 * - approved → draft: no validation (revert is always allowed)
 * - sent → archived: no additional validation
 *
 * Returns a passing result for transitions that don't require validation.
 */
export function validateTransition(
  budget: Budget,
  _fromStatus: BudgetStatus,
  toStatus: BudgetStatus,
): ValidationResult {
  // Only draft → approved requires validation
  if (_fromStatus === "draft" && toStatus === "approved") {
    return validateForApproval(budget);
  }

  // All other transitions are allowed without extra validation
  return { isValid: true, errors: [] };
}
