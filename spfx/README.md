# SPFx (Deployable Solutions)

This folder contains **all SharePoint Framework (SPFx) solutions** for the DDRE Intranet.

SPFx is used as the **delivery mechanism** for interactive intranet features
(web parts and extensions). SharePoint Online remains the **experience layer**;
any backend compute or secrets-based integrations are handled via approved
platform services (Power Platform / Azure).

---

## Core Principles

- SPFx code runs **client-side** (in the browser).
- **No secrets** (API keys, tokens, connection strings) may exist in SPFx code or config.
- External APIs must be called via a **secure Azure proxy**.
- Web parts must be **configurable** and **tenant/environment safe**.

---

## Solution Strategy (Single Solution)

All web parts — the Intranet Shell and every business app — are bundled into
one SPFx solution: **`intranet-core`**.

- Primary SPFx solution: `intranet-core`
- Produces one `.sppkg` containing all web parts
- One `npm install`, one build, one deployment

Current web parts:

| Web Part | Purpose |
|----------|---------|
| `intranetShell` | Foundation layout (navbar, sidebar, content area, cards, status bar, Jasper AI) |
| `marketingBudget` | Marketing budget tracking and reporting |

Future web parts (planned):

| Web Part | App Definition |
|----------|----------------|
| `cognitoForms` | `apps/app-cognito-forms/` |
| `danteLibrary` | `apps/app-dante-library/` |
| `pmDashboard` | `apps/app-pm-dashboard/` |
| `qrCoder` | `apps/app-qrcoder/` |
| `surveys` | `apps/app-surveys/` |
| `vaultBatcher` | `apps/app-vault-batcher/` |

---

## Naming Conventions

- Solution: `intranet-core` (the single SPFx solution)
- Web part folders: `src/webparts/<camelCaseName>/` (e.g. `marketingBudget`, `qrCoder`)
- App definitions: `apps/app-<name>/` (lowercase, hyphenated — e.g. `app-marketing-budget`)
- Display names (in manifests) should be human-friendly and stable.

---

## Versioning Rules

There is one version for the entire solution — all web parts ship together.

Keep these in sync:

- `spfx/intranet-core/package.json` version
- `spfx/intranet-core/config/package-solution.json` version

Use semantic versioning:

- **PATCH**: bugfix / small improvement
- **MINOR**: new feature (non-breaking)
- **MAJOR**: breaking change (config changes, behaviour changes that require action)

---

## Environment & Tenant Safety

SPFx solutions must be safe across environments (Dev / Test / Prod).

Rules:

- Do not hard-code:
  - tenant URLs
  - site URLs
  - list IDs
  - API endpoints
- Use web part properties and configuration.
- Prefer environment-aware endpoint selection (config-driven).

---

## Build & Deployment Notes

Typical deployment flow:

1. Build and bundle solution
2. Package to `.sppkg`
3. Deploy to SharePoint App Catalog
4. Add app to site(s) and place web parts on pages

CI/CD may be introduced via GitHub Actions under `.github/workflows`.

---

## What Belongs Here (and what doesn't)

Belongs in `/spfx`:

- SPFx solutions (web parts/extensions)
- Solution-specific assets

Does **not** belong in `/spfx`:

- Business requirements and app documentation -> `/apps`
- Reusable, SharePoint-agnostic libraries -> `/packages`
- API schemas / contracts -> `/contracts`

---

## Quick Checklist for Adding a New Web Part (App)

When adding a new business app as a web part inside `intranet-core`:

### Structure & Naming

- [ ] Business requirements defined in `apps/app-<name>/`
- [ ] Web part folder created at `src/webparts/<camelCaseName>/`
- [ ] Folder includes: `<Name>WebPart.ts`, `<Name>WebPart.manifest.json`, `components/`, `loc/`
- [ ] Add `models/` and `services/` subfolders if needed
- [ ] Bundle entry added to `config/config.json`
- [ ] `<Name>WebPartStrings` localised resource registered in `config/config.json`

### Configuration & Environment Safety

- [ ] No hard-coded tenant URLs, site URLs, list IDs, or environment-specific values
- [ ] All configurable values exposed via web part properties or environment config
- [ ] Solution is safe to deploy to Dev / Test / Prod tenants

### Security & Data Access

- [ ] No secrets, tokens, or keys in SPFx code or config
- [ ] All external APIs accessed via approved Azure proxy
- [ ] SharePoint permissions are respected (no custom auth logic)
- [ ] Role resolution uses Entra ID groups (not custom auth)

### UX & Behaviour

- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented (user-visible, non-fatal)
- [ ] Fluent UI 8 used consistently
- [ ] Accessibility basics met (keyboard, contrast, semantics)

### Quality & Hygiene

- [ ] `npm run build` succeeds with zero errors and zero warnings
- [ ] `npm run test` passes (all tests across all web parts)
- [ ] `npm run lint` clean (zero-warnings policy)
- [ ] No unused files, sample code, or scaffolding left behind
- [ ] Files kept under ~300 lines; split by responsibility

### Documentation

- [ ] Web part purpose documented in the app-level README (`apps/app-<name>/`)
- [ ] Any assumptions or constraints noted
- [ ] PLAN.md updated with the new app's tasks

This checklist is intentionally conservative. If any item is unclear, stop and document the decision before proceeding.
