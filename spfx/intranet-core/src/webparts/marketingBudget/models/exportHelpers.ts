/**
 * Export Helpers
 *
 * Pure functions for generating CSV content and managing selective data export/import.
 * No side effects in the conversion functions — file download triggers are isolated.
 */

/* eslint-disable @rushstack/no-new-null */

import type { Budget, BudgetLineItem, DataExport } from "./types";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import { getLineItemPrice, calculateBudgetSummary } from "./budgetCalculations";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Entity types available for selective export/import. */
export type ExportEntityType =
  | "vendors"
  | "services"
  | "suburbs"
  | "schedules"
  | "budgets";

/** All entity types in order. */
export const ALL_ENTITY_TYPES: ExportEntityType[] = [
  "vendors",
  "services",
  "suburbs",
  "schedules",
  "budgets",
];

/** Summary of what a DataExport file contains. */
export interface ImportSummary {
  vendors: number;
  services: number;
  suburbs: number;
  schedules: number;
  budgets: number;
  availableTypes: ExportEntityType[];
}

// ─────────────────────────────────────────────────────────────
// CSV Generation
// ─────────────────────────────────────────────────────────────

/**
 * Escape a value for CSV output.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
function csvEscape(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? "" : String(value);
  if (str.indexOf(",") >= 0 || str.indexOf('"') >= 0 || str.indexOf("\n") >= 0) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/** Build a CSV string from header row + data rows. */
function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

/**
 * Convert a list of budgets to CSV.
 * One row per budget with summary totals.
 */
export function budgetListToCsv(budgets: Budget[]): string {
  const headers = [
    "Address",
    "Client",
    "Agent",
    "Status",
    "Tier",
    "Selected Items",
    "Subtotal (inc GST)",
    "GST Component",
    "Created",
    "Updated",
  ];

  const rows = budgets.map((b) => {
    const summary = calculateBudgetSummary(b.lineItems);
    return [
      b.propertyAddress,
      b.clientName || "",
      b.agentName || "",
      b.status,
      b.tier,
      String(summary.selectedCount),
      summary.subtotal.toFixed(2),
      summary.gst.toFixed(2),
      b.createdAt,
      b.updatedAt,
    ];
  });

  return buildCsv(headers, rows);
}

/**
 * Convert a single budget's line items to CSV.
 */
export function budgetLineItemsToCsv(budget: Budget): string {
  const headers = [
    "Service",
    "Variant",
    "Selected",
    "Schedule Price",
    "Override Price",
    "Effective Price",
    "Overridden",
  ];

  const rows = budget.lineItems.map((li: BudgetLineItem) => [
    li.serviceName || `Service #${li.serviceId}`,
    li.variantName || li.variantId || "",
    li.isSelected ? "Yes" : "No",
    li.schedulePrice !== undefined ? li.schedulePrice.toFixed(2) : "",
    li.overridePrice !== null ? li.overridePrice.toFixed(2) : "",
    getLineItemPrice(li).toFixed(2),
    li.isOverridden ? "Yes" : "No",
  ]);

  return buildCsv(headers, rows);
}

// ─────────────────────────────────────────────────────────────
// File Download
// ─────────────────────────────────────────────────────────────

/**
 * Trigger a browser file download.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/csv;charset=utf-8;",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download a CSV file.
 */
export function downloadCsv(content: string, filename: string): void {
  downloadFile(content, filename, "text/csv;charset=utf-8;");
}

/**
 * Download a JSON file.
 */
export function downloadJson(data: unknown, filename: string): void {
  const content = JSON.stringify(data, undefined, 2);
  downloadFile(content, filename, "application/json;charset=utf-8;");
}

// ─────────────────────────────────────────────────────────────
// Selective Data Export
// ─────────────────────────────────────────────────────────────

/**
 * Export selected entity types from the repository.
 * Returns a partial DataExport containing only the requested types.
 */
export async function exportSelective(
  repository: IBudgetRepository,
  types: ExportEntityType[],
): Promise<Partial<DataExport> & Pick<DataExport, "exportVersion" | "exportDate" | "appVersion">> {
  const result: Partial<DataExport> & Pick<DataExport, "exportVersion" | "exportDate" | "appVersion"> = {
    exportVersion: "1.0",
    exportDate: new Date().toISOString(),
    appVersion: "0.6.0",
  };

  if (types.indexOf("vendors") >= 0) {
    result.vendors = await repository.getVendors();
  }
  if (types.indexOf("services") >= 0) {
    result.services = await repository.getServices();
  }
  if (types.indexOf("suburbs") >= 0) {
    result.suburbs = await repository.getSuburbs();
  }
  if (types.indexOf("schedules") >= 0) {
    result.schedules = await repository.getSchedules();
  }
  if (types.indexOf("budgets") >= 0) {
    result.budgets = await repository.getBudgets();
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Selective Data Import
// ─────────────────────────────────────────────────────────────

/**
 * Analyse a parsed DataExport to summarise its contents.
 */
export function analyseImport(data: Partial<DataExport>): ImportSummary {
  const available: ExportEntityType[] = [];
  const vendors = data.vendors ? data.vendors.length : 0;
  const services = data.services ? data.services.length : 0;
  const suburbs = data.suburbs ? data.suburbs.length : 0;
  const schedules = data.schedules ? data.schedules.length : 0;
  const budgets = data.budgets ? data.budgets.length : 0;

  if (vendors > 0) available.push("vendors");
  if (services > 0) available.push("services");
  if (suburbs > 0) available.push("suburbs");
  if (schedules > 0) available.push("schedules");
  if (budgets > 0) available.push("budgets");

  return { vendors, services, suburbs, schedules, budgets, availableTypes: available };
}

/**
 * Import selected entity types into the repository.
 * Additive merge — saves each record individually without clearing existing data.
 */
export async function importSelective(
  data: Partial<DataExport>,
  types: ExportEntityType[],
  repository: IBudgetRepository,
): Promise<{ imported: Record<ExportEntityType, number> }> {
  const imported: Record<ExportEntityType, number> = {
    vendors: 0,
    services: 0,
    suburbs: 0,
    schedules: 0,
    budgets: 0,
  };

  if (types.indexOf("vendors") >= 0 && data.vendors) {
    for (const vendor of data.vendors) {
      await repository.saveVendor({ ...vendor, id: undefined });
      imported.vendors++;
    }
  }

  if (types.indexOf("services") >= 0 && data.services) {
    for (const service of data.services) {
      await repository.saveService({ ...service, id: undefined });
      imported.services++;
    }
  }

  if (types.indexOf("suburbs") >= 0 && data.suburbs) {
    for (const suburb of data.suburbs) {
      await repository.saveSuburb({ ...suburb, id: undefined });
      imported.suburbs++;
    }
  }

  if (types.indexOf("schedules") >= 0 && data.schedules) {
    for (const schedule of data.schedules) {
      await repository.saveSchedule({ ...schedule, id: undefined });
      imported.schedules++;
    }
  }

  if (types.indexOf("budgets") >= 0 && data.budgets) {
    for (const budget of data.budgets) {
      await repository.saveBudget({ ...budget, id: undefined });
      imported.budgets++;
    }
  }

  return { imported };
}
