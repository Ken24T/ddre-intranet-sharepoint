/**
 * Audit Trail – Domain Types
 *
 * Records every significant change made within the Marketing Budget app.
 * Each entry captures: who, what, when, and the before/after snapshot.
 */

/* eslint-disable @rushstack/no-new-null */

// ─────────────────────────────────────────────────────────────
// Entity types that can be audited
// ─────────────────────────────────────────────────────────────

export type AuditEntityType =
  | "budget"
  | "vendor"
  | "service"
  | "suburb"
  | "schedule";

// ─────────────────────────────────────────────────────────────
// Actions that create an audit entry
// ─────────────────────────────────────────────────────────────

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "statusChange"
  | "import"
  | "seed";

// ─────────────────────────────────────────────────────────────
// Audit entry
// ─────────────────────────────────────────────────────────────

/**
 * A single audit log entry.
 *
 * `before` and `after` are JSON-serialisable snapshots of the entity
 * at the time of the change. For `create`, `before` is null.
 * For `delete`, `after` is null.
 */
export interface AuditEntry {
  id?: number;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Display name of the user who made the change. */
  user: string;
  /** Which entity type was affected. */
  entityType: AuditEntityType;
  /** The primary key of the affected entity (if known). */
  entityId: number | null;
  /** Human-readable label for the entity (e.g. property address, vendor name). */
  entityLabel: string;
  /** What happened. */
  action: AuditAction;
  /** Optional description of what changed. */
  summary: string;
  /** Snapshot before the change (null for create / seed / import). */
  before: string | null;
  /** Snapshot after the change (null for delete). */
  after: string | null;
}
