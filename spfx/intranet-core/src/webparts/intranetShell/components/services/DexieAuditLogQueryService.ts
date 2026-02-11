/**
 * DexieAuditLogQueryService — Reads shell audit events from
 * the local IndexedDB store (written by DexieShellAuditLogger).
 *
 * Used by the AuditLogViewer in the dev harness.  In production,
 * a future ApiAuditLogQueryService will call the Azure proxy's
 * GET /api/v1/audit/logs instead.
 */

import type {
  IAuditLogQueryService,
  AuditLogEntry,
  AuditLogQueryFilters,
} from "./IAuditLogQueryService";
import { shellAuditDb } from "./shellAuditDb";

export class DexieAuditLogQueryService implements IAuditLogQueryService {
  async query(
    filters?: AuditLogQueryFilters,
    limit?: number,
  ): Promise<AuditLogEntry[]> {
    let collection = shellAuditDb.events.orderBy("timestamp").reverse();

    if (limit) {
      collection = collection.limit(limit);
    }

    let results = await collection.toArray();

    // Apply client-side filtering (Dexie compound-index queries
    // would be more efficient but not worth the complexity here).
    if (filters) {
      results = results.filter((entry) => {
        if (
          filters.userId &&
          !entry.userId
            .toLowerCase()
            .includes(filters.userId.toLowerCase()) &&
          !(entry.userDisplayName ?? "")
            .toLowerCase()
            .includes(filters.userId.toLowerCase())
        ) {
          return false;
        }
        if (filters.eventType && entry.eventType !== filters.eventType) {
          return false;
        }
        if (filters.hub && entry.hub !== filters.hub) {
          return false;
        }
        if (
          filters.action &&
          !entry.action
            .toLowerCase()
            .includes(filters.action.toLowerCase())
        ) {
          return false;
        }
        if (filters.startDate && entry.timestamp < filters.startDate) {
          return false;
        }
        if (filters.endDate && entry.timestamp > filters.endDate) {
          return false;
        }
        return true;
      });
    }

    return results;
  }

  async clear(): Promise<void> {
    await shellAuditDb.events.clear();
  }
}
