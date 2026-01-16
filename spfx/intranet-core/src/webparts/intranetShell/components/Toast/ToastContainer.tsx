import * as React from 'react';
import { Icon } from '@fluentui/react';
import type { IToast, ToastType } from './ToastProvider';
import { useToast } from './ToastProvider';
import styles from './Toast.module.scss';

// =============================================================================
// TOAST ITEM
// =============================================================================

interface IToastItemProps {
  toast: IToast;
  onDismiss: (id: string) => void;
}

function getIconName(type: ToastType): string {
  switch (type) {
    case 'info': return 'Info';
    case 'success': return 'CheckMark';
    case 'warning': return 'Warning';
    case 'error': return 'ErrorBadge';
  }
}

const ToastItem: React.FC<IToastItemProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  const handleDismiss = (): void => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => onDismiss(toast.id), 100);
  };

  const handleRetry = (): void => {
    if (toast.onRetry) {
      toast.onRetry();
      handleDismiss();
    }
  };

  return (
    <div 
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon iconName={getIconName(toast.type)} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      <div className={styles.actions}>
        {toast.onRetry && (
          <button 
            className={styles.retryButton} 
            onClick={handleRetry}
            aria-label="Retry"
            title="Retry"
          >
            <Icon iconName="Refresh" />
          </button>
        )}
        <button 
          className={styles.dismissButton} 
          onClick={handleDismiss}
          aria-label="Dismiss"
          title="Dismiss"
        >
          <Icon iconName="Cancel" />
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// TOAST CONTAINER
// =============================================================================

export interface IToastContainerProps {
  /** Optional: override toasts from context (for testing) */
  toasts?: IToast[];
  /** Optional: override dismiss handler (for testing) */
  onDismiss?: (id: string) => void;
}

/**
 * Container that renders toast notifications from context.
 * Should be placed once in the app, typically near the root.
 */
export const ToastContainer: React.FC<IToastContainerProps> = (props) => {
  const context = useToast();
  
  // Use props if provided (for testing), otherwise use context
  const toasts = props.toasts ?? context.toasts;
  const onDismiss = props.onDismiss ?? context.dismissToast;

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
