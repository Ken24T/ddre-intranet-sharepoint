<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Settings Panel

Modal or slide-out panel for user preferences.

---

## Panel Layout

```
┌─────────────────────────────────────────────────────┐
│  Settings                                    [×]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  APPEARANCE                                         │
│  ─────────────────────────────────────────────────  │
│  Theme                          [Light ▼]          │
│                                                     │
│  LAYOUT                                             │
│  ─────────────────────────────────────────────────  │
│  Sidebar default state          [Expanded ▼]       │
│  Card grid columns              [3 ▼]              │
│                                                     │
│  CARDS                                              │
│  ─────────────────────────────────────────────────  │
│  Hidden cards                   [Manage...]        │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  [Reset to Defaults]                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Settings Options

### Appearance

| Setting | Type | Options | Storage |
|---------|------|---------|---------|
| Theme | Dropdown | Light, Dark, System | localStorage |

### Layout

| Setting | Type | Options | Storage |
|---------|------|---------|---------|
| Sidebar default state | Dropdown | Expanded, Collapsed | localStorage |
| Card grid columns | Dropdown | 1, 2, 3, 4, 5, 6 | localStorage |

### Cards

| Setting | Type | Description | Storage |
|---------|------|-------------|---------|
| Hidden cards | Manage button | Opens list of hidden cards with restore option | localStorage |

### Reset to Defaults

Button that resets all preferences to defaults:

- Theme → Light
- Sidebar → Expanded, 240px width
- Card grid → 3 columns
- Card order → Admin-defined default
- Hidden cards → None (all restored)
- Pinned cards → None

**Confirmation required:** "Reset all settings to defaults? This cannot be undone."

See [modals.md#confirmation-dialog](modals.md#confirmation-dialog) for confirmation pattern.

---

## Settings Persistence

All settings stored in localStorage under `ddre-intranet-preferences`:

```typescript
interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    width: number;
    collapsed: boolean;
    defaultState: 'expanded' | 'collapsed';
  };
  cardGrid: {
    columns: number;
  };
  // Card preferences stored per-Hub (see IUserCardPreferences)
}
```
