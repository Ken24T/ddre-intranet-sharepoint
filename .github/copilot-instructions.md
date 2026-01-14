# DDRE Intranet – Copilot Instructions

## Project Overview

SharePoint Online intranet using **SPFx 1.22.1 + TypeScript + React 17**. Monorepo structure with phased delivery.

**Key constraint:** SharePoint is the experience layer only—no secrets in browser code, all external APIs via Azure proxies.

## Monorepo Structure

| Folder | Purpose |
|--------|---------|
| `/spfx` | SPFx solutions (deployable `.sppkg` packages) |
| `/apps` | Business tool definitions (requirements, UX docs—no code) |
| `/packages` | Shared TypeScript libraries (no business logic) |
| `/contracts` | API schemas (OpenAPI, JSON Schema) |
| `/docs` | Architecture decisions, runbooks |

## Development Commands

```powershell
# From spfx/intranet-core/
npm install          # Setup
npm run start        # Local workbench dev server
npm run build        # Production build + package (.sppkg)
npm run test         # Jest unit tests (via Heft)
npm run test:e2e     # Playwright e2e (requires PLAYWRIGHT_BASE_URL)
npm run lint         # ESLint with zero-warnings policy
npm run format       # Prettier
```

**Node version:** `22.14.x` (enforced in `package.json` engines)

## Code Patterns

### SPFx Web Parts
- Extend `BaseClientSideWebPart` in `*WebPart.ts`
- Render React components via `ReactDom.render()`
- Props interface in `components/I*Props.ts`
- Use `escape()` from `@microsoft/sp-lodash-subset` for user-controlled strings

### React Components
- **New code:** Prefer functional components with hooks
- **Existing code:** Uses class components (refactor opportunistically)
- SCSS modules for styles (`*.module.scss`)
- Fluent UI 8 for UI components

### Testing
- Unit tests: Jest + Testing Library, co-located as `*.test.ts(x)`
- Mock SP modules in tests (see `spfx/intranet-core/src/webparts/intranetShell/IntranetShellWebPart.test.ts`)
- E2E: Playwright with env-based URL

## Critical Rules

1. **No secrets in SPFx** – All external API calls go through Azure proxy services defined in `/contracts`
2. **No hard-coded tenant URLs** – Use configuration/environment-aware endpoints
3. **Version sync** – Keep versions aligned across `package.json` and `config/package-solution.json`
4. **Permissions** – Never re-implement auth; respect SharePoint/Entra ID group-based permissions

## Phase-Aware Delivery

- **Phase 1 (current):** Single `intranet-core` solution for foundation features
- **Phase 2+:** Each business app gets its own SPFx solution and `.sppkg`

## Release Workflow

**Before any commit:** Check the Problems panel and resolve all errors/warnings.

Use the release script for versioned releases:

```powershell
./scripts/release.ps1 -Bump patch -Message "fix: description"
./scripts/release.ps1 -Bump minor -DryRun  # Preview changes
```

Git tags use semantic versioning (`vX.Y.Z`) and must match SPFx solution version.

## File Organization

- Web parts: `spfx/*/src/webparts/<name>/`
- Component + styles + props in `components/` subfolder
- Localization strings in `loc/` subfolder
- Config files in `config/` (Jest, TypeScript, SPFx)

## When Generating Code

- Prefer TypeScript strict typing
- Use Fluent UI components over custom styling
- Handle loading, empty, and error states explicitly
- Keep files under ~300 lines; split by responsibility
- Log errors meaningfully for debugging
