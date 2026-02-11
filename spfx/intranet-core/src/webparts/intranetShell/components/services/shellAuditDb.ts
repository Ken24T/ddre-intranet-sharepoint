/**
 * Dexie database for shell-level audit events.
 *
 * Separate from the Marketing Budget's IndexedDB store because
 * these are platform-wide user activity events, not domain data.
 *
 * In production the AuditClient posts to Azure — this DB is only
 * used in the local workbench / dev harness.
 */

import Dexie, { type Table } from "dexie";
import type { EventType } from "../AuditContext";

// ─── Entry shape (mirrors IAuditLogEntry from AuditLogViewer) ───

export interface ShellAuditEntry {
  /** Auto-incremented local id. */
  id?: number;
  /** UUID generated client-side. */
  eventId: string;
  eventType: EventType;
  action: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  userId: string;
  userDisplayName?: string;
  sessionId: string;
  appVersion: string;
  hub?: string;
  tool?: string;
  metadata?: Record<string, unknown>;
}

// ─── Database ───────────────────────────────────────────────

export class ShellAuditDb extends Dexie {
  events!: Table<ShellAuditEntry, number>;

  constructor() {
    super("intranet-shell-audit");

    this.version(1).stores({
      events:
        "++id, eventId, eventType, action, timestamp, userId, sessionId, hub, tool",
    });
  }
}

export const shellAuditDb = new ShellAuditDb();
