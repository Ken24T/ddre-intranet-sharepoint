<!-- markdownlint-disable MD013 MD032 -->
# Marketing Budget — Architecture

## Context

The Marketing Budget is the first business app, delivered as a **web part
inside `intranet-core`** (`spfx/intranet-core/src/webparts/marketingBudget/`).
It ships in the single `intranet-core.sppkg` alongside the Intranet Shell.
It loads inside the shell's content area and communicates with the
shell sidebar via a PostMessage bridge.

---

## Component Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Intranet Shell (intranet-core)               │
│  ┌───────────┐                                                  │
│  │  Sidebar   │◄──── PostMessage ────►┌──────────────────────┐  │
│  │ (nav items)│                       │  Marketing Budget     │  │
│  └───────────┘                       │  (iframe / web part)  │  │
│                                       │                      │  │
│                                       │  ┌────────────────┐  │  │
│                                       │  │ View Router    │  │  │
│                                       │  │ (React state)  │  │  │
│                                       │  └───┬────────────┘  │  │
│                                       │      │               │  │
│                                       │  ┌───▼────────────┐  │  │
│                                       │  │ BudgetListView │  │  │
│                                       │  │ EditorPanel    │  │  │
│                                       │  │ SchedulesView  │  │  │
│                                       │  │ ServicesView   │  │  │
│                                       │  │ VendorsView    │  │  │
│                                       │  │ SuburbsView    │  │  │
│                                       │  └───┬────────────┘  │  │
│                                       │      │               │  │
│                                       │  ┌───▼────────────┐  │  │
│                                       │  │ IBudgetRepo    │  │  │
│                                       │  │ (Repository)   │  │  │
│                                       │  └───┬────────────┘  │  │
│                                       │      │               │  │
│                                       │  ┌───▼────────────┐  │  │
│                                       │  │ Dexie 4.x      │  │  │
│                                       │  │ (IndexedDB)    │  │  │
│                                       │  └────────────────┘  │  │
│                                       └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Layer

### Repository Pattern

All data access goes through `IBudgetRepository`. Two implementations exist:

- **`DexieBudgetRepository`** — IndexedDB via Dexie 4.x (dev harness / fallback)
- **`SPListBudgetRepository`** — SharePoint Lists via PnPjs v4 (production)

`RepositoryFactory.createRepository(sp)` auto-selects the backend based on
whether a valid PnPjs `SPFI` instance is available.

```text
IBudgetRepository
├── getBudgets() / saveBudget() / deleteBudget()
├── getServices() / getVendors() / getSuburbs() / getSchedules()
├── seedData()
├── exportAll() / importAll()
├── DexieBudgetRepository  ← dev harness / offline fallback
│   └── database: 'salesmarketing-spfx'
│       ├── Table: budgets
│       ├── Table: services
│       ├── Table: vendors
│       ├── Table: suburbs
│       └── Table: schedules
└── SPListBudgetRepository  ← production (SharePoint Lists)
    └── 5 SP Lists via PnPjs v4
        ├── MarketingBudgets
        ├── MarketingServices
        ├── MarketingVendors
        ├── MarketingSuburbs
        └── MarketingSchedules
```

### Variant Pricing

Services can have multiple pricing variants resolved by three strategies:

| Strategy | Resolution | Example |
|----------|-----------|---------|
| `manual` | User selects from dropdown | Premium vs Standard listing |
| `propertySize` | Auto-match on `sizeMatch` field | Small / Medium / Large property |
| `suburbTier` | Auto-match on `tierMatch` field | Tier A / B / C / D pricing |

The `getEffectivePrice()` function in `budgetCalculations.ts` resolves the
final price for a line item given its variant context.

---

## Shell Integration

### PostMessage Bridge Protocol

The web part communicates with the Intranet Shell sidebar using `window.postMessage`:

| Message | Direction | Purpose |
|---------|-----------|---------|
| `SIDEBAR_SET_ITEMS` | App → Shell | Replace sidebar nav with app-specific items |
| `SIDEBAR_NAVIGATE` | Shell → App | User clicked a sidebar item |
| `SIDEBAR_ACTIVE` | App → Shell | Highlight active sidebar item |
| `SIDEBAR_RESTORE` | App → Shell | Restore default shell sidebar on unmount |

The bridge is initialised in `MarketingBudget.tsx` via a `useEffect` hook that
attaches a `message` event listener and cleans up on unmount.

---

## Budget Workflow

```text
draft ──► approved ──► sent ──► archived
```

- **Draft:** Editable. Line items can be added, removed, and reordered.
- **Approved:** Read-only. Locked for review.
- **Sent:** Delivered to vendor/client.
- **Archived:** Historical record.

All totals include 10% Australian GST (inclusive):
`GST = total − (total / 1.1)`

---

## Security

- No secrets in browser code.
- Production data stored in SharePoint Lists (server-side persistence).
- Dev harness uses IndexedDB (local browser only).
- No CDN dependencies — all assets bundled in `.sppkg`.
- Role resolution via Entra ID groups (`RoleResolver`):
  - Admin group → admin role
  - Editor group → editor role
  - Default → viewer role

---

## Future Considerations

- **List provisioning:** PnP template or PowerShell script for SP List creation.
- **Offline fallback:** Auto-switch to Dexie when SP is unreachable.
- **Phase 2B:** Budget validation, bulk status transitions, reference data editors.
- **Phase 2C:** Dashboard view (spend by category, status breakdown, tier analysis).
- **Reporting:** Export budgets to Excel or PDF.
- **Azure proxy:** Budget approval workflow notifications.
