<!-- markdownlint-disable MD013 MD032 -->
# Marketing Budget — Architecture

## Context

The Marketing Budget is the first Phase 2 business app, deployed as its own
SPFx solution (`spfx/marketing-budget/`) with a separate `.sppkg` package.
It loads inside the Intranet Shell content area and communicates with the
shell sidebar via a PostMessage bridge.

---

## Component Diagram

```
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

All data access goes through `IBudgetRepository`. The current implementation
uses Dexie 4.x (IndexedDB), but the interface is designed for future swap to
SharePoint Lists without changing any UI code.

```
IBudgetRepository
├── getBudgets() / saveBudget() / deleteBudget()
├── getServices() / getVendors() / getSuburbs() / getSchedules()
├── seedData()
├── exportAll() / importAll()
└── DexieBudgetRepository  ← current implementation
    └── database: 'salesmarketing-spfx'
        ├── Table: budgets
        ├── Table: services
        ├── Table: vendors
        ├── Table: suburbs
        └── Table: schedules
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

```
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
- No external API calls — all data is local IndexedDB.
- No CDN dependencies — all assets bundled in `.sppkg`.
- Respects SharePoint/Entra ID group-based permissions.

---

## Future Considerations

- **Phase B:** `SPListBudgetRepository` backed by SharePoint Lists for
  multi-user collaboration and server-side persistence.
- **Phase C:** Azure proxy API for budget approval workflow notifications.
- **Reporting:** Export budgets to Excel or PDF.
