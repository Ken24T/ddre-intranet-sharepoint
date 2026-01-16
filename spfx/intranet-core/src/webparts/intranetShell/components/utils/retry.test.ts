import { withRetry, createRetryableRequest, RETRY_CONFIGS } from './retry';

// Speed up tests by using shorter delays
jest.useFakeTimers();

describe('retry utility', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('withRetry', () => {
    it('returns success on first attempt when function succeeds', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const resultPromise = withRetry(fn);
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result).toEqual({
        success: true,
        data: 'success',
        attempts: 1,
      });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds on subsequent attempt', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const resultPromise = withRetry(fn, { delayMs: 100 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result).toEqual({
        success: true,
        data: 'success',
        attempts: 3,
      });
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('returns failure after exhausting all attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fails'));
      
      const resultPromise = withRetry(fn, { maxAttempts: 3, delayMs: 100 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('always fails');
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('respects maxAttempts config', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      
      const resultPromise = withRetry(fn, { maxAttempts: 5, delayMs: 10 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result.attempts).toBe(5);
      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('skips retries when enabled is false', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      
      const resultPromise = withRetry(fn, { enabled: false });
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('converts non-Error throws to Error objects', async () => {
      const fn = jest.fn().mockRejectedValue('string error');
      
      const resultPromise = withRetry(fn, { enabled: false });
      await jest.runAllTimersAsync();
      const result = await resultPromise;
      
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('string error');
    });

    it('applies exponential backoff when enabled', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const delays: number[] = [];
      
      // Track when the function is called to measure delays
      let lastCallTime = Date.now();
      fn.mockImplementation(() => {
        const now = Date.now();
        if (fn.mock.calls.length > 1) {
          delays.push(now - lastCallTime);
        }
        lastCallTime = now;
        return Promise.reject(new Error('fail'));
      });
      
      const resultPromise = withRetry(fn, { 
        maxAttempts: 4, 
        delayMs: 1000, 
        backoff: true 
      });
      
      // Advance timers to simulate delays
      await jest.advanceTimersByTimeAsync(1000); // 1st delay: 1000ms
      await jest.advanceTimersByTimeAsync(2000); // 2nd delay: 2000ms
      await jest.advanceTimersByTimeAsync(4000); // 3rd delay: 4000ms
      
      await resultPromise;
      
      expect(fn).toHaveBeenCalledTimes(4);
    });
  });

  describe('createRetryableRequest', () => {
    it('calls onSuccess callback with data and attempts', async () => {
      const fn = jest.fn().mockResolvedValue('data');
      const onSuccess = jest.fn();
      
      const request = createRetryableRequest(fn, { onSuccess });
      const resultPromise = request();
      await jest.runAllTimersAsync();
      await resultPromise;
      
      expect(onSuccess).toHaveBeenCalledWith('data', 1);
    });

    it('calls onError callback after all retries fail', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const onError = jest.fn();
      
      const request = createRetryableRequest(fn, { 
        onError,
        config: { maxAttempts: 2, delayMs: 10 }
      });
      
      const resultPromise = request();
      await jest.runAllTimersAsync();
      await resultPromise;
      
      expect(onError).toHaveBeenCalledWith(expect.any(Error), 2);
    });

    it('calls onRetrying callback during retry attempts', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      const onRetrying = jest.fn();
      
      const request = createRetryableRequest(fn, { 
        onRetrying,
        config: { maxAttempts: 3, delayMs: 10 }
      });
      
      const resultPromise = request();
      await jest.runAllTimersAsync();
      await resultPromise;
      
      expect(onRetrying).toHaveBeenCalledTimes(2);
      expect(onRetrying).toHaveBeenNthCalledWith(1, 1, 3);
      expect(onRetrying).toHaveBeenNthCalledWith(2, 2, 3);
    });
  });

  describe('RETRY_CONFIGS', () => {
    it('has expected service configurations', () => {
      expect(RETRY_CONFIGS.vault).toEqual({
        enabled: true,
        maxAttempts: 3,
        delayMs: 1000,
        backoff: true,
      });
      
      expect(RETRY_CONFIGS.notifications).toEqual({
        enabled: false,
        maxAttempts: 1,
        delayMs: 0,
        backoff: false,
      });
    });

    it('has configs for all expected services', () => {
      expect(RETRY_CONFIGS).toHaveProperty('vault');
      expect(RETRY_CONFIGS).toHaveProperty('propertyMe');
      expect(RETRY_CONFIGS).toHaveProperty('search');
      expect(RETRY_CONFIGS).toHaveProperty('cardData');
      expect(RETRY_CONFIGS).toHaveProperty('notifications');
    });
  });
});
