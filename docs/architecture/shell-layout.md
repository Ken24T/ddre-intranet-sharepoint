<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Intranet Shell Layout Specification

## Overview

The Intranet Shell provides a consistent layout frame for all intranet
content. Users can personalize sidebar width and card arrangement, with
preferences persisted to localStorage.

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

## Component Specifications

### Navbar

| Property | Value | Notes |
|----------|-------|-------|
| Height | 48px | Fixed, not resizable |
| Position | Fixed top | Stays visible on scroll |
| Z-index | `zIndex.sticky` (100) | Above content, below modals |
| Background | Theme `bodyBackground` | Inherits from SharePoint theme |

**Contents:**
- Hamburger menu (mobile) or logo (desktop)
- Global search input
- Notification bell
- User profile avatar/menu

---

### Sidebar

| Property | Default | Min | Max | Collapsed |
|----------|---------|-----|-----|-----------|
| Width | 240px | 180px | 320px | 64px |
| Position | Fixed left | — | — | — |
| Z-index | `zIndex.sticky` (100) | — | — | — |

**Behaviors:**
- **Collapse toggle:** Click collapse button or double-click resize edge
- **Collapsed state:** Shows only icons (64px width), tooltip on hover
- **Resize:** Cursor-based edge detection (see Resize Behavior below)

**Contents:**
- Navigation items with icon + label
- Collapse/expand toggle button at bottom
- Scroll if items exceed viewport

---

### Content Area

| Property | Value | Notes |
|----------|-------|-------|
| Position | Flows after sidebar | Not fixed |
| Padding | `spacing.lg` (24px) | Consistent inner spacing |
| Min height | `calc(100vh - 48px - 24px)` | Fills below navbar and above status bar |

---

### Status Bar

| Property | Value | Notes |
|----------|-------|-------|
| Height | 24px | Fixed |
| Position | Fixed bottom | Always visible |
| Z-index | `zIndex.sticky` (100) | Above content |

**Layout (left to right):**

| Section | Width | Content |
|---------|-------|---------|
| API Health | ~80px | Vault and PropertyMe status indicators |
| User | ~120px | Current user display name |
| Notifications | Flex (remaining) | System notification messages |

#### API Health Indicators

Small circular indicators showing API connection status, checked on app startup.

| Status | Color | Meaning |
|--------|-------|---------|
| 🟢 Green | `#107C10` | Connected, healthy |
| 🟠 Orange | `#FFB900` | Degraded, slow response |
| 🔴 Red | `#D13438` | Unavailable, error |

**APIs monitored:**
- **Vault API** — Azure proxy for secrets/config
- **PropertyMe API** — Property management integration

**Behavior:**
- Health check on app load via lightweight ping endpoint
- Tooltip on hover shows last check time and response details
- Click opens detailed status panel (future enhancement)

#### Current User

Displays the authenticated user's display name from SharePoint context (`this.context.pageContext.user.displayName`).

#### System Notifications

| Property | Value |
|----------|-------|
| Source | SharePoint List or Azure proxy endpoint |
| Publishers | Department heads, Administrators (per RBAC model) |
| Display | Scrolling or latest-first truncated |
| Persistence | Dismissible per session |

**Notification schema:**

```typescript
interface ISystemNotification {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  publishedBy: string;
  publishedAt: Date;
  expiresAt?: Date;
}
```

---

## Resize Behavior

### Cursor-Based Edge Detection

The sidebar right edge is resizable using cursor detection, similar to VS Code panels.

| Zone | Cursor | Action |
|------|--------|--------|
| Within 5px of sidebar right edge | `col-resize` | Enable drag to resize |
| Dragging | `col-resize` | Update sidebar width in real-time |
| Release | `default` | Persist width to localStorage |

**Constraints:**
- Minimum width: 180px
- Maximum width: 320px
- Snap to collapsed (64px) if dragged below 120px
- Snap to minimum (180px) if dragged above 120px from collapsed

**Double-click:** Toggle between current width and collapsed state.

---

## Card Grid

### Grid Configuration

| Property | Default | Min | Max |
|----------|---------|-----|-----|
| Columns | 3 | 1 | 6 |
| Card min-width | 280px | — | — |
| Card min-height | 180px | — | — |
| Gap | `spacing.md` (16px) | — | — |

**Behavior:**
- User configures preferred max column count (1-6)
- Grid auto-fits based on container width and min card width
- Actual columns rendered = min(user preference, available space / min-width)

### Drag-and-Drop Repositioning

Using `@dnd-kit/sortable` for accessible card reordering.

| Interaction | Behavior |
|-------------|----------|
| Drag handle | Entire card is draggable (cursor `grab` on hover) |
| Dragging | Card lifts with `shadow.cardHover`, placeholder shows drop zone |
| Drop | Card animates to new position, order persisted to localStorage |
| Keyboard | Arrow keys to move, Enter/Space to pick up/drop |

**Accessibility:**
- Focus visible on cards
- Screen reader announcements for drag operations
- Keyboard-only reordering supported

---

## User Preferences

### Interface Definition

```typescript
interface IUserLayoutPreferences {
  sidebar: {
    width: number;       // Current width in pixels (64-320)
    collapsed: boolean;  // Collapsed state
  };
  cardGrid: {
    columns: number;           // User-preferred max columns (1-6)
    cardOrder: string[];       // Array of card IDs in display order
  };
}
```

### Storage

| Key | Value | Notes |
|-----|-------|-------|
| Storage type | localStorage | Device-specific, no cross-device sync |
| Key name | `ddre-intranet-layout` | Namespaced to avoid conflicts |
| Format | JSON string | Parsed on load, stringified on save |

### Default Values

```typescript
const defaultPreferences: IUserLayoutPreferences = {
  sidebar: {
    width: 240,
    collapsed: false,
  },
  cardGrid: {
    columns: 3,
    cardOrder: [], // Empty = default order from config
  },
};
```

### Persistence Triggers

| Event | Action |
|-------|--------|
| Sidebar resize complete | Save `sidebar.width` |
| Sidebar collapse toggle | Save `sidebar.collapsed` |
| Card drag complete | Save `cardGrid.cardOrder` |
| Column config change | Save `cardGrid.columns` |

---

## Responsive Breakpoints

Using breakpoints from `pkg-theme`:

| Breakpoint | Width | Sidebar Behavior | Card Grid |
|------------|-------|------------------|-----------|
| xs (320px) | < 480px | Hidden, hamburger menu | 1 column |
| sm (480px) | < 768px | Hidden, hamburger menu | 1-2 columns |
| md (768px) | < 1024px | Collapsed by default | 2-3 columns |
| lg (1024px) | < 1366px | Expanded | 3-4 columns |
| xl (1366px) | < 1920px | Expanded | 4-5 columns |
| xxl (1920px) | ≥ 1920px | Expanded | Up to 6 columns |

**Mobile behavior (xs, sm):**
- Sidebar becomes a slide-out drawer triggered by hamburger menu
- Overlay dims content area when drawer open
- User width preference ignored; drawer is full collapsed width (64px icons + labels)

---

## AI Assistant (Chatbot)

A floating AI chatbot button positioned in the bottom-right corner of the UI.
Users can interact via a popup panel, hide the button entirely, or pop the
chat out into a separate browser window.

### Button Placement

```
                                                    ┌─────────────────┐
                                                    │                 │
                                                    │   Chat Panel    │
                                                    │   (expanded)    │
                                                    │                 │
                                                    │                 │
                                                    └─────────────────┘
                                                              ┌───┐
                                                              │🤖│  ← Floating button
                                                              └───┘
─────────────────────────────────────────────────────────────────────
                         STATUS BAR
```

| Property | Value | Notes |
|----------|-------|-------|
| Position | Fixed, bottom-right | 24px from right edge, 48px from bottom (above status bar) |
| Size | 56px diameter | Circular button |
| Z-index | `zIndex.overlay` (300) | Above content, below modals |
| Icon | Robot/AI icon | From Fluent UI icons |

### States

| State | Visual | Behavior |
|-------|--------|----------|
| Default | Floating button visible | Click to open chat panel |
| Hidden | Button not rendered | User chose to hide for session |
| Panel open | Button + panel visible | Panel anchored above button |
| Popped out | Button shows "return" icon | Chat in separate window |

### Chat Panel (Embedded)

| Property | Value | Notes |
|----------|-------|-------|
| Width | 360px | Fixed |
| Height | 480px (max) | Or 60% viewport height, whichever is smaller |
| Position | Anchored above button | Bottom-right corner |
| Animation | Slide up + fade in (normal: 200ms) | On open |

**Panel contents:**
- Header with title ("AI Assistant") and action buttons
- Message history (scrollable)
- Input field with send button
- Typing indicator when AI is responding

**Header actions:**

| Button | Icon | Action |
|--------|------|--------|
| Pop out | ⧉ (external) | Open chat in new browser window |
| Minimize | − | Close panel, keep button visible |
| Hide | × | Hide button entirely for session |

### Pop-Out Window

When user clicks "Pop out", the chat opens in a new browser window.

| Property | Value | Notes |
|----------|-------|-------|
| Window size | 400px × 600px | Default, user can resize |
| Window features | Resizable, no menubar/toolbar | Clean chat-focused UI |
| Communication | `postMessage` or shared state | Sync between windows |

**Embedded button behavior when popped out:**
- Button remains visible but shows "return" icon (↩)
- Click returns chat to embedded panel and closes popup window
- If popup window is closed manually, embedded panel reactivates

### Visibility Toggle

Users can hide the chatbot button entirely during a session.

**To hide:**
- Click × in panel header, or
- Right-click button → "Hide for this session"

**To restore:**
- User profile menu → "Show AI Assistant"
- Or keyboard shortcut (e.g., `Ctrl+Shift+A`)

**Persistence:**
- Hidden state stored in `sessionStorage` (resets on tab close)
- Not persisted to localStorage (always visible on fresh load)

### User Preferences Addition

Extend `IUserLayoutPreferences`:

```typescript
interface IUserLayoutPreferences {
  sidebar: { /* ... */ };
  cardGrid: { /* ... */ };
  aiAssistant: {
    hidden: boolean;      // Session-only (sessionStorage)
    poppedOut: boolean;   // Track pop-out state
  };
}
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| xs, sm (< 768px) | Button smaller (48px), panel full-width |
| md+ (≥ 768px) | Standard button (56px), panel 360px wide |

### Accessibility

- Button has `aria-label="Open AI Assistant"`
- Panel is a dialog with proper focus trap
- Escape key closes panel
- Screen reader announces new messages

---

## Interaction Patterns

### Transition Timing

Using values from `pkg-theme`:

| Transition | Duration | Easing | Use Case |
|------------|----------|--------|----------|
| Fast | 100ms | ease-out | Hover states, focus rings |
| Normal | 200ms | ease-in-out | Sidebar collapse, card reorder |
| Slow | 300ms | ease-in-out | Mobile drawer slide, modal open |

### Hover States

| Element | Default | Hover | Notes |
|---------|---------|-------|-------|
| Function Card | `shadow.card` | `shadow.cardHover` + slight scale(1.02) | Cursor: pointer |
| Sidebar Item | Transparent bg | Theme `neutralLighter` bg | Cursor: pointer |
| Sidebar Resize Edge | Invisible | 2px accent color line | Cursor: col-resize |
| Button (primary) | Theme `themePrimary` | Theme `themeDarkAlt` | Standard Fluent |
| Button (secondary) | Transparent | Theme `neutralLighter` | Standard Fluent |

### Focus States

All interactive elements must have visible focus indicators for keyboard navigation.

| Element | Focus Style |
|---------|-------------|
| Cards | 2px solid `themePrimary`, offset 2px |
| Sidebar Items | 2px solid `themePrimary`, inset |
| Buttons | Fluent UI default focus ring |
| Form Inputs | Fluent UI default focus ring |

### Loading States

| Scenario | Pattern |
|----------|---------|
| Initial shell load | Full-page spinner with logo |
| Card content loading | Skeleton shimmer inside card |
| API health check | Pulsing gray circle until resolved |
| Sidebar navigation | Instant (no loading needed) |
| Card grid reorder | Optimistic UI (instant move, persist async) |

### Drag-and-Drop Feedback

| State | Visual Feedback |
|-------|-----------------|
| Idle | Card at rest with `shadow.card` |
| Grab (mousedown) | Cursor: grabbing, card lifts with `shadow.cardHover` |
| Dragging | Card follows cursor, 0.9 opacity, rotation ±2° |
| Over drop zone | Placeholder shows target position (dashed border) |
| Drop | Card animates to position (normal transition) |
| Invalid drop | Card returns to origin (normal transition) |

### Sidebar Animations

| Action | Animation |
|--------|-----------|
| Collapse | Width 240px → 64px (normal: 200ms) |
| Expand | Width 64px → user preference (normal: 200ms) |
| Resize drag | Real-time width update (no transition during drag) |
| Mobile drawer open | Slide from left (slow: 300ms) + overlay fade in |
| Mobile drawer close | Slide to left (slow: 300ms) + overlay fade out |

### Notification Animations

| Event | Animation |
|-------|-----------|
| New notification | Slide in from right, fade in (normal: 200ms) |
| Dismiss | Fade out (fast: 100ms) |
| Auto-scroll | Smooth scroll if multiple notifications |

### AI Assistant Animations

| Action | Animation |
|--------|-----------|
| Panel open | Slide up + fade in (normal: 200ms) |
| Panel close | Slide down + fade out (fast: 100ms) |
| Button appear | Scale 0 → 1 + fade in (normal: 200ms) |
| Button hide | Scale 1 → 0 + fade out (fast: 100ms) |
| Pop-out transition | Panel fades out as window opens |
| Return from pop-out | Panel fades in (normal: 200ms) |

---

## Icon System

### Package

Use `@fluentui/react-icons` (Fluent UI System Icons) for all iconography.
Tree-shakable, consistent with Microsoft 365 ecosystem.

```typescript
// Import only the icons you need
import { Home24Regular, Search24Regular } from '@fluentui/react-icons';
```

### Icon Sizing Convention

| Context | Size | Suffix | Example |
|---------|------|--------|---------|
| Sidebar navigation | 24px | `24Regular` | `Home24Regular` |
| Navbar actions | 20px | `20Regular` | `Alert20Regular` |
| Buttons (with text) | 16px | `16Regular` | `Send16Regular` |
| Status indicators | 12px | `12Filled` | `Circle12Filled` |
| Card actions | 20px | `20Regular` | `MoreHorizontal20Regular` |

### Standard Icon Mapping

#### Navbar Icons

| Action | Icon | Import |
|--------|------|--------|
| Hamburger menu | ☰ | `Navigation24Regular` |
| Search | 🔍 | `Search24Regular` |
| Notifications | 🔔 | `Alert24Regular` |
| User profile | 👤 | `Person24Regular` |
| Settings | ⚙ | `Settings24Regular` |

#### Sidebar Navigation

| Item | Icon | Import |
|------|------|--------|
| Home | 🏠 | `Home24Regular` |
| Dante Library | 📚 | `Library24Regular` |
| AI Assistant | 🤖 | `Bot24Regular` |
| PM Dashboard | 📊 | `DataUsage24Regular` |
| Administration | 🛡 | `Shield24Regular` |
| Collapse sidebar | « | `PanelLeftContract24Regular` |
| Expand sidebar | » | `PanelLeftExpand24Regular` |

#### Card Grid Icons

| Action | Icon | Import |
|--------|------|--------|
| Drag handle | ⋮⋮ | `ReOrderDotsVertical24Regular` |
| Card menu | ⋯ | `MoreHorizontal20Regular` |
| Open/Launch | → | `Open24Regular` |
| Favorite | ☆ | `Star24Regular` / `Star24Filled` |

#### AI Assistant

| Action | Icon | Import |
|--------|------|--------|
| Bot button | 🤖 | `Bot24Regular` |
| Send message | ➤ | `Send24Regular` |
| Pop out | ⧉ | `WindowNew24Regular` |
| Return/dock | ↩ | `WindowInprivate24Regular` |
| Minimize | − | `Subtract24Regular` |
| Close/hide | × | `Dismiss24Regular` |

#### Status Bar Icons

| Indicator | Icon | Import |
|-----------|------|--------|
| API healthy | 🟢 | `Circle12Filled` (green) |
| API degraded | 🟠 | `Circle12Filled` (orange) |
| API error | 🔴 | `Circle12Filled` (red) |
| Info notification | ℹ | `Info16Regular` |
| Warning notification | ⚠ | `Warning16Regular` |
| Error notification | ⛔ | `ErrorCircle16Regular` |

#### Common Actions

| Action | Icon | Import |
|--------|------|--------|
| Add/Create | + | `Add24Regular` |
| Edit | ✏ | `Edit24Regular` |
| Delete | 🗑 | `Delete24Regular` |
| Save | 💾 | `Save24Regular` |
| Cancel | × | `Dismiss24Regular` |
| Refresh | ↻ | `ArrowClockwise24Regular` |
| Filter | ⏳ | `Filter24Regular` |
| Sort | ↕ | `ArrowSort24Regular` |
| Expand | ▼ | `ChevronDown24Regular` |
| Collapse | ▲ | `ChevronUp24Regular` |
| External link | ↗ | `OpenRegular` |
| Copy | 📋 | `Copy24Regular` |
| Download | ⬇ | `ArrowDownload24Regular` |
| Upload | ⬆ | `ArrowUpload24Regular` |

### Filled vs Regular

| Style | Use Case |
|-------|----------|
| `Regular` | Default state, most UI elements |
| `Filled` | Active/selected state, emphasis, status indicators |

**Example:** Star icon for favorites

- `Star24Regular` — not favorited
- `Star24Filled` — favorited

---

## Accessibility Standards

### Target Conformance

**WCAG 2.1 Level AA** — the industry standard for enterprise web applications.

Fluent UI components provide strong accessibility foundations out of the box.
Custom components must meet the same standards.

### Key Requirements

#### Perceivable

| Requirement | Implementation |
|-------------|----------------|
| Text alternatives | All images, icons have `alt` or `aria-label` |
| Color contrast | Minimum 4.5:1 for normal text, 3:1 for large text |
| Don't rely on color alone | Use icons + color for status indicators |
| Resize support | UI readable at 200% zoom |

#### Operable

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All features accessible without mouse |
| Focus visible | 2px solid focus ring on all interactive elements |
| Focus order | Logical tab order (left→right, top→bottom) |
| Skip links | "Skip to main content" link for screen readers |
| No keyboard traps | Escape key closes modals/panels |
| Touch targets | Minimum 44×44px for touch interactions |

#### Understandable

| Requirement | Implementation |
|-------------|----------------|
| Language declared | `<html lang="en">` |
| Consistent navigation | Sidebar, navbar in same position across pages |
| Error identification | Form errors clearly described, linked to field |
| Labels | All form inputs have visible labels |

#### Robust

| Requirement | Implementation |
|-------------|----------------|
| Valid HTML | Semantic markup, proper heading hierarchy |
| ARIA usage | Use ARIA only when native HTML insufficient |
| Screen reader testing | Test with NVDA or VoiceOver |

### Component-Specific Requirements

#### Sidebar Accessibility

- `aria-expanded` on collapse toggle
- `aria-label="Main navigation"` on nav element
- Current page indicated with `aria-current="page"`

#### Card Grid Accessibility

- Drag-and-drop has keyboard alternative (arrow keys)
- Screen reader announces card position changes
- Cards are in a `role="list"` container

#### AI Assistant Accessibility

- Button has `aria-label="Open AI Assistant"`
- Chat panel is `role="dialog"` with `aria-modal="true"`
- New messages announced with `aria-live="polite"`
- Focus trapped in panel when open

#### Status Bar Accessibility

- API indicators have `aria-label` (e.g., "Vault API: Connected")
- Notifications region has `aria-live="polite"`

### Testing Tools

| Tool | Purpose |
|------|---------|
| **axe DevTools** | Browser extension for automated checks |
| **Lighthouse** | Chrome DevTools accessibility audit |
| **NVDA** | Free Windows screen reader for manual testing |
| **Keyboard only** | Unplug mouse and navigate entire app |

### Implementation Checklist Addition

- [ ] Add skip link to main content
- [ ] Verify color contrast ratios with axe DevTools
- [ ] Test full keyboard navigation flow
- [ ] Test with NVDA screen reader
- [ ] Add `aria-live` regions for dynamic content

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@fluentui/react-icons` | ^2.x | Fluent UI System Icons |
| `@dnd-kit/core` | ^6.x | Drag-and-drop primitives |
| `@dnd-kit/sortable` | ^8.x | Sortable list/grid behavior |
| `@dnd-kit/utilities` | ^3.x | CSS utilities for transforms |

---

## Implementation Checklist

### Shell Layout

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

### Interaction Pattern Implementation

- [ ] Implement hover/focus states per interaction patterns
- [ ] Add loading skeletons for async content
- [ ] Add drag-and-drop visual feedback (lift, placeholder, drop animation)

### AI Assistant Implementation

- [ ] Build `AiAssistantButton` floating button component
- [ ] Build `AiAssistantPanel` chat panel component
- [ ] Implement panel open/close with animations
- [ ] Add pop-out to separate window functionality (`window.open`)
- [ ] Implement return-from-pop-out with `postMessage` sync
- [ ] Add hide/show toggle with sessionStorage persistence
- [ ] Add restore option in user profile menu
- [ ] Implement keyboard shortcut for show/hide (Ctrl+Shift+A)
- [ ] Integrate with AI RAG proxy API for chat responses
