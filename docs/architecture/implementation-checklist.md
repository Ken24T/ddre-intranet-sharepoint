<!-- markdownlint-disable MD013 MD060 -->
# Implementation Checklist

Consolidated TODO tracking for all UX specifications.

> **UX Specs:** [ux/README.md](ux/README.md)

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@fluentui/react-icons` | ^2.x | Fluent UI System Icons |
| `@dnd-kit/core` | ^6.x | Drag-and-drop primitives |
| `@dnd-kit/sortable` | ^8.x | Sortable list/grid behavior |
| `@dnd-kit/utilities` | ^3.x | CSS utilities for transforms |

---

## Shell Layout

> **Spec:** [shell-layout.md](shell-layout.md), [ux/components.md](ux/components.md)

- [ ] Add `@fluentui/react-icons` dependency to `spfx/intranet-core/package.json`
- [ ] Add `@dnd-kit/*` dependencies to `spfx/intranet-core/package.json`
- [ ] Create `IUserLayoutPreferences` interface in shared types
- [ ] Implement localStorage read/write utility with default fallback
- [ ] Build `ShellLayout` component with navbar, sidebar, content, status bar regions
- [ ] Build `Sidebar` component with resize edge detection and collapse toggle
- [ ] Build `CardGrid` component with `@dnd-kit/sortable` integration
- [ ] Build `StatusBar` component with API health indicators, user name, notifications
- [ ] Implement API health check service for Vault and PropertyMe
- [ ] Create system notifications data source (SharePoint List or API)
- [ ] Add responsive breakpoint handling with mobile drawer behavior
- [ ] Wire up preference persistence on user interactions

---

## Function Cards

> **Spec:** [ux/components.md#function-cards](ux/components.md#function-cards)

- [ ] Create `ICardConfiguration` interface for card metadata
- [ ] Create `IUserCardPreferences` interface for per-Hub user preferences
- [ ] Build `FunctionCard` component with icon, title, description, dynamic info areas
- [ ] Implement card context menu (Open, Open in new tab, Pin, Hide)
- [ ] Build card hover/focus/drag states per styling spec
- [ ] Implement dynamic data fetching with caching and error handling
- [ ] Create card administration API/UI for Hub assignment
- [ ] Implement pin/unpin logic with preference persistence
- [ ] Implement hide/restore card functionality

---

## User Profile Menu

> **Spec:** [ux/components.md#user-profile-menu](ux/components.md#user-profile-menu)

- [ ] Build `ProfileAvatar` component with Microsoft Graph photo fetch
- [ ] Implement initials fallback when photo unavailable
- [ ] Build `ProfileMenu` dropdown component
- [ ] Add "Show AI Assistant" menu item (conditional on hidden state)
- [ ] Build `SettingsPanel` modal/slide-out component
- [ ] Implement theme setting (Light/Dark/System)
- [ ] Implement sidebar default state setting
- [ ] Implement card grid columns setting
- [ ] Build hidden cards management UI with restore functionality
- [ ] Implement "Reset to Defaults" with confirmation dialog
- [ ] Create `IUserPreferences` interface consolidating all preferences
- [ ] Implement theme application before React render (avoid flash)
- [ ] Add system theme preference listener (`prefers-color-scheme`)
- [ ] Configure Help & Support link to Cognito Form

---

## Interaction Patterns

> **Spec:** [ux/personalization.md#interaction-patterns](ux/personalization.md#interaction-patterns)

- [ ] Implement hover/focus states per interaction patterns
- [ ] Add loading skeletons for async content
- [ ] Add drag-and-drop visual feedback (lift, placeholder, drop animation)

---

## AI Assistant

> **Spec:** [ux/behaviors.md#ai-assistant-chatbot](ux/behaviors.md#ai-assistant-chatbot)

- [ ] Build `AiAssistantButton` floating button component
- [ ] Build `AiAssistantPanel` chat panel component
- [ ] Implement panel open/close with animations
- [ ] Add pop-out to separate window functionality (`window.open`)
- [ ] Implement return-from-pop-out with `postMessage` sync
- [ ] Add hide/show toggle with sessionStorage persistence
- [ ] Add restore option in user profile menu
- [ ] Implement keyboard shortcut for show/hide (Ctrl+Shift+A)
- [ ] Integrate with AI RAG proxy API for chat responses

---

## Search

> **Spec:** [ux/behaviors.md#search-experience](ux/behaviors.md#search-experience)

- [ ] Build `SearchButton` expandable icon component in navbar
- [ ] Build `SearchInput` with expand/collapse animations
- [ ] Build `QuickResultsDropdown` with grouped results display
- [ ] Implement search debouncing (300ms)
- [ ] Build `SearchResultsPage` with filters panel and results list
- [ ] Implement Hub filter (checkbox list)
- [ ] Implement Content Type filter (checkbox list)
- [ ] Integrate with SharePoint Search REST API or Microsoft Graph
- [ ] Implement keyboard navigation for quick results
- [ ] Add URL query param support for shareable search links

---

## Error Handling

> **Spec:** [ux/behaviors.md#error-handling](ux/behaviors.md#error-handling)

- [ ] Build `ToastNotification` component with icon, message, dismiss, retry
- [ ] Build `ToastContainer` for positioning and stacking toasts
- [ ] Create toast service for triggering notifications from anywhere
- [ ] Implement auto-dismiss with configurable duration per type
- [ ] Build `AccessDeniedPage` (403) component
- [ ] Build `NotFoundPage` (404) component
- [ ] Implement `IRetryConfig` interface and retry logic wrapper
- [ ] Configure retry settings per API service
- [ ] Implement offline detection (`navigator.onLine` + events)
- [ ] Build `OfflineBanner` component
- [ ] Handle reconnection (banner removal, data refresh)

---

## Empty States

> **Spec:** [ux/behaviors.md#empty-states](ux/behaviors.md#empty-states)

- [ ] Build `EmptyState` reusable component (icon, title, message, optional action)
- [ ] Implement card grid empty state with context-aware messages
- [ ] Implement search no results state (simple message only)
- [ ] Implement notifications empty state with rotating dad jokes
- [ ] Configure cards to hide dynamic section when data unavailable

---

## Navigation & Routing

> **Spec:** [ux/behaviors.md#navigation--routing](ux/behaviors.md#navigation--routing)

- [ ] Create SharePoint pages for each Hub (Home, PM, Sales, Admin)
- [ ] Configure page-level permissions per Hub
- [ ] Implement hash-based router for within-Hub navigation
- [ ] Add `openMode` property to `ICardConfiguration` interface
- [ ] Implement inline tool rendering in content area
- [ ] Implement `window.open()` handling for window mode cards
- [ ] Implement new tab handling for external links
- [ ] Add "Back to Hub" button for inline tools
- [ ] Implement browser history state management
- [ ] Add scroll position restoration on back navigation
- [ ] Update sidebar to show only permitted Hubs
- [ ] Implement current Hub indicator styling in sidebar
- [ ] Add loading spinner for inline tool transitions
- [ ] Add focus management for navigation (focus to tool on open, back to card on close)

---

## Accessibility

> **Spec:** [ux/standards.md#accessibility-standards](ux/standards.md#accessibility-standards)

- [ ] Add skip link to main content
- [ ] Verify color contrast ratios with axe DevTools
- [ ] Test full keyboard navigation flow
- [ ] Test with NVDA screen reader
- [ ] Add `aria-live` regions for dynamic content
