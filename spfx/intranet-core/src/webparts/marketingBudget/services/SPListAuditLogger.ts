/**
 * SPListAuditLogger — SharePoint List–backed audit log.
 *
 * Writes budget audit entries to the MB_AuditLog SharePoint list so
 * the audit trail is centralised, visible to all admins, and not
 * tied to a single browser's IndexedDB.
 *
 * The list is auto-provisioned by listProvisioning.ts alongside the
 * other MB_* lists.
 */

import type { SPFI } from '@pnp/sp';
import type { IList } from '@pnp/sp/lists';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import type { IBudgetAuditLogger } from './IAuditLogger';
import type { AuditEntry, AuditEntityType } from '../models/auditTypes';

// ─────────────────────────────────────────────────────────────
// SP list/field constants
// ─────────────────────────────────────────────────────────────

const LIST_TITLE = 'MB_AuditLog';

const SELECT = [
  'Id', 'Title', 'Timestamp0', 'User0', 'EntityType', 'EntityId',
  'EntityLabel', 'Action0', 'Summary', 'Before0', 'After0',
] as const;

// ─────────────────────────────────────────────────────────────
// SP → Domain mapping
// ─────────────────────────────────────────────────────────────

/**
 * SP field naming: Several audit fields collide with SharePoint
 * reserved/built-in names (e.g. "User", "Action", "Timestamp",
 * "Before", "After"). We suffix them with "0" in SP to avoid
 * conflicts (SharePoint auto-renames to "Timestamp0", etc.).
 */
/* eslint-disable @rushstack/no-new-null -- SP REST API returns null for empty fields */
interface SPAuditItem {
  Id: number;
  Title: string;
  Timestamp0: string;
  User0: string;
  EntityType: string;
  EntityId: number | null;
  EntityLabel: string | null;
  Action0: string;
  Summary: string | null;
  Before0: string | null;
  After0: string | null;
}
/* eslint-enable @rushstack/no-new-null */

function mapFromSP(item: SPAuditItem): AuditEntry {
  return {
    id: item.Id,
    timestamp: item.Timestamp0 || item.Title,
    user: item.User0,
    entityType: item.EntityType as AuditEntityType,
    entityId: item.EntityId,
    entityLabel: item.EntityLabel ?? '',
    action: item.Action0 as AuditEntry['action'],
    summary: item.Summary ?? '',
    before: item.Before0,
    after: item.After0,
  };
}

function mapToSP(
  entry: Omit<AuditEntry, 'id'>,
): Record<string, unknown> {
  return {
    Title: entry.timestamp,
    Timestamp0: entry.timestamp,
    User0: entry.user,
    EntityType: entry.entityType,
    EntityId: entry.entityId,
    EntityLabel: entry.entityLabel,
    Action0: entry.action,
    Summary: entry.summary,
    Before0: entry.before,
    After0: entry.after,
  };
}

// ─────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────

export class SPListAuditLogger implements IBudgetAuditLogger {
  constructor(private readonly sp: SPFI) {}

  private get list(): IList {
    return this.sp.web.lists.getByTitle(LIST_TITLE);
  }

  async log(entry: Omit<AuditEntry, 'id'>): Promise<AuditEntry> {
    const spData = mapToSP(entry);
    const result = await this.list.items.add(spData);
    const newId = (result as { Id: number }).Id;
    return { ...entry, id: newId };
  }

  async getByEntity(
    entityType: AuditEntityType,
    entityId: number,
  ): Promise<AuditEntry[]> {
    const items: SPAuditItem[] = await this.list.items
      .select(...SELECT)
      .filter(
        `EntityType eq '${entityType}' and EntityId eq ${entityId}`,
      )
      .orderBy('Id', false)
      .top(100)();
    return items.map(mapFromSP);
  }

  async getAll(limit?: number): Promise<AuditEntry[]> {
    let query = this.list.items.select(...SELECT).orderBy('Id', false);
    if (limit) {
      query = query.top(limit);
    }
    const items: SPAuditItem[] = await query();
    return items.map(mapFromSP);
  }

  async clear(): Promise<void> {
    const items: Array<{ Id: number }> = await this.list.items
      .select('Id')
      .top(5000)();

    if (items.length === 0) return;

    // Batch delete in groups of 100
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const [batchedSP, execute] = this.sp.batched();
      for (const item of batch) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        batchedSP.web.lists
          .getByTitle(LIST_TITLE)
          .items.getById(item.Id)
          .delete();
      }
      await execute();
    }
  }
}
