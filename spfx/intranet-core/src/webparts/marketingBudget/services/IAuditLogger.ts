/**
 * IBudgetAuditLogger — Storage-agnostic interface for the budget audit log.
 *
 * Named IBudgetAuditLogger (not IAuditLogger) to distinguish from the
 * shell-level IAuditLogger in AuditContext.tsx which logs navigation,
 * card actions, and other shell events.
 *
 * Implemented by DexieAuditLogger (IndexedDB) for the dev harness.
 * A future SPListAuditLogger can write to a SharePoint list.
 */

import type { AuditEntry, AuditEntityType } from "../models/auditTypes";

export interface IBudgetAuditLogger {
  /** Record a new audit entry. */
  log(entry: Omit<AuditEntry, "id">): Promise<AuditEntry>;

  /** Retrieve entries for a specific entity, newest first. */
  getByEntity(entityType: AuditEntityType, entityId: number): Promise<AuditEntry[]>;

  /** Retrieve all entries, newest first. Optionally limited. */
  getAll(limit?: number): Promise<AuditEntry[]>;

  /** Remove all audit entries. */
  clear(): Promise<void>;
}
