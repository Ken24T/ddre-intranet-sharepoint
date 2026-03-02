/**
 * RoleResolver — Resolves the current user's Marketing Budget role
 * from SharePoint group membership.
 *
 * Group names are configurable but default to:
 *   - "DDRE-MarketingBudget-Admins"  → admin
 *   - "DDRE-MarketingBudget-Editors" → editor
 *   - (no matching group)              → viewer
 *
 * The resolver is resilient: if group resolution fails (e.g.
 * permissions, network), it falls back to 'viewer' (safest default).
 *
 * Usage:
 *   const sp = getSPFI(this.context);
 *   const role = await resolveUserRole(sp);
 */

import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups';

import type { UserRole } from '../models/permissions';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

/** SP group names that map to application roles. */
export interface RoleGroupConfig {
  adminGroup: string;
  editorGroup: string;
}

const DEFAULT_GROUPS: RoleGroupConfig = {
  adminGroup: 'DDRE-MarketingBudget-Admins',
  editorGroup: 'DDRE-MarketingBudget-Editors',
};

// ─────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────

/**
 * Resolve the current user's Marketing Budget role from their
 * SharePoint group membership.
 *
 * @param sp      - Configured PnPjs SPFI instance.
 * @param config  - Optional custom group names.
 * @returns The resolved UserRole ('admin' | 'editor' | 'viewer').
 */
export async function resolveUserRole(
  sp: SPFI,
  config: RoleGroupConfig = DEFAULT_GROUPS,
): Promise<UserRole> {
  try {
    const groups: Array<{ Title: string }> =
      await sp.web.currentUser.groups();
    const groupTitles = new Set(
      groups.map((g) => g.Title),
    );

    if (groupTitles.has(config.adminGroup)) return 'admin';
    if (groupTitles.has(config.editorGroup)) return 'editor';
    return 'viewer';
  } catch (error) {
    console.warn(
      '[Marketing Budget] Failed to resolve user role from SP groups, '
        + 'defaulting to viewer:',
      error,
    );
    return 'viewer';
  }
}
