# Marketing Budget — SPFx Web Part

Sales & Marketing budget planning tool for the DDRE Intranet.

## Overview

Create and manage marketing budgets with service line items, vendor tracking,
suburb-based delivery tiers, and reusable schedule templates. All pricing is
GST-inclusive (10% Australian GST).

**Version:** 0.1.0  
**SPFx:** 1.22.1 · React 17 · Fluent UI 8 · TypeScript 5.8  
**Storage:** IndexedDB via Dexie 4.x (offline-first, no external API calls)

## Quick Start

```powershell
npm install
npm run start        # Local workbench dev server
npm run build        # Production build + package (.sppkg)
npm run test         # Jest unit tests (130 tests, 11 suites)
npm run lint         # ESLint with zero-warnings policy
```

A Vite dev harness is available for rapid UI iteration:

```powershell
cd dev
npm run dev          # http://localhost:3028
```

## Architecture

```
src/
├── models/
│   ├── types.ts               # Domain types (Budget, Service, Vendor, etc.)
│   ├── budgetCalculations.ts  # Pure pricing functions (subtotal, GST, totals)
│   ├── variantHelpers.ts      # Service variant resolution helpers
│   └── seedData.ts            # Reference data (15 services, 10 suburbs, etc.)
├── services/
│   ├── IBudgetRepository.ts   # Repository interface (swap implementations)
│   └── DexieBudgetRepository.ts  # IndexedDB implementation via Dexie 4.x
└── webparts/marketingBudget/
    ├── MarketingBudgetWebPart.ts   # SPFx entry point
    └── components/
        ├── MarketingBudget.tsx     # Root component with view router + sidebar bridge
        ├── BudgetListView.tsx      # Budget list with status/search filter
        ├── BudgetEditorPanel.tsx   # Create/edit budgets with schedule templates
        ├── LineItemEditor.tsx      # Service line item grid with variants
        ├── BudgetTotals.tsx        # Subtotal / GST / Total summary bar
        ├── SchedulesView.tsx       # Schedule templates with line item detail
        ├── ServicesView.tsx        # Service catalogue with category filter
        ├── VendorsView.tsx         # Vendor directory with linked services
        └── SuburbsView.tsx         # Delivery suburbs with tier badges
```

### Key Patterns

| Pattern | Detail |
|---------|--------|
| **Repository** | `IBudgetRepository` → `DexieBudgetRepository` (Phase A). Future: `SPListBudgetRepository` for SharePoint Lists. |
| **PostMessage Bridge** | Shell sidebar integration via `SIDEBAR_SET_ITEMS`, `SIDEBAR_NAVIGATE`, `SIDEBAR_ACTIVE`, `SIDEBAR_RESTORE`. |
| **View Router** | React state-driven (`activeView` string) — no URL routing inside SharePoint. |
| **Variant Resolution** | Three strategies: `manual` (user dropdown), `propertySize` (auto-match), `suburbTier` (auto-match). |
| **Budget Workflow** | `draft` → `approved` → `sent` → `archived` |

### Seed Data

| Entity | Count | Notes |
|--------|-------|-------|
| Services | 15 | 6 categories (Digital, Print, Signage, Photography, Events, Social Media) |
| Vendors | 2 | REA Group, PropertyMe |
| Suburbs | 10 | 4 tiers (A–D) with tier-based pricing |
| Schedules | 3 | Reusable templates that pre-fill line items |

## Testing

130 tests across 11 suites with coverage thresholds:

| Metric | Threshold | Actual |
|--------|-----------|--------|
| Statements | 60% | 88% |
| Branches | 50% | 77% |
| Functions | 60% | 60% |
| Lines | 60% | 88% |

```powershell
npm run test                    # Run all tests
npx heft test --clean           # Full clean test via Heft
```

## Build & Deploy

```powershell
npm run build                   # Compiles + creates .sppkg in release/
```

The `.sppkg` file deploys to the SharePoint App Catalogue independently of
`intranet-core`. See [How to Deploy](../../docs/runbooks/how-to-deploy.md).

## Related Docs

- [Functional Plan](../../docs/functional/marketing-budget/PLAN.md)
- [Architecture](../../docs/architecture/marketing-budget.md)
- [Release Notes](../intranet-core/src/webparts/intranetShell/components/data/releaseNotes.ts) (v0.5.42)
