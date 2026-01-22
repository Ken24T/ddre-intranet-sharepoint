import * as React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ApiStatus = 'healthy' | 'degraded' | 'unhealthy' | 'checking' | 'unknown';

export interface IApiHealthState {
  status: ApiStatus;
  lastChecked: Date | undefined;
  responseTimeMs: number | undefined;
  error: string | undefined;
}

export interface IApiHealthResult {
  vault: IApiHealthState;
  propertyMe: IApiHealthState;
  jasper: IApiHealthState;
  checkHealth: () => Promise<void>;
  isChecking: boolean;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialApiState: IApiHealthState = {
  status: 'unknown',
  lastChecked: undefined,
  responseTimeMs: undefined,
  error: undefined,
};

// =============================================================================
// MOCK HEALTH CHECK (for Vite dev harness)
// =============================================================================

/**
 * Simulate API health check with random latency and occasional failures.
 * Used when running outside SharePoint (no SPFx context).
 */
async function mockHealthCheck(apiName: string): Promise<IApiHealthState> {
  const startTime = performance.now();
  
  // Simulate network latency (50-500ms)
  const latency = Math.floor(Math.random() * 450) + 50;
  await new Promise(resolve => setTimeout(resolve, latency));
  
  const responseTimeMs = Math.round(performance.now() - startTime);
  const lastChecked = new Date();
  
  // 80% healthy, 10% degraded, 10% unhealthy
  const roll = Math.random();
  if (roll < 0.8) {
    return { status: 'healthy', lastChecked, responseTimeMs, error: undefined };
  } else if (roll < 0.9) {
    return { status: 'degraded', lastChecked, responseTimeMs, error: `${apiName} responding slowly` };
  } else {
    return { status: 'unhealthy', lastChecked, responseTimeMs: undefined, error: `${apiName} connection failed` };
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for monitoring API health status.
 * 
 * In the Vite dev harness (no SPFx context), uses mock data.
 * In SharePoint, will use real API clients.
 * 
 * @param context - Optional SPFx WebPartContext (undefined in dev harness)
 */
export function useApiHealth(context?: unknown): IApiHealthResult {
  const [vault, setVault] = React.useState<IApiHealthState>(initialApiState);
  const [propertyMe, setPropertyMe] = React.useState<IApiHealthState>(initialApiState);
  const [jasper, setJasper] = React.useState<IApiHealthState>(initialApiState);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkHealth = React.useCallback(async () => {
    setIsChecking(true);
    setVault(prev => ({ ...prev, status: 'checking' }));
    setPropertyMe(prev => ({ ...prev, status: 'checking' }));
    setJasper(prev => ({ ...prev, status: 'checking' }));

    try {
      if (context) {
        // Real SPFx context - use actual API clients
        // TODO: Implement when pkg-api-client is integrated into SPFx solution
        // const vaultClient = new VaultClient({ context });
        // const propertyMeClient = new PropertyMeClient({ context });
        // const aiClient = new AiClient({ context });
        // const [vaultResult, propertyMeResult, jasperResult] = await Promise.all([
        //   vaultClient.health(),
        //   propertyMeClient.health(),
        //   aiClient.health(),
        // ]);
        
        // For now, use mock in all cases
        const [vaultResult, propertyMeResult, jasperResult] = await Promise.all([
          mockHealthCheck('Vault'),
          mockHealthCheck('PropertyMe'),
          mockHealthCheck('Jasper'),
        ]);
        setVault(vaultResult);
        setPropertyMe(propertyMeResult);
        setJasper(jasperResult);
      } else {
        // Dev harness - use mock data
        const [vaultResult, propertyMeResult, jasperResult] = await Promise.all([
          mockHealthCheck('Vault'),
          mockHealthCheck('PropertyMe'),
          mockHealthCheck('Jasper'),
        ]);
        setVault(vaultResult);
        setPropertyMe(propertyMeResult);
        setJasper(jasperResult);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setVault({ status: 'unhealthy', lastChecked: new Date(), responseTimeMs: undefined, error: errorMessage });
      setPropertyMe({ status: 'unhealthy', lastChecked: new Date(), responseTimeMs: undefined, error: errorMessage });
      setJasper({ status: 'unhealthy', lastChecked: new Date(), responseTimeMs: undefined, error: errorMessage });
    } finally {
      setIsChecking(false);
    }
  }, [context]);

  // Check health on mount
  React.useEffect(() => {
    checkHealth().catch(console.error);
  }, [checkHealth]);

  return { vault, propertyMe, jasper, checkHealth, isChecking };
}
