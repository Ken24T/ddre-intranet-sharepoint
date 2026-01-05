# DDRE Intranet – GitHub Copilot Instructions

## Project Context

This repository contains the **DDRE Intranet** built on
**SharePoint Online** using **SharePoint Framework (SPFx)** with
**TypeScript and React**.

The intranet is:

- Hosted in SharePoint Online
- Authenticated via Microsoft Entra ID (SSO)
- Extended using SPFx web parts
- Integrated with Azure backend services via secure proxies

The primary developer is **Ken Boyle**.

---

## Architectural Principles (Always Follow)

- SharePoint Online is an **experience layer**, not an application server
- All custom UI is implemented via **SPFx (client-side)**
- No secrets, API keys, or tokens are ever embedded in front-end code
- Access control is **group-based and additive**
- Reuse platform services before inventing custom solutions

---

## Technology Stack

When generating code, prefer:

- **TypeScript** (strict typing)
- **React functional components** with hooks
- **Fluent UI** components for layout and controls
- **PnPjs** for SharePoint and Graph access
- **SPFx best practices** (no deprecated APIs)

Avoid:

- Plain JavaScript
- Inline scripts or global CSS
- Direct DOM manipulation
- Hard-coded tenant URLs

---

## SPFx Coding Guidelines

- All web parts must be reusable and configurable
- Use web part properties for site/list IDs and configuration
- Respect SharePoint permissions (do not re-implement auth)
- Handle loading, empty, and error states explicitly
- Log errors meaningfully (console + optional telemetry hook)

---

## Data Access Rules

- Prefer **SharePoint Lists** for simple data storage
- Use **Dataverse** only when relational complexity is required
- Never connect directly to databases from SPFx
- All external APIs must be accessed via an **Azure proxy**

---

## AI Integration Rules

- AI features use **Retrieval-Augmented Generation (RAG)**
- Knowledge sources are **read-only** (Dante Library)
- AI responses must include **source citations**
- No business rules are inferred without source grounding
- All AI calls go through a secure backend service

---

## UX Standards

- Consistent layout: header, navigation, content area, status
- Card-based entry points for tools
- Accessibility is mandatory (keyboard, contrast, semantics)
- Avoid over-customising SharePoint chrome

---

## Governance & Safety

- Never bypass SharePoint or Entra ID security
- Never grant direct user permissions in code
- Assume content and tools will be audited
- Prefer clarity and maintainability over cleverness

---

## Code Quality Expectations

- Clear naming and structure
- Comments explain *why*, not *what*
- Functions are small and testable
- Errors fail safely and visibly

---

## Development Workflow (Solo Dev)

### TCTBP (Recommended Cadence)

#### TCTBP = Test, Commit, Tag, Bump, Push

When a change is complete and validated (e.g., the user confirms
“looks good”, “works great”, “perfect”), follow this workflow.

Versioning policy (repo-wide):

- The assistant chooses the semantic version number.
- Every commit the assistant creates should be tagged with a `vX.Y.Z` tag.
- The git tag and the app/solution version must match (same `X.Y.Z`) to make
  rollbacks and audits straightforward.
- Default to PATCH bumps (`Z`) unless the change is a new feature
  (MINOR / `Y`) or a breaking change (MAJOR / `X`).

Important: If you are about to run git commands, ask for confirmation first
(especially for tagging and pushing).

- **Test**: Prefer the closest equivalent of lint, typecheck, build, and a
  quick runtime check. If no automated tests exist yet, do a focused manual
  verification.
- **Commit**: Make small, focused commits. Use conventional commits: `feat:`,
  `fix:`, `refactor:`, `chore:`, `docs:`.
- **Tag**: Tag releases using semantic versioning: `vX.Y.Z`.
- **Bump**: Keep versions consistent across SPFx artifacts when present:
  `package.json`, `config/package-solution.json` (solution version), and any
  app-level version constant introduced later.
- **Push**: Push the branch and tags to the configured remote.

Example (PowerShell):

```powershell
git add -A
git commit -m "feat: short description"
git tag vX.Y.Z
git push --follow-tags
```

---

### Release Trigger Phrase

To avoid repeatedly typing “TCTBP”, the preferred trigger phrase is:

- `release` = run TCTBP end-to-end using a PATCH bump by default

Important: `release` must **not** merge or rebase anything into `main`
unless the user explicitly asks (e.g., “merge to main”). A release should
operate on the current branch only.

When the user explicitly asks to merge to `main`, the assistant should also
propose a sensible next branch name and focus area based on the current
workstream, for example:

- `chore/ci-hardening`
- `chore/release-automation`
- `test/coverage-thresholds`
- `docs/runbooks`
- `feat/<area>-shell`

Optional variants:

- `release:patch` / `release:minor` / `release:major` = force the semver bump
  type
- `release:dry-run` = run tests + report the proposed commit/tag/version
  changes, but do not modify git

When you ask for a release, include (or I will propose) a conventional
commit message like `docs: ...`, `feat: ...`, etc.

---

## Modularity & File Size

- Keep files small and cohesive; avoid “god files”.
- If a file is growing quickly or covering multiple responsibilities,
  split proactively (components/hooks/services/helpers).
- Use clear module boundaries and descriptive naming instead of relying on
  comments.
- Treat ~300 lines as a *warning threshold* for reviewing whether a split
  would improve maintainability (not a hard rule).

---

## When Unsure

If there is ambiguity:

- Choose the **simplest, most maintainable** option
- Align with Microsoft 365 and SPFx guidance
- Avoid introducing new infrastructure without justification

---

## AI Assistant Behaviour (Handoff)

After completing a feature or significant change, provide:

1. **What Was Done** – brief summary of what changed
2. **How to Test** – concrete steps (where to click/navigate, what inputs to use)
3. **What to Expect** – expected UI/behaviour results
4. **Edge Cases** – only if relevant

---

## Summary Instruction to Copilot

> Generate code as if this intranet will be maintained long-term, audited for
> security, and extended incrementally by a small team.

