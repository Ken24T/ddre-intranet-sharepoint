/**
 * Models barrel export.
 *
 * Re-exports all domain types, helpers, and calculations from a single entry point.
 */

export type {
  Vendor,
  ServiceVariant,
  Service,
  Suburb,
  ScheduleLineItem,
  Schedule,
  BudgetLineItem,
  Budget,
  ServiceCategory,
  PropertyType,
  PropertySize,
  PricingTier,
  BudgetStatus,
  VariantSelector,
  VariantContext,
  DataExport,
} from './types';

export {
  getServiceVariant,
  getVariantPrice,
  hasSelectableVariants,
  hasAutoVariants,
} from './variantHelpers';

export {
  getLineItemPrice,
  getEffectivePrice,
  calculateSubtotal,
  calculateGstInclusive,
  calculateBudgetSummary,
  resolveLineItems,
  createDefaultBudget,
} from './budgetCalculations';
