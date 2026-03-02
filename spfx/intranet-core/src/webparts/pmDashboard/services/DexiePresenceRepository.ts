/**
 * DexiePresenceRepository – In-memory stub for local development.
 *
 * The Dexie (IndexedDB) dev harness runs in a single browser tab,
 * so multi-user presence is simulated with a simple in-memory map.
 * The current user's record is stored; loadAll returns only it.
 */

import type { IPresenceRepository, IPresenceRecord } from "./IPresenceRepository";

export class DexiePresenceRepository implements IPresenceRepository {
  private readonly _records: Map<string, IPresenceRecord> = new Map();

  async heartbeat(record: IPresenceRecord): Promise<void> {
    this._records.set(record.userId, record);
  }

  async loadAll(): Promise<IPresenceRecord[]> {
    const results: IPresenceRecord[] = [];
    this._records.forEach((v) => {
      results.push(v);
    });
    return results;
  }

  async remove(userId: string): Promise<void> {
    this._records.delete(userId);
  }
}
