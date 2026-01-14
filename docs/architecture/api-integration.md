# API Integration Architecture

This document describes how SPFx solutions integrate with external APIs securely.

## Core Principle: No Secrets in SPFx

**SPFx code runs in the browser. Never embed API keys, tokens, or secrets.**

All external API calls go through Azure proxy services that:
1. Authenticate the user via SharePoint/Entra ID token
2. Add API credentials from Azure Key Vault
3. Forward requests to the target API
4. Return responses to SPFx

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SPFx Web Part │────▶│  Azure Proxy    │────▶│  External API   │
│   (Browser)     │     │  (Functions)    │     │  (OpenAI, etc.) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │ SharePoint            │ API Key from
        │ Access Token          │ Key Vault
        ▼                       ▼
   User Identity           Secure Credentials
```

## Available APIs

| API | Proxy Path | Capabilities | Consumer |
|-----|------------|--------------|----------|
| OpenAI (RAG) | `/api/v1/ai/*` | Query, Feedback | intranet-core |
| Vault CRM | `/api/v1/vault/*` | Full CRUD | Sales apps |
| PropertyMe | `/api/v1/propertyme/*` | Read-only | PM Dashboard |

## Authentication Flow

1. **User signs in** to SharePoint via Entra ID SSO
2. **SPFx web part** acquires access token using `this.context.aadHttpClientFactory`
3. **Request to proxy** includes `Authorization: Bearer <token>`
4. **Proxy validates** token with Entra ID
5. **Proxy adds** API credentials from Key Vault
6. **External API** receives authenticated request
7. **Response flows** back through proxy to SPFx

## API Contracts

OpenAPI specifications for each proxy are in `/contracts`:

- `ai-rag-proxy.openapi.yml` — OpenAI/RAG chatbot
- `vault-api-proxy.openapi.yml` — Vault Sales CRM
- `propertyme-api-proxy.openapi.yml` — PropertyMe (read-only)

These contracts define:
- Available endpoints
- Request/response schemas
- Error codes
- Pagination patterns

## Shared API Client Package

Use `@ddre/pkg-api-client` for type-safe API calls:

```typescript
import { createAiClient, createVaultClient } from '@ddre/pkg-api-client';

// In your web part
const aiClient = createAiClient(this.context);
const response = await aiClient.query({ question: "What is our leave policy?" });
```

## Environment-Specific URLs

API base URLs vary by environment. Get the correct URL from environment config:

```typescript
import devConfig from '../config/environments/dev.json';
// Use devConfig.apiProxyBaseUrl
```

Or detect at runtime based on `this.context.pageContext.web.absoluteUrl`.

## Error Handling

All proxies return consistent error shapes:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { }
  }
}
```

Common HTTP status codes:
- `401` — Unauthorized (token invalid/expired)
- `403` — Forbidden (user lacks permission)
- `404` — Resource not found
- `429` — Rate limit exceeded
- `500` — Internal server error

## Rate Limiting

Proxies may enforce rate limits. Handle `429` responses by:
1. Showing user-friendly message
2. Implementing exponential backoff for retries
3. Caching responses where appropriate

## Security Checklist

- [ ] Never log tokens or credentials
- [ ] Validate all user inputs before sending to proxy
- [ ] Handle errors gracefully (don't expose internal details)
- [ ] Use HTTPS only (enforced by SharePoint)
- [ ] Respect user permissions (proxy enforces, UI should hide inaccessible features)
