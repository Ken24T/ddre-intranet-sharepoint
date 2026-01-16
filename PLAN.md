# DDRE Intranet – Implementation Plan

Central task tracking for all planned implementations.

> **Last updated:** 2025-01-17
>
> **Current focus:** Intranet Shell (Phase 8: Modals & Dialogs)

---

## Quick Status

| Area | Status | Progress |
|------|--------|----------|
| **Intranet Shell** | 🟡 In Progress | Phases 1-7 ✅, Phase 8 next |
| **Shared Packages** | 🟡 Scaffolded | pkg-theme, pkg-api-client |
| **Business Apps** | ⚪ Not Started | Awaiting shell completion |
| **Infrastructure** | 🟡 In Progress | Dev harness ready, CI pending |

---

## Table of Contents

1. [Intranet Shell](#1-intranet-shell)
2. [Shared Packages](#2-shared-packages)
3. [Business Apps](#3-business-apps)
4. [Infrastructure & DevOps](#4-infrastructure--devops)
5. [Documentation](#5-documentation)

---

## 1. Intranet Shell

> **Location:** `spfx/intranet-core`
>
> **Specs:** [docs/architecture/shell-layout.md](docs/architecture/shell-layout.md), [docs/architecture/ux/](docs/architecture/ux/)

The foundation SPFx solution providing the layout frame for all intranet content.

### Phase 1: Shell Foundation ✅

- [x] 1.1 Create `IntranetShell` component with CSS Grid layout
- [x] 1.2 Implement `Navbar` component (48px fixed top)
- [x] 1.3 Implement `Sidebar` component (240px default)
- [x] 1.4 Implement `ContentArea` component (fluid)
- [x] 1.5 Implement `StatusBar` component (24px fixed bottom)
- [x] 1.6 Verify responsive behavior at all breakpoints

### Phase 2: Core Components ✅

- [x] 2.1 Add sidebar collapse/expand toggle (64px ↔ 240px)
- [x] 2.2 Implement sidebar resize via cursor edge detection
- [x] 2.3 Create `CardGrid` component with CSS Grid auto-fit
- [x] 2.4 Create `FunctionCard` component with icon, title, description
- [x] 2.5 Implement card context menu (pin, hide, open modes)
- [x] 2.6 Add `@dnd-kit` for card drag-and-drop reordering
- [x] 2.7 Wire up Hub navigation in sidebar

### Phase 3: User Preferences ✅

- [x] 3.1 Create `useLocalStorage` hook for preferences
- [x] 3.2 Persist sidebar width and collapsed state
- [x] 3.3 Persist card order per Hub
- [x] 3.4 Persist pinned and hidden cards per Hub
- [x] 3.5 Implement `UserProfileMenu` dropdown
- [x] 3.6 Implement `SettingsPanel` modal with preference controls
- [x] 3.7 Add "Reset to Defaults" with confirmation dialog

### Phase 4: Theme Support ✅

- [x] 4.1 Define light and dark Fluent UI theme objects
- [x] 4.2 Create `ThemeProvider` wrapper component
- [x] 4.3 Apply theme early (before React render) to avoid flash
- [x] 4.4 Add theme toggle to profile menu
- [x] 4.5 Listen for `prefers-color-scheme` changes (System mode)
- [x] 4.6 Verify all components render correctly in both themes

### Phase 5: Status Bar & API Health ✅

- [x] 5.1 Create API health check service (Vault, PropertyMe)
- [x] 5.2 Implement health indicator dots with tooltip
- [x] 5.3 Display current user from SharePoint context
- [x] 5.4 Create system notifications data source
- [x] 5.5 Display notifications with scroll/truncate behavior
- [x] 5.6 Implement notification dismiss (session-scoped)

### Phase 6: Search ✅

- [x] 6.1 Add expandable search input to navbar
- [x] 6.2 Implement quick results dropdown (grouped by type)
- [x] 6.3 Create search results page with filters panel
- [ ] 6.4 Wire up SharePoint Search API or Microsoft Graph Search
- [x] 6.5 Implement keyboard navigation in results
- [x] 6.6 Add "No results" empty state

### Phase 7: Error Handling ✅

- [x] 7.1 Create `ToastProvider` and `useToast` hook
- [x] 7.2 Implement toast component (info, success, warning, error)
- [x] 7.3 Add auto-retry logic for API calls
- [x] 7.4 Create 403 Access Denied page
- [x] 7.5 Create 404 Not Found page
- [x] 7.6 Implement offline detection banner
- [x] 7.7 Add reconnection handling with toast

### Phase 8: Modals & Dialogs 🟡

- [ ] 8.1 Create base `Modal` component with backdrop, focus trap, ESC
- [ ] 8.2 Implement `ConfirmationDialog` for destructive actions
- [ ] 8.3 Implement `HiddenCardsManager` modal
- [ ] 8.4 Implement `InfoModal` for system announcements
- [ ] 8.5 Verify modal accessibility (aria-modal, labelledby, focus)

### Phase 9: AI Assistant

- [ ] 9.1 Create floating action button (bottom-right)
- [ ] 9.2 Implement chat panel (slide up from button)
- [ ] 9.3 Add pop-out to new window functionality
- [ ] 9.4 Implement hide/show toggle (sessionStorage)
- [ ] 9.5 Add "Show AI Assistant" option to profile menu
- [ ] 9.6 Wire up to Azure AI RAG proxy API

### Phase 10: Accessibility & Polish

- [ ] 10.1 Audit all components with axe DevTools
- [ ] 10.2 Verify keyboard navigation throughout
- [ ] 10.3 Add skip links for screen readers
- [ ] 10.4 Verify focus indicators in both themes
- [ ] 10.5 Test with screen reader (NVDA or VoiceOver)
- [ ] 10.6 Document any known accessibility limitations

---

## 2. Shared Packages

> **Location:** `packages/`

Reusable libraries consumed by SPFx solutions.

### pkg-theme

> **Location:** `packages/pkg-theme`
>
> **Status:** 🟡 Scaffolded

Design tokens for consistent styling across apps.

- [x] Define spacing, typography, shadow tokens
- [x] Define z-index scale, radii, breakpoints
- [ ] Export as CSS custom properties
- [ ] Add Fluent UI theme integration helpers
- [ ] Document token usage guidelines

### pkg-api-client

> **Location:** `packages/pkg-api-client`
>
> **Status:** 🟡 Scaffolded

Type-safe clients for Azure proxy APIs.

- [x] Create `BaseClient` with error handling
- [x] Create `VaultClient` for Sales CRM
- [x] Create `PropertyMeClient` for PM data
- [x] Create `AiClient` for RAG chatbot
- [ ] Add request caching layer
- [ ] Add retry with exponential backoff
- [ ] Publish to internal npm registry (or local install)

---

## 3. Business Apps

> **Location:** `apps/` (requirements), `spfx/` (implementations)

Each app gets its own SPFx solution deployed as a separate `.sppkg`.

### app-cognito-forms

> **Status:** ⚪ Planning
>
> **Hub:** Administration

Embedded Cognito Forms for internal requests.

- [ ] Define requirements in `apps/app-cognito-forms/`
- [ ] Create SPFx solution `spfx/cognito-forms/`
- [ ] Implement form embedding component
- [ ] Configure forms list (Help & Support, IT Request, etc.)

### app-dante-library

> **Status:** ⚪ Planning
>
> **Hub:** Office

AI-powered document library search using Dante AI.

- [ ] Define requirements in `apps/app-dante-library/`
- [ ] Create SPFx solution `spfx/dante-library/`
- [ ] Implement Dante AI chat integration
- [ ] Wire up document context from SharePoint

### app-marketing-budget

> **Status:** ⚪ Planning
>
> **Hub:** Administration

Marketing budget tracking and reporting.

- [ ] Define requirements in `apps/app-marketing-budget/`
- [ ] Create SPFx solution `spfx/marketing-budget/`
- [ ] Design data model (SharePoint List or external)
- [ ] Implement budget dashboard component
- [ ] Implement budget entry/edit forms

### app-pm-dashboard

> **Status:** ⚪ Planning
>
> **Hub:** Property Management

PropertyMe data visualization dashboard.

- [ ] Define requirements in `apps/app-pm-dashboard/`
- [ ] Create SPFx solution `spfx/pm-dashboard/`
- [ ] Design dashboard layout and widgets
- [ ] Integrate with `pkg-api-client` PropertyMeClient
- [ ] Implement property list, tenant info, maintenance views

### app-qrcoder

> **Status:** ⚪ Planning
>
> **Hub:** Office

QR code generation utility for business use.

- [ ] Define requirements in `apps/app-qrcoder/`
- [ ] Create SPFx solution `spfx/qrcoder/`
- [ ] Select QR code generation library
- [ ] Implement QR generator UI
- [ ] Add download/print functionality

### app-surveys

> **Status:** ⚪ Planning
>
> **Hub:** Administration

Internal survey creation and management.

- [ ] Define requirements in `apps/app-surveys/`
- [ ] Create SPFx solution `spfx/surveys/`
- [ ] Design survey builder UI
- [ ] Implement survey response collection
- [ ] Add results visualization

### app-vault-batcher

> **Status:** ⚪ Planning
>
> **Hub:** Sales

Batch operations for Vault CRM data.

- [ ] Define requirements in `apps/app-vault-batcher/`
- [ ] Create SPFx solution `spfx/vault-batcher/`
- [ ] Define batch operation types
- [ ] Integrate with `pkg-api-client` VaultClient
- [ ] Implement batch upload/update UI
- [ ] Add progress tracking and error reporting

---

## 4. Infrastructure & DevOps

### Development Environment

- [x] Configure Vite dev harness for component development
- [x] Set up environment configs (dev/test/prod)
- [ ] Document local development setup in runbook
- [ ] Add VS Code recommended extensions list

### CI/CD Pipeline

- [ ] Create GitHub Actions workflow for PR validation
- [ ] Add lint + test + build checks
- [ ] Configure automated `.sppkg` artifact creation
- [ ] Set up deployment to SharePoint App Catalog (manual trigger)
- [ ] Add version bump automation

### Azure Proxy Services

> **Contracts:** `contracts/*.openapi.yml`

- [ ] Deploy AI RAG proxy to Azure
- [ ] Deploy Vault API proxy to Azure
- [ ] Deploy PropertyMe API proxy to Azure
- [ ] Configure API Management / Function Apps
- [ ] Set up monitoring and alerts

### SharePoint Tenant Setup

- [ ] Provision Dev tenant
- [ ] Provision Test tenant
- [ ] Provision Prod tenant
- [ ] Configure App Catalog in each tenant
- [ ] Set up SharePoint Lists for notifications, config

---

## 5. Documentation

### Architecture Docs

- [x] Shell layout specification
- [x] UX component specifications (20 specs)
- [x] Theming architecture
- [x] API integration architecture
- [ ] Security and permissions model
- [ ] Data flow diagrams

### Runbooks

- [x] Local development setup
- [x] Release process (TCTBP)
- [x] Deployment guide
- [ ] Troubleshooting guide
- [ ] Rollback procedures

### User Documentation

- [ ] End-user guide for intranet features
- [ ] Admin guide for card/notification management
- [ ] App-specific user guides

---

## Notes

### Conventions

- **Branch naming:** `feature/<name>`, `fix/<name>`, `ui/<name>`, `docs/<name>`
- **Commit messages:** Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Workflow:** TCTBP (Test, Commit, Tag, Bump, Push) for releases

### References

- [Copilot Instructions](.github/copilot-instructions.md)
- [Shell Layout Spec](docs/architecture/shell-layout.md)
- [UX Specifications](docs/architecture/ux/README.md)
- [API Contracts](contracts/)
