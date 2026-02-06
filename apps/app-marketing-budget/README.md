# Marketing Budget App

## Overview

Marketing budget tracking and reporting tool for the Sales department. Allows users to create, manage, and export marketing budgets with schedule-based line items and PDF reporting.

## Hub

Administration / Sales

## Status

⚪ Planning → SPFx integration planned

## Source

Originally built as a standalone vanilla JavaScript PWA. See the [integration plan](../../docs/functional/marketing-budget/PLAN.md) for the SPFx migration approach.

## Key Capabilities

- Create and manage marketing budgets with named schedules
- Line-item tracking (description, quantity, unit cost, totals)
- Budget-vs-actual summary calculations
- PDF export of budget reports
- Local storage (IndexedDB via Dexie)

## Functional Requirements

### Budget Management

- Create / rename / duplicate / delete budgets
- Track budget metadata (name, financial year, created date)
- Support multiple budgets in parallel

### Schedule (Line Items)

- Add / edit / remove line items within a budget
- Fields: description, quantity, unit cost, calculated total
- Support for budget categories/grouping (if applicable)
- Subtotals per group and grand total

### Reporting

- PDF export of budget summary and line items
- Print-friendly layout

### Data

- Local-only storage for initial release (IndexedDB)
- Future: migrate to SharePoint Lists for multi-device access
- No external API calls in initial release

## UX Requirements

- Responsive layout within SharePoint page context
- Fluent UI 8 components (tables, forms, buttons, dialogs)
- DDRE brand colours and theme tokens from pkg-theme
- Australian English throughout

## Non-Functional Requirements

- No service worker (not applicable in SPFx context)
- No external CDN dependencies (everything bundled)
- Accessibility: keyboard navigation, screen reader labels
- Performance: render within 2 seconds on standard hardware

## Open Questions

- Should we create a new SPFx solution (`spfx/marketing-budget/`) or add a web part to `intranet-core`? → **Decision: new solution** (per phase-aware delivery model)
- Which data sets should ship as seed data?
- Are there SharePoint-specific constraints on IndexedDB usage?
- When should the IndexedDB → SharePoint Lists migration be planned?
