# SPFx (Deployable Solutions)

This folder contains **all SharePoint Framework (SPFx) solutions** for the DDRE Intranet.

SPFx is used as the **delivery mechanism** for interactive intranet features (web parts and extensions). SharePoint Online remains the **experience layer**; any backend compute or secrets-based integrations are handled via approved platform services (Power Platform / Azure).

---

## Core Principles

- SPFx code runs **client-side** (in the browser).
- **No secrets** (API keys, tokens, connection strings) may exist in SPFx code or config.
- External APIs must be called via a **secure Azure proxy**.
- Web parts must be **configurable** and **tenant/environment safe**.

---

## Folder Strategy (Phase-aware)

### Phase 1: Intranet Core

Phase 1 ships foundation capabilities (not business apps).

- Primary SPFx solution: `intranet-core`
- Typical contents:
  - Dante Library (read-only Markdown rendering)
  - Optional AI assistant (knowledge Q&A only)
  - Shared intranet UX components

### Phase 2+: One Solution per App

From Phase 2 onward, each user-facing app should have:

- Its own SPFx solution folder (e.g. `app-marketing-budget`)
- Its own deployable package (`.sppkg`)
- Its own semantic version

This supports:

- Independent deployment and rollback
- Smaller blast radius
- Clear "what version is installed" audit trail

---

## Naming Conventions

- Solutions:
  - `intranet-core`
  - `app-<name>` (e.g. `app-marketing-budget`, `app-tenant-surveys`)

- Display names (package/web part) should be human-friendly and stable.

---

## Versioning Rules

Each SPFx solution is versioned independently.

Keep these in sync for every solution:

- `package.json` version
- `config/package-solution.json` version

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

## Quick Checklist for New SPFx Solutions

When creating a new SPFx solution, confirm the following before first deployment:

### Structure & Naming

- [ ] Solution folder created under `/spfx/<solution-name>`
- [ ] Solution name follows convention:
  - `intranet-core` **or**
  - `app-<app-name>` (lowercase, hyphenated)
- [ ] Solution purpose is documented in this README (brief paragraph)

### Versioning & Packaging

- [ ] `package.json` version updated
- [ ] `config/package-solution.json` version updated
- [ ] Versions match exactly
- [ ] Version bump follows semantic versioning rules

### Configuration & Environment Safety

- [ ] No hard-coded tenant URLs, site URLs, list IDs, or environment-specific values
- [ ] All configurable values exposed via web part properties or config files
- [ ] Solution is safe to deploy to Dev / Test / Prod tenants

### Security & Data Access

- [ ] No secrets, tokens, or keys in SPFx code or config
- [ ] All external APIs accessed via approved Azure proxy
- [ ] SharePoint permissions are respected (no custom auth logic)

### UX & Behaviour

- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented (user-visible, non-fatal)
- [ ] Fluent UI used consistently
- [ ] Accessibility basics met (keyboard, contrast, semantics)

### Quality & Hygiene

- [ ] Build succeeds locally (`gulp build` / `gulp bundle`)
- [ ] Package generates successfully (`gulp package-solution`)
- [ ] Console errors reviewed and resolved
- [ ] No unused files, sample code, or scaffolding left behind

### Documentation

- [ ] Solution purpose documented (what it does / who it's for)
- [ ] Any assumptions or constraints noted
- [ ] README updated if this introduces a new app or capability

This checklist is intentionally conservative. If any item is unclear, stop and document the decision before proceeding.
