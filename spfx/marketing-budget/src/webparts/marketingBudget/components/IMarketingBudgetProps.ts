/**
 * IMarketingBudgetProps – Props for the root MarketingBudget React component.
 */

import type { IBudgetRepository } from '../../../services/IBudgetRepository';

export interface IMarketingBudgetProps {
  /** User's display name from SharePoint context. */
  userDisplayName: string;
  /** Whether the host is in dark mode. */
  isDarkTheme: boolean;
  /** Whether running inside SharePoint (true) or Vite dev harness (false). */
  isSharePointContext: boolean;
  /** Repository instance for data operations. */
  repository: IBudgetRepository;
}
