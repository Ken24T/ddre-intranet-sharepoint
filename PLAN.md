# DDRE Intranet – Implementation Plan

Central task tracking for all planned implementations.

> **Last updated:** 2026-01-22
>
> **Current focus:** Shared Packages & Business Apps

---

## Quick Status

| Area | Status | Progress |
| ---- | ------ | -------- |
| **Intranet Shell** | ✅ Complete | Phases 1-10 done |
| **Shared Packages** | 🟡 Scaffolded | pkg-theme, pkg-api-client |
| **Business Apps** | ⚪ Not Started | Ready to begin |
| **Infrastructure** | 🟡 In Progress | Dev harness ready, CI pending |

---

## Table of Contents

1. [Intranet Shell](#1-intranet-shell)
2. [Shared Packages](#2-shared-packages)
3. [Business Apps](#3-business-apps)
4. [Infrastructure & DevOps](#4-infrastructure--devops)
5. [Documentation](#5-documentation)

---

## 1. Intranet Shell

> **Location:** `spfx/intranet-core`
>
> **Specs:** [docs/architecture/shell-layout.md](docs/architecture/shell-layout.md),
> [docs/architecture/ux/](docs/architecture/ux/)

The foundation SPFx solution providing the layout frame for all intranet content.

### Phase 1: Shell Foundation ✅

- [x] 1.1 Create `IntranetShell` component with CSS Grid layout
- [x] 1.2 Implement `Navbar` component (48px fixed top)
- [x] 1.3 Implement `Sidebar` component (240px default)
- [x] 1.4 Implement `ContentArea` component (fluid)
- [x] 1.5 Implement `StatusBar` component (24px fixed bottom)
- [x] 1.6 Verify responsive behavior at all breakpoints

### Phase 2: Core Components ✅

- [x] 2.1 Add sidebar collapse/expand toggle (64px ↔ 240px)
- [x] 2.2 Implement sidebar resize via cursor edge detection
- [x] 2.3 Create `CardGrid` component with CSS Grid auto-fit
- [x] 2.4 Create `FunctionCard` component with icon, title, description
- [x] 2.5 Implement card context menu (pin, hide, open modes)
- [x] 2.6 Add `@dnd-kit` for card drag-and-drop reordering
- [x] 2.7 Wire up Hub navigation in sidebar

### Phase 3: User Preferences ✅

- [x] 3.1 Create `useLocalStorage` hook for preferences
- [x] 3.2 Persist sidebar width and collapsed state
- [x] 3.3 Persist card order per Hub
- [x] 3.4 Persist pinned and hidden cards per Hub
- [x] 3.5 Implement `UserProfileMenu` dropdown
- [x] 3.6 Implement `SettingsPanel` modal with preference controls
- [x] 3.7 Add "Reset to Defaults" with confirmation dialog

### Phase 4: Theme Support ✅

- [x] 4.1 Define light and dark Fluent UI theme objects
- [x] 4.2 Create `ThemeProvider` wrapper component
- [x] 4.3 Apply theme early (before React render) to avoid flash
- [x] 4.4 Add theme toggle to profile menu
- [x] 4.5 Listen for `prefers-color-scheme` changes (System mode)
- [x] 4.6 Verify all components render correctly in both themes

### Phase 5: Status Bar & API Health ✅

- [x] 5.1 Create API health check service (Vault, PropertyMe)
- [x] 5.2 Implement health indicator dots with tooltip
- [x] 5.3 Display current user from SharePoint context
- [x] 5.4 Create system notifications data source
- [x] 5.5 Display notifications with scroll/truncate behavior
- [x] 5.6 Implement notification dismiss (session-scoped)

### Phase 6: Search ✅

- [x] 6.1 Add expandable search input to navbar
- [x] 6.2 Implement quick results dropdown (grouped by type)
- [x] 6.3 Create search results page with filters panel
- [ ] 6.4 Wire up SharePoint Search API or Microsoft Graph Search
- [x] 6.5 Implement keyboard navigation in results
- [x] 6.6 Add "No results" empty state

### Phase 7: Error Handling ✅

- [x] 7.1 Create `ToastProvider` and `useToast` hook
- [x] 7.2 Implement toast component (info, success, warning, error)
- [x] 7.3 Add auto-retry logic for API calls
- [x] 7.4 Create 403 Access Denied page
- [x] 7.5 Create 404 Not Found page
- [x] 7.6 Implement offline detection banner
- [x] 7.7 Add reconnection handling with toast

### Phase 8: Modals & Dialogs ✅

- [x] 8.1 Create base `Modal` component with backdrop, focus trap, ESC
- [x] 8.2 Implement `ConfirmationDialog` for destructive actions
- [x] 8.3 Implement `HiddenCardsManager` modal
- [x] 8.4 Implement `InfoModal` for system announcements
- [x] 8.5 Verify modal accessibility (aria-modal, labelledby, focus)

### Phase 9: AI Assistant ✅

- [x] 9.1 Create floating action button (bottom-right)
- [x] 9.2 Implement chat panel (slide up from button)
- [x] 9.3 Add pop-out to new window functionality
- [x] 9.4 Implement hide/show toggle (sessionStorage)
- [x] 9.5 Add "Show AI Assistant" option to profile menu
- [ ] 9.6 Wire up to Azure AI RAG proxy API

### Phase 10: Accessibility & Polish ✅

- [x] 10.1 Audit all components with axe DevTools
- [x] 10.2 Verify keyboard navigation throughout
- [x] 10.3 Add skip links for screen readers
- [x] 10.4 Verify focus indicators in both themes
- [ ] 10.5 Test with screen reader (NVDA or VoiceOver)
- [x] 10.6 Document any known accessibility limitations

> **Note:** Screen reader testing (10.5) deferred to pre-production.
> No automated issues found.

### Phase 11: Help & Feedback System

- [ ] 11.1 Define help system IA (Help Centre, in-context tips, search, roles)
- [ ] 11.2 Define help content taxonomy and metadata
      (audience, role, hub, lifecycle, tags)
- [ ] 11.3 Define content templates
      (overview, how-to, troubleshooting, FAQ, quick reference)
- [ ] 11.4 Create content authoring workflow and governance
      (owners, approvals, review cadence, versioning)
- [ ] 11.5 Build initial help content inventory
      (map cards/apps to required articles)
- [ ] 11.6 Add Help entry points
      (navbar Help icon, contextual “?” links, empty-state CTAs)
- [ ] 11.7 Implement Help Centre shell
      (hub landing page + search + filters)
- [ ] 11.7.1 Add Help Centre filter panel
      (hub, category, audience, updated, content type)
- [ ] 11.8 Implement contextual help surfaces
      (tooltips, side panel, inline callouts)
- [x] 11.8.1 Add card menu help option (Lightbulb)
- [x] 11.8.2 Add hub-based help filters in Help Centre
- [x] 11.8.3 Add general help buttons row
- [x] 11.8.4 Add general help cards (mock URLs)
- [x] 11.8.5 Add help card collapse/expand groups
- [ ] 11.9 Add onboarding checklists for new apps/tools
- [ ] 11.10 Add feedback loop
      (“Was this helpful?” + request help link)
- [x] 11.11 Define help content metadata model
      (owner, updated date, audience, content type)
- [x] 11.12 Add help card metadata display
      (owner + last updated)
- [x] 11.13 Add help feedback controls
      (helpful / not helpful)
- [x] 11.14 Add analytics hooks for help usage
      (search terms, card opens, feedback)
- [x] 11.15 Add placeholders for wizards and video tutorials

#### Phase 11a: Contextual Help Tooltips ✅

> Add `?` help icons with explanatory tooltips to complex UI elements.

- [x] 11a.1 Create `HelpTooltip` component
      (icon button + TooltipHost with rich content)
- [x] 11a.2 Define tooltip content data model
      (id, title, content, learnMoreUrl in helpTooltips.ts)
- [x] 11a.3 Add tooltips to Settings Panel sections
      (theme, layout, card visibility)
- [x] 11a.4 Add tooltips to Task Editor fields
      (priority, due date, checklist, reminders)
- [x] 11a.5 Add tooltips to Search filters
      (hub filter, content type filter)
- [x] 11a.6 Add tooltips to Card Grid actions
      (hint text with reorder tooltip)
- [x] 11a.7 Add tooltips to Admin features
      (Audit Logs header)
- [x] 11a.8 Add audit logging for tooltip views
      (help_tooltip_viewed, help_tooltip_learn_more events)

#### Phase 11b: What's New Panel ✅

> Release notes and changelog section in Help Centre.

- [x] 11b.1 Define release notes data model
      (version, date, title, summary, details, category)
- [x] 11b.2 Create mock release notes data
      (last 5-10 releases with realistic entries)
- [x] 11b.3 Add "What's New" tab/section to Help Centre
      (tab in General section or separate panel)
- [x] 11b.4 Create release notes list view
      (expandable cards with version, date, highlights)
- [x] 11b.5 Add category badges to release items
      (New Feature, Improvement, Bug Fix, Security)
- [x] 11b.6 Add "New" indicator for recent releases
      (badge on Help icon when new release unread)
- [x] 11b.7 Track release note views in audit log

#### Phase 11c: Help Search Analytics ✅

> Integrate help search with existing audit system for content gap analysis.

- [x] 11c.1 Add `help_search` event type to AuditContext
      (search_executed, search_no_results, article_opened, feedback_submitted)
- [x] 11c.2 Log Help Centre search queries
      (query text, result count, selected result)
- [x] 11c.3 Log "no results" searches separately
      (for content gap identification)
- [x] 11c.4 Log article opens with source context
      (from search, from category, from card, from request)
- [x] 11c.5 Log feedback submissions
      (helpful yes/no, article title, user context)
- [x] 11c.6 Add Help Analytics section to Audit Log Viewer
      (filter by help-related events, icon and colour)
- [x] 11c.7 Add "Top Missing Content" mock report
      (queries with no results, grouped and ranked)

#### Phase 11d: Print/Export Help Articles ✅

> Allow users to print or export help content for offline reference.

- [x] 11d.1 Add print button to help article preview
      (opens print dialog with styled content)
- [x] 11d.2 Create print-optimised CSS for help content
      (hide nav, adjust fonts, page breaks, @media print)
- [x] 11d.3 Add "Download as PDF" button (mock)
      (shows toast with "feature coming soon" for now)
- [x] 11d.4 Add "Copy link" button for help articles
      (copies shareable URL to clipboard with toast)
- [x] 11d.5 Log print/export actions in audit
      (article_printed, article_link_copied, article_pdf_requested)

#### Phase 11e: Related Articles ✅

> Show contextually related help articles for better discovery.

- [x] 11e.1 Define related articles data model
      (IRelatedArticle, RelationshipType in helpMock.ts)
- [x] 11e.2 Add mock related articles to help cards
      (relatedArticlesMap with 2-3 items per article)
- [x] 11e.3 Add "See Also" section to help preview
      (styled list with icons in mock help window)
- [x] 11e.4 Add "Related Help" section to card help
      (articles related to the function card)
- [x] 11e.5 Add relationship types
      (prerequisite, next_step, related_topic, troubleshooting)
- [x] 11e.6 Log related article clicks in audit
      (related_article_clicked with source and target)

### Phase 12: Feedback & Bug Report ✅

- [x] 12.1 Decide submission mechanism (Cognito Forms vs SharePoint list)
      (mock form for now, real integration in future phase)
- [x] 12.2 Define feedback categories + fields (bug, feature, content, access)
      (FeedbackCategory type with 5 options: bug, feature, content, access, other)
- [x] 12.3 Create feedback/bug report form (Cognito Forms)
      (FeedbackForm React component with validation and success state)
- [x] 12.4 Add Feedback entry points (navbar, footer, or Help Center CTA)
      (Send Feedback button in Help Centre CTA panel)
- [x] 12.5 Add "Report an Issue" card (hub placement + visibility rules)
      (added to home hub in sampleCards.ts)
- [x] 12.6 Implement form embedding/redirect behavior
      (FeedbackPanel using Fluent UI Panel with smooth open/close)
- [x] 12.7 Add acknowledgment UX (toast + confirmation state)
      (success state with checkmark, message, and new feedback option)
- [x] 12.8 Define routing of submissions (email, Teams channel, or tracker)
      (audit logging for feedback_form_submitted with metadata)

### Phase 13: Favourites Hub

- [ ] 13.1 Define favourites data model (per-user storage)
- [ ] 13.2 Add Favourites hub definition and light green theme
- [ ] 13.3 Render Favourites hub cards with duplicate behaviour
- [ ] 13.4 Add card menu actions (Add/Remove from Favourites)
- [ ] 13.5 Conditionally show Favourites in sidebar
      (Home → Favourites → Document Library)
- [ ] 13.6 Persist favourites and restore on load
- [ ] 13.7 Handle empty state (hide hub when no favourites)
- [ ] 13.8 Add tests for favourites persistence and sidebar visibility

### Phase 14: Collaboration, Messaging & Audit Logging

> Multi-user experience foundations (presence, chat, messaging, and audit trail).

- [ ] 14.1 Define active user presence model
      (who, where, last activity, privacy rules)
- [ ] 14.2 Add presence service abstraction
      (no secrets in SPFx; proxy via Azure service)
- [ ] 14.3 Add status bar active-user display
      (current user + count of other active users)
- [ ] 14.4 Add hover card/tooltip for active users
      (name, current hub, last activity time)
- [ ] 14.5 Define chat session model
      (participants, thread id, retention, moderation)
- [ ] 14.6 Add “Start chat” entry point
      (status bar or user directory)
- [ ] 14.7 Define messaging model for offline users
      (deliver on next login, read receipts, retention)
- [ ] 14.8 Add message inbox/notification entry point
      (navbar icon + unread badge)
- [ ] 14.9 Define authorised notification authoring flow
      (admin roles, hub scoping, scheduling, expiry)
- [ ] 14.10 Add notification composer UI
      (title, body, hub scope, severity)
- [ ] 14.11 Add notification governance
      (approvals, audit trail, editing rules)
- [x] 14.12 Define audit logging scope
      (log all user actions across all hubs and tools)
- [x] 14.12.1 Define event taxonomy
      (navigation, card actions, settings changes, content views)
      → contracts/audit-log-events.schema.json
- [x] 14.12.2 Define event payload schema
      (user id, hub, tool, action, timestamps, metadata)
      → contracts/audit-log-events.schema.json
- [x] 14.12.3 Define correlation strategy
      (session id, request id, cross-app trace)
      → sessionId in schema; serverTimestamp for server correlation
- [x] 14.12.4 Define PII handling rules
      (log everything for now; refine later)
- [x] 14.12.5 Define retention policy
      (retain indefinitely for now; apply rules later)
- [x] 14.12.6 Define access control
      (admins only)
      → contracts/audit-log-proxy.openapi.yml (403 on non-admin)
- [x] 14.12.7 Capture volume assumptions
      ~50 users × ~100 events/user/day = ~5,000 events/day
      Peak: ~500 events/hour during business hours (9am-5pm AEST)
      Storage: ~1KB/event avg → ~1.8GB/year uncompressed
      Retention: Indefinite (compress after 90 days)
- [ ] 14.13 Implement audit logging pipeline
      (client events → Azure proxy → storage)
- [x] 14.13.1 Build logging client helper
      (typed event builder, batching, retry)
      → packages/pkg-api-client/src/clients/AuditClient.ts
- [x] 14.13.1a Wire up audit logging in SPFx shell
      (AuditContext, useAudit hook, graceful failure)
      → Sidebar, CardGrid, SettingsPanel, SearchBox integrated
- [ ] 14.13.2 Implement Azure proxy endpoint
      (validate schema, auth, rate limits)
- [ ] 14.13.3 Add server-side enrichment
      (tenant, user group, app version)
- [ ] 14.13.4 Add storage partition strategy
      (by tenant/date/hub for querying)
- [ ] 14.13.5 Add failure handling
      (dead-letter queue, alerts)
- [x] 14.14 Build audit log viewer UI
      (filters, date range, export)
      → components/AuditLogViewer (attached to Audit Logs card)
- [x] 14.14.1 Define search/filter UX
      (user, hub, action, date range, event type)
      → Filter bar with dropdowns, date pickers, search field
- [x] 14.14.2 Add summary widgets
      (event counts by type, top users, activity sparkline)
- [x] 14.14.3 Add export options
      (CSV export with filtered results)
- [x] 14.14.3.1 Add unit tests for AuditLogViewer
      (17 test cases covering rendering, filtering, export, callbacks)
- [ ] 14.14.4 Add access control
      (admin-only, audit viewer role)
- [ ] 14.15 Add privacy & retention policy for logs
      (access controls, redaction, retention)
- [ ] 14.15.1 Define retention windows
      (hot vs cold storage, purge rules)
- [ ] 14.15.2 Define compliance review process
      (audit access, review cadence)

### Phase 15: User Tasks & Reminders

A comprehensive task management system supporting personal, shared, and team-based
tasks with optional hub association and recurring schedules.

#### 15.1 Data Model & Schema

- [x] 15.1.1 Define task entity schema (contracts/tasks.schema.json)

    Task {
      id: string (GUID)
      title: string (required, max 200 chars)
      description: string (optional, markdown supported)
      status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
      priority: 'low' | 'normal' | 'high' | 'urgent'
      createdBy: UserRef
      createdAt: datetime
      updatedAt: datetime
      dueDate: datetime (optional)
      completedAt: datetime (optional)
      completedBy: UserRef (optional)
    }

- [x] 15.1.2 Define ownership model

    TaskOwnership {
      taskId: string
      ownerType: 'user' | 'team' | 'group'
      ownerId: string (user email, team ID, or Entra group ID)
      role: 'owner' | 'assignee' | 'viewer'
    }

      - Owner: can edit, delete, reassign
      - Assignee: can update status, add comments
      - Viewer: read-only access

- [x] 15.1.3 Define hub association (optional)

    TaskHubLink {
      taskId: string
      hubKey:
        | 'sales'
        | 'property-management'
        | 'office'
        | 'administration'
        | null
      toolKey: string (optional, e.g., 'property-inspections')
      entityId: string (optional, link to specific record)
    }

- [x] 15.1.4 Define recurrence model

    TaskRecurrence {
      taskId: string
      pattern:
        | 'daily'
        | 'weekly'
        | 'fortnightly'
        | 'monthly'
        | 'yearly'
        | 'custom'
      interval: number (e.g., every 2 weeks)
      daysOfWeek: number[] (for weekly: 0=Sun, 1=Mon, etc.)
      dayOfMonth: number (for monthly)
      endType: 'never' | 'after-count' | 'by-date'
      endAfterCount: number (optional)
      endByDate: datetime (optional)
      nextOccurrence: datetime
    }

- [x] 15.1.5 Define reminder model

    TaskReminder {
      id: string
      taskId: string
      userId: string (who receives reminder)
      reminderType: 'before-due' | 'on-due' | 'custom'
      offsetMinutes: number (negative = before due)
      channel: 'intranet' | 'email' | 'teams' | 'all'
      sent: boolean
      sentAt: datetime (optional)
    }

- [x] 15.1.6 Define comments/activity model

    TaskComment {
      id: string
      taskId: string
      authorId: string
      content: string (markdown)
      createdAt: datetime
      editedAt: datetime (optional)
      type: 'comment' | 'status-change' | 'assignment' | 'system'
    }

#### 15.2 API Contracts

- [x] 15.2.1 Create tasks-api-proxy.openapi.yml (contracts/tasks-api-proxy.openapi.yml)
      (CRUD operations, filtering, search)
- [x] 15.2.2 Define query endpoints
      - GET /tasks (my tasks, with filters)
      - GET /tasks/assigned (tasks assigned to me)
      - GET /tasks/team/{teamId} (team tasks)
      - GET /tasks/hub/{hubKey} (hub-specific tasks)
      - GET /tasks/{id} (single task with comments)
- [x] 15.2.3 Define mutation endpoints
      - POST /tasks (create)
      - PUT /tasks/{id} (update)
      - PATCH /tasks/{id}/status (quick status change)
      - DELETE /tasks/{id} (soft delete)
      - POST /tasks/{id}/comments (add comment)
- [x] 15.2.4 Define recurrence endpoints
      - POST /tasks/{id}/recurrence (set up recurrence)
      - DELETE /tasks/{id}/recurrence (remove recurrence)
      - POST /tasks/{id}/skip-next (skip next occurrence)

#### 15.3 API Client (pkg-api-client)

- [x] 15.3.1 Create TasksClient class (pkg-api-client/src/clients/TasksClient.ts)
      (typed methods for all endpoints)
- [x] 15.3.2 Add optimistic updates for status changes (cache invalidation pattern)
- [x] 15.3.3 Add local caching with background sync (30s TTL cache)
- [ ] 15.3.4 Add offline queue for mutations

#### 15.4 React Context & Hooks

- [x] 15.4.1 Create TasksContext and TasksProvider (tasks/TasksContext.tsx)
- [x] 15.4.2 Create useTasks hook (list with filters)
- [x] 15.4.3 Create useTask hook (single task)
- [x] 15.4.4 Create useTaskMutations hook (create, update, delete)
- [x] 15.4.5 Create useTaskReminders hook (upcoming reminders)
- [x] 15.4.6 Create useTaskList, useTaskCounts, useHubTasks hooks (tasks/hooks.ts)
- [x] 15.4.7 Create task types and helpers (tasks/types.ts)

#### 15.5 UI Components

- [x] 15.5.1 TaskList component
      (filterable, sortable list view)
- [x] 15.5.2 TaskCard component
      (compact card for grid/kanban views)
- [x] 15.5.3 TaskDetailPanel component
      (full task view with comments, activity)
- [x] 15.5.4 TaskEditor component
      (create/edit form with validation)
- [x] 15.5.5 TaskStatusBadge component
      (coloured status indicator)
- [x] 15.5.6 TaskPriorityIndicator component
      (visual priority marker)
- [x] 15.5.7 TaskDueDateLabel component
      (due date with urgency indicators)
- [x] 15.5.8 TaskChecklistProgress component
      (visual progress for checklists)
- [x] 15.5.9 TaskAssignmentPicker component
      (user/team/group selection with role assignment)
- [x] 15.5.10 TaskRecurrenceEditor component
      (pattern configuration UI with all recurrence patterns)
- [x] 15.5.11 TaskReminderConfig component
      (reminder setup UI with channels and timing)

#### 15.6 Shell Integration

- [ ] 15.6.1 Add "My Tasks" widget to Home dashboard
      (top 5 pending tasks, quick actions)
- [ ] 15.6.2 Add Tasks icon to navbar
      (with badge showing pending count)
- [ ] 15.6.3 Add Tasks panel (slide-out or modal)
      (full task management without leaving context)
- [ ] 15.6.4 Add task quick-add from any hub
      (auto-link to current hub/tool context)
- [ ] 15.6.5 Add task reminders to notification system
      (integrate with existing notifications)

#### 15.7 Hub-Specific Views

- [ ] 15.7.1 Add Tasks card to each hub's card grid
      (filtered to hub's tasks)
- [ ] 15.7.2 Add "Create Task" action to hub context menus
      (pre-fill hub association)
- [ ] 15.7.3 Add task linking from business records
      (e.g., create task from property inspection)

#### 15.8 Permissions & Security

- [ ] 15.8.1 Define task visibility rules
      (owner, assignees, team members, admins)
- [ ] 15.8.2 Implement permission checks in API
- [ ] 15.8.3 Add admin task management view
      (all tasks, reassignment, bulk actions)

#### 15.9 Testing

- [ ] 15.9.1 Unit tests for TasksClient
- [ ] 15.9.2 Unit tests for TasksContext/hooks
- [ ] 15.9.3 Unit tests for UI components
- [ ] 15.9.4 E2E tests for task workflows

---

## 2. Shared Packages

> **Location:** `packages/`
>
> **Branch:** `feature/shared-packages`

Reusable libraries consumed by SPFx solutions.

### pkg-theme

> **Location:** `packages/pkg-theme`
>
> **Status:** 🟡 In Progress

Design tokens and theme utilities for consistent styling across apps.

#### Phase 1: Core Tokens ✅

- [x] 1.1 Define spacing scale (xs-xxl)
- [x] 1.2 Define typography scale (fontSize, lineHeight, fontWeight)
- [x] 1.3 Define z-index scale
- [x] 1.4 Define border radii
- [x] 1.5 Define breakpoints
- [x] 1.6 Define shadow scale

#### Phase 2: Color System ✅

- [x] 2.1 Move hub colors from shell to pkg-theme
- [x] 2.2 Add brand colors (primary, accent)
- [x] 2.3 Add semantic colors (success, warning, error, info)
- [x] 2.4 Add neutral palette
- [x] 2.5 Create `getHubColor()` helper function

#### Phase 3: CSS Custom Properties ✅

- [x] 3.1 Generate CSS variables from tokens
- [x] 3.2 Create `injectThemeVars()` function for runtime injection
- [x] 3.3 Export static CSS file for non-React usage

#### Phase 4: Fluent UI Integration ⏸️ Deferred

> Deferred until tenant environments are available and additional SPFx apps
> are needed.

- [ ] 4.1 Create light theme object for Fluent UI
- [ ] 4.2 Create dark theme object for Fluent UI
- [ ] 4.3 Add theme switching utilities
- [ ] 4.4 Export `ThemeProvider` wrapper

#### Phase 5: Documentation & Testing

- [ ] 5.1 Add JSDoc comments to all exports
- [ ] 5.2 Create README with usage examples
- [ ] 5.3 Add unit tests for helper functions
- [ ] 5.4 Verify build output (ESM + CJS)

### pkg-api-client

> **Location:** `packages/pkg-api-client`
>
> **Status:** 🟡 In Progress

Type-safe clients for Azure proxy APIs.

#### Phase 1: Core Infrastructure ✅

- [x] 1.1 Create `BaseClient` class
- [x] 1.2 Create `ApiError` class with typed errors
- [x] 1.3 Define `ApiClientConfig` interface
- [x] 1.4 Set up TypeScript build

#### Phase 2: API Clients ✅

- [x] 2.1 Create `AiClient` for RAG chatbot
- [x] 2.2 Create `VaultClient` for Sales CRM
- [x] 2.3 Create `PropertyMeClient` for PM data
- [x] 2.4 Export all types for consumers

#### Phase 3: Resilience

- [ ] 3.1 Add retry with exponential backoff
- [ ] 3.2 Add request timeout handling
- [ ] 3.3 Add circuit breaker pattern (optional)
- [ ] 3.4 Create `useRetry` hook for React consumers

#### Phase 4: Caching

- [ ] 4.1 Add in-memory cache layer
- [ ] 4.2 Add cache invalidation strategies
- [ ] 4.3 Add `stale-while-revalidate` support
- [ ] 4.4 Make caching opt-in per request

#### Phase 5: Testing & Documentation

- [ ] 5.1 Add mock server for unit tests
- [ ] 5.2 Test error handling scenarios
- [ ] 5.3 Create README with usage examples
- [ ] 5.4 Document API response types

### Integration

> **Status:** ⚪ Not Started

Wire up shared packages to SPFx solutions.

- [ ] Install pkg-theme in intranet-core
- [ ] Migrate shell theme code to use pkg-theme
- [ ] Install pkg-api-client in intranet-core
- [ ] Wire AI Assistant to AiClient
- [ ] Wire Status Bar health checks to clients
- [ ] Replace mocked global settings with SharePoint-backed config
      (card open behavior, admin settings)

---

## 3. Business Apps

> **Location:** `apps/` (requirements), `spfx/` (implementations)

Each app gets its own SPFx solution deployed as a separate `.sppkg`.

### app-cognito-forms

> **Status:** ⚪ Planning
>
> **Hub:** Administration

Embedded Cognito Forms for internal requests.

- [ ] Define requirements in `apps/app-cognito-forms/`
- [ ] Create SPFx solution `spfx/cognito-forms/`
- [ ] Implement form embedding component
- [ ] Configure forms list (Help & Support, IT Request, etc.)

### app-dante-library

> **Status:** ⚪ Planning
>
> **Hub:** Office

AI-powered document library search using Dante AI.

- [ ] Define requirements in `apps/app-dante-library/`
- [ ] Create SPFx solution `spfx/dante-library/`
- [ ] Implement Dante AI chat integration
- [ ] Wire up document context from SharePoint

### app-marketing-budget

> **Status:** ⚪ Planning
>
> **Hub:** Administration

Marketing budget tracking and reporting.

- [ ] Define requirements in `apps/app-marketing-budget/`
- [ ] Create SPFx solution `spfx/marketing-budget/`
- [ ] Design data model (SharePoint List or external)
- [ ] Implement budget dashboard component
- [ ] Implement budget entry/edit forms

### app-pm-dashboard

> **Status:** ⚪ Planning
>
> **Hub:** Property Management

PropertyMe data visualization dashboard.

- [ ] Define requirements in `apps/app-pm-dashboard/`
- [ ] Create SPFx solution `spfx/pm-dashboard/`
- [ ] Design dashboard layout and widgets
- [ ] Integrate with `pkg-api-client` PropertyMeClient
- [ ] Implement property list, tenant info, maintenance views

### app-qrcoder

> **Status:** ⚪ Planning
>
> **Hub:** Office

QR code generation utility for business use.

- [ ] Define requirements in `apps/app-qrcoder/`
- [ ] Create SPFx solution `spfx/qrcoder/`
- [ ] Select QR code generation library
- [ ] Implement QR generator UI
- [ ] Add download/print functionality

### app-surveys

> **Status:** ⚪ Planning
>
> **Hub:** Administration

Internal survey creation and management.

- [ ] Define requirements in `apps/app-surveys/`
- [ ] Create SPFx solution `spfx/surveys/`
- [ ] Design survey builder UI
- [ ] Implement survey response collection
- [ ] Add results visualization

### app-vault-batcher

> **Status:** ⚪ Planning
>
> **Hub:** Sales

Batch operations for Vault CRM data.

- [ ] Define requirements in `apps/app-vault-batcher/`
- [ ] Create SPFx solution `spfx/vault-batcher/`
- [ ] Define batch operation types
- [ ] Integrate with `pkg-api-client` VaultClient
- [ ] Implement batch upload/update UI
- [ ] Add progress tracking and error reporting

---

## 4. Infrastructure & DevOps

### Development Environment

- [x] Configure Vite dev harness for component development
- [x] Set up environment configs (dev/test/prod)
- [ ] Document local development setup in runbook
- [ ] Add VS Code recommended extensions list

### Branding Assets & Fonts (Tenant-Hosted)

> **Status:** ⚪ Planned (awaiting tenant access)

- [ ] Convert brand font files (TTF → WOFF2)
- [ ] Upload font files to SharePoint Site Assets (tenant-hosted)
- [ ] Add `@font-face` declarations in SPFx styles
- [ ] Wire font family into Fluent UI theme tokens
- [ ] Verify font loading, caching, and fallback stacks

### CI/CD Pipeline

- [ ] Create GitHub Actions workflow for PR validation
- [ ] Add lint + test + build checks
- [ ] Configure automated `.sppkg` artifact creation
- [ ] Set up deployment to SharePoint App Catalog (manual trigger)
- [ ] Add version bump automation

### Azure Proxy Services

> **Contracts:** `contracts/*.openapi.yml`

- [ ] Deploy AI RAG proxy to Azure
- [ ] Deploy Vault API proxy to Azure
- [ ] Deploy PropertyMe API proxy to Azure
- [ ] Configure API Management / Function Apps
- [ ] Set up monitoring and alerts

### SharePoint Tenant Setup

- [ ] Provision Dev tenant
- [ ] Provision Test tenant
- [ ] Provision Prod tenant
- [ ] Configure App Catalog in each tenant
- [ ] Set up SharePoint Lists for notifications, config

---

## 5. Documentation

### Architecture Docs

- [x] Shell layout specification
- [x] UX component specifications (20 specs)
- [x] Theming architecture
- [x] API integration architecture
- [ ] Security and permissions model
- [ ] Data flow diagrams

### Runbooks

- [x] Local development setup
- [x] Release process (TCTBP)
- [x] Deployment guide
- [ ] Troubleshooting guide
- [ ] Rollback procedures

### User Documentation

- [ ] End-user guide for intranet features
- [ ] Admin guide for card/notification management
- [ ] App-specific user guides

---

## Notes

### Conventions

- **Branch naming:** `feature/<name>`, `fix/<name>`, `ui/<name>`, `docs/<name>`
- **Commit messages:** Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Workflow:** TCTBP (Test, Commit, Tag, Bump, Push) for releases

### References

- [Copilot Instructions](.github/copilot-instructions.md)
- [Shell Layout Spec](docs/architecture/shell-layout.md)
- [UX Specifications](docs/architecture/ux/README.md)
- [API Contracts](contracts/)
