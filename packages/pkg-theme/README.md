# @ddre/pkg-theme

Shared design tokens for DDRE Intranet SPFx solutions.

## Purpose

Provides consistent design tokens beyond SharePoint's built-in theme colors:
- Spacing scale
- Typography
- Shadows/elevation
- Border radii
- Z-index scale
- Breakpoints

## Installation

```bash
npm install @ddre/pkg-theme
```

## Usage

```typescript
import { spacing, shadows, typography, radii, zIndex } from '@ddre/pkg-theme';

// In component styles
const containerStyle = {
  padding: spacing.md,
  borderRadius: radii.md,
  boxShadow: shadows.card,
};
```

## Available Tokens

See `src/index.ts` for all exported tokens.

## Note on Colors

**Do not define colors here.** Colors come from SharePoint's site theme and are automatically inherited by SPFx web parts. This package is for non-color design tokens only.
