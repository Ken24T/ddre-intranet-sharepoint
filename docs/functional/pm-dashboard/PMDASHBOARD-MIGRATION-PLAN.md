# PM Dashboard – Migration Plan

> **Source:** `D:\Development\Repos\DDRE Intranet\app-pm-dashboard` (standalone vanilla JS app)
> **Target:** `spfx/intranet-core/src/webparts/pmDashboard/` (SPFx web part)
> **Branch:** `app/pm-dashboard`
> **Status:** Planning – no code yet

---

## 1  Executive Summary

The standalone PM Dashboard is a **vanilla JavaScript + Express** application (~6,500 LOC) that tracks property vacates, entries, and losses for property managers. It uses JSON file storage, a WebSocket server for multi-user sync, Tailwind CSS, SortableJS drag-and-drop, and a server-side PropertyMe scraping pipeline (Puppeteer / Cheerio / OpenAI).

This plan migrates **all user-facing functionality** into a single SPFx web part (`pmDashboard`) using React 17, Fluent UI 8, TypeScript, and the existing intranet architecture. Server-side concerns move behind the Azure PropertyMe API proxy that already has a contract and typed client.

---

## 2  Existing Functionality Inventory

Every feature of the standalone app is catalogued below, grouped by subsystem.

### 2.1  Data Model

| Entity | Shape | Storage |
|--------|-------|---------|
| **Property Row** | `{ id, pm, propertyUrl?, columns: string[], blank?: boolean }` | `data.json` → `PUT /data` |
| **Blank Spacer Row** | `{ id, blank: true }` | Same |
| **User (PM)** | `{ id, firstName, lastName, preferredName, color, colWidths? }` | `users.json` → `PUT /users` |

Three sections of data: `vacates`, `entries`, `lost` — each an array of rows.

#### Column schemas per section

| Section | Columns (ordered) |
|---------|-------------------|
| **Vacates** | Date · Property · PM · VAC · Reason |
| **Entries** | Date · Day · Signed · BOND · 2WKS · Property · PM · Comments |
| **Lost** | Date · Property · Reason · PM |

> **Note:** The column schemas have been migrated (old columns ST, Sign, KEY, ECR, ECR BY were removed via `migrateData()`). The migration plan should use only the current schemas above.

### 2.2  UI Features

| # | Feature | Description | Standalone Implementation |
|---|---------|-------------|---------------------------|
| 1 | **Three-table layout** | Side-by-side cards for Vacates (yellow), Entries (green), Lost (red, currently hidden) | Flex layout, colour-coded `<section>` cards |
| 2 | **PM selector** | Dropdown to choose current property manager; gates all editing | `<select id="pmSelect">` in navbar |
| 3 | **PM background colour** | Each PM has a distinct colour; rows and the dropdown show that colour | `user.color`, `getPmColor()`, row `backgroundColor` |
| 4 | **Colour contrast** | Text colour auto-adjusts for readability on PM colour backgrounds | `getContrastColor()` luminance calculation |
| 5 | **Inline cell editing** | All data cells are `contentEditable`; changes save on blur | `td.contentEditable = 'true'` + blur handler |
| 6 | **Date picker** | Clicking a Date cell shows a native `<input type="date">` | Click handler → `input.value = displayToIso(...)` |
| 7 | **Auto Day column** | Entries table auto-calculates day-of-week from Date | `['Sun',...,'Sat'][new Date(iso).getDay()]` |
| 8 | **PM dropdown per row** | PM column renders as a `<select>` of user initials | In-cell `<select>` with colour update on change |
| 9 | **Property links** | Property column shows a clickable link if `propertyUrl` is set | `<a>` element + double-click to edit text |
| 10 | **Context menu** | Right-click on rows: Add property row, Add blank row, Add URL from clipboard, Remove row | Custom `<ul id="contextMenu">` |
| 11 | **Add row buttons** | `+` button in each section header | `addRow()` creates row with inherited date |
| 12 | **Blank spacer rows** | Rows with no data used as visual separators between date groups | `{ blank: true }` rows with full-width cell |
| 13 | **Drag-and-drop reorder** | SortableJS on tbody; drag handle column; reordering persists | `Sortable()` with `onEnd` handler |
| 14 | **Date-based auto-reorder** | Changing a row's date moves it to the correct chronological position | `reorderPropertyByDate()` |
| 15 | **Date update on drag** | Dragging a row near a different date group updates its date column | `updateDateBasedOnPosition()` |
| 16 | **Column resizing** | Drag resizer on column headers; widths saved per PM per section | Custom `mousedown`/`mousemove` on header dividers |
| 17 | **Per-PM column widths** | Each PM's column width preferences are stored and restored | `user.colWidths[section][]` |
| 18 | **Card resizing** | Horizontal resizer between Vacates and Entries cards | `.card-resizer` with `mousedown` |
| 19 | **Settings modal** | Manage PMs: add, edit (name, preferred name, colour), delete | `<div id="settingsModal">` form |
| 20 | **Delete PM warning** | Shows count of rows using PM's initials before deletion | Row scan + `confirm()` |
| 21 | **Paste sanitiser** | Pasted text is stripped to plain text, whitespace normalised | `addPlainPasteListener()` intercepts paste |
| 22 | **Clipboard URL attach** | Context menu "Add URL from clipboard" attaches a PropertyMe URL to a row | `navigator.clipboard.readText()` + URL validation |
| 23 | **Data validation** | Strips null/undefined rows on load | `validateAndCleanData()` |
| 24 | **Data migration** | Removes legacy columns from old data shapes | `migrateData()` |
| 25 | **Editing gating** | All editing disabled until a PM is selected (cells, drag, buttons, dropdowns) | `setCellEditingEnabled()`, `setDragAndDropEnabled()` |
| 26 | **Date format** | Display: DD/MM, storage: DD/MM, input: ISO for `<input type="date">` | `isoToDisplay()`, `displayToIso()` |

### 2.3  PropertyMe Drag-and-Drop Integration

| # | Feature | Description |
|---|---------|-------------|
| 27 | **External drag-and-drop** | Drag PropertyMe URLs from browser onto table rows | `PropertyMeDragDrop` class (2,362 LOC) |
| 28 | **Row-level drop targeting** | Drop highlights specific rows; insertion indicator shows where | `setTargetRow()`, `.propertyme-drop-target` |
| 29 | **Drop zone UI** | Animated drop zone overlay with status messages | `.propertyme-drop-zone` CSS |
| 30 | **URL extraction** | Extracts URLs from `text/uri-list`, `text/plain`, `text/html`, custom `PMDASH:` format | `extractUrlFromDragEvent()` |
| 31 | **Address extraction from drag** | Parses property address from drag data (text and HTML) | `extractAddressFromDragContent()`, Australian address patterns |
| 32 | **Client-side record creation** | If address is extracted from drag data, creates row without server call | `createPropertyRecord()` |
| 33 | **Server-side extraction fallback** | Calls `POST /api/propertyme/extract` if no address in drag data | `processPropertyMeUrl()` |
| 34 | **Target row insertion** | Inserts new property after the row being hovered | `insertRowAfterTarget()` |
| 35 | **Date inheritance from context** | New row inherits date from target row or nearest neighbour | `getDateFromRowBelowBlank()`, target row date |
| 36 | **PM gating on drag** | Drag-and-drop disabled if no PM is selected; warning shown | `checkPmSelectionStatus()` |
| 37 | **URL validation** | Only accepts `manager.propertyme.com/#/property/card/*` URLs | `isPropertyMeUrl()` regex |
| 38 | **Chrome extension support** | Custom `PMDASH:` base64 payload from browser extension | `text/plain` starting with `PMDASH:` decoded as JSON |
| 39 | **PM status monitoring** | Polls PM selection state, shows/hides warning banner | `setupPmStatusMonitoring()` |

### 2.4  Server-Side PropertyMe Extraction

| # | Feature | Description |
|---|---------|-------------|
| 40 | **Web scraping** | Axios + Cheerio fetches PropertyMe page HTML, searches for address | `extractUsingWebScraping()` |
| 41 | **Browser automation** | Puppeteer fallback for JavaScript-rendered pages | `extractUsingBrowser()` |
| 42 | **OpenAI fallback** | GPT-4o extraction as last resort | `extractUsingOpenAI()` |
| 43 | **URL-to-address parsing** | Converts URL slugs to readable addresses as final fallback | `createFallbackRecord()` |
| 44 | **Key date extraction** | Scrapes "Moved in" / "Moved out" dates from PropertyMe | Cheerio `.card-label` selectors |
| 45 | **Address cleaning** | Removes suburb, state, postcode, parenthesised type from full address | `extractStreetAddress()`, `cleanPropertyAddress()` |
| 46 | **Dashboard format conversion** | Converts extracted data into section-specific column arrays | `convertToDashboardFormat()` |

### 2.5  Real-Time Sync

| # | Feature | Description |
|---|---------|-------------|
| 47 | **WebSocket client** | Connects to `/sync`, sends data/user/PM changes | `PMDashboardSyncClient` class |
| 48 | **WebSocket server** | Broadcasts data changes to all other connected clients | `websocket-server.js` |
| 49 | **Online user dots** | Shows coloured dots for connected users in navbar | `updateOnlineUsers()` |
| 50 | **User dot blinking** | Blinks a user's dot when they make changes | `blinkUserDot()` |
| 51 | **PM selection broadcast** | Other users see which PM each person has selected | `sendPmSelectionChange()` |
| 52 | **Auto-reconnect** | Reconnects up to 5 times with exponential backoff | `attemptReconnect()` |
| 53 | **Sync status indicator** | Green/yellow/grey/red dot with text in navbar | `updateSyncUI()` |

### 2.6  Server & Storage

| # | Feature | Description |
|---|---------|-------------|
| 54 | **Express server** | Serves static files + REST API on port 3000 | `server-production-with-websocket.js` |
| 55 | **JSON file storage** | `data.json` (property data) and `users.json` (PM profiles) | `fs.readFile` / `fs.writeFile` |
| 56 | **Health endpoint** | `GET /health` returns status, uptime, WebSocket stats | Express route |
| 57 | **One-off data importers** | `importVacates()`, `importEntries()`, `importLost()` with hardcoded TSV | Embedded in `script.js` |

### 2.7  Chrome Browser Extension

| # | Feature | Description |
|---|---------|-------------|
| 58 | **Manifest V3 extension** | Runs on PropertyMe pages to enable enhanced drag data | `propertyme-browser-extension/` |

---

## 3  Architecture Decisions

### 3.1  What Migrates As-Is (adapted to React/TypeScript/Fluent UI)

All 26 UI features (§2.2) are re-implemented as React components with Fluent UI 8 controls. The data model and column schemas carry over unchanged.

### 3.2  What Changes Architecture

| Area | Standalone | SPFx Target | Rationale |
|------|-----------|-------------|-----------|
| **Styling** | Tailwind CSS via CDN | SCSS modules + Fluent UI theme tokens | SPFx doesn't support Tailwind CDN; Fluent UI is the design system |
| **Data storage** | JSON files on Express | SharePoint List (SPListRepository) + Dexie fallback for dev harness | Follow Marketing Budget pattern |
| **Real-time sync** | WebSocket server | SharePoint List polling or Azure SignalR (Phase 2) | No WebSocket server in SharePoint; initial release uses polling |
| **Auth / user identity** | None (honour system PM select) | Entra ID via SharePoint context; PM selector still used for "working as" | SPFx provides `context.pageContext.user` |
| **PM management** | Settings modal → `users.json` | SharePoint List (`PmDashboard-PropertyManagers`) | Persistent, multi-user safe |
| **PropertyMe integration** | Express routes + Puppeteer/Cheerio/OpenAI | Azure proxy (`PropertyMeClient` from `pkg-api-client`) | No server-side code in SPFx; proxy already exists |
| **Drag-and-drop** | PropertyMe URLs from browser | PropertyMe URL paste/input initially; drag-drop requires browser extension update (Phase 2) | SPFx iframe sandboxing limits cross-origin drag events |
| **Column resizing** | Custom mouse drag on `<th>` | Fluent UI `DetailsList` with `isResizable: true` | Built-in, accessible, keyboard-friendly |
| **Row drag-and-drop** | SortableJS library | `@dnd-kit/sortable` (React-native, accessible) or Fluent UI's drag support | SortableJS is DOM-imperative; `@dnd-kit` is React-idiomatic |
| **Card/panel resizing** | Custom resizer div | Fluent UI `SplitButton` / CSS `resize` / custom hook | Simpler with React state |
| **Data importers** | Hardcoded TSV strings | Not migrated; one-off data was for bootstrapping | Data now lives in SharePoint Lists |

### 3.3  What Is Dropped

| Feature | Reason |
|---------|--------|
| Express server (`server-production-with-websocket.js`) | No server in SPFx |
| WebSocket real-time sync (initial release) | Replaced by SharePoint List polling; SignalR upgrade in Phase 2 |
| Puppeteer browser automation | Cannot run headless browser from SPFx; Azure proxy handles extraction |
| OpenAI direct integration | Moves to Azure proxy |
| Cheerio HTML scraping | Moves to Azure proxy |
| Chrome browser extension | Unchanged; operates independently; will adapt `PMDASH:` format in Phase 2 |
| `importVacates/Entries/Lost()` one-off importers | Bootstrap data; not needed post-migration |
| `node-windows` service installer | Express-specific |
| Deployment flags (`DISABLE_EXTERNAL_DND`) | Controlled by SPFx environment config |

### 3.4  What Is Deferred to Phase 2

| Feature | Phase 2 Approach |
|---------|-----------------|
| Real-time multi-user sync | Azure SignalR via proxy; `pkg-api-client` SignalR wrapper |
| PropertyMe drag-and-drop from browser | Update Chrome extension to post messages to SPFx iframe |
| Online user presence indicators | Azure SignalR presence channel |
| User dot blinking on changes | SignalR event |

---

## 4  Data Model (TypeScript)

```typescript
// models/types.ts

/** The three table sections */
export type DashboardSection = 'vacates' | 'entries' | 'lost';

/** A single row in any section table */
export interface IPropertyRow {
  id: string;
  pm: string;                  // PM initials e.g. "CW"
  propertyUrl?: string;        // Optional PropertyMe link
  columns: string[];           // Ordered values per section schema
  blank?: boolean;             // True = spacer row (columns ignored)
}

/** Full dashboard data */
export interface IDashboardData {
  vacates: IPropertyRow[];
  entries: IPropertyRow[];
  lost: IPropertyRow[];
}

/** A property manager user */
export interface IPropertyManager {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  color: string;               // Hex colour for row backgrounds
}

/** Column definitions per section */
export const SECTION_COLUMNS: Record<DashboardSection, string[]> = {
  vacates: ['Date', 'Property', 'PM', 'VAC', 'Reason'],
  entries: ['Date', 'Day', 'Signed', 'BOND', '2WKS', 'Property', 'PM', 'Comments'],
  lost:    ['Date', 'Property', 'Reason', 'PM'],
};
```

---

## 5  SharePoint List Schemas

### 5.1  `PmDashboard-Data`

| Column | Type | Notes |
|--------|------|-------|
| `RowId` | Single line (GUID) | Indexed, unique |
| `Section` | Choice (vacates, entries, lost) | Indexed |
| `SortOrder` | Number | For manual ordering |
| `PmInitials` | Single line (2 chars) | Indexed |
| `PropertyUrl` | Hyperlink | Optional PropertyMe link |
| `IsBlank` | Yes/No | Spacer row flag |
| `Col_Date` | Single line | DD/MM format |
| `Col_Property` | Single line | Address text |
| `Col_PM` | Single line | Initials |
| `Col_VAC` | Single line | Vacates-specific |
| `Col_Reason` | Single line | Vacates & Lost |
| `Col_Day` | Single line | Entries-specific (auto-calc) |
| `Col_Signed` | Single line | Entries |
| `Col_BOND` | Single line | Entries |
| `Col_2WKS` | Single line | Entries |
| `Col_Comments` | Multiple lines | Entries |

> **Alternative:** Use a single `ColumnsJson` field (multiple lines of text) storing `JSON.stringify(columns)` — simpler schema, identical to current data model, avoids column explosion. Recommended for Phase 1.

### 5.2  `PmDashboard-PropertyManagers`

| Column | Type | Notes |
|--------|------|-------|
| `PmId` | Single line (GUID) | Indexed, unique |
| `FirstName` | Single line | |
| `LastName` | Single line | |
| `PreferredName` | Single line | Optional |
| `Color` | Single line | Hex e.g. `#ffc0cb` |

---

## 6  Component Architecture

### 6.1  Web Part Entry Point

```
pmDashboard/
├── PmDashboardWebPart.ts              # SPFx entry point
├── PmDashboardWebPart.manifest.json   # Manifest
├── components/
│   ├── IPmDashboardProps.ts           # Root props interface
│   ├── PmDashboard.tsx                # Root component (state, data loading)
│   ├── PmDashboard.module.scss        # Root styles
│   ├── PmSelector.tsx                 # PM dropdown with colour background
│   ├── SectionTable.tsx               # Generic table for any section
│   ├── SectionTable.module.scss       # Table styles (colour themes)
│   ├── PropertyRow.tsx                # Single data row (editable cells)
│   ├── BlankRow.tsx                   # Spacer row
│   ├── CellEditors/
│   │   ├── DateCell.tsx               # Date display → date picker on click
│   │   ├── DayCell.tsx                # Auto-calculated, read-only
│   │   ├── PmCell.tsx                 # PM initials dropdown
│   │   ├── PropertyCell.tsx           # Text with optional link; double-click edit
│   │   └── TextCell.tsx               # Generic contentEditable text cell
│   ├── ContextMenu.tsx                # Right-click actions (Fluent UI ContextualMenu)
│   ├── SettingsPanel.tsx              # PM CRUD (Fluent UI Panel)
│   ├── PropertyMeInput.tsx            # URL input/paste for adding PropertyMe properties
│   └── useShellBridge.ts             # AppBridge hook (nav items, sidebar)
├── models/
│   ├── types.ts                       # Interfaces (§4 above)
│   ├── dateHelpers.ts                 # DD/MM ↔ ISO, day-of-week calc
│   ├── dateHelpers.test.ts
│   ├── rowOperations.ts              # Add, remove, reorder, date-reorder logic
│   ├── rowOperations.test.ts
│   ├── pmHelpers.ts                  # getInitials, getPmColor, getContrastColor
│   ├── pmHelpers.test.ts
│   └── columnSchemas.ts             # SECTION_COLUMNS constant + helpers
├── services/
│   ├── IDashboardRepository.ts       # Interface: load/save data + PMs
│   ├── DexieDashboardRepository.ts   # Dexie (IndexedDB) for dev harness
│   ├── SPListDashboardRepository.ts  # SharePoint List implementation
│   ├── RepositoryFactory.ts          # Chooses SP or Dexie based on context
│   ├── PropertyMeService.ts          # Wraps PropertyMeClient for extraction
│   └── db.ts                         # Dexie database definition
└── loc/
    ├── en-us.js                       # Australian English strings
    └── mystrings.d.ts
```

### 6.2  Component Responsibilities

| Component | Responsibility | Standalone Equivalent |
|-----------|---------------|----------------------|
| `PmDashboard` | Root: loads data, manages PM selection, renders 3 sections | `init()`, global state |
| `PmSelector` | PM dropdown with colour background, contrast text | `renderPmDropdown()`, `updateDropdownBackground()` |
| `SectionTable` | Renders one section: header row, body rows, add button | `renderTable()`, `renderHeaders()` |
| `PropertyRow` | Single data row with per-column cell editors, drag handle, PM colour | Row rendering inside `renderTable()` |
| `BlankRow` | Full-width empty row as visual separator | `if (row.blank)` branch |
| `DateCell` | Shows DD/MM; click opens Fluent UI `DatePicker`; triggers reorder on change | Date `<td>` click handler |
| `DayCell` | Read-only; shows weekday calculated from Date | Auto-calc in entries |
| `PmCell` | Dropdown of PM initials; updates row colour on change | `PM` column `<select>` |
| `PropertyCell` | Text with optional hyperlink (`propertyUrl`); double-click to edit | Property `<td>` with `<a>` |
| `TextCell` | Generic text cell; editable when PM selected; paste sanitiser | `contentEditable` cells |
| `ContextMenu` | Right-click menu: add row, add blank, paste URL, remove | `contextMenu` `<ul>` |
| `SettingsPanel` | Fluent UI Panel: list PMs, edit form, delete with row-count warning | `settingsModal` |
| `PropertyMeInput` | Text input + "Add" button for PropertyMe URLs (replaces drag-and-drop in Phase 1) | `processPropertyMeUrl()` |

### 6.3  State Management

Use React `useReducer` in `PmDashboard.tsx`:

```typescript
interface DashboardState {
  data: IDashboardData;
  propertyManagers: IPropertyManager[];
  selectedPmId: string;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean; // Unsaved changes
}

type DashboardAction =
  | { type: 'SET_DATA'; payload: IDashboardData }
  | { type: 'SET_PMS'; payload: IPropertyManager[] }
  | { type: 'SELECT_PM'; payload: string }
  | { type: 'UPDATE_ROW'; section: DashboardSection; rowId: string; columns: string[] }
  | { type: 'ADD_ROW'; section: DashboardSection; afterRowId?: string; blank?: boolean }
  | { type: 'REMOVE_ROW'; section: DashboardSection; rowId: string }
  | { type: 'REORDER_ROWS'; section: DashboardSection; rowIds: string[] }
  | { type: 'REORDER_BY_DATE'; section: DashboardSection; rowId: string; newDate: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
```

Auto-save via `useEffect` debounce (300ms) when `isDirty` is true.

---

## 7  Service Layer

### 7.1  `IDashboardRepository` Interface

```typescript
export interface IDashboardRepository {
  loadData(): Promise<IDashboardData>;
  saveData(data: IDashboardData): Promise<void>;
  loadPropertyManagers(): Promise<IPropertyManager[]>;
  savePropertyManagers(pms: IPropertyManager[]): Promise<void>;
}
```

### 7.2  Implementations

| Class | When Used | Storage |
|-------|-----------|---------|
| `DexieDashboardRepository` | Vite dev harness (no SP context) | IndexedDB via Dexie.js |
| `SPListDashboardRepository` | SharePoint runtime | PnPjs → `PmDashboard-Data` and `PmDashboard-PropertyManagers` lists |

### 7.3  `PropertyMeService`

Wraps `PropertyMeClient` from `pkg-api-client`:

```typescript
export class PropertyMeService {
  constructor(private client: PropertyMeClient) {}

  /** Extract property address from a PropertyMe URL */
  async extractProperty(url: string): Promise<{ address: string; propertyUrl: string }> {
    // Validates URL format client-side
    // Calls PropertyMeClient.getPropertyByUrl() via Azure proxy
    // Azure proxy handles scraping/extraction server-side
    // Returns cleaned street address
  }
}
```

> **Note:** The Azure proxy contract (`contracts/propertyme/openapi.yml`) may need a new endpoint for URL-based property lookup. This is an infrastructure task outside the web part.

---

## 8  Feature-by-Feature Migration Map

| # | Feature | SPFx Component | Fluent UI Control | Notes |
|---|---------|---------------|-------------------|-------|
| 1 | Three-table layout | `PmDashboard` flex container | Stack horizontal | Colour themes via SCSS variables |
| 2 | PM selector | `PmSelector` | `Dropdown` with `onRenderOption` | Custom option rendering for colour backgrounds |
| 3 | PM background colour | `PropertyRow` inline style | — | `style={{ backgroundColor: pmColor }}` |
| 4 | Colour contrast | `pmHelpers.getContrastColor()` | — | Pure function, unit-tested |
| 5 | Inline editing | `TextCell` | `TextField` (borderless) on click | Or `contentEditable` span with `onBlur` |
| 6 | Date picker | `DateCell` | `DatePicker` (Fluent UI) | Australian date format DD/MM/YYYY |
| 7 | Auto Day | `DayCell` | `Text` (read-only) | Computed from Date column |
| 8 | PM dropdown per row | `PmCell` | `Dropdown` (compact) | Options = PM initials |
| 9 | Property links | `PropertyCell` | `Link` + `TextField` on edit | Double-click swaps to edit mode |
| 10 | Context menu | `ContextMenu` | `ContextualMenu` | `onContextMenu` on rows |
| 11 | Add row buttons | `SectionTable` header | `IconButton` (Add icon) | Disabled when no PM selected |
| 12 | Blank spacer rows | `BlankRow` | `<tr>` with `colSpan` | Same as current |
| 13 | Row drag-and-drop | `SectionTable` body | `@dnd-kit/sortable` | Drag handle + reorder save |
| 14 | Date-based reorder | `rowOperations.reorderByDate()` | — | Pure function |
| 15 | Date update on drag | `rowOperations.updateDateFromPosition()` | — | Pure function |
| 16 | Column resizing | `SectionTable` | `DetailsList` `isResizable` or custom | Consider per-PM preferences |
| 17 | Per-PM widths | User preferences in SP List or localStorage | — | Phase 1: localStorage; Phase 2: SP List |
| 18 | Card resizing | `PmDashboard` | Custom CSS `resize` or drag handle | Horizontal split between sections |
| 19 | Settings panel | `SettingsPanel` | `Panel` + `TextField` + `ColorPicker` | Fluent UI `Panel` slides in from right |
| 20 | Delete PM warning | `SettingsPanel` | `Dialog` with row count | Fluent UI `Dialog` |
| 21 | Paste sanitiser | `TextCell` | `onPaste` handler | Strip formatting, normalise whitespace |
| 22 | Clipboard URL | `ContextMenu` action | — | `navigator.clipboard.readText()` |
| 23 | Data validation | `rowOperations.validateData()` | — | On load, strip nulls |
| 24 | Data migration | Not needed | — | Clean start from SP Lists |
| 25 | Editing gating | `PmDashboard` state → prop cascade | — | `isEditable` prop flows to all cells |
| 26 | Date format | `dateHelpers` module | — | DD/MM ↔ ISO conversions |
| 27–39 | PropertyMe drag-and-drop | Phase 1: `PropertyMeInput` (paste/type URL) | `TextField` + `PrimaryButton` | Full drag-and-drop deferred to Phase 2 |
| 40–46 | Server-side extraction | Azure proxy + `PropertyMeService` | — | Proxy handles scraping |
| 47–53 | Real-time sync | Phase 1: polling; Phase 2: SignalR | — | Poll interval configurable |
| 54–57 | Server & storage | Replaced by SharePoint Lists | — | — |
| 58 | Chrome extension | Unchanged (independent) | — | Phase 2: adapt for SPFx iframe |

---

## 9  Implementation Phases

### Phase 1 – Core Dashboard (this branch)

**Milestone:** Fully functional dashboard with all table features in SPFx.

| Step | Task | Est. |
|------|------|------|
| 1.1 | Scaffold web part (`PmDashboardWebPart.ts`, manifest, config.json entry, loc strings) | 1h |
| 1.2 | Define TypeScript models (`types.ts`, `columnSchemas.ts`) | 1h |
| 1.3 | Implement `dateHelpers.ts` with unit tests | 1h |
| 1.4 | Implement `pmHelpers.ts` with unit tests | 0.5h |
| 1.5 | Implement `rowOperations.ts` with unit tests (add, remove, reorder, date-reorder, validate) | 2h |
| 1.6 | Define `IDashboardRepository` interface | 0.5h |
| 1.7 | Implement `DexieDashboardRepository` (dev harness) with seed data | 2h |
| 1.8 | Build `PmSelector` component | 1h |
| 1.9 | Build `TextCell`, `DateCell`, `DayCell`, `PmCell`, `PropertyCell` | 3h |
| 1.10 | Build `PropertyRow` and `BlankRow` components | 1.5h |
| 1.11 | Build `SectionTable` (header, body, add button, column resizing) | 2h |
| 1.12 | Build `ContextMenu` component | 1h |
| 1.13 | Add row drag-and-drop with `@dnd-kit/sortable` | 2h |
| 1.14 | Build root `PmDashboard` with `useReducer`, data loading, three-table layout | 2h |
| 1.15 | Build `SettingsPanel` (PM CRUD) | 1.5h |
| 1.16 | SCSS module styles (section colour themes, PM row colours) | 2h |
| 1.17 | Implement `PropertyMeInput` (URL paste/type → Azure proxy extraction) | 1.5h |
| 1.18 | AppBridge integration (`useShellBridge` for sidebar nav) | 1h |
| 1.19 | Editing gating (disabled state cascade when no PM selected) | 1h |
| 1.20 | Implement `SPListDashboardRepository` | 3h |
| 1.21 | SharePoint List provisioning (feature XML or `listProvisioning.ts`) | 1.5h |
| 1.22 | End-to-end testing in dev harness | 2h |
| 1.23 | Playwright E2E tests | 2h |
| **Total** | | **~33h** |

### Phase 2 – Real-Time & PropertyMe Enhancement

| Task | Notes |
|------|-------|
| Azure SignalR integration for real-time sync | Via Azure proxy |
| Online user presence indicators | SignalR presence channel |
| PropertyMe drag-and-drop from browser extension | Update extension to post to SPFx iframe |
| User dot blinking | SignalR events |
| Per-PM column widths in SP List | Move from localStorage |

### Phase 3 – Advanced Features

| Task | Notes |
|------|-------|
| Dashboard analytics / KPIs | PropertyMe API aggregate queries |
| Property portfolio widget views | As described in `apps/app-pm-dashboard/README.md` |
| Maintenance request tracking | PropertyMe maintenance endpoints |

---

## 10  Azure Proxy Considerations

The `contracts/propertyme/openapi.yml` currently defines read-only endpoints for properties, tenants, owners, and maintenance. For PM Dashboard Phase 1, we may need:

1. **`POST /api/v1/propertyme/extract`** – Accepts a PropertyMe URL, performs server-side scraping (the extraction logic currently in `property-extractor.js`), and returns the street address. This replaces the Express route.
2. **Dashboard data endpoints** – If we choose Azure proxy storage instead of SharePoint Lists (unlikely for Phase 1), add CRUD endpoints.

For Phase 1, the recommendation is to use **SharePoint Lists** for all data storage and only use the PropertyMe proxy for property address extraction.

---

## 11  Data Migration (One-Time)

To migrate existing data from the standalone app's `data.json` and `users.json` into SharePoint Lists:

1. Export `data.json` and `users.json` from the standalone server
2. Run a PowerShell migration script that:
   - Creates the two SharePoint Lists if they don't exist
   - Iterates each section's rows and creates list items
   - Creates PM list items from `users.json`
   - Assigns `SortOrder` based on array index
3. Validate row counts match

This is a one-time operation. The script should be idempotent (skip existing items by `RowId`/`PmId`).

---

## 12  Testing Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Models (`dateHelpers`, `pmHelpers`, `rowOperations`) | Jest (Heft) | Pure functions, 100% branch coverage |
| Components | Jest + Testing Library | Render, interaction, state |
| Repository (Dexie) | Jest | CRUD operations |
| Repository (SP List) | Jest + mocked PnPjs | SP call verification |
| Integration | Vite dev harness | Manual smoke test |
| E2E | Playwright | Full user workflows |

---

## 13  Acceptance Criteria

Phase 1 is complete when:

- [ ] All 26 UI features from §2.2 work in the SPFx web part
- [ ] PM selector controls all editing (gating)
- [ ] Three-table layout renders with colour-coded sections
- [ ] Rows are editable inline (text, date picker, PM dropdown, property link)
- [ ] Rows can be added (property + blank), removed, and reordered via drag-and-drop
- [ ] Context menu provides all four actions
- [ ] Settings panel allows full PM CRUD with delete warning
- [ ] PropertyMe URLs can be added via text input and are extracted via Azure proxy
- [ ] Data persists to SharePoint Lists (or Dexie in dev harness)
- [ ] Date changes trigger automatic row reordering
- [ ] Per-PM row colours display correctly with contrast text
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run test` passes
- [ ] Dev harness works at `http://localhost:3027/`
- [ ] Australian English used in all UI text
