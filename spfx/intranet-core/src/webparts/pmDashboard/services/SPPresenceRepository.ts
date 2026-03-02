/**
 * SPPresenceRepository – SharePoint List–backed presence storage.
 *
 * Uses the PMD_Presence list (one item per user, Title = email).
 * The heartbeat method creates-or-updates the user's record.
 */

import type { SPFI } from "@pnp/sp";
import type { IList } from "@pnp/sp/lists";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import type { IPresenceRepository, IPresenceRecord } from "./IPresenceRepository";
import {
  SP_LISTS,
  PRESENCE_SELECT,
  mapPresenceFromSP,
  mapPresenceToSP,
} from "./listSchemas";
import type { SPPresenceItem } from "./listSchemas";

export class SPPresenceRepository implements IPresenceRepository {
  constructor(private readonly sp: SPFI) {}

  private get list(): IList {
    return this.sp.web.lists.getByTitle(SP_LISTS.presence);
  }

  async heartbeat(record: IPresenceRecord): Promise<void> {
    // Check if a record already exists for this user
    const existing: SPPresenceItem[] = await this.list.items
      .select(...PRESENCE_SELECT)
      .filter(`Title eq '${record.userId}'`)
      .top(1)
      ();

    const spData = mapPresenceToSP(record);

    if (existing.length > 0) {
      await this.list.items.getById(existing[0].Id).update(spData);
    } else {
      await this.list.items.add(spData);
    }
  }

  async loadAll(): Promise<IPresenceRecord[]> {
    const items: SPPresenceItem[] = await this.list.items
      .select(...PRESENCE_SELECT)
      .top(100)
      ();

    return items.map(mapPresenceFromSP);
  }

  async remove(userId: string): Promise<void> {
    const items: SPPresenceItem[] = await this.list.items
      .select("Id", "Title")
      .filter(`Title eq '${userId}'`)
      .top(1)
      ();

    if (items.length > 0) {
      await this.list.items.getById(items[0].Id).delete();
    }
  }
}
