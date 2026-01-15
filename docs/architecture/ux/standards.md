<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Standards Specifications

Accessibility requirements and icon system.

## Related Specs

| Dependency | Spec | Why |
|------------|------|-----|
| **Components** | [components.md](components.md) | Component-specific accessibility |
| **Interactions** | [personalization.md](personalization.md#interaction-patterns) | Focus states, keyboard nav |

---

## Icon System

### Package

Use `@fluentui/react-icons` (Fluent UI System Icons) for all iconography.
Tree-shakable, consistent with Microsoft 365 ecosystem.

```typescript
// Import only the icons you need
import { Home24Regular, Search24Regular } from '@fluentui/react-icons';
```

### Icon Sizing Convention

| Context | Size | Suffix | Example |
|---------|------|--------|---------|
| Sidebar navigation | 24px | `24Regular` | `Home24Regular` |
| Navbar actions | 20px | `20Regular` | `Alert20Regular` |
| Buttons (with text) | 16px | `16Regular` | `Send16Regular` |
| Status indicators | 12px | `12Filled` | `Circle12Filled` |
| Card actions | 20px | `20Regular` | `MoreHorizontal20Regular` |

### Standard Icon Mapping

#### Navbar Icons

| Action | Icon | Import |
|--------|------|--------|
| Hamburger menu | ☰ | `Navigation24Regular` |
| Search | 🔍 | `Search24Regular` |
| Notifications | 🔔 | `Alert24Regular` |
| User profile | 👤 | `Person24Regular` |
| Settings | ⚙ | `Settings24Regular` |

#### Sidebar Navigation

| Item | Icon | Import |
|------|------|--------|
| Home | 🏠 | `Home24Regular` |
| Dante Library | 📚 | `Library24Regular` |
| AI Assistant | 🤖 | `Bot24Regular` |
| PM Dashboard | 📊 | `DataUsage24Regular` |
| Administration | 🛡 | `Shield24Regular` |
| Collapse sidebar | « | `PanelLeftContract24Regular` |
| Expand sidebar | » | `PanelLeftExpand24Regular` |

#### Card Grid Icons

| Action | Icon | Import |
|--------|------|--------|
| Drag handle | ⋮⋮ | `ReOrderDotsVertical24Regular` |
| Card menu | ⋯ | `MoreHorizontal20Regular` |
| Open/Launch | → | `Open24Regular` |
| Favorite | ☆ | `Star24Regular` / `Star24Filled` |

#### AI Assistant Icons

| Action | Icon | Import |
|--------|------|--------|
| Bot button | 🤖 | `Bot24Regular` |
| Send message | ➤ | `Send24Regular` |
| Pop out | ⧉ | `WindowNew24Regular` |
| Return/dock | ↩ | `WindowInprivate24Regular` |
| Minimize | − | `Subtract24Regular` |
| Close/hide | × | `Dismiss24Regular` |

#### Status Bar Icons

| Indicator | Icon | Import |
|-----------|------|--------|
| API healthy | 🟢 | `Circle12Filled` (green) |
| API degraded | 🟠 | `Circle12Filled` (orange) |
| API error | 🔴 | `Circle12Filled` (red) |
| Info notification | ℹ | `Info16Regular` |
| Warning notification | ⚠ | `Warning16Regular` |
| Error notification | ⛔ | `ErrorCircle16Regular` |

#### Common Actions

| Action | Icon | Import |
|--------|------|--------|
| Add/Create | + | `Add24Regular` |
| Edit | ✏ | `Edit24Regular` |
| Delete | 🗑 | `Delete24Regular` |
| Save | 💾 | `Save24Regular` |
| Cancel | × | `Dismiss24Regular` |
| Refresh | ↻ | `ArrowClockwise24Regular` |
| Filter | ⏳ | `Filter24Regular` |
| Sort | ↕ | `ArrowSort24Regular` |
| Expand | ▼ | `ChevronDown24Regular` |
| Collapse | ▲ | `ChevronUp24Regular` |
| External link | ↗ | `OpenRegular` |
| Copy | 📋 | `Copy24Regular` |
| Download | ⬇ | `ArrowDownload24Regular` |
| Upload | ⬆ | `ArrowUpload24Regular` |

### Filled vs Regular

| Style | Use Case |
|-------|----------|
| `Regular` | Default state, most UI elements |
| `Filled` | Active/selected state, emphasis, status indicators |

**Example:** Star icon for favorites

- `Star24Regular` — not favorited
- `Star24Filled` — favorited

---

## Accessibility Standards

### Target Conformance

**WCAG 2.1 Level AA** — the industry standard for enterprise web applications.

Fluent UI components provide strong accessibility foundations out of the box.
Custom components must meet the same standards.

### Key Requirements

#### Perceivable

| Requirement | Implementation |
|-------------|----------------|
| Text alternatives | All images, icons have `alt` or `aria-label` |
| Color contrast | Minimum 4.5:1 for normal text, 3:1 for large text |
| Don't rely on color alone | Use icons + color for status indicators |
| Resize support | UI readable at 200% zoom |

#### Operable

> **Focus states defined in:** [personalization.md#focus-states](personalization.md#focus-states)

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All features accessible without mouse |
| Focus visible | 2px solid focus ring on all interactive elements |
| Focus order | Logical tab order (left→right, top→bottom) |
| Skip links | "Skip to main content" link for screen readers |
| No keyboard traps | Escape key closes modals/panels |
| Touch targets | Minimum 44×44px for touch interactions |

#### Understandable

| Requirement | Implementation |
|-------------|----------------|
| Language declared | `<html lang="en">` |
| Consistent navigation | Sidebar, navbar in same position across pages |
| Error identification | Form errors clearly described, linked to field |
| Labels | All form inputs have visible labels |

#### Robust

| Requirement | Implementation |
|-------------|----------------|
| Valid HTML | Semantic markup, proper heading hierarchy |
| ARIA usage | Use ARIA only when native HTML insufficient |
| Screen reader testing | Test with NVDA or VoiceOver |

### Component-Specific Accessibility

> Details in component specs — quick links:

| Component | Accessibility Section |
|-----------|----------------------|
| Sidebar | [components.md#sidebar-accessibility](components.md#sidebar-accessibility) |
| Card Grid | [components.md#card-grid-accessibility](components.md#card-grid-accessibility) |
| Status Bar | [components.md#status-bar-accessibility](components.md#status-bar-accessibility) |
| AI Assistant | [behaviors.md#ai-assistant-accessibility](behaviors.md#ai-assistant-accessibility) |

### Testing Tools

| Tool | Purpose |
|------|---------|
| **axe DevTools** | Browser extension for automated checks |
| **Lighthouse** | Chrome DevTools accessibility audit |
| **NVDA** | Free Windows screen reader for manual testing |
| **Keyboard only** | Unplug mouse and navigate entire app |
