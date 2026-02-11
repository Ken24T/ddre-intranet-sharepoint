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
} from "./types";

export {
  getServiceVariant,
  getVariantPrice,
  hasSelectableVariants,
  hasAutoVariants,
} from "./variantHelpers";

export {
  getLineItemPrice,
  getEffectivePrice,
  calculateSubtotal,
  calculateGstInclusive,
  calculateBudgetSummary,
  resolveLineItems,
  createDefaultBudget,
} from "./budgetCalculations";

export { getSeedData, SEED_COUNTS } from "./seedData";

export type { ValidationError, ValidationResult } from "./budgetValidation";

export {
  validateAddress,
  validateHasLineItems,
  validateSelectedItems,
  validateItemPrices,
  validateSchedule,
  validateForApproval,
  validateTransition,
} from "./budgetValidation";

export type { MonthlySpend } from "./dashboardAggregations";

export {
  countBudgetsByStatus,
  totalSpendByCategory,
  totalSpendByTier,
  monthlySpendTrend,
  overallSpendSummary,
} from "./dashboardAggregations";

export type { ExportEntityType, ImportSummary } from "./exportHelpers";

export {
  ALL_ENTITY_TYPES,
  budgetListToCsv,
  budgetLineItemsToCsv,
  downloadCsv,
  downloadJson,
  downloadFile,
  exportSelective,
  analyseImport,
  importSelective,
} from "./exportHelpers";
