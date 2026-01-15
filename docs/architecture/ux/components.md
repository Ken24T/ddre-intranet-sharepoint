<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Component Specifications

Core UI components that make up the intranet shell.

## Related Specs

| Dependency | Spec | Why |
|------------|------|-----|
| **Icons** | [standards.md](standards.md#icon-system) | All components use Fluent UI icons |
| **Interactions** | [personalization.md](personalization.md#interaction-patterns) | Hover, focus, drag states |
| **Empty States** | [behaviors.md](behaviors.md#empty-states) | What to show when no content |
| **Error Handling** | [behaviors.md](behaviors.md#error-handling) | API failures, toasts |

---

## Navbar

| Property | Value | Notes |
|----------|-------|-------|
| Height | 48px | Fixed, not resizable |
| Position | Fixed top | Stays visible on scroll |
| Z-index | `zIndex.sticky` (100) | Above content, below modals |
| Background | Theme `bodyBackground` | Inherits from SharePoint theme |

**Contents:**

- Hamburger menu (mobile) or logo (desktop)
- Search icon (expandable) — see [Search Experience](behaviors.md#search-experience)
- Notification bell
- User profile avatar/menu

---

## Sidebar

| Property | Default | Min | Max | Collapsed |
|----------|---------|-----|-----|-----------|
| Width | 240px | 180px | 320px | 64px |
| Position | Fixed left | — | — | — |
| Z-index | `zIndex.sticky` (100) | — | — | — |

**Behaviors:**

- **Collapse toggle:** Click collapse button or double-click resize edge
- **Collapsed state:** Shows only icons (64px width), tooltip on hover
- **Resize:** Cursor-based edge detection (see [Resize Behavior](#resize-behavior) below)

**Contents:**

- Navigation items with icon + label
- Collapse/expand toggle button at bottom
- Scroll if items exceed viewport

### Resize Behavior

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

### Sidebar Accessibility

> Implements: [Accessibility Standards](standards.md#accessibility-standards)

- `aria-expanded` on collapse toggle
- `aria-label="Main navigation"` on nav element
- Current page indicated with `aria-current="page"`

---

## Content Area

| Property | Value | Notes |
|----------|-------|-------|
| Position | Flows after sidebar | Not fixed |
| Padding | `spacing.lg` (24px) | Consistent inner spacing |
| Min height | `calc(100vh - 48px - 24px)` | Fills below navbar and above status bar |

---

## Status Bar

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

### API Health Indicators

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

### Current User

Displays the authenticated user's display name from SharePoint context (`this.context.pageContext.user.displayName`).

### System Notifications

| Property | Value |
|----------|-------|
| Source | SharePoint List or Azure proxy endpoint |
| Publishers | Department heads, Administrators (per RBAC model) |
| Display | Scrolling or latest-first truncated |
| Persistence | Dismissible per session |

> Empty notification state: see [behaviors.md#notifications-empty](behaviors.md#notifications-empty)

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

### Status Bar Accessibility

> Implements: [Accessibility Standards](standards.md#accessibility-standards)

- API indicators have `aria-label` (e.g., "Vault API: Connected")
- Notifications region has `aria-live="polite"`

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

> Empty card grid: see [behaviors.md#card-grid-empty](behaviors.md#card-grid-empty)

### Drag-and-Drop Repositioning

Using `@dnd-kit/sortable` for accessible card reordering.

| Interaction | Behavior |
|-------------|----------|
| Drag handle | Entire card is draggable (cursor `grab` on hover) |
| Dragging | Card lifts with `shadow.cardHover`, placeholder shows drop zone |
| Drop | Card animates to new position, order persisted to localStorage |
| Keyboard | Arrow keys to move, Enter/Space to pick up/drop |

> Drag feedback details: [personalization.md#drag-and-drop-feedback](personalization.md#drag-and-drop-feedback)

### Card Grid Accessibility

> Implements: [Accessibility Standards](standards.md#accessibility-standards)

- Drag-and-drop has keyboard alternative (arrow keys)
- Screen reader announces card position changes
- Cards are in a `role="list"` container

---

## Function Cards

Function cards are the primary entry points to tools and apps on the intranet.
Cards are Hub-specific but can be configured to appear across multiple Hubs.
Only cards the user has permission to access are displayed.

### Card Anatomy

```
┌─────────────────────────────────────────┐
│  ┌────┐                          ┌───┐  │
│  │Icon│  Title                   │ ⋮ │  │  ← Context menu
│  └────┘                          └───┘  │
│                                         │
│  Description text that explains         │
│  the purpose of this tool...            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │     Dynamic Info Area           │    │  ← Live data preview
│  │     "5 properties pending"      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Badge]              Last updated: 2h  │  ← Optional metadata
└─────────────────────────────────────────┘
```

### Card Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Min width | 280px | Responsive grid constraint |
| Min height | 180px | Ensures consistent layout |
| Max height | 240px | Prevents overly tall cards |
| Padding | `spacing.md` (16px) | Inner spacing |
| Border radius | `borderRadius.lg` (8px) | Rounded corners |

### Card Elements

| Element | Position | Required | Notes |
|---------|----------|----------|-------|
| Icon | Top-left | Yes | 32px, from Fluent UI icons |
| Title | Top, beside icon | Yes | Bold, truncate if too long |
| Context menu | Top-right | Yes | "⋮" button, opens menu |
| Description | Below title | Yes | 2-3 lines max, truncate with ellipsis |
| Dynamic info | Center/lower | Optional | Live data from tool API |
| Badge | Bottom-left | Optional | Status indicator (e.g., "New", "3 alerts") |
| Metadata | Bottom-right | Optional | Last updated, item count |

### Card Styling

| State | Background | Shadow | Border |
|-------|------------|--------|--------|
| Default | Theme `bodyBackground` | `shadow.card` | 1px `neutralLight` |
| Hover | Theme `bodyBackground` | `shadow.cardHover` | 1px `themePrimary` |
| Focused | Theme `bodyBackground` | `shadow.cardHover` | 2px `themePrimary` |
| Dragging | Theme `bodyBackground` | `shadow.cardHover` | 1px `themePrimary`, 0.9 opacity |

### Card Actions

#### Primary Action

Click anywhere on card (except context menu) to open the tool.

#### Context Menu

Right-click or click "⋮" button to open context menu:

| Action | Icon | Description |
|--------|------|-------------|
| Open | `Open24Regular` | Open tool (same as click) |
| Open in new tab | `OpenRegular` | Open in new browser tab |
| Pin to top | `Pin24Regular` | Move card to first position |
| Unpin | `PinOff24Regular` | Remove pin, return to default order |
| Hide card | `EyeOff24Regular` | Hide from view (can restore in settings) |

**Note:** "Hide card" only hides from user's view, not from the Hub configuration.

### Dynamic Information

Cards can display live data relevant to the tool:

| Card | Dynamic Info Example |
|------|---------------------|
| PM Dashboard | "5 properties pending review" |
| Dante Library | "3 new policies this week" |
| AI Assistant | "Ask me anything" (static) |
| Marketing Budget | "Current budget: $12,450" |
| Administration | "2 access requests pending" |

**Data fetching:**

- Fetch on initial load
- Cache for 5 minutes (configurable)
- Show skeleton shimmer while loading
- Show "—" if fetch fails (don't break the card)

> Empty dynamic data: see [behaviors.md#dynamic-card-data-empty](behaviors.md#dynamic-card-data-empty)
>
> API failure handling: see [behaviors.md#api-failure-handling](behaviors.md#api-failure-handling)

### Hub-Specific Configuration

Cards are assigned to Hubs by administrators.

#### Hub Assignment Model

```typescript
interface ICardConfiguration {
  id: string;                    // Unique card identifier
  title: string;
  description: string;
  icon: string;                  // Fluent UI icon name
  toolUrl: string;               // URL or route to open
  hubs: string[];                // Hub IDs where card appears
  permissions: string[];         // Entra ID groups with access
  dynamicDataEndpoint?: string;  // API endpoint for live data
  order: number;                 // Default display order
}
```

#### Card Assignment Rules

| Rule | Description |
|------|-------------|
| Hub-specific | Card appears only in assigned Hubs |
| Common cards | Card can be assigned to multiple Hubs |
| Permission-filtered | User only sees cards they have access to |
| No duplicates | Card appears once per Hub, even if user has multiple permission groups |

#### Administration

Administrators (via Administration Hub) can:

- Add/remove cards from Hubs
- Set default card order per Hub
- Configure card metadata (title, description, icon)
- Set permission groups for each card

### User Card Preferences

Stored per-user, per-Hub in localStorage:

```typescript
interface IUserCardPreferences {
  [hubId: string]: {
    cardOrder: string[];      // Card IDs in user's preferred order
    pinnedCards: string[];    // Card IDs pinned to top
    hiddenCards: string[];    // Card IDs hidden by user
  };
}
```

**Precedence:**

1. Pinned cards appear first (in pinned order)
2. User-ordered cards next
3. Remaining cards in admin-defined default order
