# Contracts (Interfaces & Schemas)

This folder contains **formal contracts** that define how the DDRE Intranet integrates with external or backend systems.

Contracts act as **stable boundaries** between front-end SPFx solutions and backend services (e.g. Azure Functions, APIs managed by Grey Fox).

They exist to reduce ambiguity, support parallel work, and make integrations auditable.

---

## What a Contract Is

A contract is a **machine-readable definition** of an interface, such as:

- API request / response schemas
- JSON payload shapes
- OpenAPI (Swagger) specifications
- Event or message schemas

Contracts describe **what is exchanged**, not **how it is implemented**.

---

## What Belongs in `/contracts`

Appropriate content includes:

- OpenAPI / Swagger files (`.yaml`, `.json`)
- JSON Schema definitions
- Example request / response payloads
- Versioned interface definitions

Examples:

- CRM lookup API schema
- AI proxy request/response shape
- Maintenance request submission payload

---

## What Does *Not* Belong Here

Do **not** place the following in `/contracts`:

- SPFx code or API client implementations
- Secrets, keys, or tokens
- Business logic
- Environment-specific configuration

Contracts must remain **clean, portable, and safe to share**.

---

## Folder Structure

Contracts are organised by API/system:

```
/contracts
  /ai                           # AI RAG (OpenAI chatbot)
    openapi.yml                 # OpenAPI specification
    README.md                   # API overview
  /vault                        # Vault CRM (Sales)
    openapi.yml
    README.md
  /propertyme                   # PropertyMe (PM Dashboard)
    openapi.yml
    README.md
  audit-log-proxy.openapi.yml   # Audit logging
  tasks-api-proxy.openapi.yml   # User tasks
```

---

## Available API Proxy Contracts

| Contract | Location | Capabilities | Consumer |
|----------|----------|--------------|----------|
| AI RAG (OpenAI) | `ai/openapi.yml` | Query, Feedback | AI Assistant |
| Vault CRM | `vault/openapi.yml` | Full CRUD | Sales hub apps |
| PropertyMe | `propertyme/openapi.yml` | Read-only | PM Dashboard |
| Audit Log | `audit-log-proxy.openapi.yml` | Write, Query | Audit system |
| Tasks | `tasks-api-proxy.openapi.yml` | Full CRUD | Task system |

All proxies:
- Are hosted in Azure (Functions/App Service)
- Store API keys in Azure Key Vault
- Authenticate users via SharePoint/Entra ID tokens
- Follow consistent error response patterns

See `/docs/architecture/api-integration.md` for the full architecture.

---

## Related Documentation

| API | Documentation |
|-----|---------------|
| Vault | `docs/integrations/vault/` |
| PropertyMe | `docs/integrations/propertyme/` |

---

## Versioning & Change Management

- Contracts should be versioned explicitly (folder name or file header)
- Breaking changes must be intentional and documented
- Front-end and backend changes should be coordinated against the same contract version

A contract change is a **coordination event**, not a casual refactor.

---

## Vendor Boundary (Grey Fox)

Where backend services are delivered by a third-party vendor:

- Contracts in this folder represent the **agreed interface**
- Changes require explicit agreement
- Contracts are the source of truth during delivery, testing, and support

This helps avoid undocumented drift between teams.

---

## Usage Guidance

- SPFx solutions should consume contracts conceptually, not re-define schemas ad-hoc
- API clients may reference contracts during development or testing
- Keep example payloads realistic but anonymised

---

## When Unsure

If you're unsure whether something belongs in `/contracts`:

- If it defines a boundary between systems, it belongs here
- If it executes logic, it does not
