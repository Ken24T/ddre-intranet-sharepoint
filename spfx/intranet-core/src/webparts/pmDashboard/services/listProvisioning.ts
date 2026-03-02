/**
 * listProvisioning — Creates the PMD_* SharePoint lists and
 * their custom columns if they don't already exist.
 *
 * Uses PnPjs v4's `lists.ensure()` (idempotent — safe to call
 * multiple times) and wraps field creation in try/catch so
 * already-existing fields are silently skipped.
 *
 * Called automatically on first access in SPListDashboardRepository
 * so users don't need to provision lists manually.
 */

import type { SPFI } from "@pnp/sp";
import type { IList } from "@pnp/sp/lists";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";

import { SP_LISTS } from "./listSchemas";

// ─────────────────────────────────────────────────────────────
// Field definition types
// ─────────────────────────────────────────────────────────────

type FieldType = "text" | "note";

interface FieldDef {
  name: string;
  type: FieldType;
}

// ─────────────────────────────────────────────────────────────
// Field schemas per list
// ─────────────────────────────────────────────────────────────
// Title is built-in — only custom columns listed here.

/**
 * PMD_Data stores JSON blobs for each section.
 * Note fields support large text (vacates/entries/lost can have
 * many rows with many columns).
 */
const DATA_FIELDS: FieldDef[] = [
  { name: "Vacates", type: "note" },
  { name: "Entries", type: "note" },
  { name: "Lost", type: "note" },
  { name: "ColWidths", type: "note" },
];

/**
 * PMD_PropertyManagers stores one item per PM.
 * Title = firstName (SP built-in).
 */
const PM_FIELDS: FieldDef[] = [
  { name: "PmId", type: "text" },
  { name: "LastName", type: "text" },
  { name: "PreferredName", type: "text" },
  { name: "Colour", type: "text" },
];

/**
 * PMD_Presence stores one item per connected user.
 * Title = user email (unique key).
 */
const PRESENCE_FIELDS: FieldDef[] = [
  { name: "DisplayName", type: "text" },
  { name: "LastSeen", type: "text" },
  { name: "SelectedPm", type: "text" },
  { name: "Colour", type: "text" },
];

// ─────────────────────────────────────────────────────────────
// Field creation helper
// ─────────────────────────────────────────────────────────────

/**
 * Add a field to a list, silently skipping if it already exists.
 * SharePoint returns a 500 with "A duplicate field name" when the
 * field is already present — we catch that and move on.
 */
async function addFieldIfMissing(
  list: IList,
  field: FieldDef,
): Promise<void> {
  try {
    switch (field.type) {
      case "text":
        await list.fields.addText(field.name, { MaxLength: 255 });
        break;
      case "note":
        await list.fields.addMultilineText(field.name, {
          NumberOfLines: 6,
          RichText: false,
        });
        break;
    }
  } catch (e: unknown) {
    // Duplicate field — safe to ignore
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.indexOf("duplicate") >= 0 ||
      msg.indexOf("already exists") >= 0 ||
      msg.indexOf("A field with") >= 0
    ) {
      return;
    }
    throw e;
  }
}

/**
 * Ensure a single list and all its custom fields exist.
 */
async function ensureListWithFields(
  sp: SPFI,
  listTitle: string,
  fields: FieldDef[],
): Promise<void> {
  // lists.ensure() is idempotent — creates only if missing
  const result = await sp.web.lists.ensure(listTitle, "", 100);
  const list: IList = result.list;

  for (const field of fields) {
    await addFieldIfMissing(list, field);
  }
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Ensure all PM Dashboard SharePoint lists exist with the correct
 * custom columns. Safe to call repeatedly — existing lists and
 * fields are silently skipped.
 */
export async function ensurePmDashboardLists(
  sp: SPFI,
): Promise<void> {
  await ensureListWithFields(sp, SP_LISTS.data, DATA_FIELDS);
  await ensureListWithFields(sp, SP_LISTS.propertyManagers, PM_FIELDS);
  await ensureListWithFields(sp, SP_LISTS.presence, PRESENCE_FIELDS);
}
