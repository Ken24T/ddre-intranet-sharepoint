<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Function Cards

Function cards are the primary entry points to tools and apps on the intranet.
Cards are Hub-specific but can be configured to appear across multiple Hubs.
Only cards the user has permission to access are displayed.

---

## Card Anatomy

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

---

## Card Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Min width | 280px | Responsive grid constraint |
| Min height | 180px | Ensures consistent layout |
| Max height | 240px | Prevents overly tall cards |
| Padding | `spacing.md` (16px) | Inner spacing |
| Border radius | `borderRadius.lg` (8px) | Rounded corners |

---

## Card Elements

| Element | Position | Required | Notes |
|---------|----------|----------|-------|
| Icon | Top-left | Yes | 32px, from Fluent UI icons |
| Title | Top, beside icon | Yes | Bold, truncate if too long |
| Context menu | Top-right | Yes | "⋮" button, opens menu |
| Description | Below title | Yes | 2-3 lines max, truncate with ellipsis |
| Dynamic info | Center/lower | Optional | Live data from tool API |
| Badge | Bottom-left | Optional | Status indicator (e.g., "New", "3 alerts") |
| Metadata | Bottom-right | Optional | Last updated, item count |

---

## Card Styling

| State | Background | Shadow | Border |
|-------|------------|--------|--------|
| Default | Theme `bodyBackground` | `shadow.card` | 1px `neutralLight` |
| Hover | Theme `bodyBackground` | `shadow.cardHover` | 1px `themePrimary` |
| Focused | Theme `bodyBackground` | `shadow.cardHover` | 2px `themePrimary` |
| Dragging | Theme `bodyBackground` | `shadow.cardHover` | 1px `themePrimary`, 0.9 opacity |

---

## Card Actions

### Primary Action

Click anywhere on card (except context menu) to open the tool.

### Context Menu

Right-click or click "⋮" button to open context menu:

| Action | Icon | Description |
|--------|------|-------------|
| Open | `Open24Regular` | Open tool (same as click) |
| Open in new tab | `OpenRegular` | Open in new browser tab |
| Pin to top | `Pin24Regular` | Move card to first position |
| Unpin | `PinOff24Regular` | Remove pin, return to default order |
| Hide card | `EyeOff24Regular` | Hide from view (can restore in settings) |

**Note:** "Hide card" only hides from user's view, not from the Hub configuration.

---

## Dynamic Information

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

> Empty dynamic data: see [empty-states.md#dynamic-card-data-empty](empty-states.md#dynamic-card-data-empty)
>
> API failure handling: see [error-handling.md#api-failure-handling](error-handling.md#api-failure-handling)

---

## Hub-Specific Configuration

Cards are assigned to Hubs by administrators.

### Hub Assignment Model

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

### Card Assignment Rules

| Rule | Description |
|------|-------------|
| Hub-specific | Card appears only in assigned Hubs |
| Common cards | Card can be assigned to multiple Hubs |
| Permission-filtered | User only sees cards they have access to |
| No duplicates | Card appears once per Hub, even if user has multiple permission groups |

### Administration

Administrators (via Administration Hub) can:

- Add/remove cards from Hubs
- Set default card order per Hub
- Configure card metadata (title, description, icon)
- Set permission groups for each card

---

## User Card Preferences

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
