import * as React from 'react';
import { ToastProvider, ToastContainer, useToast } from './Toast';
import { OfflineBanner } from './OfflineBanner';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type { IToastContext } from './Toast';
import { AuditProvider, useAudit } from './AuditContext';
import type { IAuditLogger } from './AuditContext';
import { AuditQueryProvider, useAuditQuery } from './AuditQueryContext';
import type { IAuditLogQueryService } from './services/IAuditLogQueryService';
import { DexieShellAuditLogger } from './services/DexieShellAuditLogger';
import { DexieAuditLogQueryService } from './services/DexieAuditLogQueryService';
import { TasksProvider } from './tasks/TasksContext';

/**
 * Props for the IntranetShellWrapper
 */
export interface IIntranetShellWrapperProps {
  children: React.ReactNode;
  /** Optional audit logger instance. If not provided, uses DexieShellAuditLogger (dev mode). */
  auditLogger?: IAuditLogger;
  /** Optional query service for AuditLogViewer. If not provided, uses DexieAuditLogQueryService (dev mode). */
  auditQueryService?: IAuditLogQueryService;
}

/**
 * Internal component that uses hooks for online status and toast
 */
const IntranetShellInner: React.FC<IIntranetShellWrapperProps> = ({ children }) => {
  const toast = useToast();
  const [offlineDismissed, setOfflineDismissed] = React.useState(false);

  const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus({
    onOnline: () => {
      toast.success("You're back online!");
    },
  });

  // Reset dismissal state when going offline again
  React.useEffect(() => {
    if (!isOnline) {
      setOfflineDismissed(false);
    }
  }, [isOnline]);

  // Handle data refresh after reconnection
  React.useEffect(() => {
    if (wasOffline && isOnline) {
      // Data refresh would happen here via event bus or callback
      clearWasOffline();
    }
  }, [wasOffline, isOnline, clearWasOffline]);

  const handleDismissOffline = (): void => {
    setOfflineDismissed(true);
  };

  return (
    <>
      <OfflineBanner 
        isVisible={!isOnline && !offlineDismissed}
        onDismiss={handleDismissOffline}
      />
      {children}
      <ToastContainer />
    </>
  );
};

/**
 * Wrapper component that provides error handling context to the Intranet Shell.
 * 
 * Features:
 * - Toast notification system (ToastProvider + ToastContainer)
 * - Offline detection banner with dismissal
 * - Reconnection handling with success toast
 * - Audit logging context (AuditProvider)
 * 
 * @example
 * ```tsx
 * <IntranetShellWrapper auditLogger={auditClient}>
 *   <IntranetShell {...props} />
 * </IntranetShellWrapper>
 * ```
 */
export const IntranetShellWrapper: React.FC<IIntranetShellWrapperProps> = ({ 
  children,
  auditLogger,
  auditQueryService,
}) => {
  // Use provided logger or fall back to Dexie logger for dev
  // (DexieShellAuditLogger persists events to IndexedDB so they
  //  survive page reloads and appear in AuditLogViewer.)
  const logger = React.useMemo(
    () => auditLogger ?? new DexieShellAuditLogger(),
    [auditLogger]
  );

  // Use provided query service or fall back to Dexie reader for dev
  const queryService = React.useMemo(
    () => auditQueryService ?? new DexieAuditLogQueryService(),
    [auditQueryService]
  );

  // Log app_loaded on mount
  React.useEffect(() => {
    logger.logSystem('app_loaded');
  }, [logger]);

  return (
    <AuditProvider logger={logger}>
      <AuditQueryProvider service={queryService}>
        <ToastProvider>
          <TasksProvider>
            <IntranetShellInner>{children}</IntranetShellInner>
          </TasksProvider>
        </ToastProvider>
      </AuditQueryProvider>
    </AuditProvider>
  );
};

/**
 * Hook for components to access toast context.
 * Re-export from Toast module for convenience.
 */
export { useToast, type IToastContext };

/**
 * Hook for components to access audit logger.
 * Re-export from AuditContext for convenience.
 */
export { useAudit, type IAuditLogger };
export { useAuditQuery };
export type { IAuditLogQueryService };

export default IntranetShellWrapper;
