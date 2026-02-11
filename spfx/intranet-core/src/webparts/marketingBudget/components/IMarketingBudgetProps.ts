/**
 * IMarketingBudgetProps – Props for the root MarketingBudget React component.
 */

import type { IBudgetRepository } from "../services/IBudgetRepository";
import type { UserRole } from "../models/permissions";

export interface IMarketingBudgetProps {
  /** User's display name from SharePoint context. */
  userDisplayName: string;
  /** Whether the host is in dark mode. */
  isDarkTheme: boolean;
  /** Whether running inside SharePoint (true) or Vite dev harness (false). */
  isSharePointContext: boolean;
  /** Repository instance for data operations. */
  repository: IBudgetRepository;
  /** User's role — determines what actions are available. Defaults to 'viewer'. */
  userRole?: UserRole;
  /**
   * Options forwarded to useShellBridge.
   * Pass `{ forceActive: true }` when rendering inline in the shell's
   * Vite dev harness so the sidebar bridge works without an iframe.
   */
  shellBridgeOptions?: { forceActive?: boolean };
}
