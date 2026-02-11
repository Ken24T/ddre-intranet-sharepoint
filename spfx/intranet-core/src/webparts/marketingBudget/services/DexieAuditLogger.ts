/**
 * DexieAuditLogger — IndexedDB-backed audit log using the shared Dexie db.
 */

import type { IBudgetAuditLogger } from "./IAuditLogger";
import type { AuditEntry, AuditEntityType } from "../models/auditTypes";
import { db } from "./db";

export class DexieAuditLogger implements IBudgetAuditLogger {
  async log(entry: Omit<AuditEntry, "id">): Promise<AuditEntry> {
    const id = await db.auditLog.add(entry as AuditEntry);
    return { ...entry, id };
  }

  async getByEntity(
    entityType: AuditEntityType,
    entityId: number,
  ): Promise<AuditEntry[]> {
    return db.auditLog
      .where("[entityType+entityId]")
      .equals([entityType, entityId])
      .reverse()
      .toArray();
  }

  async getAll(limit?: number): Promise<AuditEntry[]> {
    let collection = db.auditLog.orderBy("timestamp").reverse();
    if (limit) {
      collection = collection.limit(limit);
    }
    return collection.toArray();
  }

  async clear(): Promise<void> {
    await db.auditLog.clear();
  }
}
