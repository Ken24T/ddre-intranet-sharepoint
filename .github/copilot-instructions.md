# DDRE Intranet – Copilot Instructions

## Project Overview

SharePoint Online intranet using **SPFx 1.22.1 + TypeScript + React 17**. Monorepo structure with phased delivery.

**Key constraint:** SharePoint is the experience layer only—no secrets in browser code, all external APIs via Azure proxies.

**Implementation plan:** See PLAN.md in the repo root for current tasks and progress.

## Monorepo Structure

| Folder | Purpose |
|--------|---------|
| `/spfx` | SPFx solution (`intranet-core` — single `.sppkg` containing all web parts) |
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

# From packages/pkg-api-client/ or packages/pkg-theme/
npm install          # Setup
npm run build        # Compile TypeScript
```

**Node version:** `22.14.x` (enforced in `package.json` engines)

## Environment Configuration

Environment-specific settings live in `spfx/intranet-core/config/environments/`:
- `dev.json` – Local development
- `test.json` – Test/staging environment  
- `prod.json` – Production

Use these configs for API endpoints and feature flags. Never hard-code environment-specific values.

## Shared Packages

| Package | Purpose |
|---------|---------|
| `pkg-api-client` | Typed clients for Azure proxy APIs (`AiClient`, `VaultClient`, `PropertyMeClient`) |
| `pkg-theme` | Fluent UI theme tokens and DDRE brand colors |

SPFx solutions consume these via local npm install (not published to registry yet).

## DDRE Brand Colours

- **DDRE Blue:** `#001CAD`
- **Eggshell:** `#F6F6F6`
- **Light Blue:** `#EEF2F8`

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
5. **Regional language** – Use Australian English spelling and grammar in all UI text

## Single-Solution Architecture

All business apps are delivered as **web parts inside `intranet-core`** (one `.sppkg`).

- `/apps/app-<name>/` — business definition (requirements, UX, data model)
- `spfx/intranet-core/src/webparts/<camelCaseName>/` — implementation code
- `spfx/intranet-core/config/config.json` — register each web part's bundle + localised resources

To add a new app:
1. Define requirements in `/apps/app-<name>/`
2. Create web part folder at `spfx/intranet-core/src/webparts/<camelCaseName>/`
3. Add bundle entry and `*Strings` resource to `config/config.json`
4. `npm run test` → `npm run build` → deploy single `.sppkg`

## Jasper (AI Chatbot)

**Jasper** is the name of the intranet's AI assistant chatbot. He appears as a floating button in the bottom-right corner of the shell and provides conversational help to users.

- **Personality:** Friendly, supportive, and helpful with an Australian touch (e.g., "G'day!")
- **Capabilities:** Finding documents, explaining policies, navigating the intranet, answering questions
- **Backend:** Azure OpenAI via the AI RAG Proxy API (see `/contracts/ai-rag-proxy.openapi.yml`)
- **Health monitoring:** StatusBar shows Jasper connection status; button is disabled when unavailable

When writing Jasper's dialogue or messages, use a warm, encouraging tone that makes users feel supported.

## Shipping Workflow

For SHIP/TCTBP activation, steps, approvals, and versioning rules, see the TCTBP agent guidance in [TCTBP Agent.md](TCTBP Agent.md).

## File Organisation

- Web parts: `spfx/intranet-core/src/webparts/<name>/`
  - `<Name>WebPart.ts` — SPFx entry point
  - `<Name>WebPart.manifest.json` — web part manifest
  - `components/` — React components, styles, props, hooks
  - `models/` — types, calculations, helpers
  - `services/` — data access (repository pattern)
  - `loc/` — localisation strings (`en-us.js`, `mystrings.d.ts`)
- Config files in `config/` (Jest, TypeScript, SPFx)
- Business definitions in `apps/app-<name>/` (requirements, UX docs — no code)

## When Generating Code

- Prefer TypeScript strict typing
- Use Fluent UI components over custom styling
- Apply theme tokens from `pkg-theme` for consistent branding
- Use API clients from `pkg-api-client` for external service calls
- Handle loading, empty, and error states explicitly
- Keep files under ~300 lines; split by responsibility
- Log errors meaningfully for debugging

## Branch Naming

- `feature/<name>` – New features
- `fix/<name>` – Bug fixes
- `docs/<name>` – Documentation updates
- `infrastructure/<name>` – Build/CI/tooling changes

## Release Notes (What's New)

When starting a new feature branch, add a placeholder release note entry:

```powershell
./scripts/add-release-note.ps1 -Title "Feature Name" -Category feature
```

**Categories:** `feature`, `improvement`, `bugfix`, `security`

The script adds a placeholder entry to `releaseNotes.ts` that should be updated with specific changes before shipping. Release notes are grouped by minor version (v0.5, v0.6, etc.) and shown in the Help Centre "What's New" panel.

**When to add release notes:**
- User-facing features and improvements
- Bug fixes that users would notice
- Security updates

**When to skip:**
- Internal refactoring
- Test-only changes
- Documentation updates (unless user-facing help content)
