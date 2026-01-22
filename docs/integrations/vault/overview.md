# Vault API Integration – Overview

## What is Vault?

Vault is DDRE's Sales CRM system used by the sales team to manage:
- Contacts (people and organisations)
- Deals/opportunities with values and stages
- Sales pipeline tracking

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SPFx Web Part                            │
│   (Sales Hub cards – e.g., Contact Lookup, Deal Pipeline)       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ SharePoint token
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Proxy Function                        │
│   - Validates SharePoint token                                   │
│   - Checks user permissions (SP groups → Vault roles)            │
│   - Retrieves Vault API key from Key Vault                       │
│   - Proxies request to Vault API                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Vault API key
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Vault CRM API                            │
│   (External service – managed by Vault)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Access Level

**Full CRUD** – Create, Read, Update, Delete

| Operation | Supported | Notes |
|-----------|-----------|-------|
| List/Search | ✅ | Paginated results |
| Get by ID | ✅ | Single record |
| Create | ✅ | Validation enforced |
| Update | ✅ | Partial updates |
| Delete | ✅ | Soft delete where applicable |

## Authentication Flow

1. SPFx requests data using current user's SharePoint token
2. Azure proxy validates token and extracts user identity
3. Proxy maps SharePoint groups to Vault permission levels
4. Proxy retrieves Vault API key from Azure Key Vault
5. Proxy makes request to Vault API with credentials
6. Response is returned to SPFx (no secrets exposed)

## Permissions

| SharePoint Group | Vault Access |
|-----------------|--------------|
| Sales Team | Full CRUD on own contacts/deals |
| Sales Managers | Full CRUD on all contacts/deals |
| Others | No access (403) |

## Rate Limits

- **Vault API:** 100 requests/minute per user
- **Azure proxy:** Implements rate limiting and retry logic

## Error Handling

See [error-handling.md](./error-handling.md) for error codes and retry strategies.

## See Also

- [OpenAPI Spec](../../../contracts/vault/openapi.yml)
- [Endpoint Reference](./endpoints.md)
- [VaultClient](../../../packages/pkg-api-client/src/clients/VaultClient.ts)
