/**
 * Unit tests for @ddre/pkg-app-bridge protocol types and type guards.
 */

import {
  isAppToShellMessage,
  isShellToAppMessage,
} from '../src/protocol';

describe('isAppToShellMessage', () => {
  it('returns true for SIDEBAR_SET_ITEMS', () => {
    expect(
      isAppToShellMessage({
        type: 'SIDEBAR_SET_ITEMS',
        items: [{ key: 'budgets', label: 'Budgets', icon: 'Financial' }],
      }),
    ).toBe(true);
  });

  it('returns true for SIDEBAR_RESTORE', () => {
    expect(isAppToShellMessage({ type: 'SIDEBAR_RESTORE' })).toBe(true);
  });

  it('returns true for SIDEBAR_ACTIVE', () => {
    expect(
      isAppToShellMessage({ type: 'SIDEBAR_ACTIVE', key: 'budgets' }),
    ).toBe(true);
  });

  it('returns true for NOTIFICATION_UPDATE', () => {
    expect(
      isAppToShellMessage({
        type: 'NOTIFICATION_UPDATE',
        source: 'budget',
        notifications: [
          { id: 'budget-1', category: 'budget-approval', title: 'Draft', timestamp: '2025-01-01T00:00:00Z' },
        ],
      }),
    ).toBe(true);
  });

  it('returns false for SIDEBAR_NAVIGATE (Shell → App)', () => {
    expect(
      isAppToShellMessage({ type: 'SIDEBAR_NAVIGATE', key: 'budgets' }),
    ).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAppToShellMessage(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isAppToShellMessage('SIDEBAR_SET_ITEMS')).toBe(false);
  });

  it('returns false for unknown type', () => {
    expect(isAppToShellMessage({ type: 'UNKNOWN' })).toBe(false);
  });
});

describe('isShellToAppMessage', () => {
  it('returns true for SIDEBAR_NAVIGATE', () => {
    expect(
      isShellToAppMessage({ type: 'SIDEBAR_NAVIGATE', key: 'budgets' }),
    ).toBe(true);
  });

  it('returns false for SIDEBAR_SET_ITEMS (App → Shell)', () => {
    expect(
      isShellToAppMessage({
        type: 'SIDEBAR_SET_ITEMS',
        items: [],
      }),
    ).toBe(false);
  });

  it('returns false for null', () => {
    expect(isShellToAppMessage(null)).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isShellToAppMessage(42)).toBe(false);
  });
});
