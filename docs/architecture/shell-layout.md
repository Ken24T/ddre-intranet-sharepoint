<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Intranet Shell Layout Specification

## Overview

The Intranet Shell provides a consistent layout frame for all intranet
content. Users can personalize sidebar width and card arrangement, with
preferences persisted to localStorage.

> **Detailed specs:** [ux/README.md](ux/README.md)
>
> **Implementation checklist:** [implementation-checklist.md](implementation-checklist.md)

---

## Shell Regions

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR (48px)                           │
│  [☰] [Logo] [Search...]                    [Notifications] [👤] │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│  SIDEBAR   │              CONTENT AREA                          │
│  (240px)   │                                                    │
│            │  ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  [🏠 Home] │  │  Card   │ │  Card   │ │  Card   │               │
│  [📚 Lib]  │  │    1    │ │    2    │ │    3    │               │
│  [🤖 AI]   │  └─────────┘ └─────────┘ └─────────┘               │
│  [📊 PM]   │                                                    │
│            │  ┌─────────┐ ┌─────────┐                           │
│   ← →      │  │  Card   │ │  Card   │                           │
│  (resize)  │  │    4    │ │    5    │                           │
│            │  └─────────┘ └─────────┘                           │
│            │                                                    │
├────────────┴────────────────────────────────────────────────────┤
│ [🟢][🟢] Vault | PropertyMe    [User Name]   [Notifications...] │
│                         STATUS BAR (24px)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

| Region | Height/Width | Position | Detailed Spec |
|--------|--------------|----------|---------------|
| **Navbar** | 48px | Fixed top | [ux/navbar.md](ux/navbar.md) |
| **Sidebar** | 240px (resizable 64–320px) | Fixed left | [ux/sidebar.md](ux/sidebar.md) |
| **Content Area** | Fluid | Flows after sidebar | [ux/content-area.md](ux/content-area.md) |
| **Status Bar** | 24px | Fixed bottom | [ux/status-bar.md](ux/status-bar.md) |

---

## UX Specification Index

### Components

| Component | Spec |
|-----------|------|
| Navbar | [ux/navbar.md](ux/navbar.md) |
| Sidebar | [ux/sidebar.md](ux/sidebar.md) |
| Content Area | [ux/content-area.md](ux/content-area.md) |
| Card Grid | [ux/card-grid.md](ux/card-grid.md) |
| Function Cards | [ux/function-cards.md](ux/function-cards.md) |
| Status Bar | [ux/status-bar.md](ux/status-bar.md) |
| User Profile Menu | [ux/profile-menu.md](ux/profile-menu.md) |
| Settings Panel | [ux/settings-panel.md](ux/settings-panel.md) |
| Theme Support | [ux/theme-support.md](ux/theme-support.md) |

### Behaviors

| Behavior | Spec |
|----------|------|
| Navigation & Routing | [ux/navigation.md](ux/navigation.md) |
| Search Experience | [ux/search.md](ux/search.md) |
| Error Handling | [ux/error-handling.md](ux/error-handling.md) |
| Empty States | [ux/empty-states.md](ux/empty-states.md) |
| AI Assistant | [ux/ai-assistant.md](ux/ai-assistant.md) |
| Modals & Dialogs | [ux/modals.md](ux/modals.md) |

### Personalization

| Feature | Spec |
|---------|------|
| User Preferences | [ux/personalization.md#user-preferences](ux/personalization.md#user-preferences) |
| Responsive Breakpoints | [ux/personalization.md#responsive-breakpoints](ux/personalization.md#responsive-breakpoints) |
| Interaction Patterns | [ux/personalization.md#interaction-patterns](ux/personalization.md#interaction-patterns) |

### Standards

| Standard | Spec |
|----------|------|
| Icon System | [ux/standards.md#icon-system](ux/standards.md#icon-system) |
| Accessibility (WCAG 2.1 AA) | [ux/standards.md#accessibility-standards](ux/standards.md#accessibility-standards) |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@fluentui/react-icons` | ^2.x | Fluent UI System Icons |
| `@dnd-kit/core` | ^6.x | Drag-and-drop primitives |
| `@dnd-kit/sortable` | ^8.x | Sortable list/grid behavior |
| `@dnd-kit/utilities` | ^3.x | CSS utilities for transforms |

---

## Implementation TODO

Work through these in order. Each phase builds on the previous.

### Phase 1: Shell Foundation

> Get the basic layout rendering before adding functionality.

- [ ] **1.1** Create `IntranetShell` component with CSS Grid layout (navbar, sidebar, content, status bar regions)
- [ ] **1.2** Implement `Navbar` component — static 48px bar with logo placeholder
- [ ] **1.3** Implement `Sidebar` component — static 240px with hardcoded nav items
- [ ] **1.4** Implement `ContentArea` component — fluid region with padding
- [ ] **1.5** Implement `StatusBar` component — static 24px bar with placeholder text
- [ ] **1.6** Verify responsive behavior at all breakpoints (xs, sm, md, lg, xl)

### Phase 2: Core Components

> Make the shell functional with real data.

- [ ] **2.1** Add sidebar collapse/expand toggle (64px ↔ 240px)
- [ ] **2.2** Implement sidebar resize via cursor edge detection
- [ ] **2.3** Create `CardGrid` component with CSS Grid auto-fit
- [ ] **2.4** Create `FunctionCard` component with icon, title, description
- [ ] **2.5** Implement card context menu (pin, hide, open modes)
- [ ] **2.6** Add `@dnd-kit` for card drag-and-drop reordering
- [ ] **2.7** Wire up Hub navigation in sidebar (links to SharePoint pages)

### Phase 3: User Preferences

> Persist user customizations.

- [ ] **3.1** Create `useLocalStorage` hook for preferences
- [ ] **3.2** Persist sidebar width and collapsed state
- [ ] **3.3** Persist card order per Hub
- [ ] **3.4** Persist pinned and hidden cards per Hub
- [ ] **3.5** Implement `UserProfileMenu` dropdown (avatar, name, email)
- [ ] **3.6** Implement `SettingsPanel` modal with preference controls
- [ ] **3.7** Add "Reset to Defaults" with confirmation dialog

### Phase 4: Theme Support

> Light/Dark/System theme switching.

- [ ] **4.1** Define light and dark Fluent UI theme objects
- [ ] **4.2** Create `ThemeProvider` wrapper component
- [ ] **4.3** Apply theme early (before React render) to avoid flash
- [ ] **4.4** Add theme toggle to profile menu
- [ ] **4.5** Listen for `prefers-color-scheme` changes (System mode)
- [ ] **4.6** Verify all components render correctly in both themes

### Phase 5: Status Bar & API Health

> Real-time status indicators.

- [ ] **5.1** Create API health check service (Vault, PropertyMe)
- [ ] **5.2** Implement health indicator dots with tooltip
- [ ] **5.3** Display current user from SharePoint context
- [ ] **5.4** Create system notifications data source (SharePoint List or API)
- [ ] **5.5** Display notifications with scroll/truncate behavior
- [ ] **5.6** Implement notification dismiss (session-scoped)

### Phase 6: Search

> Global search with quick results and full results page.

- [ ] **6.1** Add expandable search input to navbar
- [ ] **6.2** Implement quick results dropdown (grouped by type)
- [ ] **6.3** Create search results page with filters panel
- [ ] **6.4** Wire up SharePoint Search API or Microsoft Graph Search
- [ ] **6.5** Implement keyboard navigation in results
- [ ] **6.6** Add "No results" empty state

### Phase 7: Error Handling

> Graceful failures and user feedback.

- [ ] **7.1** Create `ToastProvider` and `useToast` hook
- [ ] **7.2** Implement toast component with types (info, success, warning, error)
- [ ] **7.3** Add auto-retry logic for API calls
- [ ] **7.4** Create 403 Access Denied page
- [ ] **7.5** Create 404 Not Found page
- [ ] **7.6** Implement offline detection banner
- [ ] **7.7** Add reconnection handling with toast

### Phase 8: Modals & Dialogs

> Standardized modal patterns.

- [ ] **8.1** Create base `Modal` component with backdrop, focus trap, ESC handling
- [ ] **8.2** Implement `ConfirmationDialog` for destructive actions
- [ ] **8.3** Implement `HiddenCardsManager` modal
- [ ] **8.4** Implement `InfoModal` for system announcements
- [ ] **8.5** Verify modal accessibility (aria-modal, labelledby, focus return)

### Phase 9: AI Assistant

> Floating chatbot integration.

- [ ] **9.1** Create floating action button (bottom-right)
- [ ] **9.2** Implement chat panel (slide up from button)
- [ ] **9.3** Add pop-out to new window functionality
- [ ] **9.4** Implement hide/show toggle (sessionStorage)
- [ ] **9.5** Add "Show AI Assistant" option to profile menu
- [ ] **9.6** Wire up to Azure AI RAG proxy API

### Phase 10: Accessibility & Polish

> Final pass for WCAG 2.1 AA compliance.

- [ ] **10.1** Audit all components with axe DevTools
- [ ] **10.2** Verify keyboard navigation throughout
- [ ] **10.3** Add skip links for screen readers
- [ ] **10.4** Verify focus indicators in both themes
- [ ] **10.5** Test with screen reader (NVDA or VoiceOver)
- [ ] **10.6** Document any known accessibility limitations

---

## Quick Start

1. Read this overview to understand shell regions
2. Browse [ux/README.md](ux/README.md) for detailed specifications
3. Check [implementation-checklist.md](implementation-checklist.md) for TODO tracking
