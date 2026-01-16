import { useState, useCallback, useRef } from 'react';
import { withRetry, IRetryConfig, IRetryResult } from '../utils/retry';

export interface IUseRetryOptions<T> {
  /** Initial data value */
  initialData?: T;
  /** Retry configuration */
  config?: Partial<IRetryConfig>;
  /** Called when request succeeds */
  onSuccess?: (data: T, attempts: number) => void;
  /** Called after all retries fail */
  onError?: (error: Error, attempts: number) => void;
}

export interface IUseRetryReturn<T> {
  /** Current data value */
  data: T | undefined;
  /** Current error (cleared on success) */
  error: Error | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Number of attempts made */
  attempts: number;
  /** Execute the request */
  execute: () => Promise<IRetryResult<T>>;
  /** Manually retry after failure */
  retry: () => Promise<IRetryResult<T>>;
  /** Reset state to initial */
  reset: () => void;
}

/**
 * Hook for executing async operations with automatic retry logic.
 * 
 * @example
 * ```tsx
 * const { data, error, isLoading, execute, retry } = useRetry(
 *   () => vaultClient.getProperties(),
 *   {
 *     config: RETRY_CONFIGS.vault,
 *     onError: (err) => toast.error(`Failed to load: ${err.message}`)
 *   }
 * );
 * 
 * useEffect(() => { execute(); }, []);
 * 
 * if (error) return <Button onClick={retry}>Retry</Button>;
 * ```
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: IUseRetryOptions<T> = {}
): IUseRetryReturn<T> {
  const { initialData, config, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Store fn in ref to avoid recreating execute on every render
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async (): Promise<IRetryResult<T>> => {
    setIsLoading(true);
    setError(undefined);
    
    const result = await withRetry(() => fnRef.current(), config);
    
    setAttempts(result.attempts);
    setIsLoading(false);
    
    if (result.success && result.data !== undefined) {
      setData(result.data);
      onSuccess?.(result.data, result.attempts);
    } else if (result.error) {
      setError(result.error);
      onError?.(result.error, result.attempts);
    }
    
    return result;
  }, [config, onSuccess, onError]);

  const retry = useCallback(async (): Promise<IRetryResult<T>> => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(undefined);
    setIsLoading(false);
    setAttempts(0);
  }, [initialData]);

  return {
    data,
    error,
    isLoading,
    attempts,
    execute,
    retry,
    reset,
  };
}
