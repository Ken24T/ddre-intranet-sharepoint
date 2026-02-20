/**
 * MarketingBudgetDevView — Dev-only wrapper that renders the Marketing
 * Budget app inline within the intranet-core shell.
 *
 * This component is only used by the Vite dev harness so the whole
 * intranet can be developed on a single port (3027). It provides a
 * DexieBudgetRepository instance and enables the shell sidebar bridge
 * in "forceActive" mode so the sidebar integration works without an
 * iframe boundary.
 *
 * In production SharePoint the Marketing Budget is a web part inside
 * the intranet-core .sppkg — this file is never included in the SPFx build.
 */

import React from 'react';
import MarketingBudget from '@mb-components/MarketingBudget';
import { DexieBudgetRepository } from '@mb-services/DexieBudgetRepository';

// Single repository instance, reused across renders
const repository = new DexieBudgetRepository();

export const MarketingBudgetDevView: React.FC = () => {
  return (
    <MarketingBudget
      userDisplayName="Ken Boyle"
      isDarkTheme={false}
      isSharePointContext={false}
      repository={repository}
      shellBridgeOptions={{ forceActive: true }}
      userRole="admin" // Change to 'editor' or 'viewer' to test role-gating
    />
  );
};
