<!-- markdownlint-disable MD013 MD032 MD040 MD060 -->
# Search Experience

> **Implemented in:** Navbar (search icon), Content area (results page)
>
> **Related:** [navbar.md](navbar.md)

## Search Scope

Search includes all content the user has permission to access:

| Content Type | Source | Notes |
|--------------|--------|-------|
| Pages | SharePoint pages across all Hubs | |
| Documents | SharePoint document libraries | |
| Policies | Dante Library (Markdown files) | |
| People | Microsoft 365 directory | |
| Tools/Cards | Function card metadata | |

**Permission trimming:** Results are filtered server-side to only show content
the user has read access to. No results leak across permission boundaries.

---

## Search Input

### Collapsed State (Default)

| Property | Value |
|----------|-------|
| Icon | `Search24Regular` |
| Position | Navbar, left of notifications |
| Size | 32px touch target |
| Behavior | Click to expand |

### Expanded State

| Property | Value |
|----------|-------|
| Width | 320px (or available space on mobile) |
| Animation | Expand left from icon (fast: 100ms) |
| Placeholder | "Search pages, documents, people..." |
| Auto-focus | Yes, when expanded |
| Close | Click outside, Escape key, or clear + blur |

```
Collapsed:                    Expanded:
┌──────────────────────┐      ┌──────────────────────────────────────┐
│  [Logo]    [🔍][🔔][👤]│  →   │  [Logo]  [🔍 Search...         ][🔔][👤]│
└──────────────────────┘      └──────────────────────────────────────┘
```

---

## Quick Results Dropdown

Appears below search input as user types (after 2+ characters).

| Property | Value |
|----------|-------|
| Width | Same as expanded search input |
| Max height | 400px (scrollable) |
| Debounce | 300ms after typing stops |
| Position | Anchored below search input |
| Z-index | `zIndex.dropdown` (200) |

### Results Layout

Results grouped by content type:

```
┌─────────────────────────────────────┐
│ 🔍 "budget"                      ×  │
├─────────────────────────────────────┤
│ PAGES                               │
│   📄 Marketing Budget Guidelines    │
│   📄 Annual Budget Process          │
├─────────────────────────────────────┤
│ DOCUMENTS                           │
│   📎 Budget_Template_2026.xlsx      │
│   📎 Q4_Budget_Report.pdf           │
├─────────────────────────────────────┤
│ POLICIES                            │
│   📚 Budget Approval Policy         │
├─────────────────────────────────────┤
│ PEOPLE                              │
│   👤 Sarah Budget (Finance)         │
├─────────────────────────────────────┤
│ ────────────────────────────────    │
│ Press Enter for all results →       │
└─────────────────────────────────────┘
```

| Group | Max Items | Icon |
|-------|-----------|------|
| Pages | 3 | `Document24Regular` |
| Documents | 3 | `Attach24Regular` |
| Policies | 2 | `Library24Regular` |
| People | 2 | `Person24Regular` |
| Tools | 2 | `Apps24Regular` |

**Interactions:**

- Click result to navigate directly
- Arrow keys to navigate results
- Enter on result to open it
- Enter with no selection opens full results page

---

## Full Results Page

Dedicated page for complete search results with filtering.

### URL Structure

```
/search?q={query}&hub={hubId}&type={contentType}
```

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                       │
├─────────┬───────────────────────────────────────────────────┤
│         │  Search Results for "budget"         [🔍 budget ] │
│ SIDEBAR │                                                    │
│         │  ┌─────────────┐  ┌───────────────────────────┐   │
│         │  │ FILTERS     │  │ RESULTS                   │   │
│         │  │             │  │                           │   │
│         │  │ Hub         │  │ 📄 Marketing Budget...    │   │
│         │  │ ☑ All       │  │    Sales Hub · Page       │   │
│         │  │ ☐ PM Hub    │  │                           │   │
│         │  │ ☐ Sales Hub │  │ 📎 Budget_Template...     │   │
│         │  │             │  │    PM Hub · Document      │   │
│         │  │ Type        │  │                           │   │
│         │  │ ☑ All       │  │ 📚 Budget Approval...     │   │
│         │  │ ☐ Pages     │  │    Dante Library · Policy │   │
│         │  │ ☐ Documents │  │                           │   │
│         │  │ ☐ Policies  │  │ [Load more...]            │   │
│         │  │ ☐ People    │  │                           │   │
│         │  └─────────────┘  └───────────────────────────┘   │
│         │                                                    │
├─────────┴───────────────────────────────────────────────────┤
│ STATUS BAR                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Filters Panel

| Filter | Type | Options |
|--------|------|---------|
| Hub | Checkbox list | All, PM Hub, Sales Hub, Admin Hub, etc. |
| Content Type | Checkbox list | All, Pages, Documents, Policies, People, Tools |

**Filter behavior:**

- "All" checked by default
- Selecting specific items unchecks "All"
- Clearing all selections re-checks "All"
- Filters update URL query params
- Results update immediately (no submit button)

### Results List

| Element | Description |
|---------|-------------|
| Icon | Content type icon |
| Title | Clickable, navigates to item |
| Snippet | Text excerpt with search term highlighted |
| Metadata | Hub name · Content type · Last modified |
| Pagination | "Load more" button or infinite scroll |

**Results per page:** 20 initially, load 20 more on demand.

---

## Search No Results

When search returns nothing:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              No results for "xyzzy"                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Simple, clean — no suggestions or distractions. Just acknowledge the empty result.

---

## Implementation Notes

- Use SharePoint Search REST API or Microsoft Graph Search
- Implement search suggestions/autocomplete (future enhancement)
- Track popular searches for analytics (future enhancement)
- Consider search result ranking improvements (future enhancement)
