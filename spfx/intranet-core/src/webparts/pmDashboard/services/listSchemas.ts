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

import type { IDashboardData, IPropertyManager, IPropertyRow, IColumnWidthPreferences } from "../models/types";

// ─────────────────────────────────────────────────────────────
// List Names
// ─────────────────────────────────────────────────────────────

export const SP_LISTS = {
  data: "PMD_Data",
  propertyManagers: "PMD_PropertyManagers",
  presence: "PMD_Presence",
} as const;

// ─────────────────────────────────────────────────────────────
// Select field arrays (for efficient REST queries)
// ─────────────────────────────────────────────────────────────

export const DATA_SELECT = [
  "Id", "Title", "Vacates", "Entries", "Lost", "ColWidths",
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
  /** JSON-serialised IColumnWidthPreferences */
  ColWidths?: string;
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

/** Extract column width preferences from a SP data item. */
export function mapColWidthsFromSP(
  item: SPDataItem,
): IColumnWidthPreferences {
  return parseJson<IColumnWidthPreferences>(item.ColWidths, {});
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

/** Convert column width preferences to SP update payload. */
export function mapColWidthsToSP(
  widths: IColumnWidthPreferences,
): Record<string, unknown> {
  return {
    ColWidths: JSON.stringify(widths),
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

// ─────────────────────────────────────────────────────────────
// PMD_Presence – User presence records
// ─────────────────────────────────────────────────────────────

export const PRESENCE_SELECT = [
  "Id", "Title", "DisplayName", "LastSeen", "SelectedPm", "Colour", "LastChanged",
] as const;

export interface SPPresenceItem {
  Id: number;
  /** Title = user email (unique per user). */
  Title: string;
  DisplayName?: string;
  LastSeen?: string;
  SelectedPm?: string;
  Colour?: string;
  LastChanged?: string;
}

export interface PresenceRecord {
  userId: string;
  displayName: string;
  lastSeen: string;
  selectedPm: string;
  colour: string;
  lastChanged: string;
}

export function mapPresenceFromSP(item: SPPresenceItem): PresenceRecord {
  return {
    userId: item.Title || "",
    displayName: item.DisplayName || "",
    lastSeen: item.LastSeen || "",
    selectedPm: item.SelectedPm || "",
    colour: item.Colour || "",
    lastChanged: item.LastChanged || "",
  };
}

export function mapPresenceToSP(
  record: PresenceRecord,
): Record<string, unknown> {
  return {
    Title: record.userId,
    DisplayName: record.displayName,
    LastSeen: record.lastSeen,
    SelectedPm: record.selectedPm,
    Colour: record.colour,
    LastChanged: record.lastChanged,
  };
}
