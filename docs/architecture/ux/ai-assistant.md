<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# AI Assistant (Chatbot)

A floating AI chatbot button positioned in the bottom-right corner of the UI.
Users can interact via a popup panel, hide the button entirely, or pop the
chat out into a separate browser window.

> **Animations:** See [personalization.md#ai-assistant-animations](personalization.md#ai-assistant-animations)

---

## Button Placement

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

---

## States

| State | Visual | Behavior |
|-------|--------|----------|
| Default | Floating button visible | Click to open chat panel |
| Hidden | Button not rendered | User chose to hide for session |
| Panel open | Button + panel visible | Panel anchored above button |
| Popped out | Button shows "return" icon | Chat in separate window |

---

## Chat Panel (Embedded)

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

---

## Pop-Out Window

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

---

## Visibility Toggle

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

---

## AI Assistant Preferences

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

---

## Responsive Behavior

> Part of: [personalization.md#responsive-breakpoints](personalization.md#responsive-breakpoints)

| Breakpoint | Behavior |
|------------|----------|
| xs, sm (< 768px) | Button smaller (48px), panel full-width |
| md+ (≥ 768px) | Standard button (56px), panel 360px wide |

---

## Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- Button has `aria-label="Open AI Assistant"`
- Panel is a dialog with proper focus trap
- Escape key closes panel
- Screen reader announces new messages
