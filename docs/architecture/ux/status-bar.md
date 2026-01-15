<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Status Bar

| Property | Value | Notes |
|----------|-------|-------|
| Height | 24px | Fixed |
| Position | Fixed bottom | Always visible |
| Z-index | `zIndex.sticky` (100) | Above content |

---

## Layout

| Section | Width | Content |
|---------|-------|---------|
| API Health | ~80px | Vault and PropertyMe status indicators |
| User | ~120px | Current user display name |
| Notifications | Flex (remaining) | System notification messages |

---

## API Health Indicators

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

---

## Current User

Displays the authenticated user's display name from SharePoint context (`this.context.pageContext.user.displayName`).

---

## System Notifications

| Property | Value |
|----------|-------|
| Source | SharePoint List or Azure proxy endpoint |
| Publishers | Department heads, Administrators (per RBAC model) |
| Display | Scrolling or latest-first truncated |
| Persistence | Dismissible per session |

> Empty notification state: see [empty-states.md#notifications-empty](empty-states.md#notifications-empty)

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

## Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- API indicators have `aria-label` (e.g., "Vault API: Connected")
- Notifications region has `aria-live="polite"`
