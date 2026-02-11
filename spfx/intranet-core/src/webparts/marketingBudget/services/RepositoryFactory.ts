/**
 * RepositoryFactory — Creates the appropriate IBudgetRepository
 * based on the runtime environment.
 *
 * - In SharePoint (SPFx context available): uses SPListBudgetRepository
 *   backed by SharePoint Lists via PnPjs.
 * - In development/workbench (no context): uses DexieBudgetRepository
 *   backed by IndexedDB via Dexie.
 *
 * Usage in a web part:
 *   const sp = getSPFI(this.context);
 *   const repo = createRepository(sp);
 *
 * Usage in dev harness:
 *   const repo = createRepository();
 */

import { spfi, SPFx } from '@pnp/sp';
import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';

import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { IBudgetRepository } from './IBudgetRepository';
import { DexieBudgetRepository } from './DexieBudgetRepository';
import { SPListBudgetRepository } from './SPListBudgetRepository';

/**
 * Initialise PnPjs with an SPFx web part context.
 * Call once in `onInit()` and pass the result to `createRepository()`.
 */
export function getSPFI(context: WebPartContext): SPFI {
  return spfi().using(SPFx(context));
}

/**
 * Create a budget repository instance.
 *
 * @param sp - A configured PnPjs SPFI instance (from `getSPFI()`).
 *             Omit for development/workbench to use IndexedDB.
 */
export function createRepository(sp?: SPFI): IBudgetRepository {
  if (sp) {
    return new SPListBudgetRepository(sp);
  }
  return new DexieBudgetRepository();
}
