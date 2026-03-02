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
import { DexieAuditLogger } from '@mb-services/DexieAuditLogger';
import { DexieBudgetTemplateService } from '@mb-services/DexieBudgetTemplateService';
import { AuditedBudgetRepository } from '@mb-services/AuditedBudgetRepository';
import type { BudgetAuditEvent } from '@mb-services/AuditedBudgetRepository';
import { useAudit } from '../../src/webparts/intranetShell/components/AuditContext';

// Single instances, reused across renders
const baseRepository = new DexieBudgetRepository();
const auditLogger = new DexieAuditLogger();
const templateService = new DexieBudgetTemplateService();

interface MarketingBudgetDevViewProps {
  isAdmin: boolean;
}

export const MarketingBudgetDevView: React.FC<MarketingBudgetDevViewProps> = ({ isAdmin }) => {
  const shellAudit = useAudit();

  // Create audited repository with shell bridge callback.
  // Memoised so it doesn't change on every render.
  const repository = React.useMemo(() => {
    const onAuditEvent = (event: BudgetAuditEvent): void => {
      shellAudit.logUserInteraction('feedback_form_submitted', {
        hub: 'sales',
        tool: 'marketing-budget',
        metadata: {
          entityType: event.entityType,
          action: event.action,
          summary: event.summary,
          changes: event.changes,
        },
      });
    };
    return new AuditedBudgetRepository(baseRepository, auditLogger, 'Ken Boyle', onAuditEvent);
  }, [shellAudit]);

  return (
    <MarketingBudget
      userDisplayName="Ken Boyle"
      isDarkTheme={false}
      isSharePointContext={false}
      repository={repository}
      auditLogger={auditLogger}
      templateService={templateService}
      shellBridgeOptions={{ forceActive: true }}
      userRole={isAdmin ? 'admin' : 'editor'}
    />
  );
};
