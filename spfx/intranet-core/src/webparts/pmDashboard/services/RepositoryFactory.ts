/**
 * RepositoryFactory — Creates the appropriate IDashboardRepository
 * based on the runtime environment.
 *
 * - In SharePoint (SPFx context available): uses SPListDashboardRepository
 *   backed by SharePoint Lists via PnPjs.
 * - In development/workbench (no context): uses DexieDashboardRepository
 *   backed by IndexedDB via Dexie.
 *
 * Usage in a web part:
 *   const sp = getSPFI(this.context);
 *   const repo = createDashboardRepository(sp);
 *
 * Usage in dev harness:
 *   const repo = createDashboardRepository();
 */

import { spfi, SPFx } from "@pnp/sp";
import type { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";

import type { WebPartContext } from "@microsoft/sp-webpart-base";
import type { IDashboardRepository } from "./IDashboardRepository";
import type { IPresenceRepository } from "./IPresenceRepository";
import { DexieDashboardRepository } from "./DexieDashboardRepository";
import { SPListDashboardRepository } from "./SPListDashboardRepository";
import { DexiePresenceRepository } from "./DexiePresenceRepository";
import { SPPresenceRepository } from "./SPPresenceRepository";

/**
 * Initialise PnPjs with an SPFx web part context.
 * Call once in `onInit()` and pass the result to `createDashboardRepository()`.
 */
export function getSPFI(context: WebPartContext): SPFI {
  return spfi().using(SPFx(context));
}

/**
 * Create a dashboard repository instance.
 *
 * @param sp - A configured PnPjs SPFI instance (from `getSPFI()`).
 *             Omit for development/workbench to use IndexedDB.
 */
export function createDashboardRepository(sp?: SPFI): IDashboardRepository {
  if (sp) {
    return new SPListDashboardRepository(sp);
  }
  return new DexieDashboardRepository();
}

/**
 * Create a presence repository instance.
 *
 * @param sp - A configured PnPjs SPFI instance (from `getSPFI()`).
 *             Omit for development/workbench to use in-memory store.
 */
export function createPresenceRepository(sp?: SPFI): IPresenceRepository {
  if (sp) {
    return new SPPresenceRepository(sp);
  }
  return new DexiePresenceRepository();
}
