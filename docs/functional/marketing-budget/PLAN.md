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

Integrate the standalone Marketing Budget app into DDRE Intranet as a dedicated
SPFx web part and package, aligned with intranet-core standards and DDRE governance.

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

Deliverables: `spfx/marketing-budget/` solution,
`MarketingBudgetWebPart` with React render, Repository Pattern
(`IBudgetRepository` → `DexieBudgetRepository`).

### 3) Core Logic Port ✅

- ~~Move business logic modules into TypeScript.~~
- ~~Port state management, DB layer, and calculators.~~
- ~~Replace direct DOM manipulation with React state.~~

Deliverables: Type-safe domain models (`types.ts`),
Dexie 4.x data access (`DexieBudgetRepository`),
pure calculation functions (`budgetCalculations.ts`, `variantHelpers.ts`),
seed data with 2 vendors / 15 services / 10 suburbs / 3 schedules.

### 4) UI and Routing ✅

- ~~Replace hash-based router with React view switching.~~
- ~~Port main views: Budgets, Editor, Schedules, Services, Vendors, Suburbs.~~
- ~~PostMessage bridge for shell sidebar integration.~~
- ~~Ensure accessibility and DDRE UI guidelines.~~

Deliverables: `MarketingBudget` root with view router,
`BudgetListView` with status/search filter,
`BudgetEditorPanel` + `LineItemEditor` + `BudgetTotals`,
sidebar bridge protocol (SIDEBAR_SET_ITEMS, SIDEBAR_RESTORE,
SIDEBAR_ACTIVE, SIDEBAR_NAVIGATE).

### 5) Assets and Styling ✅

- ~~Convert CSS to SCSS modules.~~
- ~~Preserve sm- namespace to avoid collisions.~~
- ~~Bundle icons and fonts locally.~~

Deliverables: `MarketingBudget.module.scss` (~420 lines), themed with
DDRE tokens, local asset pipeline (no CDN). Four reference data views:
`SchedulesView`, `ServicesView`, `VendorsView`, `SuburbsView` with
search, filters, and expandable detail rows.

### 6) Quality Gates ✅

- ~~Add unit tests for key logic.~~
- ~~Run lint/test/build via SPFx scripts.~~
- ~~Ensure version sync across SPFx package files.~~
- ~~Coverage thresholds: statements 60%, branches 50%, functions 60%, lines 60%.~~

Deliverables: 130 tests across 11 suites,
coverage 88%/77%/60%/88%, zero lint warnings, Prettier-clean,
version sync 0.1.0 / 0.1.0.0.

### 7) Release and Documentation ✅

- ~~Update intranet docs with new web part info.~~
- ~~Add release note entry (v0.5.42 in intranet-core What's New).~~
- ~~Update PLAN.md with completion status.~~

Deliverables: Release note in shell What's New, updated PLAN.md,
architecture documentation.

## Resolved Questions

- **New solution or web part in intranet-core?** →
  ~~Separate SPFx solution at `spfx/marketing-budget/`~~ Consolidated into
  `spfx/intranet-core/src/webparts/marketingBudget/` (single solution, single
  `npm install`, single build). Dev harness remains at `spfx/marketing-budget/dev/`.
- **Which data sets as seed data?** →
  2 vendors, 15 services (6 categories), 10 suburbs (4 tiers),
  3 schedule templates.
- **SharePoint IndexedDB constraints?** →
  No issues; Dexie 4.x works in SPFx context.
  Database: `salesmarketing-spfx`.

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

---

## Phase 2: Enhancement & Production Readiness

### Post-Port Work Already Completed

| Version | Change | Branch |
|---------|--------|--------|
| mb-v0.2.0 | Role-based CRUD, context menus on all reference data views | `app/marketing-budgets` |
| v0.6.0 | Integrated dev harness into intranet-core shell (Vite, dexie alias) | `app/marketing-budgets` |

### Phase 2 Status: 🟡 In Progress

The repository pattern (`IBudgetRepository` → `DexieBudgetRepository`) was designed from the
start to support a seamless backend swap. Phase 2 builds on this foundation.

### 2A) SharePoint Integration (Production Backend)

Move from IndexedDB to SharePoint Lists for multi-user, persistent storage.

- [x] **SPListBudgetRepository** — Implement `IBudgetRepository`
  against SharePoint Lists using `@pnp/sp` v4 (PnPjs).
  - [x] Design list schemas: MB_Vendors, MB_Services,
    MB_Suburbs, MB_Schedules, MB_Budgets (5 lists, complex
    arrays stored as JSON in multi-line text fields).
  - [x] Map repository CRUD methods to SharePoint REST/batch
    operations (22 methods: full CRUD + bulk + import/export).
  - [x] Handle list item limits (threshold-safe queries via
    PnPjs v4 invokable collections, batched deletes in groups of 100).
  - [ ] Provisioning script or PnP template for list creation.

- [x] **Entra ID role resolution** — Replace the dev harness
  `userRole` prop with runtime resolution from SharePoint group
  membership ("Marketing Budget Admins",
  "Marketing Budget Editors").

- [x] **Repository factory** — Auto-select
  `DexieBudgetRepository` (dev/workbench) or
  `SPListBudgetRepository` (production) based on context.

- [x] **Data migration** — `seedData()` and `importAll()` methods
  with ID remapping for cross-entity references (vendorId,
  serviceId) and name-based import resolution.

- [ ] **Offline fallback** (stretch) — Read-through cache in IndexedDB for offline viewing.

New files: `listSchemas.ts`, `SPListBudgetRepository.ts`,
`RepositoryFactory.ts`, `RoleResolver.ts` (all under
`intranet-core/src/webparts/marketingBudget/services/`).
Modified: `services/index.ts`, `MarketingBudgetWebPart.ts`,
`intranet-core/package.json` (+`@pnp/sp@^4.17.0`, `dexie@^4.0.0`),
`intranet-core/config/config.json` (new bundle entry).

Deliverables: `SPListBudgetRepository`, group-based permissions, list provisioning, zero-downtime repository swap.

### 2B) Core Enhancements

Improve day-to-day usability for editors and admins.

- [x] **Budget validation** — Enforce completeness rules before
  `draft → approved` transition (address required, at least one
  line item, schedule selected).
- [x] **Bulk status transitions** — Multi-select budgets in
  `BudgetListView` and apply a status change to all selected.
- [x] **Budget duplication** — Deep-copy an existing budget (already
  permitted by `canDuplicateBudget`) with option to change property
  address and schedule.
- [x] **Inline editing on reference data** — Replace
  context-menu-only CRUD on Vendors, Services, Suburbs, Schedules
  with edit panels (similar to `BudgetEditorPanel`).
- [x] **Service variant management UI** — Dedicated panel for
  adding/editing/reordering `ServiceVariant[]` within a service,
  improving on the current read-only `ServiceDetailPanel`.
- [x] **Schedule builder** — Visual editor for composing
  `ScheduleLineItem[]` within a schedule (drag-to-reorder,
  toggle services).
- [x] **Suburb tier management** — Bulk assign/reassign pricing tiers to suburbs with postcode validation.

Deliverables: Validation rules, multi-select UX, full CRUD panels for all reference entities.

### 2C) Reporting & Export

Surface insights and support external workflows.

- [x] **Dashboard view** — New default landing view showing:
  - Budget count by status (draft/approved/sent/archived).
  - Total spend by `ServiceCategory`.
  - Spend by `BudgetTier` and `PricingTier`.
  - Monthly trend if budget dates are captured.
  - Quick-action links to Budgets and Compare views.
- [x] **Print / PDF export** — Browser-print layout using an
  iframe-copy technique (no external dependencies). Print button
  on budget row context menu and in BudgetEditorPanel footer.
- [x] **CSV export** — Export filtered budget list as CSV from
  BudgetListView toolbar, and export individual budget line items
  from row context menu.
- [x] **Budget comparison** — Side-by-side view of two budgets
  highlighting price differences (useful for re-quoting or tier
  changes) with diff colouring (green = cheaper, red = more
  expensive, grey = missing).
- [x] **Selective data export/import** — Entity-type-level
  export/import (budgets, services, vendors, suburbs, schedules)
  with additive merge for cross-environment data transfer and
  backup/restore. Admin-only access.

Deliverables: Dashboard component, print layout, CSV download,
comparison view, selective data management panel.
New files: `dashboardAggregations.ts`, `exportHelpers.ts`,
`DashboardView.tsx`, `BudgetPrintView.tsx`,
`BudgetComparisonView.tsx`, `DataManagementView.tsx` + tests.
Modified: `MarketingBudget.tsx` (8 nav items, dashboard default),
`useShellBridge.ts`, `BudgetListView.tsx` (CSV/Print integration),
`BudgetEditorPanel.tsx` (Print button), `MarketingBudget.module.scss`.

### 2D) Integration & Advanced Features

Connect to the wider DDRE ecosystem and add power-user capabilities.

- [ ] **PropertyMe integration** — Pull property address and type
  from PropertyMe API (via `pkg-api-client` `PropertyMeClient`)
  to auto-fill `BudgetPropertyForm` fields.
- [ ] **Audit trail** — Record
  `{ user, action, timestamp, before, after }` on every budget
  and reference data change. Display as a timeline in the editor
  panel.
- [ ] **Budget templates** — Save a budget configuration
  (schedule + overrides) as a reusable template for common
  property types.
- [ ] **Notifications** — Surface budgets awaiting approval in
  the intranet shell status bar or Jasper prompts.
- [ ] **Shared appBridge package** — Extract the PostMessage
  protocol types from `appBridge.ts` into
  `packages/pkg-app-bridge` so both `intranet-core` and
  `marketing-budget` import from the same source
  (noted in code as a TODO).
- [ ] **Drag-and-drop line item reordering** — Leverage the existing `@dnd-kit` aliases already configured in the dev harness.

Deliverables: PropertyMe auto-fill, audit log, templates, shell notifications, shared bridge package.

### Phase 2 Milestones

1. 🟢 SharePoint List backend operational (2A) — core implementation complete, list provisioning remaining.
2. 🟢 Entra ID group-based roles live (2A) — `RoleResolver` implemented.
3. 🟢 Validation and bulk operations shipped (2B).
4. 🟢 Reference data edit panels complete (2B).
5. 🟢 Dashboard and export features live (2C) — 356 tests passing.
6. ⬜ PropertyMe integration functional (2D).
7. ⬜ Audit trail and templates shipped (2D).

### Phase 2 Acceptance Criteria

- All data persisted in SharePoint Lists (no IndexedDB dependency in production).
- Role resolution happens automatically via Entra ID groups.
- Budget validation prevents incomplete budgets from advancing.
- At least one export format (PDF or CSV) available.
- Dashboard provides at-a-glance spend visibility.
- Existing 130+ tests remain green; new features add proportional coverage.
