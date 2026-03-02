/**
 * SharePoint List schemas for PM Dashboard data.
 *
 * Defines list names, field internal names, and mapping utilities
 * for converting between domain types and SP list items.
 *
 * Lists are prefixed with "PMD_" to avoid collisions with other
 * site content.
 *
 * Design:
 *  - PMD_Data: Single-document store. The three section arrays
 *    (vacates, entries, lost) are JSON-serialised into Note fields.
 *    This mirrors the Dexie approach (one "main" record) and avoids
 *    complex relational mapping for a small-scale dataset.
 *  - PMD_PropertyManagers: One item per property manager, with
 *    simple text/colour fields.
 */

import type { IDashboardData, IPropertyManager, IPropertyRow } from "../models/types";

// ─────────────────────────────────────────────────────────────
// List Names
// ─────────────────────────────────────────────────────────────

export const SP_LISTS = {
  data: "PMD_Data",
  propertyManagers: "PMD_PropertyManagers",
} as const;

// ─────────────────────────────────────────────────────────────
// Select field arrays (for efficient REST queries)
// ─────────────────────────────────────────────────────────────

export const DATA_SELECT = [
  "Id", "Title", "Vacates", "Entries", "Lost",
] as const;

export const PM_SELECT = [
  "Id", "Title", "PmId", "LastName", "PreferredName", "Colour",
] as const;

// ─────────────────────────────────────────────────────────────
// SP Item Interfaces (raw shapes from SharePoint REST API)
// ─────────────────────────────────────────────────────────────

export interface SPDataItem {
  Id: number;
  /** Fixed key — always "main" */
  Title: string;
  /** JSON-serialised IPropertyRow[] for vacates */
  Vacates: string;
  /** JSON-serialised IPropertyRow[] for entries */
  Entries: string;
  /** JSON-serialised IPropertyRow[] for lost */
  Lost: string;
}

export interface SPPropertyManagerItem {
  Id: number;
  /** First name (stored in Title — SP's built-in field) */
  Title: string;
  /** GUID identifier for the PM */
  PmId: string;
  LastName: string;
  PreferredName: string;
  /** Hex colour for row backgrounds (e.g. "#ffc0cb") */
  Colour: string;
}

// ─────────────────────────────────────────────────────────────
// JSON helpers
// ─────────────────────────────────────────────────────────────

/** Safely parse a JSON string, returning a fallback on failure. */
export function parseJson<T>(
  value: string | undefined,
  fallback: T,
): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────
// Mappers: SP → Domain
// ─────────────────────────────────────────────────────────────

export function mapDataFromSP(item: SPDataItem): IDashboardData {
  return {
    vacates: parseJson<IPropertyRow[]>(item.Vacates, []),
    entries: parseJson<IPropertyRow[]>(item.Entries, []),
    lost: parseJson<IPropertyRow[]>(item.Lost, []),
  };
}

export function mapPmFromSP(item: SPPropertyManagerItem): IPropertyManager {
  return {
    id: item.PmId,
    firstName: item.Title,
    lastName: item.LastName || "",
    preferredName: item.PreferredName || "",
    color: item.Colour || "#cccccc",
  };
}

// ─────────────────────────────────────────────────────────────
// Mappers: Domain → SP (for add/update operations)
// ─────────────────────────────────────────────────────────────

export function mapDataToSP(
  data: IDashboardData,
): Record<string, unknown> {
  return {
    Title: "main",
    Vacates: JSON.stringify(data.vacates),
    Entries: JSON.stringify(data.entries),
    Lost: JSON.stringify(data.lost),
  };
}

export function mapPmToSP(
  pm: IPropertyManager,
): Record<string, unknown> {
  return {
    Title: pm.firstName,
    PmId: pm.id,
    LastName: pm.lastName,
    PreferredName: pm.preferredName,
    Colour: pm.color,
  };
}
