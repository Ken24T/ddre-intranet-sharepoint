# PropertyMe API Integration – Overview

## What is PropertyMe?

PropertyMe is DDRE's property management system used by the PM team to manage:
- Properties (residential, commercial, industrial)
- Tenants and lease agreements
- Property owners
- Maintenance requests and work orders

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SPFx Web Part                            │
│   (PM Hub cards – e.g., PM Dashboard, Property Lookup)          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ SharePoint token
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Proxy Function                        │
│   - Validates SharePoint token                                   │
│   - Checks user permissions (SP groups → PM roles)               │
│   - Retrieves PropertyMe API key from Key Vault                  │
│   - Proxies request to PropertyMe API                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ PropertyMe API key
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PropertyMe API                              │
│   (External service – managed by PropertyMe)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Access Level

**Read-Only** – No create, update, or delete operations

| Operation | Supported | Notes |
|-----------|-----------|-------|
| List/Search | ✅ | Paginated results |
| Get by ID | ✅ | Single record |
| Dashboard summary | ✅ | Aggregated metrics |
| Create | ❌ | Not supported |
| Update | ❌ | Not supported |
| Delete | ❌ | Not supported |

## Authentication Flow

1. SPFx requests data using current user's SharePoint token
2. Azure proxy validates token and extracts user identity
3. Proxy maps SharePoint groups to PM permission levels
4. Proxy retrieves PropertyMe API key from Azure Key Vault
5. Proxy makes request to PropertyMe API with credentials
6. Response is returned to SPFx (no secrets exposed)

## Permissions

| SharePoint Group | PropertyMe Access |
|-----------------|-------------------|
| PM Team | Read all properties, tenants, owners |
| PM Managers | Read all + dashboard metrics |
| Others | No access (403) |

## Rate Limits

- **PropertyMe API:** 60 requests/minute per user
- **Azure proxy:** Implements rate limiting and retry logic

## Dashboard Summary

The `/dashboard/summary` endpoint provides pre-aggregated metrics:

| Metric | Description |
|--------|-------------|
| `totalProperties` | Total managed properties |
| `activeProperties` | Currently active rentals |
| `totalTenants` | All tenants |
| `occupancyRate` | Percentage occupied (0-100) |
| `openMaintenanceRequests` | Outstanding work orders |
| `rentCollectedThisMonth` | Rent received this month |
| `rentOutstandingThisMonth` | Overdue rent |

## Error Handling

See [error-handling.md](./error-handling.md) for error codes and retry strategies.

## See Also

- [OpenAPI Spec](../../../contracts/propertyme/openapi.yml)
- [Endpoint Reference](./endpoints.md)
- [PropertyMeClient](../../../packages/pkg-api-client/src/clients/PropertyMeClient.ts)
