<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Modals & Dialogs

Standard patterns for modal dialogs across the application.

> **Related:** [settings-panel.md](settings-panel.md), [personalization.md#interaction-patterns](personalization.md#interaction-patterns)

---

## Modal Types

| Type | Purpose | Close Behavior |
|------|---------|----------------|
| Confirmation | Destructive actions, important decisions | Explicit button only |
| Settings | User preferences panel | ESC, backdrop click, close button |
| Info/Alert | System messages, announcements | ESC, backdrop click, close button |
| Manager | List management (hidden cards, etc.) | ESC, backdrop click, close button |

---

## Base Modal Anatomy

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    ╔═══════════════════════════════════════════╗    │
│    ║  Title                              [×]   ║    │
│    ╠═══════════════════════════════════════════╣    │
│    ║                                           ║    │
│    ║  Content area                             ║    │
│    ║                                           ║    │
│    ╠═══════════════════════════════════════════╣    │
│    ║                    [Cancel] [Confirm]     ║    │
│    ╚═══════════════════════════════════════════╝    │
│                                                     │
│              (backdrop overlay)                     │
└─────────────────────────────────────────────────────┘
```

---

## Modal Sizing

| Size | Width | Use Case |
|------|-------|----------|
| Small | 400px | Confirmations, simple alerts |
| Medium | 560px | Settings, forms |
| Large | 720px | Complex content, lists |

**Max height:** 80vh with scrollable content area.

---

## Backdrop

| Property | Value |
|----------|-------|
| Color | `rgba(0, 0, 0, 0.4)` — semi-transparent black |
| Z-index | `zIndex.overlay` (300) |
| Animation | Fade in (fast: 100ms) |

---

## Modal Positioning

| Property | Value |
|----------|-------|
| Position | Centered horizontally and vertically |
| Z-index | `zIndex.modal` (400) |
| Animation | Fade in + scale from 95% (normal: 200ms) |

---

## Close Behaviors

| Action | Confirmation Modal | Other Modals |
|--------|-------------------|--------------|
| Close button (×) | ✅ Closes (Cancel) | ✅ Closes |
| ESC key | ✅ Closes (Cancel) | ✅ Closes |
| Click backdrop | ❌ No effect | ✅ Closes |
| Confirm button | ✅ Closes + action | N/A |
| Cancel button | ✅ Closes | N/A |

**ESC key always maps to Cancel** — never triggers destructive action.

---

## Confirmation Dialog

For destructive or important actions requiring explicit user choice.

```
╔═══════════════════════════════════════════════╗
║  Reset Settings                        [×]    ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ⚠️  Reset all settings to defaults?          ║
║                                               ║
║  This will restore theme, sidebar, card       ║
║  layout, and all customizations to their      ║
║  original values. This cannot be undone.      ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                      [Cancel]  [Reset]        ║
╚═══════════════════════════════════════════════╝
```

### Confirmation Elements

| Element | Description |
|---------|-------------|
| Title | Action being confirmed |
| Icon | Warning icon for destructive actions |
| Message | Clear explanation of consequences |
| Cancel button | Secondary style, always available |
| Confirm button | Primary style, describes action (not just "OK") |

### Button Styling

| Button | Style | Notes |
|--------|-------|-------|
| Cancel | Secondary (outline) | Always on left |
| Confirm (safe) | Primary | Blue/theme color |
| Confirm (destructive) | Danger | Red background |

---

## Settings Modal

Centered modal for user preferences.

```
╔═══════════════════════════════════════════════════════╗
║  Settings                                      [×]    ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  APPEARANCE                                           ║
║  ───────────────────────────────────────────────────  ║
║  Theme                              [Light ▼]        ║
║                                                       ║
║  LAYOUT                                               ║
║  ───────────────────────────────────────────────────  ║
║  Sidebar default state              [Expanded ▼]     ║
║  Card grid columns                  [3 ▼]            ║
║                                                       ║
║  CARDS                                                ║
║  ───────────────────────────────────────────────────  ║
║  Hidden cards                       [Manage...]      ║
║                                                       ║
║  ───────────────────────────────────────────────────  ║
║  [Reset to Defaults]                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**No footer buttons** — settings apply immediately (auto-save).

---

## Hidden Cards Manager

Sub-modal or inline expansion for managing hidden cards.

```
╔═══════════════════════════════════════════════════════╗
║  Hidden Cards                                  [×]    ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  These cards are hidden from your view.               ║
║  Click Restore to show them again.                    ║
║                                                       ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │  📊  PM Dashboard                    [Restore]  │  ║
║  ├─────────────────────────────────────────────────┤  ║
║  │  📋  Task Manager                    [Restore]  │  ║
║  ├─────────────────────────────────────────────────┤  ║
║  │  📈  Analytics                       [Restore]  │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                       ║
║  ───────────────────────────────────────────────────  ║
║  [Restore All]                              [Done]    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## Info/Alert Modal

For system messages or announcements.

```
╔═══════════════════════════════════════════════════════╗
║  System Maintenance                            [×]    ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  ℹ️  Scheduled maintenance this weekend               ║
║                                                       ║
║  The intranet will be unavailable on Saturday         ║
║  from 10pm to 2am AEST for system upgrades.          ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║                                           [Got it]    ║
╚═══════════════════════════════════════════════════════╝
```

Single action button — no Cancel needed.

---

## Mobile Behavior

Modals remain as overlays on mobile (not full-screen).

| Breakpoint | Behavior |
|------------|----------|
| xs, sm (< 768px) | Modal width: 90vw, centered |
| md+ (≥ 768px) | Modal width per size (400/560/720px) |

---

## Focus Management

| Event | Focus Behavior |
|-------|----------------|
| Modal opens | Focus moves to first focusable element (or close button) |
| Tab key | Cycles within modal (focus trap) |
| Modal closes | Focus returns to triggering element |

---

## Modal Animations

| Event | Animation |
|-------|-----------|
| Open | Backdrop fades in (fast: 100ms), modal fades in + scales from 95% (normal: 200ms) |
| Close | Modal fades out + scales to 95% (fast: 100ms), backdrop fades out |

---

## Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- Modal has `role="dialog"` and `aria-modal="true"`
- Title linked via `aria-labelledby`
- Description linked via `aria-describedby` (if present)
- Focus trapped within modal while open
- ESC key closes modal
- Screen reader announces modal on open
