import type { IHelpTooltipContent } from '../HelpTooltip';

// =============================================================================
// SETTINGS PANEL TOOLTIPS
// =============================================================================

export const settingsTooltips = {
  theme: {
    id: 'settings-theme',
    title: 'Theme Mode',
    content:
      'Choose between Light, Dark, or System theme. System mode automatically matches your operating system preferences.',
    learnMoreUrl: '/help/settings#theme',
  } as IHelpTooltipContent,

  sidebarBehaviour: {
    id: 'settings-sidebar-behaviour',
    title: 'Sidebar Behaviour',
    content:
      'Control whether the sidebar stays expanded or collapses automatically. Pinned mode keeps it open; Auto-collapse saves screen space.',
    learnMoreUrl: '/help/settings#sidebar',
  } as IHelpTooltipContent,

  cardVisibility: {
    id: 'settings-card-visibility',
    title: 'Card Visibility',
    content:
      'Hidden cards are removed from your view but can be restored anytime. This only affects your personal view—other users still see their own settings.',
    learnMoreUrl: '/help/personalisation#hidden-cards',
  } as IHelpTooltipContent,

  cardOrder: {
    id: 'settings-card-order',
    title: 'Card Order',
    content:
      'Drag cards to reorder them within each hub. Your custom order is saved automatically and persists across sessions.',
    learnMoreUrl: '/help/personalisation#reorder',
  } as IHelpTooltipContent,

  pinnedCards: {
    id: 'settings-pinned-cards',
    title: 'Pinned Cards',
    content:
      'Pinned cards always appear at the top of their hub. Use pinning for your most frequently accessed tools.',
    learnMoreUrl: '/help/personalisation#pinning',
  } as IHelpTooltipContent,
};

// =============================================================================
// TASK EDITOR TOOLTIPS
// =============================================================================

export const taskTooltips = {
  priority: {
    id: 'task-priority',
    title: 'Task Priority',
    content:
      'Set the urgency level: Low (can wait), Medium (normal), High (important), or Urgent (needs immediate attention). Priority affects sort order and visual styling.',
    learnMoreUrl: '/help/tasks#priority',
  } as IHelpTooltipContent,

  dueDate: {
    id: 'task-due-date',
    title: 'Due Date',
    content:
      'When the task should be completed. Overdue tasks are highlighted and appear in your notifications.',
    learnMoreUrl: '/help/tasks#due-dates',
  } as IHelpTooltipContent,

  recurrence: {
    id: 'task-recurrence',
    title: 'Recurring Tasks',
    content:
      'Set a task to repeat daily, weekly, monthly, or on a custom schedule. A new instance is created each time the previous one is completed.',
    learnMoreUrl: '/help/tasks#recurrence',
  } as IHelpTooltipContent,

  reminders: {
    id: 'task-reminders',
    title: 'Task Reminders',
    content:
      'Get notified before a task is due. Add multiple reminders with different timing (e.g., 1 day before, 1 hour before).',
    learnMoreUrl: '/help/tasks#reminders',
  } as IHelpTooltipContent,

  checklist: {
    id: 'task-checklist',
    title: 'Checklist Items',
    content:
      'Break down complex tasks into smaller steps. Check items off as you complete them—progress is shown on the task card.',
    learnMoreUrl: '/help/tasks#checklists',
  } as IHelpTooltipContent,

  assignees: {
    id: 'task-assignees',
    title: 'Task Assignees',
    content:
      'Assign tasks to yourself or others. Assignees receive notifications and can update task status. You can have multiple assignees with different roles.',
    learnMoreUrl: '/help/tasks#assignees',
  } as IHelpTooltipContent,

  hubLink: {
    id: 'task-hub-link',
    title: 'Link to Hub',
    content:
      'Associate this task with a specific hub or card. This helps organise tasks by work area and provides quick navigation.',
    learnMoreUrl: '/help/tasks#hub-linking',
  } as IHelpTooltipContent,
};

// =============================================================================
// SEARCH TOOLTIPS
// =============================================================================

export const searchTooltips = {
  hubFilter: {
    id: 'search-hub-filter',
    title: 'Filter by Hub',
    content:
      'Narrow results to specific hubs. Select one or more hubs to focus your search. Clear all to search everywhere.',
    learnMoreUrl: '/help/search#filters',
  } as IHelpTooltipContent,

  contentTypeFilter: {
    id: 'search-content-type-filter',
    title: 'Content Type',
    content:
      'Filter by the type of content: Pages, Documents, Policies, People, or Tools. Combine with hub filters for precise results.',
    learnMoreUrl: '/help/search#content-types',
  } as IHelpTooltipContent,

  quickSearch: {
    id: 'search-quick',
    title: 'Quick Search',
    content:
      'Start typing to see instant results. Press Enter to see all results, or click a result to navigate directly.',
    learnMoreUrl: '/help/search',
  } as IHelpTooltipContent,
};

// =============================================================================
// CARD GRID TOOLTIPS
// =============================================================================

export const cardGridTooltips = {
  pinCard: {
    id: 'card-pin',
    title: 'Pin to Top',
    content:
      'Pinned cards always appear at the top of the hub, making them easy to find. Unpin to return to normal order.',
    learnMoreUrl: '/help/personalisation#pinning',
  } as IHelpTooltipContent,

  hideCard: {
    id: 'card-hide',
    title: 'Hide Card',
    content:
      'Remove this card from your view. Hidden cards can be restored from Settings → Card Visibility.',
    learnMoreUrl: '/help/personalisation#hidden-cards',
  } as IHelpTooltipContent,

  favouriteCard: {
    id: 'card-favourite',
    title: 'Add to Favourites',
    content:
      'Add frequently used cards to your Favourites hub for quick access from any hub.',
    learnMoreUrl: '/help/personalisation#favourites',
  } as IHelpTooltipContent,

  reorderCards: {
    id: 'card-reorder',
    title: 'Reorder Cards',
    content:
      'Drag cards to rearrange them. Your custom order is saved and restored automatically.',
    learnMoreUrl: '/help/personalisation#reorder',
  } as IHelpTooltipContent,

  cardHelp: {
    id: 'card-help',
    title: 'Get Help',
    content:
      'Open the help article for this card to learn how to use it effectively.',
    learnMoreUrl: '/help/getting-started',
  } as IHelpTooltipContent,
};

// =============================================================================
// ADMIN TOOLTIPS
// =============================================================================

export const adminTooltips = {
  auditLogs: {
    id: 'admin-audit-logs',
    title: 'Audit Logs',
    content:
      'View a record of user actions across the intranet. Use filters to find specific events by type, user, or time range.',
    learnMoreUrl: '/help/admin#audit-logs',
  } as IHelpTooltipContent,

  adminHub: {
    id: 'admin-hub',
    title: 'Administration Hub',
    content:
      'Access admin-only tools and settings. This hub is only visible to users with administrative permissions.',
    learnMoreUrl: '/help/admin',
  } as IHelpTooltipContent,

  userManagement: {
    id: 'admin-user-management',
    title: 'User Management',
    content:
      'Manage user access, roles, and permissions. Changes here affect what users can see and do across the intranet.',
    learnMoreUrl: '/help/admin#users',
  } as IHelpTooltipContent,

  analyticsExport: {
    id: 'admin-analytics-export',
    title: 'Export Analytics',
    content:
      'Download audit logs and usage data for reporting. Data is exported in CSV format for analysis in Excel or other tools.',
    learnMoreUrl: '/help/admin#export',
  } as IHelpTooltipContent,
};

// =============================================================================
// NOTIFICATION TOOLTIPS
// =============================================================================

export const notificationTooltips = {
  taskBanner: {
    id: 'notification-task-banner',
    title: 'Task Notifications',
    content:
      'Shows tasks that are overdue or due today. Click to open the Tasks panel and manage your pending work.',
    learnMoreUrl: '/help/tasks#notifications',
  } as IHelpTooltipContent,

  notificationBell: {
    id: 'notification-bell',
    title: 'Notifications',
    content:
      'View all your notifications including task updates, mentions, and system alerts. Unread notifications are counted on the badge.',
    learnMoreUrl: '/help/notifications',
  } as IHelpTooltipContent,
};

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const helpTooltips = {
  settings: settingsTooltips,
  tasks: taskTooltips,
  search: searchTooltips,
  cardGrid: cardGridTooltips,
  admin: adminTooltips,
  notifications: notificationTooltips,
};

export default helpTooltips;
