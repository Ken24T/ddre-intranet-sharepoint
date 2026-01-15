<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Theme Support

Light and dark theme support using Fluent UI theming.

---

## Theme Options

| Theme | Description |
|-------|-------------|
| Light | Default light theme |
| Dark | Dark theme for low-light environments |
| System | Follows `prefers-color-scheme` media query |

---

## Implementation

```typescript
// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply theme
const theme = userPreference === 'system' 
  ? (prefersDark ? darkTheme : lightTheme)
  : (userPreference === 'dark' ? darkTheme : lightTheme);
```

---

## Theme Tokens

Use Fluent UI theme tokens — no hard-coded colors:

| Token | Light | Dark |
|-------|-------|------|
| `bodyBackground` | White | Near-black |
| `bodyText` | Near-black | White |
| `themePrimary` | DDRE brand color | DDRE brand color (adjusted) |

> **Note:** Specific DDRE brand colors to be defined when branding info available.

---

## Theme Persistence

- Saved to localStorage immediately on change
- Applied on page load before React renders (avoid flash)
- System preference changes detected via `matchMedia` listener

---

## Accessibility

- All color combinations must maintain WCAG 2.1 AA contrast ratios
- Test both themes with axe DevTools
- Ensure focus indicators visible in both themes
