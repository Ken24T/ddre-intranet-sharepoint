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

## Quick Start

1. Read this overview to understand shell regions
2. Browse [ux/README.md](ux/README.md) for detailed specifications
3. Check [implementation-checklist.md](implementation-checklist.md) for TODO tracking
