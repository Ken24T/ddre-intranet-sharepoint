/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { render, act } from '@testing-library/react';
import { ToastProvider, useToast, IToastContext } from './ToastProvider';
import { ToastContainer } from './ToastContainer';

// Test component that exposes toast context
const TestComponent: React.FC<{ onMount?: (toast: IToastContext) => void }> = ({ onMount }) => {
  const toast = useToast();
  React.useEffect(() => {
    onMount?.(toast);
  }, [toast, onMount]);
  return null;
};

// Helper to render with provider
const renderWithProvider = (ui: React.ReactElement, maxToasts = 5): ReturnType<typeof render> => {
  return render(
    <ToastProvider maxToasts={maxToasts}>
      {ui}
      <ToastContainer />
    </ToastProvider>
  );
};

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides toast context to children', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    expect(toastContext).toBeDefined();
    expect(toastContext?.toasts).toEqual([]);
    expect(typeof toastContext?.showToast).toBe('function');
    expect(typeof toastContext?.dismissToast).toBe('function');
    expect(typeof toastContext?.info).toBe('function');
    expect(typeof toastContext?.success).toBe('function');
    expect(typeof toastContext?.warning).toBe('function');
    expect(typeof toastContext?.error).toBe('function');
  });

  it('showToast adds a toast to the list', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.showToast('Test message');
    });
    
    expect(toastContext?.toasts).toHaveLength(1);
    expect(toastContext?.toasts[0].message).toBe('Test message');
  });

  it('info() creates info toast', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.info('Info message');
    });
    
    expect(toastContext?.toasts[0].type).toBe('info');
  });

  it('success() creates success toast', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.success('Success message');
    });
    
    expect(toastContext?.toasts[0].type).toBe('success');
  });

  it('warning() creates warning toast', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.warning('Warning message');
    });
    
    expect(toastContext?.toasts[0].type).toBe('warning');
  });

  it('error() creates error toast', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.error('Error message');
    });
    
    expect(toastContext?.toasts[0].type).toBe('error');
  });

  it('dismissToast removes specific toast', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    let id1: string, id2: string;
    act(() => {
      id1 = toastContext!.info('First');
      id2 = toastContext!.info('Second');
    });
    
    expect(toastContext?.toasts).toHaveLength(2);
    
    act(() => {
      toastContext?.dismissToast(id1!);
    });
    
    expect(toastContext?.toasts).toHaveLength(1);
    expect(toastContext?.toasts[0].id).toBe(id2!);
  });

  it('dismissAll removes all toasts', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.info('First');
      toastContext?.info('Second');
      toastContext?.info('Third');
    });
    
    expect(toastContext?.toasts).toHaveLength(3);
    
    act(() => {
      toastContext?.dismissAll();
    });
    
    expect(toastContext?.toasts).toHaveLength(0);
  });

  it('auto-dismisses toast after duration', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.showToast('Auto dismiss', { duration: 3000 });
    });
    
    expect(toastContext?.toasts).toHaveLength(1);
    
    // Advance time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(toastContext?.toasts).toHaveLength(0);
  });

  it('does not auto-dismiss error toasts (duration 0)', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    act(() => {
      toastContext?.error('Error that stays');
    });
    
    expect(toastContext?.toasts).toHaveLength(1);
    
    // Advance time significantly
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    
    // Error should still be there
    expect(toastContext?.toasts).toHaveLength(1);
  });

  it('respects maxToasts limit', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />,
      3 // maxToasts = 3
    );
    
    act(() => {
      toastContext?.info('First');
      toastContext?.info('Second');
      toastContext?.info('Third');
      toastContext?.info('Fourth');
    });
    
    // Should only have 3 toasts, oldest removed
    expect(toastContext?.toasts).toHaveLength(3);
    expect(toastContext?.toasts[0].message).toBe('Second');
    expect(toastContext?.toasts[2].message).toBe('Fourth');
  });

  it('calls onDismiss callback when toast is dismissed', () => {
    let toastContext: IToastContext | undefined;
    const onDismiss = jest.fn();
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    let id: string;
    act(() => {
      id = toastContext!.showToast('With callback', { onDismiss });
    });
    
    act(() => {
      toastContext?.dismissToast(id!);
    });
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('returns unique IDs for each toast', () => {
    let toastContext: IToastContext | undefined;
    
    renderWithProvider(
      <TestComponent onMount={(ctx) => { toastContext = ctx; }} />
    );
    
    let id1 = '';
    let id2 = '';
    let id3 = '';
    act(() => {
      id1 = toastContext!.info('First');
      id2 = toastContext!.info('Second');
      id3 = toastContext!.info('Third');
    });
    
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });
});

describe('useToast', () => {
  it('throws error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestOutsideProvider: React.FC = () => {
      useToast();
      return null;
    };
    
    expect(() => render(<TestOutsideProvider />)).toThrow(
      'useToast must be used within a ToastProvider'
    );
    
    consoleSpy.mockRestore();
  });
});
