# Vault API Contracts

This folder contains API specifications for the **Vault CRM** (VaultRE) integration.

## Overview

Vault is the Sales CRM used by DDRE for managing contacts, properties, and sales pipeline.

| Item | Value |
|------|-------|
| **Upstream API** | VaultRE API v1.3 |
| **Base URL** | `https://ap-southeast-2.api.vaultre.com.au/api/v1.3` |
| **Swagger Docs** | https://docs.api.vaultre.com.au/swagger/index.html |
| **Auth** | API Key + Bearer Token (server-side only) |

## Files

| File | Purpose |
|------|---------|
| `openapi.yml` | **DDRE Proxy Spec** – Simplified API our Azure proxy exposes to SPFx |
| `vaultre-upstream.yaml` | **VaultRE Official Spec** – Complete upstream API (26k lines, reference only) |
| `schemas/contact.json` | Full Contact entity schema from VaultRE |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   SPFx      │────▶│  Azure Proxy     │────▶│   VaultRE API   │
│  (browser)  │     │  (our spec)      │     │  (upstream)     │
└─────────────┘     └──────────────────┘     └─────────────────┘
     │                      │                        │
     ▼                      ▼                        ▼
 No secrets          Adds API Key            Full CRM access
 SharePoint auth     Permission check        26k+ endpoints
```

## Which Spec to Use?

- **Building SPFx components?** → Use `openapi.yml` (our proxy)
- **Building the Azure proxy?** → Reference `vaultre-upstream.yaml` (upstream)
- **Debugging API issues?** → Check both specs

## Priority Endpoints (Phase 1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/vault/health` | GET | Health check |
| `/api/v1/vault/contacts` | GET, POST | List/create contacts |
| `/api/v1/vault/contacts/{id}` | GET, PUT, DELETE | Contact CRUD |
| `/api/v1/vault/contacts/{id}/notes` | GET, POST | Contact notes |
| `/api/v1/vault/properties/sale` | GET | Active sales listings |
| `/api/v1/vault/properties/{id}` | GET | Property details |
| `/api/v1/vault/search` | GET | Cross-entity search |

## Key Entities

- **Contact** – Person or organisation in the CRM (see `schemas/contact.json`)
- **Property** – Listing with sale/lease lifecycle
- **Deal** – Sales opportunity with value and stage

## See Also

- [Vault Integration Docs](../../docs/integrations/vault/)
- [Vault Detailed Guide](../../.github/copilot-instructions/vault-api-detailed.md)
- [VaultClient TypeScript](../../packages/pkg-api-client/src/clients/VaultClient.ts)
