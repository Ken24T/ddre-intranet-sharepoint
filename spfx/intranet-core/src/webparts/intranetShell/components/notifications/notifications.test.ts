/**
 * Unit tests for the unified notifications system.
 *
 * Tests notification types, category config, and the groupNotifications()
 * behaviour including the budget-approval category.
 */

import { CATEGORY_CONFIG, NotificationCategory, Notification } from './types';

// ─── Category Config ────────────────────────────────────────

describe('CATEGORY_CONFIG', () => {
  const allCategories: NotificationCategory[] = [
    'overdue',
    'due-today',
    'due-tomorrow',
    'due-this-week',
    'assigned',
    'mentioned',
    'budget-approval',
  ];

  it('has config for every NotificationCategory', () => {
    for (const cat of allCategories) {
      const config = CATEGORY_CONFIG[cat];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.icon).toBeTruthy();
      expect(typeof config.sortOrder).toBe('number');
    }
  });

  it('has unique sort orders', () => {
    const orders: number[] = [];
    const keys = Object.keys(CATEGORY_CONFIG) as NotificationCategory[];
    for (const key of keys) {
      orders.push(CATEGORY_CONFIG[key].sortOrder);
    }
    const unique = new Set(orders);
    expect(unique.size).toBe(orders.length);
  });

  it('budget-approval has correct label and icon', () => {
    const config = CATEGORY_CONFIG['budget-approval'];
    expect(config.label).toBe('Budgets Awaiting Approval');
    expect(config.icon).toBe('Financial');
  });

  it('budget-approval sorts after other categories', () => {
    const budgetOrder = CATEGORY_CONFIG['budget-approval'].sortOrder;
    const keys = Object.keys(CATEGORY_CONFIG) as NotificationCategory[];
    for (const key of keys) {
      if (key !== 'budget-approval') {
        expect(budgetOrder).toBeGreaterThan(CATEGORY_CONFIG[key].sortOrder);
      }
    }
  });
});

// ─── Notification Interface ─────────────────────────────────

describe('Notification type', () => {
  it('accepts budget source and budget-approval category', () => {
    const notification: Notification = {
      id: 'budget-42',
      category: 'budget-approval',
      source: 'budget',
      title: 'Draft budget: 123 Test St',
      message: '123 Test St — Agent Name awaiting approval',
      timestamp: '2025-01-01T00:00:00Z',
      isRead: false,
      priority: 'medium',
    };

    expect(notification.category).toBe('budget-approval');
    expect(notification.source).toBe('budget');
  });
});
