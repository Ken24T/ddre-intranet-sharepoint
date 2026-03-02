/**
 * IAuditLogQueryService — Read interface for the AuditLogViewer.
 *
 * Decouples the viewer from the data source:
 * - Dev:  DexieAuditLogQueryService  → local IndexedDB
 * - Prod: ApiAuditLogQueryService    → Azure Audit Log Proxy
 *
 * The viewer receives the service via props and never knows
 * which implementation is behind it.
 */

import type { EventType } from "../AuditContext";

// Re-export the entry shape so consumers don't depend on Dexie.
export interface AuditLogEntry {
  eventId: string;
  eventType: EventType;
  action: string;
  timestamp: string;
  userId: string;
  userDisplayName?: string;
  sessionId: string;
  appVersion: string;
  hub?: string;
  tool?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogQueryFilters {
  userId?: string;
  eventType?: EventType;
  hub?: string;
  action?: string;
  startDate?: string; // ISO-8601
  endDate?: string;   // ISO-8601
}

export interface IAuditLogQueryService {
  /** Return entries matching the filters, newest first. */
  query(filters?: AuditLogQueryFilters, limit?: number): Promise<AuditLogEntry[]>;

  /** Remove all stored entries (dev only). */
  clear(): Promise<void>;
}
