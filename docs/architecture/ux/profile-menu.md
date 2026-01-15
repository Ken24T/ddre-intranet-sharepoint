<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# User Profile Menu

Dropdown menu accessed via the user avatar in the navbar (top-right).

> **Related:** [personalization.md#user-preferences](personalization.md#user-preferences), [ai-assistant.md](ai-assistant.md)

---

## Profile Avatar

| Property | Value |
|----------|-------|
| Position | Navbar, far right |
| Size | 32px diameter |
| Source | Microsoft Graph profile photo |
| Fallback | Initials on themed background |

**Photo retrieval:**

```typescript
// Microsoft Graph endpoint for user photo
GET https://graph.microsoft.com/v1.0/me/photo/$value
```

If photo unavailable, display user's initials (first + last name) on a
colored circle using theme `themePrimary`.

---

## Menu Structure

```
┌─────────────────────────────────────┐
│  [Photo]  Ken Boyle                 │
│           ken.boyle@ddre.com.au     │
├─────────────────────────────────────┤
│  ⚙️  Settings                        │
│  🤖  Show AI Assistant              │  ← Only when hidden
├─────────────────────────────────────┤
│  🌓  Theme: Light ▼                 │  ← Quick toggle
├─────────────────────────────────────┤
│  ❓  Help & Support                 │
└─────────────────────────────────────┘
```

---

## Menu Sections

### User Header

| Element | Source |
|---------|--------|
| Photo | Microsoft Graph or initials fallback |
| Display name | `context.pageContext.user.displayName` |
| Email | `context.pageContext.user.email` |

Non-interactive header section — just displays user info.

### Settings

Opens a settings panel/modal with all user preferences.

See [settings-panel.md](settings-panel.md).

### Show AI Assistant

> Only visible when AI Assistant is hidden for the session.

Clicking restores the AI Assistant floating button.

See [ai-assistant.md#visibility-toggle](ai-assistant.md#visibility-toggle).

### Theme Toggle

Quick theme switcher without opening full settings.

| Option | Description |
|--------|-------------|
| Light | Light theme (default) |
| Dark | Dark theme |
| System | Follow OS preference |

Clicking cycles through options or opens a submenu.

See [theme-support.md](theme-support.md).

### Help & Support

Opens external Cognito Form in new tab for support requests.

| Property | Value |
|----------|-------|
| Behavior | Opens in new tab |
| URL | Cognito Form URL (configured per environment) |

---

## Menu Behavior

| Property | Value |
|----------|-------|
| Trigger | Click on avatar |
| Position | Anchored below avatar, right-aligned |
| Width | 280px |
| Z-index | `zIndex.dropdown` (200) |
| Close | Click outside, Escape key, or menu item click |

---

## Accessibility

- Menu button has `aria-haspopup="menu"` and `aria-expanded`
- Menu items are focusable with arrow key navigation
- Escape closes menu and returns focus to avatar button
