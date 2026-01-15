<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Navigation & Routing

Hybrid navigation model: Hubs are separate SharePoint pages (permission boundaries),
tools within a Hub use hash routing for SPA-style navigation.

> **Related:** [sidebar.md](sidebar.md), [function-cards.md](function-cards.md)

---

## Hub-Level Navigation

Each Hub is a separate SharePoint page with its own permissions.

### Hub URL Structure

```
/sites/intranet/SitePages/Home.aspx       → Home Hub
/sites/intranet/SitePages/PM.aspx         → PM Hub
/sites/intranet/SitePages/Sales.aspx      → Sales Hub
/sites/intranet/SitePages/Admin.aspx      → Admin Hub (restricted)
```

### Permissions

| Hub | Access |
|-----|--------|
| Home | All authenticated users |
| PM | PM Hub Entra ID group |
| Sales | Sales Hub Entra ID group |
| Admin | Administrators Entra ID group |

Users only see Hubs they have access to in the sidebar navigation.

### Hub Switching

When user clicks a Hub in the sidebar:

1. Full page navigation to that Hub's SharePoint page
2. Shell reinitializes with Hub-specific card configuration
3. User preferences (sidebar width, etc.) restored from localStorage

**Note:** This is intentional — SharePoint page-level permissions provide
the security boundary. The trade-off is a page reload between Hubs.

---

## Within-Hub Navigation

Tools and views within a Hub use hash-based routing for fast SPA-style navigation.

### Hash Route Structure

```
/sites/intranet/SitePages/PM.aspx                → PM Hub card grid (default)
/sites/intranet/SitePages/PM.aspx#/tool/dante    → Dante Library inline
/sites/intranet/SitePages/PM.aspx#/search?q=foo  → Search results
```

### Route Configuration

```typescript
interface IRoute {
  path: string;           // Hash path pattern (e.g., "/tool/:toolId")
  component: string;      // React component to render
  title?: string;         // Document title suffix
}
```

### Default Route

When no hash is present, display the card grid for the current Hub.

---

## Card Open Behavior

Function Cards are configured with an open mode that determines how they launch.

### Open Mode Configuration

Extend `ICardConfiguration` from [function-cards.md](function-cards.md):

```typescript
interface ICardConfiguration {
  // ... existing properties
  openMode: 'inline' | 'window' | 'tab';
  windowFeatures?: string;   // For 'window' mode: size, position, etc.
}
```

### Open Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `inline` | Renders in content area, updates hash route | Simple tools, Dante Library |
| `window` | Opens `window.open()` with features | PM Dashboard (needs dedicated space) |
| `tab` | Opens in new browser tab | External systems |

### Mode-Specific Behavior

**Inline mode:**

- Content area renders the tool component
- Hash updates to `#/tool/{toolId}`
- Browser back returns to card grid
- Sidebar and navbar remain visible

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                              PM Hub  │
├─────────┬───────────────────────────────────────────────────┤
│         │  ← Back to PM Hub                                 │
│ SIDEBAR │  ┌─────────────────────────────────────────────┐  │
│         │  │                                             │  │
│ [Home]  │  │           Tool Content Area                 │  │
│ [PM] ●  │  │           (Dante Library, etc.)             │  │
│ [Sales] │  │                                             │  │
│ [Admin] │  │                                             │  │
│         │  │                                             │  │
│         │  └─────────────────────────────────────────────┘  │
├─────────┴───────────────────────────────────────────────────┤
│ STATUS BAR                                                   │
└─────────────────────────────────────────────────────────────┘
```

**Window mode:**

- Opens new browser window via `window.open()`
- Parent page stays on card grid (no hash change)
- Window sized per `windowFeatures` config
- No shell chrome in popup (tool runs standalone)

```typescript
// Example window features for PM Dashboard
windowFeatures: "width=1200,height=800,menubar=no,toolbar=no,resizable=yes"
```

**Tab mode:**

- Opens URL in new browser tab (`target="_blank"`)
- Parent page unchanged
- Used for external systems (PropertyMe portal, etc.)

---

## Browser History

### Inline Tool Navigation

| Action | Result |
|--------|--------|
| Click card (inline) | Push `#/tool/{id}` to history |
| Click "Back" button in tool | `history.back()` |
| Browser back | Return to card grid |
| Browser forward | Return to tool |

### History State

```typescript
interface INavigationState {
  hubId: string;
  toolId?: string;
  scrollPosition?: number;  // Restore scroll on back
}
```

### Scroll Restoration

When returning to card grid via back:

- Restore scroll position to where user was
- Card grid state preserved (no re-fetch needed)

---

## Sidebar Navigation State

### Current Hub Indicator

Active Hub highlighted in sidebar:

| State | Style |
|-------|-------|
| Active Hub | Bold text, accent left border, `neutralLighter` background |
| Other Hubs | Normal weight, no border, transparent background |

### Permission-Filtered

Sidebar only shows Hubs the user can access:

```typescript
interface ISidebarHub {
  id: string;
  title: string;
  icon: string;
  pageUrl: string;          // SharePoint page URL
  requiredGroups: string[]; // Entra ID group IDs
}
```

Filter at render time — user never sees Hubs they can't access.

---

## External Links

Links to external systems always open in a new tab:

| Element | Behavior |
|---------|----------|
| Card with `openMode: 'tab'` | `target="_blank"` + `rel="noopener noreferrer"` |
| Links in tool content | Same — new tab for external domains |
| Links to same SharePoint site | Same tab (internal navigation) |

---

## Loading States

| Transition | Loading Pattern |
|------------|-----------------|
| Hub switch | Full page reload (SharePoint handles this) |
| Inline tool open | Content area shows spinner until tool loads |
| Tool data fetch | Skeleton shimmer in tool area |
| Back to card grid | Instant (state preserved) |

---

## Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- Sidebar navigation uses `<nav>` element with `aria-label="Hub navigation"`
- Current Hub has `aria-current="page"`
- Inline tool area is `<main>` element
- Focus moves to tool heading when opening inline
- Focus returns to triggering card on back navigation
- New window/tab indicated with screen reader text: "Opens in new window"
