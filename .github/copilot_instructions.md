# DDRE Intranet – GitHub Copilot Instructions

## Project Context

This repository contains the **DDRE Intranet** built on **SharePoint Online** using **SharePoint Framework (SPFx)** with **TypeScript and React**.

The intranet is:

- Hosted in SharePoint Online
- Authenticated via Microsoft Entra ID (SSO)
- Extended using SPFx web parts
- Integrated with Azure backend services via secure proxies

The repository is a **monorepo** containing:

- **Intranet core SPFx solutions** (navigation, Dante Library, AI assistant)
- **User-facing apps** (introduced from Phase 2 onward)
- **Shared packages** (UI, SharePoint helpers, AI client)

The primary developer is **Ken Boyle**.

---

## Architectural Principles (Always Follow)

- SharePoint Online is an **experience layer**, not an application server
- All custom UI is implemented via **SPFx (client-side only)**
- No secrets, API keys, or tokens are ever embedded in front-end code
- Access control is **group-based and additive**
- Reuse Microsoft 365 platform services before inventing custom solutions
- Prefer clarity, stability, and auditability over clever abstractions

---

## Repository & Monorepo Structure

This is a **single Git repository** with one source of truth.

### Folder Intent

- `/spfx`
  - All SPFx solutions live here
  - Multiple SPFx solutions are expected over time
  - Phase 1: intranet-core solution only
  - Phase 2+: one SPFx solution per app

- `/apps`
  - Conceptual definition of user-facing tools
  - Business context, documentation, requirements, and app-level metadata
  - **No `.git` folders inside apps** (monorepo only)

- `/packages`
  - Shared, reusable TypeScript libraries
  - No SharePoint or business assumptions

- `/scripts`
  - Dev, validation, and automation scripts

- `/docs`
  - Architecture decisions, governance notes, runbooks

- `/contracts`
  - API contracts, schemas, interface definitions

---

## Phase-Aware SPFx Strategy

### Phase 1 (Foundation)

- No business "apps" are shipped
- One SPFx solution: **intranet-core**
- Delivers:
  - Site-wide navigation UX
  - Dante Library (read-only Markdown rendering)
  - Optional AI assistant (knowledge Q&A only)

**Versioning:**
- One SPFx solution version
- Repo tags map directly to deployed intranet versions

### Phase 2+ (Apps)

- Each user-facing app has:
  - Its own SPFx solution
  - Its own `.sppkg`
  - Its own semantic version

- Apps are deployed independently via the App Catalog

This enables:
- Independent release cadence
- Smaller blast radius
- Clear audit and rollback story

---

## Versioning & Release Model

### Git (Monorepo)

- One Git history
- No nested repositories or submodules
- Tags represent **what was deployed**

### SPFx Versioning

- Each SPFx solution has its own version
- Version must be kept in sync across:
  - `package.json`
  - `config/package-solution.json`

### App Versioning

- From Phase 2 onward, each app:
  - Has its own SPFx solution version
  - May also carry lightweight app metadata (e.g. `/apps/app-x/app.json`)

---

## Technology Stack

When generating code, prefer:

- **TypeScript** (strict typing)
- **React functional components** with hooks
- **Fluent UI** components
- **PnPjs** for SharePoint / Graph access
- **SPFx best practices** (no deprecated APIs)

Avoid:

- Plain JavaScript
- Inline scripts or global CSS
- Direct DOM manipulation
- Hard-coded tenant URLs

---

## SPFx Coding Guidelines

- Web parts must be reusable and configurable
- Use web part properties for site/list IDs
- Respect SharePoint permissions (never re-implement auth)
- Handle loading, empty, and error states explicitly
- Log errors meaningfully (console + optional telemetry hook)

---

## Tenant & Environment Rules

- Assume **Dev / Test / Prod** environments exist (or will exist)
- Do not hard-code environment-specific values
- Use configuration and environment-aware endpoints
- SPFx packages must be safe to deploy across tenants

---

## Data Access Rules

- Prefer **SharePoint Lists** for simple data storage
- Use **Dataverse** only when relational complexity is required
- Never connect directly to databases from SPFx
- All external APIs must be accessed via a **secure Azure proxy**

---

## AI Integration Rules

- AI features use **Retrieval-Augmented Generation (RAG)**
- Knowledge sources are **read-only** (Dante Library)
- AI responses must include **source citations**
- No business rules inferred without source grounding
- All AI calls go through a secure backend service

---

## UX Standards

- Consistent layout: header, navigation, content, status
- Card-based entry points for tools
- Accessibility is mandatory (keyboard, contrast, semantics)
- Avoid over-customising SharePoint chrome

---

## Governance & Safety

- Never bypass SharePoint or Entra ID security
- Never grant direct user permissions in code
- Assume all code may be audited
- Prefer maintainability over short-term speed

---

## Development Workflow (Solo Dev)

### TCTBP (Recommended Cadence)

**TCTBP = Test, Commit, Tag, Bump, Push**

Used when a change is complete and validated.

Versioning rules:

- Repo tags use semantic versioning: `vX.Y.Z`
- SPFx solution versions must match the release tag
- Default to PATCH unless feature or breaking change

**Never run git commands without confirmation.**

Example:

```powershell
git add -A
git commit -m "feat: short description"
git tag vX.Y.Z
git push --follow-tags
```

---

### Release Trigger Phrase

- `release` = run TCTBP using PATCH bump

Variants:
- `release:patch`
- `release:minor`
- `release:major`
- `release:dry-run`

Releases must not merge to `main` unless explicitly requested.

---

## Modularity & File Size

- Avoid god files
- Split by responsibility (components, hooks, services)
- ~300 lines is a warning threshold, not a rule

---

## AI Assistant Behaviour (Handoff)

After completing a feature, provide:

1. What was done
2. How to test
3. What to expect
4. Edge cases (if relevant)

---

## Summary Instruction to Copilot

> Generate code as if this intranet will be maintained long-term, audited for security, and extended incrementally by a small team.

