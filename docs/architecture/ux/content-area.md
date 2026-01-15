<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Content Area

| Property | Value | Notes |
|----------|-------|-------|
| Position | Flows after sidebar | Not fixed |
| Padding | `spacing.lg` (24px) | Consistent inner spacing |
| Min height | `calc(100vh - 48px - 24px)` | Fills below navbar and above status bar |

---

## Layout

The content area is the main region where Hub content is displayed:

- Card grid (default Hub view)
- Inline tool content (when opened via hash route)
- Search results
- Error pages (403, 404)

---

## Related Specs

- Card grid layout: [card-grid.md](card-grid.md)
- Navigation within content area: [navigation.md](navigation.md)
- Error pages: [error-handling.md](error-handling.md)
- Empty states: [empty-states.md](empty-states.md)
