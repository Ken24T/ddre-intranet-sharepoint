/* eslint-disable @typescript-eslint/no-floating-promises */
import { renderHook, act } from '@testing-library/react-hooks';
import { useRetry } from './useRetry';

describe('useRetry hook', () => {
  it('initializes with correct default state', () => {
    const fn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useRetry(fn));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempts).toBe(0);
  });

  it('uses initialData when provided', () => {
    const fn = jest.fn().mockResolvedValue('new data');
    const { result } = renderHook(() => 
      useRetry(fn, { initialData: 'initial' })
    );

    expect(result.current.data).toBe('initial');
  });

  it('updates data on successful execution', async () => {
    const fn = jest.fn().mockResolvedValue('success data');
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { config: { enabled: false } })
    );

    act(() => {
      result.current.execute();
    });

    await waitForNextUpdate();

    expect(result.current.data).toBe('success data');
    expect(result.current.error).toBeUndefined();
    expect(result.current.attempts).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates error on failed execution', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { config: { enabled: false } })
    );

    act(() => {
      result.current.execute();
    });

    await waitForNextUpdate();

    expect(result.current.error?.message).toBe('fail');
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('calls onSuccess callback with data and attempts', async () => {
    const fn = jest.fn().mockResolvedValue('data');
    const onSuccess = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { onSuccess, config: { enabled: false } })
    );

    act(() => {
      result.current.execute();
    });

    await waitForNextUpdate();

    expect(onSuccess).toHaveBeenCalledWith('data', 1);
  });

  it('calls onError callback with error and attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { onError, config: { enabled: false } })
    );

    act(() => {
      result.current.execute();
    });

    await waitForNextUpdate();

    expect(onError).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  it('retry() re-executes the function', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { config: { enabled: false } })
    );

    // First execute fails
    act(() => {
      result.current.execute();
    });
    await waitForNextUpdate();
    expect(result.current.error).toBeDefined();

    // Retry succeeds
    act(() => {
      result.current.retry();
    });
    await waitForNextUpdate();
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeUndefined();
  });

  it('reset() restores initial state', async () => {
    const fn = jest.fn().mockResolvedValue('data');
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { initialData: 'initial', config: { enabled: false } })
    );

    // Execute to change state
    act(() => {
      result.current.execute();
    });
    await waitForNextUpdate();
    expect(result.current.data).toBe('data');
    expect(result.current.attempts).toBe(1);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe('initial');
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.attempts).toBe(0);
  });

  it('clears previous error on new successful execution', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { config: { enabled: false } })
    );

    // First fails
    act(() => {
      result.current.execute();
    });
    await waitForNextUpdate();
    expect(result.current.error).toBeDefined();

    // Second succeeds
    act(() => {
      result.current.execute();
    });
    await waitForNextUpdate();
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBe('success');
  });

  it('isLoading is true during execution', async () => {
    const fn = jest.fn().mockResolvedValue('data');

    const { result, waitForNextUpdate } = renderHook(() => 
      useRetry(fn, { config: { enabled: false } })
    );

    // Before execution
    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.execute();
    });

    // isLoading should be true immediately after starting execution
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    // isLoading should be false after completion
    expect(result.current.isLoading).toBe(false);
  });
});
