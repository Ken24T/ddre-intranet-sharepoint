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
|-- spfx/         # SPFx solutions (deployable .sppkg packages)
|-- apps/         # User-facing tool definitions (business context)
|-- packages/     # Shared TypeScript libraries (reusable building blocks)
|-- contracts/    # API schemas/contracts (interfaces, OpenAPI, JSON schemas)
|-- docs/         # Architecture notes, runbooks, decisions
|-- scripts/      # Dev and validation scripts
`-- .github/      # CI/CD workflows (when enabled)
```

**Important:** do not add nested `.git` folders under `/apps` or anywhere else.

---

## Phase-Aware Delivery Model

### Phase 1: Foundation

Phase 1 ships **intranet foundation features**, not business apps.

Typical Phase 1 deliverables:

- Intranet core navigation and UX shell
- **Dante Library** (read-only Markdown rendering from SharePoint)
- Optional AI assistant (knowledge Q&A only, read-only)

Implementation:

- One SPFx solution under `/spfx` (typically `intranet-core`)

### Phase 2+: Apps

From Phase 2 onward, each user-facing app is delivered as:

- A dedicated SPFx solution (its own `.sppkg`)
- Its own semantic version
- Independently deployable via the SharePoint App Catalog

---

## Versioning

- **Git**: one history (monorepo). Tags represent what was deployed.
- **SPFx**: each SPFx solution has its own version.
  - Keep versions in sync across `package.json` and `config/package-solution.json`.

Guiding idea:

- In Phase 1, you mostly track the **intranet-core** solution version.
- In Phase 2+, you track **per-app** SPFx solution versions.

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
