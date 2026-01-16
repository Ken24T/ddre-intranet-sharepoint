import * as React from 'react';
import { ToastProvider, ToastContainer, useToast } from './Toast';
import { OfflineBanner } from './OfflineBanner';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import type { IToastContext } from './Toast';

/**
 * Props for the IntranetShellWrapper
 */
export interface IIntranetShellWrapperProps {
  children: React.ReactNode;
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
 * 
 * @example
 * ```tsx
 * <IntranetShellWrapper>
 *   <IntranetShell {...props} />
 * </IntranetShellWrapper>
 * ```
 */
export const IntranetShellWrapper: React.FC<IIntranetShellWrapperProps> = ({ children }) => {
  return (
    <ToastProvider>
      <IntranetShellInner>{children}</IntranetShellInner>
    </ToastProvider>
  );
};

/**
 * Hook for components to access toast context.
 * Re-export from Toast module for convenience.
 */
export { useToast, type IToastContext };

export default IntranetShellWrapper;
