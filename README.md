# DDRE Intranet (SharePoint Monorepo)

This repository contains the **DDRE Intranet** built on **SharePoint Online** using **SharePoint Framework (SPFx)** with **TypeScript + React**.

The intranet is:

- Hosted in SharePoint Online (Modern Experience)
- Authenticated via Microsoft Entra ID (SSO)
- Extended via SPFx web parts (client-side)
- Integrated with Azure backend services via secure proxies (no secrets in browser code)

Primary developer: **Ken Boyle**

---

## Repo Structure

This is a **monorepo**: one Git history, one set of repo standards, multiple deliverables.

```
.
|-- spfx/         # SPFx solution (intranet-core — single .sppkg with all web parts)
|-- apps/         # User-facing tool definitions (business context, no code)
|-- packages/     # Shared TypeScript libraries (reusable building blocks)
|-- contracts/    # API schemas/contracts (interfaces, OpenAPI, JSON schemas)
|-- docs/         # Architecture notes, runbooks, decisions
|-- scripts/      # Dev and validation scripts
`-- .github/      # CI/CD workflows (when enabled)
```

**Important:** do not add nested `.git` folders under `/apps` or anywhere else.

---

## Delivery Model (Single Solution)

### Foundation (Intranet Shell)

The Intranet Shell provides the foundation layout frame: navbar, sidebar,
content area, card grid, status bar, Jasper AI assistant, and Help Centre.

### Business Apps (Web Parts)

Every business app is delivered as a **web part inside `intranet-core`**:

- One SPFx solution, one `.sppkg`, one deployment
- `/apps/app-<name>/` defines the business requirements (no code)
- `spfx/intranet-core/src/webparts/<camelCaseName>/` contains the implementation
- `config/config.json` registers each web part's bundle and localised resources

| App | Hub | Web Part | Status |
|-----|-----|----------|--------|
| Marketing Budget | Administration | `marketingBudget` | Active |
| Cognito Forms | Administration | `cognitoForms` | Planning |
| Dante Library | Office | `danteLibrary` | Planning |
| PM Dashboard | Property Management | `pmDashboard` | Planning |
| QR Coder | Office | `qrCoder` | Planning |
| Surveys | Administration | `surveys` | Planning |
| Vault Batcher | Sales | `vaultBatcher` | Planning |

To add a new app:
1. Define requirements in `apps/app-<name>/`
2. Create web part at `spfx/intranet-core/src/webparts/<camelCaseName>/`
3. Register in `config/config.json`
4. `npm run test` → `npm run build` → deploy single `.sppkg`

---

## Versioning

- **Git**: one history (monorepo). Tags represent what was deployed.
- **SPFx**: one solution version for `intranet-core` (all web parts ship together).
  - Keep versions in sync across `package.json` and `config/package-solution.json`.

---

## Environment & Tenant Assumptions

- Treat the system as **environment-aware** (Dev / Test / Prod tenants or equivalent separation).
- Do not hard-code tenant URLs, site URLs, list IDs, or environment-specific endpoints.
- All external integrations must use an **Azure proxy** with secrets stored securely (e.g., Key Vault).

---

## Developer Principles

- SharePoint is the **experience layer**, not a general-purpose application server.
- Security is group-based and least-privilege by default.
- Prefer Microsoft 365 native capabilities first (SharePoint, Power Platform, Graph, etc.).
- Build for maintainability and audits (clear code, clear docs, predictable releases).

See: `.github/copilot_instructions.md` for detailed coding and governance rules.

---

## Where to Start

- Want to work on SPFx deliverables? Start in: `/spfx`
- Defining a new tool/app (requirements, UX, data model)? Start in: `/apps`
- Adding reusable shared code? Start in: `/packages`
- Working with API definitions? Start in: `/contracts`

---

## Quick Notes

- This repo intentionally avoids clever build magic early on.
- Keep docs short and current; prefer adding a README over tribal knowledge.
- If something feels ambiguous, write it down in `/docs` before it becomes folklore.
