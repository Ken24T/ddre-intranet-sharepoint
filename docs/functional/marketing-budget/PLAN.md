# Marketing Budget App — SPFx Integration Plan

## Status: ✅ Complete

All seven workstreams shipped across stages 1–7 on branch `app/marketing-budget`.

| Stage | Workstream | Commit | Tests |
|-------|-----------|--------|-------|
| 1 | Scaffolding & skeleton | v0.1.0-marketing-budget | 38 |
| 2 | Seed data import | a5fff15 | 65 |
| 3 | View routing & shell bridge | c3d2b12 | 240 (total) |
| 4 | Budget editor | cbc82b7 | 98 |
| 5 | Reference data views | 862704d | 121 |
| 6 | Quality gates | d9fa5c4 | 130 |
| 7 | Release & documentation | _(this commit)_ | 130 |

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

### 1) Discovery and Mapping ✅
- ~~Inventory existing app entrypoints, routes, and modules.~~
- ~~Map PWA boot flow to SPFx web part lifecycle.~~
- ~~Identify modules safe to port as-is vs. refactor.~~
- ~~Document external dependencies and replace CDN usage.~~

Deliverables: Module inventory, mapping notes, refactor shortlist.

### 2) SPFx Package and Web Part Skeleton ✅
- ~~Create new SPFx solution for Marketing Budget.~~
- ~~Establish a React root component and wiring.~~
- ~~Add base props, theming, and environment config hooks.~~

Deliverables: `spfx/marketing-budget/` solution, `MarketingBudgetWebPart` with React render, Repository Pattern (`IBudgetRepository` → `DexieBudgetRepository`).

### 3) Core Logic Port ✅
- ~~Move business logic modules into TypeScript.~~
- ~~Port state management, DB layer, and calculators.~~
- ~~Replace direct DOM manipulation with React state.~~

Deliverables: Type-safe domain models (`types.ts`), Dexie 4.x data access (`DexieBudgetRepository`), pure calculation functions (`budgetCalculations.ts`, `variantHelpers.ts`), seed data with 2 vendors / 15 services / 10 suburbs / 3 schedules.

### 4) UI and Routing ✅
- ~~Replace hash-based router with React view switching.~~
- ~~Port main views: Budgets, Editor, Schedules, Services, Vendors, Suburbs.~~
- ~~PostMessage bridge for shell sidebar integration.~~
- ~~Ensure accessibility and DDRE UI guidelines.~~

Deliverables: `MarketingBudget` root with view router, `BudgetListView` with status/search filter, `BudgetEditorPanel` + `LineItemEditor` + `BudgetTotals`, sidebar bridge protocol (SIDEBAR_SET_ITEMS, SIDEBAR_RESTORE, SIDEBAR_ACTIVE, SIDEBAR_NAVIGATE).

### 5) Assets and Styling ✅
- ~~Convert CSS to SCSS modules.~~
- ~~Preserve sm- namespace to avoid collisions.~~
- ~~Bundle icons and fonts locally.~~

Deliverables: `MarketingBudget.module.scss` (~420 lines), themed with DDRE tokens, local asset pipeline (no CDN). Four reference data views: `SchedulesView`, `ServicesView`, `VendorsView`, `SuburbsView` with search, filters, and expandable detail rows.

### 6) Quality Gates ✅
- ~~Add unit tests for key logic.~~
- ~~Run lint/test/build via SPFx scripts.~~
- ~~Ensure version sync across SPFx package files.~~
- ~~Coverage thresholds: statements 60%, branches 50%, functions 60%, lines 60%.~~

Deliverables: 130 tests across 11 suites, coverage 88%/77%/60%/88%, zero lint warnings, Prettier-clean, version sync 0.1.0 / 0.1.0.0.

### 7) Release and Documentation ✅
- ~~Update intranet docs with new web part info.~~
- ~~Add release note entry (v0.5.42 in intranet-core What's New).~~
- ~~Update PLAN.md with completion status.~~

Deliverables: Release note in shell What's New, updated PLAN.md, architecture documentation.

## Resolved Questions
- **New solution or web part in intranet-core?** → Separate SPFx solution at `spfx/marketing-budget/` (Phase 2 pattern).
- **Which data sets as seed data?** → 2 vendors, 15 services (6 categories), 10 suburbs (4 tiers), 3 schedule templates.
- **SharePoint IndexedDB constraints?** → No issues; Dexie 4.x works in SPFx context. Database: `salesmarketing-spfx`.

## Acceptance Criteria
- ✅ Marketing Budget loads as an SPFx web part in SharePoint.
- ✅ No external CDN calls required at runtime.
- ✅ IndexedDB persists budgets locally.
- ✅ UX parity with standalone app for core flows.
- ✅ Lint/test/build succeed with zero errors.

## Milestones
1. ✅ Discovery and mapping complete.
2. ✅ SPFx web part skeleton running in workbench.
3. ✅ Core logic ported and data working.
4. ✅ UI parity achieved.
5. ✅ Tests and lint passing.
6. ✅ Release notes and docs done.
