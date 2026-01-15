<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Card Grid

## Grid Configuration

| Property | Default | Min | Max |
|----------|---------|-----|-----|
| Columns | 3 | 1 | 6 |
| Card min-width | 280px | — | — |
| Card min-height | 180px | — | — |
| Gap | `spacing.md` (16px) | — | — |

**Behavior:**

- User configures preferred max column count (1-6)
- Grid auto-fits based on container width and min card width
- Actual columns rendered = min(user preference, available space / min-width)

> Empty card grid: see [empty-states.md#card-grid-empty](empty-states.md#card-grid-empty)

---

## Drag-and-Drop Repositioning

Using `@dnd-kit/sortable` for accessible card reordering.

| Interaction | Behavior |
|-------------|----------|
| Drag handle | Entire card is draggable (cursor `grab` on hover) |
| Dragging | Card lifts with `shadow.cardHover`, placeholder shows drop zone |
| Drop | Card animates to new position, order persisted to localStorage |
| Keyboard | Arrow keys to move, Enter/Space to pick up/drop |

> Drag feedback details: [personalization.md#drag-and-drop-feedback](personalization.md#drag-and-drop-feedback)

---

## Accessibility

> Implements: [standards.md#accessibility-standards](standards.md#accessibility-standards)

- Drag-and-drop has keyboard alternative (arrow keys)
- Screen reader announces card position changes
- Cards are in a `role="list"` container
