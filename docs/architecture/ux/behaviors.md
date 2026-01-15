<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Behavior Specifications

User-facing behaviors including error handling, empty states, AI Assistant, and search.

## Related Specs

| Dependency | Spec | Why |
|------------|------|-----|
| **Icons** | [standards.md](standards.md#icon-system) | Toast and error page icons |
| **Interactions** | [personalization.md](personalization.md#interaction-patterns) | Animations and transitions |
| **Components** | [components.md](components.md) | Where behaviors apply |

---

## Search Experience

> **Implemented in:** Navbar (search icon), Content area (results page)
>
> **Related:** [components.md#navbar](components.md#navbar)

### Search Scope

Search includes all content the user has permission to access:

| Content Type | Source | Notes |
|--------------|--------|-------|
| Pages | SharePoint pages across all Hubs | |
| Documents | SharePoint document libraries | |
| Policies | Dante Library (Markdown files) | |
| People | Microsoft 365 directory | |
| Tools/Cards | Function card metadata | |

**Permission trimming:** Results are filtered server-side to only show content
the user has read access to. No results leak across permission boundaries.

### Search Input

#### Collapsed State (Default)

| Property | Value |
|----------|-------|
| Icon | `Search24Regular` |
| Position | Navbar, left of notifications |
| Size | 32px touch target |
| Behavior | Click to expand |

#### Expanded State

| Property | Value |
|----------|-------|
| Width | 320px (or available space on mobile) |
| Animation | Expand left from icon (fast: 100ms) |
| Placeholder | "Search pages, documents, people..." |
| Auto-focus | Yes, when expanded |
| Close | Click outside, Escape key, or clear + blur |

```
Collapsed:                    Expanded:
┌──────────────────────┐      ┌──────────────────────────────────────┐
│  [Logo]    [🔍][🔔][👤]│  →   │  [Logo]  [🔍 Search...         ][🔔][👤]│
└──────────────────────┘      └──────────────────────────────────────┘
```

### Quick Results Dropdown

Appears below search input as user types (after 2+ characters).

| Property | Value |
|----------|-------|
| Width | Same as expanded search input |
| Max height | 400px (scrollable) |
| Debounce | 300ms after typing stops |
| Position | Anchored below search input |
| Z-index | `zIndex.dropdown` (200) |

#### Results Layout

Results grouped by content type:

```
┌─────────────────────────────────────┐
│ 🔍 "budget"                      ×  │
├─────────────────────────────────────┤
│ PAGES                               │
│   📄 Marketing Budget Guidelines    │
│   📄 Annual Budget Process          │
├─────────────────────────────────────┤
│ DOCUMENTS                           │
│   📎 Budget_Template_2026.xlsx      │
│   📎 Q4_Budget_Report.pdf           │
├─────────────────────────────────────┤
│ POLICIES                            │
│   📚 Budget Approval Policy         │
├─────────────────────────────────────┤
│ PEOPLE                              │
│   👤 Sarah Budget (Finance)         │
├─────────────────────────────────────┤
│ ────────────────────────────────    │
│ Press Enter for all results →       │
└─────────────────────────────────────┘
```

| Group | Max Items | Icon |
|-------|-----------|------|
| Pages | 3 | `Document24Regular` |
| Documents | 3 | `Attach24Regular` |
| Policies | 2 | `Library24Regular` |
| People | 2 | `Person24Regular` |
| Tools | 2 | `Apps24Regular` |

**Interactions:**

- Click result to navigate directly
- Arrow keys to navigate results
- Enter on result to open it
- Enter with no selection opens full results page

### Full Results Page

Dedicated page for complete search results with filtering.

#### URL Structure

```
/search?q={query}&hub={hubId}&type={contentType}
```

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                       │
├─────────┬───────────────────────────────────────────────────┤
│         │  Search Results for "budget"         [🔍 budget ] │
│ SIDEBAR │                                                    │
│         │  ┌─────────────┐  ┌───────────────────────────┐   │
│         │  │ FILTERS     │  │ RESULTS                   │   │
│         │  │             │  │                           │   │
│         │  │ Hub         │  │ 📄 Marketing Budget...    │   │
│         │  │ ☑ All       │  │    Sales Hub · Page       │   │
│         │  │ ☐ PM Hub    │  │                           │   │
│         │  │ ☐ Sales Hub │  │ 📎 Budget_Template...     │   │
│         │  │             │  │    PM Hub · Document      │   │
│         │  │ Type        │  │                           │   │
│         │  │ ☑ All       │  │ 📚 Budget Approval...     │   │
│         │  │ ☐ Pages     │  │    Dante Library · Policy │   │
│         │  │ ☐ Documents │  │                           │   │
│         │  │ ☐ Policies  │  │ [Load more...]            │   │
│         │  │ ☐ People    │  │                           │   │
│         │  └─────────────┘  └───────────────────────────┘   │
│         │                                                    │
├─────────┴───────────────────────────────────────────────────┤
│ STATUS BAR                                                   │
└─────────────────────────────────────────────────────────────┘
```

#### Filters Panel

| Filter | Type | Options |
|--------|------|---------|
| Hub | Checkbox list | All, PM Hub, Sales Hub, Admin Hub, etc. |
| Content Type | Checkbox list | All, Pages, Documents, Policies, People, Tools |

**Filter behavior:**

- "All" checked by default
- Selecting specific items unchecks "All"
- Clearing all selections re-checks "All"
- Filters update URL query params
- Results update immediately (no submit button)

#### Results List

| Element | Description |
|---------|-------------|
| Icon | Content type icon |
| Title | Clickable, navigates to item |
| Snippet | Text excerpt with search term highlighted |
| Metadata | Hub name · Content type · Last modified |
| Pagination | "Load more" button or infinite scroll |

**Results per page:** 20 initially, load 20 more on demand.

### Search No Results

When search returns nothing:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              No results for "xyzzy"                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Simple, clean — no suggestions or distractions. Just acknowledge the empty result.

### Search Implementation Notes

- Use SharePoint Search REST API or Microsoft Graph Search
- Implement search suggestions/autocomplete (future enhancement)
- Track popular searches for analytics (future enhancement)
- Consider search result ranking improvements (future enhancement)

---

## Error Handling

### Toast Notifications

Toast notifications provide non-blocking feedback for errors and other events.

> **Animations:** See [personalization.md#notification-animations](personalization.md#notification-animations)

#### Toast Anatomy

```
┌──────────────────────────────────────────────────┐
│  [Icon]  Message text here            [×] [↻]   │
└──────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Icon | Severity indicator (info, warning, error, success) |
| Message | Brief description of what happened |
| Dismiss (×) | Manual close button |
| Retry (↻) | Optional, for retryable errors |

#### Toast Positioning

| Property | Value |
|----------|-------|
| Position | Bottom-right, above status bar |
| Offset | 24px from right, 48px from bottom |
| Z-index | `zIndex.overlay` (300) |
| Max width | 400px |
| Stack | Multiple toasts stack upward |

#### Toast Types

| Type | Icon | Background | Auto-dismiss |
|------|------|------------|--------------|
| Info | `Info24Regular` | Theme `neutralLighter` | 5 seconds |
| Success | `CheckmarkCircle24Regular` | Light green tint | 3 seconds |
| Warning | `Warning24Regular` | Light orange tint | 8 seconds |
| Error | `ErrorCircle24Regular` | Light red tint | No (manual) |

#### Toast Animations

| Event | Animation |
|-------|-----------|
| Appear | Slide in from right + fade in (normal: 200ms) |
| Dismiss | Fade out + slide right (fast: 100ms) |
| Stack shift | Slide up (fast: 100ms) |

### API Failure Handling

When Vault, PropertyMe, Search, or other APIs fail:

| Scenario | User Experience |
|----------|-----------------|
| Initial load failure | Toast: "Unable to load [service]. Some features may be unavailable." |
| Action failure (save, etc.) | Toast: "Failed to save. Please try again." with Retry button |
| Partial failure | Component shows "—" or placeholder; toast explains issue |
| Timeout | Toast: "[Service] is taking longer than expected." |

#### Retry Behavior

Configurable auto-retry for transient failures:

```typescript
interface IRetryConfig {
  enabled: boolean;      // Whether auto-retry is on
  maxAttempts: number;   // Max retry attempts (default: 3)
  delayMs: number;       // Delay between retries (default: 1000)
  backoff: boolean;      // Exponential backoff (default: true)
}
```

**Default retry configuration:**

| Service | Auto-retry | Max Attempts | Notes |
|---------|------------|--------------|-------|
| Vault API | Yes | 3 | Config/health checks |
| PropertyMe API | Yes | 3 | Data operations |
| Search API | Yes | 2 | User-initiated searches |
| Card dynamic data | Yes | 2 | Background refresh |
| Notifications | No | — | Non-critical |

**Retry UX:**

- First attempt fails → auto-retry silently
- All retries fail → show toast with manual Retry button
- User clicks Retry → reset attempt count, try again

### Access Denied (403)

When user lacks permission to access content:

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                       │
├─────────┬───────────────────────────────────────────────────┤
│         │                                                    │
│ SIDEBAR │         ┌─────────────────────────────────┐       │
│         │         │          🔒                      │       │
│         │         │                                  │       │
│         │         │    Access Denied                 │       │
│         │         │                                  │       │
│         │         │    You don't have permission     │       │
│         │         │    to view this content.         │       │
│         │         │                                  │       │
│         │         │    If you believe this is an     │       │
│         │         │    error, contact your manager   │       │
│         │         │    or IT administrator.          │       │
│         │         │                                  │       │
│         │         │    [Go to Home]                  │       │
│         │         │                                  │       │
│         │         └─────────────────────────────────┘       │
│         │                                                    │
├─────────┴───────────────────────────────────────────────────┤
│ STATUS BAR                                                   │
└─────────────────────────────────────────────────────────────┘
```

| Element | Value |
|---------|-------|
| Icon | `LockClosed24Regular` (64px, muted color) |
| Title | "Access Denied" |
| Message | Explanation + contact guidance |
| Action | "Go to Home" button |

### Not Found (404)

When page or resource doesn't exist:

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                       │
├─────────┬───────────────────────────────────────────────────┤
│         │                                                    │
│ SIDEBAR │         ┌─────────────────────────────────┐       │
│         │         │          🔍                      │       │
│         │         │                                  │       │
│         │         │    Page Not Found                │       │
│         │         │                                  │       │
│         │         │    We couldn't find the page     │       │
│         │         │    you're looking for.           │       │
│         │         │                                  │       │
│         │         │    The page may have been        │       │
│         │         │    moved or deleted.             │       │
│         │         │                                  │       │
│         │         │    [Go to Home]  [Search]        │       │
│         │         │                                  │       │
│         │         └─────────────────────────────────┘       │
│         │                                                    │
├─────────┴───────────────────────────────────────────────────┤
│ STATUS BAR                                                   │
└─────────────────────────────────────────────────────────────┘
```

| Element | Value |
|---------|-------|
| Icon | `SearchInfo24Regular` (64px, muted color) |
| Title | "Page Not Found" |
| Message | Explanation + suggestions |
| Actions | "Go to Home" + "Search" buttons |

### Network Offline

When connection is lost:

> **Related:** [personalization.md#offline-behavior](personalization.md#offline-behavior)

#### Detection

Monitor `navigator.onLine` and `online`/`offline` events.

#### Offline Banner

Persistent banner at top of content area (below navbar):

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  You're offline. Some features may be unavailable.  [×] │
└─────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Position | Top of content area, full width |
| Background | Theme `warningBackground` or light orange |
| Dismissible | Yes, but reappears on page navigation while offline |

#### Offline Behavior

| Feature | Offline Behavior |
|---------|------------------|
| Cached pages | Display normally |
| Card dynamic data | Show cached or "—" |
| Search | Disabled, show message |
| AI Assistant | Disabled, show message |
| Card reordering | Works (localStorage) |
| Sidebar resize | Works (localStorage) |

#### Reconnection

When connection restored:

- Remove offline banner
- Toast: "You're back online" (success, auto-dismiss)
- Refresh stale data in background

---

## Empty States

Empty states provide feedback when there's no content to display.

> **Styling:** See [Empty State Styling](#empty-state-styling) below

### Card Grid Empty

> **Renders in:** [components.md#card-grid](components.md#card-grid)

When user has no cards available (no permissions or no cards assigned to Hub):

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         📋                                  │
│                                                             │
│              No tools available                             │
│                                                             │
│     You don't have any tools assigned to this Hub.         │
│     Contact your administrator if you believe this         │
│     is an error.                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Scenario | Message |
|----------|---------|
| No permissions | "You don't have any tools assigned to this Hub." |
| Hub has no cards | "No tools have been configured for this Hub yet." |
| All cards hidden | "You've hidden all cards. [Restore cards]" |

### Notifications Empty

> **Renders in:** [components.md#status-bar](components.md#status-bar)

When there are no system notifications, show an encouraging message:

```
┌─────────────────────────────────────────────────────────────┐
│  ✨  All caught up! No news is good news.                   │
└─────────────────────────────────────────────────────────────┘
```

**Dad joke rotation** (randomly selected):

| Message |
|---------|
| "All caught up! No news is good news." |
| "Nothing to see here... move along! 👀" |
| "Inbox zero? More like notification zero! 🎉" |
| "It's quiet... too quiet. 🤫" |
| "You're all caught up! Time for a coffee? ☕" |
| "No notifications. The system is impressed. 👏" |

**Display behavior:**

- Show in status bar notifications area when empty
- Muted/subtle text color
- No icon (or subtle emoji)

### Dynamic Card Data Empty

> **Renders in:** [components.md#function-cards](components.md#function-cards)

When a card has no dynamic data to display:

**Behavior:** Hide the dynamic info section entirely.

The card shows only:

- Icon
- Title
- Description
- Context menu

The dynamic info area is simply not rendered — no placeholder, no "No data" message.
This keeps cards clean and consistent in height when data isn't available.

```
With data:                          Without data:
┌─────────────────────────┐         ┌─────────────────────────┐
│  [Icon] Title      [⋮]  │         │  [Icon] Title      [⋮]  │
│                         │         │                         │
│  Description text...    │         │  Description text...    │
│                         │         │                         │
│  ┌───────────────────┐  │         │                         │
│  │ 5 items pending   │  │         │                         │
│  └───────────────────┘  │         │                         │
└─────────────────────────┘         └─────────────────────────┘
```

### Empty State Styling

| Element | Style |
|---------|-------|
| Container | Centered in available space |
| Icon | 48-64px, muted color (theme `neutralSecondary`) |
| Title | Bold, theme `neutralPrimary` |
| Message | Regular, theme `neutralSecondary` |
| Action (if any) | Link or secondary button |

---

## AI Assistant (Chatbot)

A floating AI chatbot button positioned in the bottom-right corner of the UI.
Users can interact via a popup panel, hide the button entirely, or pop the
chat out into a separate browser window.

> **Animations:** See [personalization.md#ai-assistant-animations](personalization.md#ai-assistant-animations)

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

### AI Assistant Preferences Addition

> Extends: [personalization.md#user-preferences](personalization.md#user-preferences)

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

### AI Assistant Responsive Behavior

> Part of: [personalization.md#responsive-breakpoints](personalization.md#responsive-breakpoints)

| Breakpoint | Behavior |
|------------|----------|
| xs, sm (< 768px) | Button smaller (48px), panel full-width |
| md+ (≥ 768px) | Standard button (56px), panel 360px wide |

### AI Assistant Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- Button has `aria-label="Open AI Assistant"`
- Panel is a dialog with proper focus trap
- Escape key closes panel
- Screen reader announces new messages
