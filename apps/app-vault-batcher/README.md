# Vault Batcher

> **Hub:** Sales · **Status:** Planning · **Web Part:** `vaultBatcher`

## Overview

Batch operations for Vault CRM data. Provides sales staff with tools to perform bulk updates, uploads, and data management tasks against the Vault CRM system.

## Intended Use

- Batch upload of CRM records (contacts, properties, etc.)
- Bulk update operations (status changes, field updates)
- Data validation and error reporting for batch operations
- Progress tracking for long-running batch jobs

## Key Requirements

- CSV/Excel file upload for batch data input
- Preview and validation before execution
- Progress tracking with success/failure counts
- Error reporting with row-level detail
- Undo/rollback capability where possible

## Data & Integration

- **Source:** Vault CRM API (via Azure proxy)
- **Client:** `pkg-api-client` → `VaultClient`
- **Authentication:** Azure proxy handles Vault API credentials; SPFx uses Entra ID auth to the proxy
- **Input:** CSV/Excel file uploads from the user

## Notes

- All Vault API calls go through the Azure proxy — no API keys in SPFx
- Batch operations should be idempotent where possible
- Consider rate limiting and chunked processing for large batches
- Clear error messages are critical for user confidence in batch operations

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/vaultBatcher/` _(not yet created)_
- API contract: `contracts/vault-api-proxy.openapi.yml`
- API client: `packages/pkg-api-client/src/clients/VaultClient.ts`
- Plan: See `PLAN.md` § app-vault-batcher
