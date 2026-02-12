/**
 * useBudgetNotifications Hook
 *
 * Monitors draft budgets and pushes notification updates to the shell
 * via the AppBridge NOTIFICATION_UPDATE message. When the marketing budget
 * component mounts, this hook queries for draft budgets and sends them
 * as notifications. The shell persists these in state so they remain
 * visible even after the user navigates away from the budget app.
 *
 * Polls every 30 seconds to catch status changes.
 */

import * as React from 'react';
import type { IBudgetRepository } from '../services/IBudgetRepository';
import type { Budget } from '../models/types';
import type { IAppNotificationItem } from '../../intranetShell/components/appBridge';

/** How often to re-check draft budgets (ms). */
const POLL_INTERVAL = 30_000;

/**
 * Convert a draft budget into an AppBridge notification item.
 */
function budgetToNotificationItem(budget: Budget): IAppNotificationItem {
  const address = budget.propertyAddress || 'Untitled property';
  const agent = budget.agentName ? ` — ${budget.agentName}` : '';

  return {
    id: `budget-${budget.id}`,
    category: 'budget-approval',
    title: `Draft budget: ${address}`,
    message: `${address}${agent} awaiting approval`,
    timestamp: budget.updatedAt || budget.createdAt,
    priority: 'medium',
  };
}

/**
 * Post the current set of budget notifications to the shell.
 */
function postNotifications(items: IAppNotificationItem[]): void {
  const message = {
    type: 'NOTIFICATION_UPDATE' as const,
    source: 'budget',
    notifications: items,
  };

  // Post to parent window (iframe scenario) and own window (inline scenario).
  // The shell's handleAppMessage listener picks it up from either.
  if (window.parent !== window) {
    window.parent.postMessage(message, window.location.origin);
  }
  window.postMessage(message, window.location.origin);
}

/**
 * Hook that monitors draft budgets and pushes notifications to the shell.
 *
 * @param repository - Budget repository to query.
 * @param enabled - Set to false to disable polling (e.g. for viewers).
 */
export function useBudgetNotifications(
  repository: IBudgetRepository,
  enabled: boolean = true,
): void {
  React.useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const check = async (): Promise<void> => {
      try {
        const drafts: Budget[] = await repository.getBudgets({ status: 'draft' });
        if (cancelled) return;

        const items = drafts.map(budgetToNotificationItem);
        postNotifications(items);
      } catch (err) {
        // Silently ignore — notifications are non-critical.
        // eslint-disable-next-line no-console
        console.warn('[BudgetNotifications] Failed to check drafts:', err);
      }
    };

    // Initial check on mount.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    check();

    // Periodic polling.
    const intervalId = setInterval(() => { check().catch(() => { /* handled inside */ }); }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      // Clear notifications when component unmounts (app is closed).
      postNotifications([]);
    };
  }, [repository, enabled]);
}
