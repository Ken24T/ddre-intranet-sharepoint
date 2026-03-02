/**
 * SPListBudgetTemplateService — SharePoint List–backed template storage.
 *
 * Stores budget templates in the MB_Templates SharePoint list so they
 * are shared across all users on the site (not browser-local like Dexie).
 *
 * The list is auto-provisioned by listProvisioning.ts alongside the
 * other MB_* lists.
 */

import type { SPFI } from '@pnp/sp';
import type { IList } from '@pnp/sp/lists';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import type { BudgetTemplate, BudgetTemplateLineItem } from '../models/types';
import type { IBudgetTemplateService } from './IBudgetTemplateService';
import { parseJson } from './listSchemas';

// ─────────────────────────────────────────────────────────────
// SP list/field constants
// ─────────────────────────────────────────────────────────────

const LIST_TITLE = 'MB_Templates';

const SELECT = [
  'Id', 'Title', 'Description0', 'PropertyType', 'PropertySize',
  'Tier', 'SourceScheduleId', 'LineItems', 'Created', 'Modified',
] as const;

// ─────────────────────────────────────────────────────────────
// SP → Domain mapping
// ─────────────────────────────────────────────────────────────

/* eslint-disable @rushstack/no-new-null -- SP REST API returns null for empty fields */
interface SPTemplateItem {
  Id: number;
  Title: string;
  /** SP reserves "Description" — we use "Description0". */
  Description0: string | null;
  PropertyType: string | null;
  PropertySize: string | null;
  Tier: string | null;
  SourceScheduleId: number | null;
  LineItems: string;
  Created: string;
  Modified: string;
}
/* eslint-enable @rushstack/no-new-null */

function mapFromSP(item: SPTemplateItem): BudgetTemplate {
  return {
    id: item.Id,
    name: item.Title,
    description: item.Description0 ?? undefined,
    propertyType: item.PropertyType as BudgetTemplate['propertyType'],
    propertySize: item.PropertySize as BudgetTemplate['propertySize'],
    tier: item.Tier as BudgetTemplate['tier'],
    sourceScheduleId: item.SourceScheduleId ?? undefined,
    lineItems: parseJson<BudgetTemplateLineItem[]>(item.LineItems, []),
    createdAt: item.Created,
    updatedAt: item.Modified,
  };
}

function mapToSP(
  template: BudgetTemplate,
): Record<string, unknown> {
  return {
    Title: template.name,
    Description0: template.description ?? null,
    PropertyType: template.propertyType ?? null,
    PropertySize: template.propertySize ?? null,
    Tier: template.tier ?? null,
    SourceScheduleId: template.sourceScheduleId ?? null,
    LineItems: JSON.stringify(template.lineItems),
  };
}

// ─────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────

export class SPListBudgetTemplateService implements IBudgetTemplateService {
  constructor(private readonly sp: SPFI) {}

  private get list(): IList {
    return this.sp.web.lists.getByTitle(LIST_TITLE);
  }

  public async getTemplates(): Promise<BudgetTemplate[]> {
    const items: SPTemplateItem[] = await this.list.items
      .select(...SELECT)
      .orderBy('Created', false)();
    return items.map(mapFromSP);
  }

  public async getTemplate(
    id: number,
  ): Promise<BudgetTemplate | undefined> {
    try {
      const item: SPTemplateItem = await this.list.items
        .getById(id)
        .select(...SELECT)();
      return mapFromSP(item);
    } catch {
      return undefined;
    }
  }

  public async saveTemplate(
    template: BudgetTemplate,
  ): Promise<BudgetTemplate> {
    const spData = mapToSP(template);

    if (template.id) {
      // Update existing
      await this.list.items.getById(template.id).update(spData);
      const updated = await this.getTemplate(template.id);
      return updated!;
    }

    // Create new
    const result = await this.list.items.add(spData);
    const newId = (result as { Id: number }).Id;
    const created = await this.getTemplate(newId);
    return created!;
  }

  public async deleteTemplate(id: number): Promise<void> {
    await this.list.items.getById(id).delete();
  }
}
