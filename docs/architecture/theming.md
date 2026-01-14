# Theming Architecture

This document describes how theming works across the DDRE Intranet and its apps.

## Strategy: Hybrid Theming

The intranet uses a two-layer theming approach:

1. **SharePoint Site Theme** — Core colors inherited automatically by all SPFx web parts
2. **Shared Theme Package** — Extended design tokens for consistency beyond colors

## Layer 1: SharePoint Site Theme

SharePoint sites have a configurable theme that provides ~20 semantic color slots. All SPFx web parts automatically inherit these colors.

### How It Works

- Theme is set at the site level (Site Settings → Change the look)
- SPFx web parts receive theme via `onThemeChanged()` lifecycle method
- SCSS can reference theme slots: `"[theme:bodyText, default: #323130]"`
- CSS custom properties injected at runtime for dynamic theming

### Supported Theme Slots

Key semantic colors available:

| Slot | Usage |
|------|-------|
| `bodyText` | Primary text color |
| `bodyBackground` | Page background |
| `link` | Hyperlink color |
| `linkHovered` | Hyperlink hover state |
| `primaryButtonBackground` | Primary action buttons |
| `errorText` | Error messages |

Full list: [SharePoint Theme JSON Schema](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/site-theming/sharepoint-site-theming-json-schema)

### Dark Mode

SharePoint handles dark mode automatically. SPFx receives `currentTheme.isInverted = true` when dark mode is active.

## Layer 2: Shared Theme Package (`/packages/pkg-theme`)

For tokens beyond SharePoint's color slots, use the shared theme package.

### What It Provides

- **Spacing scale** — Consistent margins/padding (4px, 8px, 16px, 24px, 32px)
- **Typography** — Font sizes, line heights, font weights
- **Shadows** — Elevation levels for cards and modals
- **Border radii** — Consistent corner rounding
- **Z-index scale** — Layering for overlays, modals, tooltips
- **Breakpoints** — Responsive design breakpoints
- **Custom component tokens** — App-specific design decisions

### Usage in SPFx Apps

```typescript
import { spacing, shadows, typography } from '@ddre/pkg-theme';

const styles = {
  padding: spacing.md,        // 16px
  boxShadow: shadows.card,    // elevation for cards
  fontSize: typography.body,  // 14px
};
```

### When to Use Which Layer

| Need | Use |
|------|-----|
| Text color, background, links | SharePoint theme (automatic) |
| Button colors, error states | SharePoint theme (automatic) |
| Spacing, margins, padding | Shared package |
| Custom shadows, elevations | Shared package |
| Font sizes, line heights | Shared package |
| App-specific component variants | Shared package |

## Implementation Checklist

### Site Theme (do once per environment)

- [ ] Define brand colors in SharePoint theme JSON
- [ ] Apply theme to intranet site collection
- [ ] Verify theme propagates to hub-connected sites

### Shared Package (do once, update as needed)

- [ ] Define spacing scale
- [ ] Define typography scale
- [ ] Define shadow/elevation tokens
- [ ] Publish package, add as dependency to SPFx solutions

## References

- [SharePoint Site Theming](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/site-theming/sharepoint-site-theming-overview)
- [Fluent UI Theming](https://developer.microsoft.com/en-us/fluentui#/theming)
- [SPFx Theme Handling](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-theme-colors-in-your-customizations)
