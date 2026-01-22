# PropertyMe API Contracts

This folder contains contracts for the **PropertyMe** property management API integration.

## Overview

PropertyMe is the property management CRM used by DDRE for managing properties, tenants, owners, and maintenance.

**Access Level:** Read-only
**Consumer:** PM Dashboard application
**Authentication:** SharePoint token → Azure proxy → PropertyMe API

## Files

| File | Description |
|------|-------------|
| `openapi.yml` | OpenAPI 3.0 specification for the proxy API |
| `data-models.schema.json` | JSON Schema for data entities (future) |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/propertyme/health` | GET | Health check |
| `/api/v1/propertyme/properties` | GET | List properties |
| `/api/v1/propertyme/properties/{id}` | GET | Get property details |
| `/api/v1/propertyme/tenants` | GET | List tenants |
| `/api/v1/propertyme/tenants/{id}` | GET | Get tenant details |
| `/api/v1/propertyme/owners` | GET | List property owners |
| `/api/v1/propertyme/owners/{id}` | GET | Get owner details |
| `/api/v1/propertyme/maintenance` | GET | List maintenance requests |
| `/api/v1/propertyme/dashboard/summary` | GET | Dashboard aggregate metrics |

## Key Entities

- **Property** – Rental property with address, type, and status
- **Tenant** – Current or past tenant with lease details
- **Owner** – Property owner with contact info
- **MaintenanceRequest** – Work order with status and priority
- **DashboardSummary** – Aggregated metrics for the PM Dashboard

## See Also

- [PropertyMe integration docs](../../docs/integrations/propertyme/)
- [PropertyMeClient TypeScript](../../packages/pkg-api-client/src/clients/PropertyMeClient.ts)
