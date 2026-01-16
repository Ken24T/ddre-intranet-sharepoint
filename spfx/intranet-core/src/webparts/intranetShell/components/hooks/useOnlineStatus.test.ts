/* eslint-disable @typescript-eslint/no-floating-promises */
import { renderHook, act } from '@testing-library/react-hooks';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus hook', () => {
  // Store original navigator descriptor
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'navigator');
  
  const setNavigatorOnline = (online: boolean): void => {
    Object.defineProperty(window, 'navigator', {
      value: { onLine: online },
      writable: true,
      configurable: true,
    });
  };

  beforeEach(() => {
    // Start online by default
    setNavigatorOnline(true);
  });

  afterEach(() => {
    // Restore original navigator
    if (originalDescriptor) {
      Object.defineProperty(window, 'navigator', originalDescriptor);
    }
  });

  it('initializes with navigator.onLine value (online)', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('initializes with navigator.onLine value (offline)', () => {
    setNavigatorOnline(false);
    
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(false);
  });

  it('updates isOnline when offline event fires', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(true);
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOnline).toBe(false);
  });

  it('updates isOnline when online event fires', () => {
    setNavigatorOnline(false);
    
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(false);
    
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current.isOnline).toBe(true);
  });

  it('calls onOffline callback when going offline', () => {
    const onOffline = jest.fn();
    renderHook(() => useOnlineStatus({ onOffline }));
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(onOffline).toHaveBeenCalledTimes(1);
  });

  it('calls onOnline callback when reconnecting after being offline', () => {
    const onOnline = jest.fn();
    const { result } = renderHook(() => useOnlineStatus({ onOnline }));
    
    // Go offline first
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOnline).toBe(false);
    
    // Come back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(onOnline).toHaveBeenCalledTimes(1);
  });

  it('sets wasOffline true when reconnecting', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Go offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.wasOffline).toBe(false);
    
    // Come back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current.wasOffline).toBe(true);
  });

  it('clearWasOffline() resets wasOffline to false', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Go offline then online to set wasOffline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current.wasOffline).toBe(true);
    
    act(() => {
      result.current.clearWasOffline();
    });
    
    expect(result.current.wasOffline).toBe(false);
  });

  it('does not set wasOffline if already online when online event fires', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Fire online event when already online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    // wasOffline should still be false since we never went offline
    expect(result.current.wasOffline).toBe(false);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useOnlineStatus());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});
