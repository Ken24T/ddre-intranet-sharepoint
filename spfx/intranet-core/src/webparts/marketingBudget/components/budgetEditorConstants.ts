/**
 * Static dropdown options and workflow transitions for the Budget Editor.
 */

import type { IDropdownOption } from "@fluentui/react";
import type { BudgetStatus } from "../models/types";

export const propertyTypeOptions: IDropdownOption[] = [
  { key: "house", text: "House" },
  { key: "unit", text: "Unit" },
  { key: "townhouse", text: "Townhouse" },
  { key: "land", text: "Land" },
  { key: "rural", text: "Rural" },
  { key: "commercial", text: "Commercial" },
];

export const propertySizeOptions: IDropdownOption[] = [
  { key: "small", text: "Small" },
  { key: "medium", text: "Medium" },
  { key: "large", text: "Large" },
];

export const budgetTierOptions: IDropdownOption[] = [
  { key: "basic", text: "Basic" },
  { key: "standard", text: "Standard" },
  { key: "premium", text: "Premium" },
];

export const statusTransitions: Record<BudgetStatus, BudgetStatus[]> = {
  draft: ["approved"],
  approved: ["sent", "draft"],
  sent: ["archived"],
  archived: [],
};
