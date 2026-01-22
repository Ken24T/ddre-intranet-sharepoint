# Modular Copilot Instructions

This folder contains **API-specific context files** that can be referenced when working on particular integrations.

## Available Context Files

| File | When to Use |
|------|-------------|
| `vault-api.md` | Working on Vault CRM / Sales hub features |
| `propertyme-api.md` | Working on PropertyMe / PM Dashboard features |

## How to Use

Reference these files in your prompts when you need specific API context:

> "I'm working on the Vault contact lookup. See `.github/copilot-instructions/vault-api.md` for patterns."

Or include them as workspace context when starting a session focused on a particular integration.

## Structure

Each API instruction file contains:

1. **Overview** – What the API is and access level
2. **Key Files** – Where contracts, clients, and docs live
3. **Entities** – Main data types
4. **Usage Patterns** – Code examples
5. **Error Handling** – How to handle failures
6. **Permissions** – Who can access
7. **Audit Logging** – Events to log
8. **UI Patterns** – Recommended components

## Adding New APIs

When integrating a new external API:

1. Create OpenAPI spec in `contracts/<api-name>/openapi.yml`
2. Add TypeScript client in `packages/pkg-api-client/src/clients/`
3. Add docs in `docs/integrations/<api-name>/`
4. Add Copilot context in `.github/copilot-instructions/<api-name>-api.md`
