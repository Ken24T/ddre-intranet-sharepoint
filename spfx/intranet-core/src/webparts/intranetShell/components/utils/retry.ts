// =============================================================================
// RETRY UTILITY
// =============================================================================

export interface IRetryConfig {
  /** Whether auto-retry is enabled */
  enabled: boolean;
  /** Maximum retry attempts (default: 3) */
  maxAttempts: number;
  /** Delay between retries in ms (default: 1000) */
  delayMs: number;
  /** Use exponential backoff (default: true) */
  backoff: boolean;
}

export interface IRetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

const DEFAULT_CONFIG: IRetryConfig = {
  enabled: true,
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true,
};

/**
 * Execute a function with automatic retry logic.
 * 
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns Result with success status, data/error, and attempt count
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<IRetryConfig> = {}
): Promise<IRetryResult<T>> {
  const mergedConfig: IRetryConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!mergedConfig.enabled) {
    try {
      const data = await fn();
      return { success: true, data, attempts: 1 };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error(String(err)), 
        attempts: 1 
      };
    }
  }

  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
    try {
      const data = await fn();
      return { success: true, data, attempts: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Don't wait after the last attempt
      if (attempt < mergedConfig.maxAttempts) {
        const delay = mergedConfig.backoff 
          ? mergedConfig.delayMs * Math.pow(2, attempt - 1)
          : mergedConfig.delayMs;
        await sleep(delay);
      }
    }
  }

  return { 
    success: false, 
    error: lastError, 
    attempts: mergedConfig.maxAttempts 
  };
}

/**
 * Hook for retry-enabled async operations with toast feedback.
 */
export function createRetryableRequest<T>(
  fn: () => Promise<T>,
  options: {
    config?: Partial<IRetryConfig>;
    onSuccess?: (data: T, attempts: number) => void;
    onError?: (error: Error, attempts: number) => void;
    onRetrying?: (attempt: number, maxAttempts: number) => void;
  } = {}
): () => Promise<IRetryResult<T>> {
  const { config, onSuccess, onError, onRetrying } = options;
  const mergedConfig: IRetryConfig = { ...DEFAULT_CONFIG, ...config };

  return async () => {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
      try {
        const data = await fn();
        onSuccess?.(data, attempt);
        return { success: true, data, attempts: attempt };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        if (attempt < mergedConfig.maxAttempts) {
          onRetrying?.(attempt, mergedConfig.maxAttempts);
          const delay = mergedConfig.backoff 
            ? mergedConfig.delayMs * Math.pow(2, attempt - 1)
            : mergedConfig.delayMs;
          await sleep(delay);
        }
      }
    }

    onError?.(lastError!, mergedConfig.maxAttempts);
    return { 
      success: false, 
      error: lastError, 
      attempts: mergedConfig.maxAttempts 
    };
  };
}

// =============================================================================
// PRESET CONFIGS
// =============================================================================

/** Default retry configs for different services */
export const RETRY_CONFIGS = {
  vault: { enabled: true, maxAttempts: 3, delayMs: 1000, backoff: true },
  propertyMe: { enabled: true, maxAttempts: 3, delayMs: 1000, backoff: true },
  search: { enabled: true, maxAttempts: 2, delayMs: 500, backoff: true },
  cardData: { enabled: true, maxAttempts: 2, delayMs: 1000, backoff: true },
  notifications: { enabled: false, maxAttempts: 1, delayMs: 0, backoff: false },
} as const;

// =============================================================================
// HELPERS
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
