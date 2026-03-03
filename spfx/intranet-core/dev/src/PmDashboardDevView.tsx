/**
 * PmDashboardDevView — Dev-only wrapper that renders the PM Dashboard
 * inline within the intranet-core shell.
 *
 * This component is only used by the Vite dev harness so the whole
 * intranet can be developed on a single port (3027). It provides a
 * DexieDashboardRepository instance with seed data.
 *
 * In production SharePoint the PM Dashboard is a web part inside
 * the intranet-core .sppkg — this file is never included in the SPFx build.
 */

import React from 'react';
import { PmDashboard } from '@pmd-components/PmDashboard';
import { DexieDashboardRepository } from '@pmd-services/DexieDashboardRepository';
import { DexiePresenceRepository } from '@pmd-services/DexiePresenceRepository';
import { MockPropertyMeService } from '@pmd-services/MockPropertyMeService';

// Single instances, reused across renders
const repository = new DexieDashboardRepository();
const presenceRepository = new DexiePresenceRepository();
const propertyMeService = new MockPropertyMeService();

interface PmDashboardDevViewProps {
  isAdmin: boolean;
}

export const PmDashboardDevView: React.FC<PmDashboardDevViewProps> = () => {
  return (
    <PmDashboard
      userDisplayName="Ken Boyle"
      userEmail="ken@disher.com.au"
      isDarkTheme={false}
      repository={repository}
      presenceRepository={presenceRepository}
      propertyMeService={propertyMeService}
    />
  );
};
