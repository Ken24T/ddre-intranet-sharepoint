/**
 * Unit tests for useBudgetNotifications hook.
 *
 * Verifies that the hook queries draft budgets from the repository and
 * posts NOTIFICATION_UPDATE messages via window.postMessage.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { useBudgetNotifications } from './useBudgetNotifications';
import type { IBudgetRepository } from '../services/IBudgetRepository';
import type { Budget } from '../models/types';

// ─── Helpers ────────────────────────────────────────────────

const makeBudget = (overrides: Partial<Budget> = {}): Budget => ({
  id: 1,
  propertyAddress: '123 Test St',
  propertyType: 'house',
  propertySize: 'medium',
  tier: 'standard',
  suburbId: 1,
  vendorId: 1,
  scheduleId: 1,
  lineItems: [],
  status: 'draft',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-02T00:00:00Z',
  agentName: 'Test Agent',
  ...overrides,
});

function createMockRepository(drafts: Budget[] = []): IBudgetRepository {
  return {
    getVendors: jest.fn().mockResolvedValue([]),
    getVendor: jest.fn().mockResolvedValue(undefined),
    saveVendor: jest.fn().mockResolvedValue({}),
    deleteVendor: jest.fn().mockResolvedValue(undefined),
    getServices: jest.fn().mockResolvedValue([]),
    getAllServices: jest.fn().mockResolvedValue([]),
    getServicesByVendor: jest.fn().mockResolvedValue([]),
    getServicesByCategory: jest.fn().mockResolvedValue([]),
    saveService: jest.fn().mockResolvedValue({}),
    deleteService: jest.fn().mockResolvedValue(undefined),
    getSuburbs: jest.fn().mockResolvedValue([]),
    getSuburbsByTier: jest.fn().mockResolvedValue([]),
    saveSuburb: jest.fn().mockResolvedValue({}),
    deleteSuburb: jest.fn().mockResolvedValue(undefined),
    getSchedules: jest.fn().mockResolvedValue([]),
    getSchedule: jest.fn().mockResolvedValue(undefined),
    saveSchedule: jest.fn().mockResolvedValue({}),
    deleteSchedule: jest.fn().mockResolvedValue(undefined),
    getBudgets: jest.fn().mockResolvedValue(drafts),
    getBudget: jest.fn().mockResolvedValue(undefined),
    saveBudget: jest.fn().mockResolvedValue({}),
    deleteBudget: jest.fn().mockResolvedValue(undefined),
    clearAllData: jest.fn().mockResolvedValue(undefined),
    seedData: jest.fn().mockResolvedValue(undefined),
    exportAll: jest.fn().mockResolvedValue({}),
    importAll: jest.fn().mockResolvedValue(undefined),
  };
}

// ─── Tests ──────────────────────────────────────────────────

describe('useBudgetNotifications', () => {
  let postMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    postMessageSpy = jest.spyOn(window, 'postMessage').mockImplementation(() => { /* noop */ });
  });

  afterEach(() => {
    jest.useRealTimers();
    postMessageSpy.mockRestore();
  });

  it('posts NOTIFICATION_UPDATE on mount with draft budgets', async () => {
    const drafts = [makeBudget({ id: 1 }), makeBudget({ id: 2, propertyAddress: '456 Other Ave' })];
    const repo = createMockRepository(drafts);

    renderHook(() => useBudgetNotifications(repo, true));

    // Let the async check() complete
    await act(async () => { await Promise.resolve(); });

    expect(repo.getBudgets).toHaveBeenCalledWith({ status: 'draft' });
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NOTIFICATION_UPDATE',
        source: 'budget',
        notifications: expect.arrayContaining([
          expect.objectContaining({
            id: 'budget-1',
            category: 'budget-approval',
            title: expect.stringContaining('123 Test St'),
          }),
          expect.objectContaining({
            id: 'budget-2',
            category: 'budget-approval',
            title: expect.stringContaining('456 Other Ave'),
          }),
        ]),
      }),
      window.location.origin,
    );
  });

  it('posts empty notifications when no drafts exist', async () => {
    const repo = createMockRepository([]);

    renderHook(() => useBudgetNotifications(repo, true));

    await act(async () => { await Promise.resolve(); });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NOTIFICATION_UPDATE',
        source: 'budget',
        notifications: [],
      }),
      window.location.origin,
    );
  });

  it('does not query when disabled', async () => {
    const repo = createMockRepository([]);

    renderHook(() => useBudgetNotifications(repo, false));

    await act(async () => { await Promise.resolve(); });

    expect(repo.getBudgets).not.toHaveBeenCalled();
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('includes agent name in notification message', async () => {
    const drafts = [makeBudget({ id: 5, agentName: 'Jane Smith' })];
    const repo = createMockRepository(drafts);

    renderHook(() => useBudgetNotifications(repo, true));

    await act(async () => { await Promise.resolve(); });

    const call = postMessageSpy.mock.calls[0][0];
    expect(call.notifications[0].message).toContain('Jane Smith');
  });

  it('uses updatedAt as timestamp', async () => {
    const drafts = [makeBudget({ id: 3, updatedAt: '2025-06-15T10:00:00Z' })];
    const repo = createMockRepository(drafts);

    renderHook(() => useBudgetNotifications(repo, true));

    await act(async () => { await Promise.resolve(); });

    const call = postMessageSpy.mock.calls[0][0];
    expect(call.notifications[0].timestamp).toBe('2025-06-15T10:00:00Z');
  });

  it('clears notifications on unmount', async () => {
    const repo = createMockRepository([makeBudget()]);

    const { unmount } = renderHook(() => useBudgetNotifications(repo, true));

    await act(async () => { await Promise.resolve(); });

    postMessageSpy.mockClear();
    unmount();

    // Should post empty notifications array
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NOTIFICATION_UPDATE',
        source: 'budget',
        notifications: [],
      }),
      window.location.origin,
    );
  });

  it('handles repository errors gracefully', async () => {
    const repo = createMockRepository();
    (repo.getBudgets as jest.Mock).mockRejectedValue(new Error('DB error'));

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });

    renderHook(() => useBudgetNotifications(repo, true));

    await act(async () => { await Promise.resolve(); });

    // Should not throw, just warn
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[BudgetNotifications]'),
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('polls periodically', async () => {
    const repo = createMockRepository([]);

    renderHook(() => useBudgetNotifications(repo, true));

    await act(async () => { await Promise.resolve(); });

    expect(repo.getBudgets).toHaveBeenCalledTimes(1);

    // Advance past poll interval (30s)
    await act(async () => {
      jest.advanceTimersByTime(30_000);
      await Promise.resolve();
    });

    expect(repo.getBudgets).toHaveBeenCalledTimes(2);
  });
});
