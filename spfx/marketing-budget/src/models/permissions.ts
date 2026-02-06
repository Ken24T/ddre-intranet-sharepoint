/**
 * Marketing Budget – Role-Based Access Control
 *
 * Defines user roles and permission checks for the Marketing Budget app.
 *
 * Three roles:
 *   - viewer:  Read-only access to all budget data
 *   - editor:  Create/edit drafts, delete any budget (with confirmation)
 *   - admin:   Full access — edit any status, all transitions, manage ref data
 *
 * In the Dexie/dev phase the role is a prop toggled in the dev harness.
 * In production SharePoint (Phase B) the web part resolves the role from
 * Entra ID / SharePoint group membership (Admin group → admin, Sales → editor,
 * everyone else → viewer).
 */

/** User role within the Marketing Budget application. */
export type UserRole = 'viewer' | 'editor' | 'admin';

// ─────────────────────────────────────────────────────────────
// Permission predicates
// ─────────────────────────────────────────────────────────────

/** Whether the user can create new budgets. */
export function canCreateBudget(role: UserRole): boolean {
  return role === 'editor' || role === 'admin';
}

/** Whether the user can edit a budget's fields (property details, line items, notes). */
export function canEditBudget(role: UserRole, status: string): boolean {
  if (role === 'admin') return true;
  if (role === 'editor') return status === 'draft';
  return false;
}

/** Whether the user can delete a budget (any status, with confirmation). */
export function canDeleteBudget(role: UserRole): boolean {
  return role === 'editor' || role === 'admin';
}

/** Whether the user can duplicate a budget. */
export function canDuplicateBudget(role: UserRole): boolean {
  return role === 'editor' || role === 'admin';
}

/** Whether the user can perform status transitions on a budget. */
export function canTransitionBudget(role: UserRole): boolean {
  return role === 'admin';
}

/** Whether the user can manage reference data (services, vendors, suburbs, schedules). */
export function canManageReferenceData(role: UserRole): boolean {
  return role === 'admin';
}
