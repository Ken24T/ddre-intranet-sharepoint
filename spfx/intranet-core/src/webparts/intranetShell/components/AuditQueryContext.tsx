/**
 * AuditQueryContext — React context that provides an
 * IAuditLogQueryService to the AuditLogViewer.
 *
 * Keeps the viewer decoupled from the data source:
 * - Dev:  DexieAuditLogQueryService  (reads IndexedDB)
 * - Prod: ApiAuditLogQueryService    (reads Azure proxy)
 *
 * Provided by IntranetShellWrapper alongside the AuditProvider.
 */

import * as React from "react";
import type { IAuditLogQueryService } from "./services/IAuditLogQueryService";

const AuditQueryContext = React.createContext<IAuditLogQueryService | undefined>(
  undefined,
);

export interface AuditQueryProviderProps {
  service: IAuditLogQueryService;
  children: React.ReactNode;
}

export const AuditQueryProvider: React.FC<AuditQueryProviderProps> = ({
  service,
  children,
}) => (
  <AuditQueryContext.Provider value={service}>
    {children}
  </AuditQueryContext.Provider>
);

/**
 * Hook to access the audit log query service.
 * Returns undefined when no provider is present (viewer falls back to mock data).
 */
export function useAuditQuery(): IAuditLogQueryService | undefined {
  return React.useContext(AuditQueryContext);
}
