<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Personalization Specifications

User preferences, responsive breakpoints, and interaction patterns.

## Related Specs

| Dependency | Spec | Why |
|------------|------|-----|
| **Components** | [components.md](components.md) | What gets personalized |
| **AI Assistant** | [behaviors.md](behaviors.md#ai-assistant-chatbot) | AI preferences extend base interface |
| **Icons** | [standards.md](standards.md#icon-system) | Icons used in interactions |

---

## User Preferences

### Interface Definition

```typescript
interface IUserLayoutPreferences {
  sidebar: {
    width: number;       // Current width in pixels (64-320)
    collapsed: boolean;  // Collapsed state
  };
  cardGrid: {
    columns: number;           // User-preferred max columns (1-6)
    cardOrder: string[];       // Array of card IDs in display order
  };
}
```

### Storage

| Key | Value | Notes |
|-----|-------|-------|
| Storage type | localStorage | Device-specific, no cross-device sync |
| Key name | `ddre-intranet-layout` | Namespaced to avoid conflicts |
| Format | JSON string | Parsed on load, stringified on save |

### Default Values

```typescript
const defaultPreferences: IUserLayoutPreferences = {
  sidebar: {
    width: 240,
    collapsed: false,
  },
  cardGrid: {
    columns: 3,
    cardOrder: [], // Empty = default order from config
  },
};
```

### Persistence Triggers

| Event | Action |
|-------|--------|
| Sidebar resize complete | Save `sidebar.width` |
| Sidebar collapse toggle | Save `sidebar.collapsed` |
| Card drag complete | Save `cardGrid.cardOrder` |
| Column config change | Save `cardGrid.columns` |

---

## Responsive Breakpoints

Using breakpoints from `pkg-theme`:

| Breakpoint | Width | Sidebar Behavior | Card Grid |
|------------|-------|------------------|-----------|
| xs (320px) | < 480px | Hidden, hamburger menu | 1 column |
| sm (480px) | < 768px | Hidden, hamburger menu | 1-2 columns |
| md (768px) | < 1024px | Collapsed by default | 2-3 columns |
| lg (1024px) | < 1366px | Expanded | 3-4 columns |
| xl (1366px) | < 1920px | Expanded | 4-5 columns |
| xxl (1920px) | ≥ 1920px | Expanded | Up to 6 columns |

**Mobile behavior (xs, sm):**

- Sidebar becomes a slide-out drawer triggered by hamburger menu
- Overlay dims content area when drawer open
- User width preference ignored; drawer is full collapsed width (64px icons + labels)

### Offline Behavior

> **Related:** [behaviors.md#network-offline](behaviors.md#network-offline)

Offline-safe features that work without network:

| Feature | Works Offline |
|---------|---------------|
| Card reordering | ✅ Yes (localStorage) |
| Sidebar resize | ✅ Yes (localStorage) |
| Cached pages | ✅ Yes |
| Card dynamic data | ⚠️ Cached or "—" |
| Search | ❌ No (disabled) |
| AI Assistant | ❌ No (disabled) |

---

## Interaction Patterns

### Transition Timing

Using values from `pkg-theme`:

| Transition | Duration | Easing | Use Case |
|------------|----------|--------|----------|
| Fast | 100ms | ease-out | Hover states, focus rings |
| Normal | 200ms | ease-in-out | Sidebar collapse, card reorder |
| Slow | 300ms | ease-in-out | Mobile drawer slide, modal open |

### Hover States

| Element | Default | Hover | Notes |
|---------|---------|-------|-------|
| Function Card | `shadow.card` | `shadow.cardHover` + slight scale(1.02) | Cursor: pointer |
| Sidebar Item | Transparent bg | Theme `neutralLighter` bg | Cursor: pointer |
| Sidebar Resize Edge | Invisible | 2px accent color line | Cursor: col-resize |
| Button (primary) | Theme `themePrimary` | Theme `themeDarkAlt` | Standard Fluent |
| Button (secondary) | Transparent | Theme `neutralLighter` | Standard Fluent |

### Focus States

> **Required for:** [standards.md#operable](standards.md#operable)

All interactive elements must have visible focus indicators for keyboard navigation.

| Element | Focus Style |
|---------|-------------|
| Cards | 2px solid `themePrimary`, offset 2px |
| Sidebar Items | 2px solid `themePrimary`, inset |
| Buttons | Fluent UI default focus ring |
| Form Inputs | Fluent UI default focus ring |

### Loading States

| Scenario | Pattern |
|----------|---------|
| Initial shell load | Full-page spinner with logo |
| Card content loading | Skeleton shimmer inside card |
| API health check | Pulsing gray circle until resolved |
| Sidebar navigation | Instant (no loading needed) |
| Card grid reorder | Optimistic UI (instant move, persist async) |

### Drag-and-Drop Feedback

> **Used by:** [components.md#drag-and-drop-repositioning](components.md#drag-and-drop-repositioning)

| State | Visual Feedback |
|-------|-----------------|
| Idle | Card at rest with `shadow.card` |
| Grab (mousedown) | Cursor: grabbing, card lifts with `shadow.cardHover` |
| Dragging | Card follows cursor, 0.9 opacity, rotation ±2° |
| Over drop zone | Placeholder shows target position (dashed border) |
| Drop | Card animates to position (normal transition) |
| Invalid drop | Card returns to origin (normal transition) |

### Sidebar Animations

| Action | Animation |
|--------|-----------|
| Collapse | Width 240px → 64px (normal: 200ms) |
| Expand | Width 64px → user preference (normal: 200ms) |
| Resize drag | Real-time width update (no transition during drag) |
| Mobile drawer open | Slide from left (slow: 300ms) + overlay fade in |
| Mobile drawer close | Slide to left (slow: 300ms) + overlay fade out |

### Notification Animations

> **Used by:** [behaviors.md#toast-notifications](behaviors.md#toast-notifications)

| Event | Animation |
|-------|-----------|
| New notification | Slide in from right, fade in (normal: 200ms) |
| Dismiss | Fade out (fast: 100ms) |
| Auto-scroll | Smooth scroll if multiple notifications |

### AI Assistant Animations

> **Used by:** [behaviors.md#ai-assistant-chatbot](behaviors.md#ai-assistant-chatbot)

| Action | Animation |
|--------|-----------|
| Panel open | Slide up + fade in (normal: 200ms) |
| Panel close | Slide down + fade out (fast: 100ms) |
| Button appear | Scale 0 → 1 + fade in (normal: 200ms) |
| Button hide | Scale 1 → 0 + fade out (fast: 100ms) |
| Pop-out transition | Panel fades out as window opens |
| Return from pop-out | Panel fades in (normal: 200ms) |
