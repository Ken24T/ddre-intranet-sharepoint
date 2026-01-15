<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Sidebar

| Property | Default | Min | Max | Collapsed |
|----------|---------|-----|-----|-----------|
| Width | 240px | 180px | 320px | 64px |
| Position | Fixed left | — | — | — |
| Z-index | `zIndex.sticky` (100) | — | — | — |

---

## Behaviors

- **Collapse toggle:** Click collapse button or double-click resize edge
- **Collapsed state:** Shows only icons (64px width), tooltip on hover
- **Resize:** Cursor-based edge detection (see [Resize Behavior](#resize-behavior) below)

---

## Contents

- Navigation items with icon + label
- Collapse/expand toggle button at bottom
- Scroll if items exceed viewport

---

## Resize Behavior

The sidebar right edge is resizable using cursor detection, similar to VS Code panels.

| Zone | Cursor | Action |
|------|--------|--------|
| Within 5px of sidebar right edge | `col-resize` | Enable drag to resize |
| Dragging | `col-resize` | Update sidebar width in real-time |
| Release | `default` | Persist width to localStorage |

**Constraints:**

- Minimum width: 180px
- Maximum width: 320px
- Snap to collapsed (64px) if dragged below 120px
- Snap to minimum (180px) if dragged above 120px from collapsed

**Double-click:** Toggle between current width and collapsed state.

---

## Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- `aria-expanded` on collapse toggle
- `aria-label="Main navigation"` on nav element
- Current page indicated with `aria-current="page"`
