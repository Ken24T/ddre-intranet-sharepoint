# Vault API – Detailed Integration Guide

> Include this file when implementing Vault CRM integration features.

## VaultRE API Overview

**Vault** is the Sales CRM used by DDRE for managing contacts, properties, and sales pipeline.

| Item | Value |
|------|-------|
| **Upstream API** | VaultRE API v1.3 |
| **Base URL** | `https://ap-southeast-2.api.vaultre.com.au/api/v1.3` |
| **Swagger Docs** | https://docs.api.vaultre.com.au/swagger/index.html |
| **Auth** | API Key + Bearer Token (server-side only) |
| **Azure Proxy** | `https://api.dougdisher.com.au/api/v1/vault/` |

## Authentication

VaultRE uses two authentication mechanisms:

```http
Api-Key: {VAULTRE_API_KEY}
Authorization: Bearer {token}
```

**CRITICAL:** These credentials are **never exposed to SPFx**. The Azure proxy:
1. Receives requests from SPFx with SharePoint auth token
2. Validates user permissions via SharePoint groups
3. Adds VaultRE credentials from Azure Key Vault
4. Forwards to VaultRE API
5. Returns response to SPFx

## Priority Endpoints for DDRE Intranet

### Phase 1 – Core Sales Hub

| Endpoint | Method | Use Case |
|----------|--------|----------|
| `/contacts` | GET | List/search contacts |
| `/contacts/{id}` | GET | Contact details |
| `/contacts` | POST | Create contact |
| `/contacts/{id}` | PUT | Update contact |
| `/contacts/{id}/notes` | GET/POST | Contact notes |
| `/properties/sale` | GET | Active sales listings |
| `/properties/{id}` | GET | Property details |
| `/search` | GET | Cross-entity search |

### Phase 2 – Extended Features

| Endpoint | Method | Use Case |
|----------|--------|----------|
| `/calendar` | GET | Agent appointments |
| `/tasks` | GET/POST | To-do items |
| `/deals` | GET | Sales pipeline |
| `/properties/{id}/feedback` | GET | Buyer feedback |
| `/contacts/{id}/requirements` | GET | Buyer requirements |

## Contact Entity Schema

The full Contact schema is complex with nested objects. Key fields:

```typescript
interface VaultContact {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  displayName: string;
  company: string;
  position: string;
  emails: string[];
  phoneNumbers: VaultPhoneNumber[];
  address: VaultAddress;
  postalAddress: VaultAddress;
  archived: boolean;
  inserted: string; // ISO date
  modified: string; // ISO date
  marketingUsers: VaultMarketingUser[];
  entityType: { id: number; name: string };
  unsubscribe: {
    email: boolean;
    sms: boolean;
    letters: boolean;
  };
}

interface VaultPhoneNumber {
  number: string;
  typeCode: 'H' | 'W' | 'M' | 'F'; // Home, Work, Mobile, Fax
  type: string;
  comment: string;
}

interface VaultAddress {
  level: string;
  unitNumber: string;
  streetNumber: string;
  street: string;
  suburb: {
    id: number;
    name: string;
    postcode: string;
    state: { id: number; name: string; abbreviation: string };
  };
  state: { id: number; name: string; abbreviation: string };
  country: { id: number; name: string; isocode: string };
}
```

## Property Entity

Properties have multiple life cycles (sale/lease) and types:

| Property Type | Tag |
|---------------|-----|
| Residential | `residentialProperties` |
| Rural | `ruralProperties` |
| Commercial | `commercialProperties` |
| Land | `landProperties` |
| Business | `businessProperties` |

## Query Parameters

VaultRE uses consistent pagination:

| Parameter | Type | Description |
|-----------|------|-------------|
| `$top` | int | Number of records (default 20, max 100) |
| `$skip` | int | Records to skip for pagination |
| `$orderby` | string | Sort field and direction |
| `$filter` | string | OData filter expression |

Example:
```
GET /contacts?$top=20&$skip=40&$orderby=lastName&$filter=archived eq false
```

## Error Handling

VaultRE returns standard HTTP status codes:

| Code | Meaning | Proxy Response |
|------|---------|----------------|
| 200 | Success | Pass through |
| 400 | Bad request | Return validation errors |
| 401 | API key invalid | Return 500 (config error) |
| 403 | Forbidden | Return 403 with message |
| 404 | Not found | Return 404 |
| 429 | Rate limited | Return 429 with retry-after |
| 500 | Server error | Return 502 Bad Gateway |

## Rate Limiting

VaultRE has rate limits (exact values not documented). Implement:
- Exponential backoff on 429 responses
- Cache frequently accessed data (contacts, property lists)
- Batch operations where possible

## Reference Files

| File | Purpose |
|------|---------|
| `contracts/vault/vaultre-upstream.yaml` | Official VaultRE OpenAPI spec (26k lines) |
| `contracts/vault/schemas/contact.json` | Full Contact entity schema |
| `contracts/vault/openapi.yml` | DDRE proxy spec (our subset) |
| `packages/pkg-api-client/src/clients/VaultClient.ts` | TypeScript client |

## Implementation Notes

1. **Proxy Design:** Our Azure proxy exposes a simplified subset of VaultRE endpoints
2. **Field Mapping:** Flatten nested structures where sensible for SPFx consumption
3. **Search:** Use VaultRE's `/search` for cross-entity queries
4. **Caching:** Cache reference data (suburbs, states, categories) aggressively
5. **Audit:** Log all CRM access for compliance

## Testing

For local development, the proxy returns mock data. Set in environment config:

```json
{
  "vaultApiMode": "mock"
}
```

For integration testing, use test environment credentials configured in Azure Key Vault.
