# Vault API Contracts

This folder contains contracts for the **Vault CRM API** integration.

## Overview

Vault is the Sales CRM used by DDRE for managing contacts, deals, and sales opportunities.

**Access Level:** Full CRUD (Create, Read, Update, Delete)
**Consumer:** Sales hub applications
**Authentication:** SharePoint token → Azure proxy → Vault API

## Files

| File | Description |
|------|-------------|
| `openapi.yml` | OpenAPI 3.0 specification for the proxy API |
| `data-models.schema.json` | JSON Schema for data entities (future) |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/vault/health` | GET | Health check |
| `/api/v1/vault/contacts` | GET, POST | List/create contacts |
| `/api/v1/vault/contacts/{id}` | GET, PUT, DELETE | Contact CRUD |
| `/api/v1/vault/deals` | GET | List deals/opportunities |

## Key Entities

- **Contact** – Person or organisation in the CRM
- **Deal** – Sales opportunity with value and stage

## See Also

- [Vault integration docs](../../docs/integrations/vault/)
- [VaultClient TypeScript](../../packages/pkg-api-client/src/clients/VaultClient.ts)
