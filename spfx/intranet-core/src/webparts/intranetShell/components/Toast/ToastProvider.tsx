import * as React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface IToast {
  id: string;
  type: ToastType;
  message: string;
  /** Auto-dismiss timeout in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Show retry button */
  onRetry?: () => void;
  /** Called when toast is dismissed */
  onDismiss?: () => void;
}

export interface IToastOptions {
  type?: ToastType;
  duration?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export interface IToastContext {
  toasts: IToast[];
  /** Show a toast notification */
  showToast: (message: string, options?: IToastOptions) => string;
  /** Dismiss a specific toast by ID */
  dismissToast: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
  /** Helper: show info toast */
  info: (message: string, options?: Omit<IToastOptions, 'type'>) => string;
  /** Helper: show success toast */
  success: (message: string, options?: Omit<IToastOptions, 'type'>) => string;
  /** Helper: show warning toast */
  warning: (message: string, options?: Omit<IToastOptions, 'type'>) => string;
  /** Helper: show error toast */
  error: (message: string, options?: Omit<IToastOptions, 'type'>) => string;
}

// =============================================================================
// DEFAULT DURATIONS
// =============================================================================

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  info: 5000,
  success: 3000,
  warning: 8000,
  error: 0, // No auto-dismiss for errors
};

// =============================================================================
// CONTEXT
// =============================================================================

const ToastContext = React.createContext<IToastContext | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

let toastIdCounter = 0;

export interface IToastProviderProps {
  children: React.ReactNode;
  /** Maximum number of visible toasts (default: 5) */
  maxToasts?: number;
}

export const ToastProvider: React.FC<IToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = React.useState<IToast[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    // Clear any existing timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const showToast = React.useCallback((message: string, options: IToastOptions = {}): string => {
    const id = `toast-${++toastIdCounter}`;
    const type = options.type || 'info';
    const duration = options.duration ?? DEFAULT_DURATIONS[type];

    const newToast: IToast = {
      id,
      type,
      message,
      duration,
      onRetry: options.onRetry,
      onDismiss: options.onDismiss,
    };

    setToasts(prev => {
      // If at max, remove oldest (first) toast
      const updated = prev.length >= maxToasts ? prev.slice(1) : prev;
      return [...updated, newToast];
    });

    // Set auto-dismiss timer if duration > 0
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [maxToasts, dismissToast]);

  const dismissAll = React.useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // Helper methods
  const info = React.useCallback((message: string, options?: Omit<IToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'info' }), [showToast]);
  
  const success = React.useCallback((message: string, options?: Omit<IToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'success' }), [showToast]);
  
  const warning = React.useCallback((message: string, options?: Omit<IToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'warning' }), [showToast]);
  
  const error = React.useCallback((message: string, options?: Omit<IToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'error' }), [showToast]);

  const contextValue: IToastContext = {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    info,
    success,
    warning,
    error,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

// =============================================================================
// HOOK
// =============================================================================

export function useToast(): IToastContext {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
