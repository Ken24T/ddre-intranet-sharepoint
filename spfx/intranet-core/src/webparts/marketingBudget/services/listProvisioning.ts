/**
 * listProvisioning — Creates the five MB_* SharePoint lists and
 * their custom columns if they don't already exist.
 *
 * Uses PnPjs v4's `lists.ensure()` (idempotent — safe to call
 * multiple times) and wraps field creation in try/catch so
 * already-existing fields are silently skipped.
 *
 * Called automatically before `seedData()` in SPListBudgetRepository
 * so users don't need to provision lists manually.
 */

import type { SPFI } from '@pnp/sp';
import type { IList } from '@pnp/sp/lists';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

import { SP_LISTS } from './listSchemas';

// ─────────────────────────────────────────────────────────────
// Field definition types
// ─────────────────────────────────────────────────────────────

type FieldType = 'text' | 'number' | 'boolean' | 'note';

interface FieldDef {
  name: string;
  type: FieldType;
}

// ─────────────────────────────────────────────────────────────
// Field schemas per list
// ─────────────────────────────────────────────────────────────
// Title is built-in — only custom columns listed here.

const VENDOR_FIELDS: FieldDef[] = [
  { name: 'ShortCode', type: 'text' },
  { name: 'ContactEmail', type: 'text' },
  { name: 'ContactPhone', type: 'text' },
  { name: 'IsActive', type: 'number' },
];

const SERVICE_FIELDS: FieldDef[] = [
  { name: 'Category', type: 'text' },
  { name: 'VendorId', type: 'number' },
  { name: 'VariantSelector', type: 'text' },
  { name: 'Variants', type: 'note' },
  { name: 'IncludesGst', type: 'boolean' },
  { name: 'IsActive', type: 'number' },
];

const SUBURB_FIELDS: FieldDef[] = [
  { name: 'PricingTier', type: 'text' },
  { name: 'Postcode', type: 'text' },
  { name: 'State', type: 'text' },
];

const SCHEDULE_FIELDS: FieldDef[] = [
  { name: 'PropertyType', type: 'text' },
  { name: 'PropertySize', type: 'text' },
  { name: 'Tier', type: 'text' },
  { name: 'DefaultVendorId', type: 'number' },
  { name: 'LineItems', type: 'note' },
  { name: 'IsActive', type: 'number' },
];

const BUDGET_FIELDS: FieldDef[] = [
  { name: 'PropertyType', type: 'text' },
  { name: 'PropertySize', type: 'text' },
  { name: 'Tier', type: 'text' },
  { name: 'SuburbId', type: 'number' },
  { name: 'VendorId', type: 'number' },
  { name: 'ScheduleId', type: 'number' },
  { name: 'ScheduleName', type: 'text' },
  { name: 'LineItems', type: 'note' },
  { name: 'Notes', type: 'note' },
  { name: 'ClientName', type: 'text' },
  { name: 'AgentName', type: 'text' },
  { name: 'Status', type: 'text' },
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
      case 'text':
        await list.fields.addText(field.name, { MaxLength: 255 });
        break;
      case 'number':
        await list.fields.addNumber(field.name);
        break;
      case 'boolean':
        await list.fields.addBoolean(field.name);
        break;
      case 'note':
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
      msg.indexOf('duplicate') >= 0 ||
      msg.indexOf('already exists') >= 0 ||
      msg.indexOf('A field with') >= 0
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
  const result = await sp.web.lists.ensure(listTitle, '', 100);
  const list: IList = result.list;

  for (const field of fields) {
    await addFieldIfMissing(list, field);
  }
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Ensure all five Marketing Budget SharePoint lists exist with
 * the correct custom columns. Safe to call repeatedly — existing
 * lists and fields are silently skipped.
 */
export async function ensureMarketingBudgetLists(
  sp: SPFI,
): Promise<void> {
  await ensureListWithFields(sp, SP_LISTS.vendors, VENDOR_FIELDS);
  await ensureListWithFields(sp, SP_LISTS.services, SERVICE_FIELDS);
  await ensureListWithFields(sp, SP_LISTS.suburbs, SUBURB_FIELDS);
  await ensureListWithFields(sp, SP_LISTS.schedules, SCHEDULE_FIELDS);
  await ensureListWithFields(sp, SP_LISTS.budgets, BUDGET_FIELDS);
}
