# PropertyMe API – Copilot Instructions

> Include this file when working on PropertyMe integration features.

## Overview

PropertyMe is the Property Management CRM. Access is **read-only** via Azure proxy.

**Consumer:** PM hub cards and PM Dashboard
**Client:** `PropertyMeClient` from `@ddre/pkg-api-client`

## Key Files

| File | Purpose |
|------|---------|
| `contracts/propertyme/openapi.yml` | OpenAPI specification |
| `packages/pkg-api-client/src/clients/PropertyMeClient.ts` | TypeScript client |
| `docs/integrations/propertyme/` | Integration documentation |

## Entities

- **Property** – Rental property (`address`, `propertyType`, `bedrooms`, `status`, `rentAmount`)
- **Tenant** – Current/past tenant (`firstName`, `lastName`, `leaseStart`, `leaseEnd`)
- **Owner** – Property owner (`firstName`, `lastName`, `propertyCount`)
- **MaintenanceRequest** – Work order (`description`, `status`, `priority`)
- **DashboardSummary** – Aggregated metrics for PM Dashboard

## Usage Pattern

```typescript
import { PropertyMeClient } from '@ddre/pkg-api-client';

const pmClient = new PropertyMeClient({ baseUrl: environment.apiBaseUrl });

// List properties
const properties = await pmClient.listProperties({ 
  status: 'active',
  page: 1 
});

// Get dashboard summary
const summary = await pmClient.getDashboardSummary();

// Get tenant details
const tenant = await pmClient.getTenant('tenant-123');

// List maintenance by property
const maintenance = await pmClient.listMaintenance({ 
  propertyId: 'prop-456',
  status: 'open' 
});
```

## Error Handling

Always handle these errors gracefully:

| Error | User Message |
|-------|--------------|
| 403 Forbidden | "You don't have access to PM data." |
| 404 Not Found | "Property not found." |
| 429 Rate Limited | "Too many requests. Please wait." |
| 503 Unavailable | "PropertyMe is temporarily unavailable." |

## Dashboard Caching

Cache dashboard data for resilience:

```typescript
const CACHE_KEY = 'pm-dashboard-summary';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getDashboardWithCache(): Promise<DashboardSummary> {
  try {
    const data = await pmClient.getDashboardSummary();
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    return data;
  } catch (error) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
    throw error;
  }
}
```

## Permissions

Only users in **PM Team** or **PM Managers** SharePoint groups have access.

## Audit Logging

Log these events:
- `pm_dashboard_viewed` – When viewing PM Dashboard
- `pm_property_viewed` – When viewing a property
- `pm_tenant_viewed` – When viewing a tenant
- `pm_search_executed` – When searching properties

## UI Patterns

- Use metric cards with icons for dashboard summary
- Show occupancy as percentage with colour coding (green > 90%, yellow > 80%, red otherwise)
- Use status badges for maintenance priority (urgent = red, high = orange, etc.)
- Format currency as AUD with locale formatting
- Show lease expiry with countdown (e.g., "Expires in 45 days")

## Dashboard Widgets

Recommended widgets for PM Dashboard:

1. **Properties at a Glance** – Total, active, occupancy rate
2. **Rent Summary** – Collected vs outstanding this month
3. **Open Maintenance** – Count with priority breakdown
4. **Expiring Leases** – Leases ending in next 30/60/90 days
