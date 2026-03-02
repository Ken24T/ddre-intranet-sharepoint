# PM Dashboard

> **Hub:** Property Management · **Status:** Planning · **Web Part:** `pmDashboard`

## Overview

PropertyMe data visualisation dashboard. Provides property management staff with at-a-glance views of key property, tenant, and maintenance data sourced from PropertyMe.

## Intended Use

- Property portfolio overview
- Tenant information summaries
- Maintenance request tracking and status
- Key performance indicators for property management operations

## Key Requirements

- Dashboard layout with configurable widgets
- Real-time (or near-real-time) data from PropertyMe API
- Responsive design for desktop and tablet use
- Role-based access (property managers, administrators)

## Data & Integration

- **Source:** PropertyMe API (via Azure proxy)
- **Client:** `pkg-api-client` → `PropertyMeClient`
- **Authentication:** Azure proxy handles PropertyMe API credentials; SPFx uses Entra ID auth to the proxy

## Notes

- All PropertyMe API calls go through the Azure proxy — no API keys in SPFx
- Dashboard widgets should handle loading, empty, and error states
- Consider caching strategies for frequently accessed data

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/pmDashboard/` _(not yet created)_
- API contract: `contracts/propertyme-api-proxy.openapi.yml`
- API client: `packages/pkg-api-client/src/clients/PropertyMeClient.ts`
- Plan: See `PLAN.md` § app-pm-dashboard
