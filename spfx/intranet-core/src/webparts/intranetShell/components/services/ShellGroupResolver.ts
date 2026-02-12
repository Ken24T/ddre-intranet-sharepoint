/**
 * ShellGroupResolver — Resolves the current user's intranet access
 * from SharePoint group membership.
 *
 * Uses the DDRE-* naming convention:
 *   - "DDRE-Admins" → full admin, sees all hubs
 *   - "DDRE-Sales"  → sees the Sales hub
 *   - "DDRE-PropertyManagement" → sees the Property Management hub
 *   - "DDRE-Office" → sees the Office hub
 *
 * Hubs with no mapped group are visible to everyone (default-open).
 * Admin users always see every hub.
 *
 * The resolver is resilient: if SP group resolution fails (e.g.
 * permissions, network), all hubs are shown (safest UX default).
 */

import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups';

// ─────────────────────────────────────────────────────────────
// Hub keys — all navigable hubs in the shell
// ─────────────────────────────────────────────────────────────

/**
 * Canonical hub key strings used throughout the intranet.
 *
 * 'home' and 'library' are always visible (no group gating).
 * 'favourites' and 'help' are virtual hubs (not in the sidebar list).
 */
export type HubKey =
  | 'home'
  | 'library'
  | 'administration'
  | 'office'
  | 'property-management'
  | 'sales'
  | 'favourites'
  | 'help';

/** All hub keys that appear in the sidebar nav. */
export const SIDEBAR_HUB_KEYS: HubKey[] = [
  'home',
  'library',
  'administration',
  'office',
  'property-management',
  'sales',
];

// ─────────────────────────────────────────────────────────────
// Group → Hub mapping
// ─────────────────────────────────────────────────────────────

/** SP group name that grants site-wide admin access. */
const ADMIN_GROUP = 'DDRE-Admins';

/**
 * Maps SP group names to the hub keys they unlock.
 *
 * Hubs NOT listed here are default-open (visible to all users).
 * Only hubs that should be restricted need a mapping.
 */
const HUB_GROUP_MAP: Record<string, HubKey> = {
  'DDRE-Sales': 'sales',
  'DDRE-PropertyManagement': 'property-management',
  'DDRE-Office': 'office',
};

/** Hubs that are visible to everyone without group membership. */
const DEFAULT_OPEN_HUBS: HubKey[] = ['home', 'library'];

// ─────────────────────────────────────────────────────────────
// Resolver result
// ─────────────────────────────────────────────────────────────

export interface ShellAccess {
  /** Whether the user is a site-wide admin (member of DDRE-Admins). */
  isAdmin: boolean;
  /**
   * Hub keys the user is allowed to see.
   * Admins get all hubs. Others get default-open hubs + hubs
   * unlocked by their group memberships.
   */
  visibleHubs: HubKey[];
}

// ─────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────

/**
 * Resolve the current user's shell access from their SP group
 * memberships.
 *
 * @param sp - Configured PnPjs SPFI instance.
 * @returns The user's admin status and visible hub keys.
 */
export async function resolveShellAccess(sp: SPFI): Promise<ShellAccess> {
  try {
    const groups: Array<{ Title: string }> =
      await sp.web.currentUser.groups();
    const groupTitles = new Set(groups.map((g) => g.Title));

    // Admin check — DDRE-Admins sees everything
    const isAdmin = groupTitles.has(ADMIN_GROUP);

    if (isAdmin) {
      return {
        isAdmin: true,
        visibleHubs: [...SIDEBAR_HUB_KEYS, 'favourites', 'help'],
      };
    }

    // Start with default-open hubs
    const visible = new Set<HubKey>(DEFAULT_OPEN_HUBS);

    // Add hubs unlocked by group membership
    const groupNames = Object.keys(HUB_GROUP_MAP);
    for (let i = 0; i < groupNames.length; i++) {
      const groupName = groupNames[i];
      if (groupTitles.has(groupName)) {
        visible.add(HUB_GROUP_MAP[groupName]);
      }
    }

    // Always include virtual hubs
    visible.add('favourites');
    visible.add('help');

    return {
      isAdmin: false,
      visibleHubs: Array.from(visible),
    };
  } catch (error) {
    // If group resolution fails, show everything (safest UX default)
    // eslint-disable-next-line no-console
    console.warn('[ShellGroupResolver] Failed to resolve groups, showing all hubs:', error);
    return {
      isAdmin: false,
      visibleHubs: [...SIDEBAR_HUB_KEYS, 'favourites', 'help'],
    };
  }
}
