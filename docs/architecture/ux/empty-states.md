<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Empty States

Empty states provide feedback when there's no content to display.

---

## Card Grid Empty

> **Renders in:** [card-grid.md](card-grid.md)

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

---

## Notifications Empty

> **Renders in:** [status-bar.md](status-bar.md)

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

---

## Dynamic Card Data Empty

> **Renders in:** [function-cards.md](function-cards.md)

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

---

## Empty State Styling

| Element | Style |
|---------|-------|
| Container | Centered in available space |
| Icon | 48-64px, muted color (theme `neutralSecondary`) |
| Title | Bold, theme `neutralPrimary` |
| Message | Regular, theme `neutralSecondary` |
| Action (if any) | Link or secondary button |
