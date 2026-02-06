# Marketing Budget App - SPFx Integration Plan

## Goal
Integrate the standalone Marketing Budget app into DDRE Intranet as a dedicated SPFx web part and package, aligned with intranet-core standards and DDRE governance.

## Scope
- Convert the standalone PWA into an SPFx web part (React + TypeScript).
- Keep local-only storage (IndexedDB) for initial release.
- Disable service worker in SPFx context.
- Bundle all dependencies (no external CDN usage).
- Preserve DDRE branding and existing UX intent.

## Non-Goals (Initial Phase)
- API-backed storage or sync.
- Multi-tenant configuration.
- Replatforming other standalone apps.
- Service worker support inside SharePoint.

## Assumptions
- SPFx 1.22.1, React 17, Fluent UI 8 are required.
- Australian English for all UI text.
- No secrets or external API calls directly from SPFx.

## Workstreams

### 1) Discovery and Mapping
- Inventory existing app entrypoints, routes, and modules.
- Map PWA boot flow to SPFx web part lifecycle.
- Identify modules safe to port as-is vs. refactor.
- Document external dependencies and replace CDN usage.

Deliverables:
- Module inventory and mapping notes.
- Refactor shortlist and risk list.

### 2) SPFx Package and Web Part Skeleton
- Create new SPFx solution or web part for Marketing Budget.
- Establish a React root component and wiring.
- Add base props, theming, and environment config hooks.

Deliverables:
- SPFx solution/package skeleton.
- MarketingBudgetWebPart with minimal render.

### 3) Core Logic Port
- Move business logic modules into TypeScript.
- Port state management, DB layer, and calculators.
- Replace direct DOM manipulation with React state.

Deliverables:
- Type-safe domain models.
- Data access module using IndexedDB (Dexie).

### 4) UI and Routing
- Replace hash-based router with React view switching.
- Port main views: Budget, Schedules, Budgets, Settings.
- Ensure accessibility and DDRE UI guidelines.

Deliverables:
- React components for each view.
- Shared components for lists, summaries, forms.

### 5) Assets and Styling
- Convert CSS to SCSS modules where appropriate.
- Preserve sm- namespace to avoid collisions.
- Bundle icons and fonts locally.

Deliverables:
- Themed SCSS modules with DDRE tokens.
- Local asset pipeline (no CDN).

### 6) Quality Gates
- Add unit tests for key logic.
- Run lint/test/build via SPFx scripts.
- Ensure version sync across SPFx package files.

Deliverables:
- Jest tests for core modules.
- Passing lint and test runs.

### 7) Release and Documentation
- Update intranet docs with new web part info.
- Add release note entry via script.

Deliverables:
- Documentation updates.
- Release note placeholder.

## Risks and Mitigations
- Routing conflicts inside SharePoint: use internal React state routing.
- Service worker incompatibility: disable in SPFx context.
- CDN restrictions: bundle all dependencies and assets.
- Direct DOM manipulation: refactor to React components.

## Open Questions
- ~~Should we create a new SPFx solution or add a web part to intranet-core?~~
  **Resolved:** New SPFx solution (`spfx/marketing-budget/`) per phase-aware delivery model.
- Which data sets should be shipped as seed data?
- Are there SharePoint-specific constraints on IndexedDB usage?

## Data Migration Path (IndexedDB → SharePoint Lists)

> IndexedDB is the initial storage layer. This section defines the planned migration
> to SharePoint Lists once tenant environments are available.

### Phase A: IndexedDB Only (Initial Release)

- All budget data stored locally in the browser (Dexie/IndexedDB).
- Users only see their own data on their own device.
- Acceptable for single-user, single-device usage during pilot.

### Phase B: SharePoint Lists (Post-Tenant Access)

- Define SharePoint List schemas for budgets, schedules, and line items.
- Build a data access abstraction layer (interface) so the UI doesn't know
  whether data comes from IndexedDB or SharePoint.
- Implement a `SharePointBudgetStore` that replaces `IndexedDBBudgetStore`.
- Add a one-time migration utility: export from IndexedDB → import to List.

### Design Guidance

- Use the **Repository Pattern**: define `IBudgetRepository` with `getAll()`,
  `getById()`, `create()`, `update()`, `delete()` methods.
- Initial implementation: `DexieBudgetRepository` (IndexedDB).
- Future implementation: `SPListBudgetRepository` (SharePoint REST/PnPjs).
- Switching between them should require only a provider change, not UI rewrites.

### Migration Risks

- Users may have accumulated significant data locally before migration.
- IndexedDB data is per-browser, per-origin — not transferable to other devices.
- Plan a clear "export → import" workflow with user confirmation.

## Acceptance Criteria
- Marketing Budget loads as an SPFx web part in SharePoint.
- No external CDN calls required at runtime.
- IndexedDB persists budgets locally.
- UX parity with standalone app for core flows.
- Lint/test/build succeed with zero errors.

## Milestones (Indicative)
1. Discovery and mapping complete.
2. SPFx web part skeleton running in workbench.
3. Core logic ported and data working.
4. UI parity achieved.
5. Tests and lint passing.
6. Release notes and docs done.
