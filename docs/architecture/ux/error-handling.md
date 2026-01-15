<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Error Handling

## Toast Notifications

Toast notifications provide non-blocking feedback for errors and other events.

> **Animations:** See [personalization.md#notification-animations](personalization.md#notification-animations)

### Toast Anatomy

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

### Toast Positioning

| Property | Value |
|----------|-------|
| Position | Bottom-right, above status bar |
| Offset | 24px from right, 48px from bottom |
| Z-index | `zIndex.overlay` (300) |
| Max width | 400px |
| Stack | Multiple toasts stack upward |

### Toast Types

| Type | Icon | Background | Auto-dismiss |
|------|------|------------|--------------|
| Info | `Info24Regular` | Theme `neutralLighter` | 5 seconds |
| Success | `CheckmarkCircle24Regular` | Light green tint | 3 seconds |
| Warning | `Warning24Regular` | Light orange tint | 8 seconds |
| Error | `ErrorCircle24Regular` | Light red tint | No (manual) |

### Toast Animations

| Event | Animation |
|-------|-----------|
| Appear | Slide in from right + fade in (normal: 200ms) |
| Dismiss | Fade out + slide right (fast: 100ms) |
| Stack shift | Slide up (fast: 100ms) |

---

## API Failure Handling

When Vault, PropertyMe, Search, or other APIs fail:

| Scenario | User Experience |
|----------|-----------------|
| Initial load failure | Toast: "Unable to load [service]. Some features may be unavailable." |
| Action failure (save, etc.) | Toast: "Failed to save. Please try again." with Retry button |
| Partial failure | Component shows "—" or placeholder; toast explains issue |
| Timeout | Toast: "[Service] is taking longer than expected." |

### Retry Behavior

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

---

## Access Denied (403)

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

---

## Not Found (404)

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

---

## Network Offline

When connection is lost:

> **Related:** [personalization.md#offline-behavior](personalization.md#offline-behavior)

### Detection

Monitor `navigator.onLine` and `online`/`offline` events.

### Offline Banner

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

### Offline Behavior

| Feature | Offline Behavior |
|---------|------------------|
| Cached pages | Display normally |
| Card dynamic data | Show cached or "—" |
| Search | Disabled, show message |
| AI Assistant | Disabled, show message |
| Card reordering | Works (localStorage) |
| Sidebar resize | Works (localStorage) |

### Reconnection

When connection restored:

- Remove offline banner
- Toast: "You're back online" (success, auto-dismiss)
- Refresh stale data in background
