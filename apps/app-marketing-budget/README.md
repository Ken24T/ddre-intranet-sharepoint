# Marketing Budget

> **Hub:** Administration · **Status:** Active (Phase 1 Complete, Phase 2A In Progress) · **Web Part:** `marketingBudget`

## Overview

Marketing budget tracking and reporting for sales & marketing teams. Provides a full CRUD interface for managing marketing budgets, line items, vendors, services, schedules, and suburbs.

## Current State

**Phase 1 — SPFx Port (Complete):**
- Budget dashboard with 5 views (budgets, schedules, services, vendors, suburbs)
- Budget entry/edit forms (editor panel, line item editor, property form)
- Role-based CRUD (viewer/editor/admin) via context menus
- Shell integration via PostMessage sidebar bridge
- IndexedDB/Dexie 4.x for local data storage
- 268+ tests passing, zero lint warnings

**Phase 2A — SharePoint Integration (In Progress):**
- SPListBudgetRepository (22 methods, PnPjs v4, 5 SharePoint Lists)
- Entra ID group-based role resolution
- Repository factory (auto-select Dexie or SP backend)
- Data migration with ID remapping
- Consolidated into intranet-core single solution (v0.6.0)

**Upcoming:**
- Phase 2B: Budget validation, reference data editing, dashboard charts
- Phase 2C: Print/PDF export, CSV export, PropertyMe integration
- Phase 2D: Audit trail, budget templates, appBridge extraction

## Data & Integration

- **Storage:** SharePoint Lists (5 lists via PnPjs) with IndexedDB fallback
- **API proxy:** PropertyMe API (planned, via `pkg-api-client`)
- **Authentication:** Entra ID group-based role resolution

## Related Files

- Web part code: `spfx/intranet-core/src/webparts/marketingBudget/`
- Detailed plan: `docs/functional/marketing-budget/PLAN.md`
- Plan: See `PLAN.md` § app-marketing-budget
