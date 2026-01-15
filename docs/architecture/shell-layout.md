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
| **Navbar** | 48px | Fixed top | [ux/components.md#navbar](ux/components.md#navbar) |
| **Sidebar** | 240px (resizable 64–320px) | Fixed left | [ux/components.md#sidebar](ux/components.md#sidebar) |
| **Content Area** | Fluid | Flows after sidebar | [ux/components.md#content-area](ux/components.md#content-area) |
| **Status Bar** | 24px | Fixed bottom | [ux/components.md#status-bar](ux/components.md#status-bar) |

---

## UX Specification Index

### Components

| Component | Spec |
|-----------|------|
| Navbar | [ux/components.md#navbar](ux/components.md#navbar) |
| Sidebar | [ux/components.md#sidebar](ux/components.md#sidebar) |
| Card Grid | [ux/components.md#card-grid](ux/components.md#card-grid) |
| Function Cards | [ux/components.md#function-cards](ux/components.md#function-cards) |
| Status Bar | [ux/components.md#status-bar](ux/components.md#status-bar) |
| User Profile Menu | [ux/components.md#user-profile-menu](ux/components.md#user-profile-menu) |
| Settings Panel | [ux/components.md#settings-panel](ux/components.md#settings-panel) |
| Theme Support | [ux/components.md#theme-support](ux/components.md#theme-support) |

### Behaviors

| Behavior | Spec |
|----------|------|
| Navigation & Routing | [ux/behaviors.md#navigation--routing](ux/behaviors.md#navigation--routing) |
| Search Experience | [ux/behaviors.md#search-experience](ux/behaviors.md#search-experience) |
| Error Handling | [ux/behaviors.md#error-handling](ux/behaviors.md#error-handling) |
| Empty States | [ux/behaviors.md#empty-states](ux/behaviors.md#empty-states) |
| AI Assistant | [ux/behaviors.md#ai-assistant-chatbot](ux/behaviors.md#ai-assistant-chatbot) |

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
