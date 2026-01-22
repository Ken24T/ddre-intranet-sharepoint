# Integrations

This folder contains **human-readable documentation** for external API integrations.

For machine-readable contracts (OpenAPI specs), see `contracts/`.

---

## Available Integrations

| Integration | Folder | Description |
|-------------|--------|-------------|
| AI RAG | `ai/` | OpenAI chatbot with RAG (query + feedback) |
| Vault CRM | `vault/` | Sales CRM – contacts, deals (full CRUD) |
| PropertyMe | `propertyme/` | Property management – properties, tenants (read-only) |

---

## Documentation Structure

Each integration folder contains:

| File | Purpose |
|------|---------|
| `overview.md` | Architecture, auth flow, permissions, rate limits |
| `endpoints.md` | Endpoint-by-endpoint usage guide with examples |
| `error-handling.md` | Error codes, retry strategies, client-side handling |

---

## Related Resources

| Resource | Location |
|----------|----------|
| OpenAPI Contracts | `contracts/<api>/openapi.yml` |
| TypeScript Clients | `packages/pkg-api-client/src/clients/` |
| Copilot Context | `.github/copilot-instructions/<api>-api.md` |

---

## Adding a New Integration

1. Create OpenAPI spec in `contracts/<api>/openapi.yml`
2. Create TypeScript client in `packages/pkg-api-client/src/clients/`
3. Add documentation here in `docs/integrations/<api>/`
4. Add Copilot context in `.github/copilot-instructions/<api>-api.md`
