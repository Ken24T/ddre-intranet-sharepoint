/**
 * Release Notes Data Model and Mock Data
 * Phase 11b: What's New Panel
 *
 * Structure: Minor releases (0.x) contain patch releases (0.x.y)
 */

// =============================================================================
// TYPES
// =============================================================================

/** Category of a release note item */
export type ReleaseCategory = 'feature' | 'improvement' | 'bugfix' | 'security';

/** A single item within a release */
export interface IReleaseNoteItem {
  /** Unique identifier */
  id: string;
  /** Short description of the change */
  title: string;
  /** Category for badge styling */
  category: ReleaseCategory;
  /** Optional detailed description */
  description?: string;
}

/** A patch release (e.g., 0.5.24) within a minor release */
export interface IPatchRelease {
  /** Semantic version (e.g., "0.5.24") */
  version: string;
  /** Release date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Title for the patch (e.g., "Contextual Help Tooltips") */
  title: string;
  /** List of changes in this patch */
  items: IReleaseNoteItem[];
}

/** A minor release (e.g., 0.5) containing multiple patches */
export interface IMinorRelease {
  /** Unique identifier for the release */
  id: string;
  /** Minor version (e.g., "0.5") */
  version: string;
  /** Title for the release (e.g., "v0.5 — January 2026") */
  title: string;
  /** Brief summary of this minor release cycle */
  summary: string;
  /** Patch releases within this minor version, ordered newest first */
  patches: IPatchRelease[];
}

// Legacy interface for backwards compatibility
export interface IReleaseNote {
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  items: IReleaseNoteItem[];
}

// =============================================================================
// CATEGORY METADATA
// =============================================================================

export const categoryLabels: Record<ReleaseCategory, string> = {
  feature: 'New Feature',
  improvement: 'Improvement',
  bugfix: 'Bug Fix',
  security: 'Security',
};

export const categoryColors: Record<ReleaseCategory, { bg: string; text: string }> = {
  feature: { bg: '#dff6dd', text: '#107c10' },
  improvement: { bg: '#deecf9', text: '#0078d4' },
  bugfix: { bg: '#fff4ce', text: '#8a6914' },
  security: { bg: '#fde7e9', text: '#a4262c' },
};

// =============================================================================
// GROUPED RELEASE DATA
// =============================================================================

export const minorReleases: IMinorRelease[] = [
  {
    id: 'release-0.5',
    version: '0.5',
    title: 'v0.5 — January 2026',
    summary: 'Major feature release including Help Centre, Tasks, AI Assistant, Audit Logging, and comprehensive theming support.',
    patches: [
      {
        version: '0.5.32',
        date: '2026-01-22',
        title: 'What\'s New Category Filters',
        items: [
          {
            id: 'item-0.5.32-1',
            title: 'Category badges now act as filters in What\'s New',
            category: 'feature',
            description: 'Click Features, Improvements, Bug Fixes, or Security badges to filter the release notes.',
          },
          {
            id: 'item-0.5.32-2',
            title: 'Toggle filter by clicking badge again or use Clear button',
            category: 'improvement',
          },
          {
            id: 'item-0.5.32-3',
            title: 'Auto-expand release when filter is applied',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.31',
        date: '2026-01-22',
        title: 'Grouped Release Notes',
        items: [
          {
            id: 'item-0.5.31-1',
            title: 'What\'s New now groups patches by minor version',
            category: 'improvement',
            description: 'Patch releases (0.5.x) are now grouped under their parent minor version (v0.5) for easier browsing.',
          },
          {
            id: 'item-0.5.31-2',
            title: 'Summary badges show total counts per category',
            category: 'feature',
            description: 'Each minor release shows counts for Features, Improvements, Bug Fixes, and Security items.',
          },
          {
            id: 'item-0.5.31-3',
            title: 'Date range and update count shown for each release',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.30',
        date: '2026-01-22',
        title: 'Styled Notification Tooltips',
        items: [
          {
            id: 'item-0.5.30-1',
            title: 'Notification tooltips now use styled callouts',
            category: 'improvement',
            description: 'Hover over status bar notifications to see a nicely formatted popup with severity, message, publisher, and date.',
          },
          {
            id: 'item-0.5.30-2',
            title: 'Improved status bar task flyout styling',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.29',
        date: '2026-01-22',
        title: 'Bug Fixes & Polish',
        items: [
          {
            id: 'item-0.5.29-1',
            title: 'Fixed admin cards showing in Favourites for non-admin users',
            category: 'bugfix',
            description: 'Favourites hub now correctly filters out admin-only cards when user switches from admin role.',
          },
          {
            id: 'item-0.5.29-2',
            title: 'Cards now draggable from anywhere, not just drag handle',
            category: 'improvement',
            description: 'Entire card is now draggable with grab cursor for easier reordering.',
          },
          {
            id: 'item-0.5.29-3',
            title: 'Removed redundant 6-dot drag handle icon',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.24',
        date: '2026-01-21',
        title: 'Contextual Help Tooltips',
        items: [
          {
            id: 'item-0.5.24-1',
            title: 'Added contextual help tooltips to Settings Panel',
            category: 'feature',
            description: 'Hover over the info icons in Settings to learn about theme, layout, and card visibility options.',
          },
          {
            id: 'item-0.5.24-2',
            title: 'Added help tooltips to Task Editor fields',
            category: 'feature',
            description: 'Priority, due date, checklist, and reminder fields now have helpful explanations.',
          },
          {
            id: 'item-0.5.24-3',
            title: 'Added help tooltips to Search filters',
            category: 'feature',
          },
          {
            id: 'item-0.5.24-4',
            title: 'Card grid now shows reorder hint with tooltip',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.20',
        date: '2026-01-20',
        title: 'Help Centre Enhancements',
        items: [
          {
            id: 'item-0.5.20-1',
            title: 'Added hub-based help article filtering',
            category: 'feature',
            description: 'Filter help articles by hub to find relevant content faster.',
          },
          {
            id: 'item-0.5.20-2',
            title: 'Added "Was this helpful?" feedback controls',
            category: 'feature',
            description: 'Help us improve by rating articles as helpful or not helpful.',
          },
          {
            id: 'item-0.5.20-3',
            title: 'Added owner and updated date metadata to help cards',
            category: 'improvement',
          },
          {
            id: 'item-0.5.20-4',
            title: 'Added placeholders for video tutorials and wizards',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.15',
        date: '2026-01-15',
        title: 'Admin Audit Logging',
        items: [
          {
            id: 'item-0.5.15-1',
            title: 'Added Audit Log Viewer for administrators',
            category: 'feature',
            description: 'View a record of user actions across the intranet with filtering by type, user, and time range.',
          },
          {
            id: 'item-0.5.15-2',
            title: 'Audit events now tracked for navigation, cards, settings, and search',
            category: 'feature',
          },
          {
            id: 'item-0.5.15-3',
            title: 'Session tracking for usage analytics',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.10',
        date: '2026-01-10',
        title: 'Tasks System',
        items: [
          {
            id: 'item-0.5.10-1',
            title: 'Full task management system with create, edit, and delete',
            category: 'feature',
            description: 'Create tasks with titles, descriptions, priorities, due dates, and checklists.',
          },
          {
            id: 'item-0.5.10-2',
            title: 'Task notifications in navbar and status bar',
            category: 'feature',
            description: 'Get notified about overdue and due-today tasks.',
          },
          {
            id: 'item-0.5.10-3',
            title: 'Email reminder settings for tasks',
            category: 'feature',
          },
          {
            id: 'item-0.5.10-4',
            title: 'Link tasks to hubs for better organisation',
            category: 'improvement',
          },
          {
            id: 'item-0.5.10-5',
            title: 'Fixed task due date timezone handling',
            category: 'bugfix',
          },
        ],
      },
      {
        version: '0.5.5',
        date: '2026-01-05',
        title: 'AI Assistant',
        items: [
          {
            id: 'item-0.5.5-1',
            title: 'Floating AI Assistant button',
            category: 'feature',
            description: 'Access the AI Assistant from any page via the floating button in the bottom-right corner.',
          },
          {
            id: 'item-0.5.5-2',
            title: 'Pop-out chat to new window',
            category: 'feature',
          },
          {
            id: 'item-0.5.5-3',
            title: 'Show/hide AI Assistant from profile menu',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.5.0',
        date: '2025-12-20',
        title: 'December 2025 Release',
        items: [
          {
            id: 'item-0.5.0-1',
            title: 'Light and dark theme support',
            category: 'feature',
            description: 'Choose between Light, Dark, or System theme in Settings.',
          },
          {
            id: 'item-0.5.0-2',
            title: 'Status bar with API health indicators',
            category: 'feature',
            description: 'See real-time health status for connected services.',
          },
          {
            id: 'item-0.5.0-3',
            title: 'Improved toast notifications with auto-dismiss',
            category: 'improvement',
          },
          {
            id: 'item-0.5.0-4',
            title: 'Offline detection with reconnection handling',
            category: 'feature',
          },
          {
            id: 'item-0.5.0-5',
            title: 'Fixed focus trap in modals',
            category: 'bugfix',
          },
          {
            id: 'item-0.5.0-6',
            title: 'Security headers added to all API requests',
            category: 'security',
          },
        ],
      },
    ],
  },
  {
    id: 'release-0.4',
    version: '0.4',
    title: 'v0.4 — December 2025',
    summary: 'Personalisation features including card reordering, pinning, hiding, and user preferences.',
    patches: [
      {
        version: '0.4.0',
        date: '2025-12-01',
        title: 'User Preferences',
        items: [
          {
            id: 'item-0.4.0-1',
            title: 'Drag-and-drop card reordering',
            category: 'feature',
            description: 'Drag cards to rearrange them within each hub.',
          },
          {
            id: 'item-0.4.0-2',
            title: 'Pin and unpin cards to the top',
            category: 'feature',
          },
          {
            id: 'item-0.4.0-3',
            title: 'Hide cards from your view',
            category: 'feature',
          },
          {
            id: 'item-0.4.0-4',
            title: 'Settings panel with reset to defaults',
            category: 'feature',
          },
          {
            id: 'item-0.4.0-5',
            title: 'Preferences persist across sessions',
            category: 'improvement',
          },
        ],
      },
    ],
  },
  {
    id: 'release-0.3',
    version: '0.3',
    title: 'v0.3 — November 2025',
    summary: 'Search functionality, error handling, modals, and AI Assistant foundations.',
    patches: [
      {
        version: '0.3.5',
        date: '2025-11-25',
        title: 'AI Assistant',
        items: [
          {
            id: 'item-0.3.5-1',
            title: 'Added floating AI Assistant button',
            category: 'feature',
            description: 'Access AI help from any page via the bottom-right button.',
          },
          {
            id: 'item-0.3.5-2',
            title: 'Chat panel slides up from button',
            category: 'feature',
          },
          {
            id: 'item-0.3.5-3',
            title: 'Pop-out chat to new window',
            category: 'feature',
          },
          {
            id: 'item-0.3.5-4',
            title: 'Show/hide AI Assistant from profile menu',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.3.4',
        date: '2025-11-20',
        title: 'Modals & Dialogs',
        items: [
          {
            id: 'item-0.3.4-1',
            title: 'Modal component with backdrop and focus trap',
            category: 'feature',
            description: 'Accessible modals with keyboard navigation and ESC to close.',
          },
          {
            id: 'item-0.3.4-2',
            title: 'Confirmation dialog for destructive actions',
            category: 'feature',
          },
          {
            id: 'item-0.3.4-3',
            title: 'Hidden cards manager modal',
            category: 'feature',
            description: 'View and restore hidden cards from the Settings panel.',
          },
          {
            id: 'item-0.3.4-4',
            title: 'System announcements modal',
            category: 'feature',
          },
        ],
      },
      {
        version: '0.3.2',
        date: '2025-11-15',
        title: 'Error Handling',
        items: [
          {
            id: 'item-0.3.2-1',
            title: 'Toast notification system',
            category: 'feature',
            description: 'Info, success, warning, and error toasts with auto-dismiss.',
          },
          {
            id: 'item-0.3.2-2',
            title: 'Auto-retry logic for API calls',
            category: 'improvement',
          },
          {
            id: 'item-0.3.2-3',
            title: 'Access Denied (403) error page',
            category: 'feature',
          },
          {
            id: 'item-0.3.2-4',
            title: 'Not Found (404) error page',
            category: 'feature',
          },
          {
            id: 'item-0.3.2-5',
            title: 'Offline detection with reconnection banner',
            category: 'feature',
            description: 'Automatic detection when network is lost, with reconnection handling.',
          },
        ],
      },
      {
        version: '0.3.0',
        date: '2025-11-10',
        title: 'Search',
        items: [
          {
            id: 'item-0.3.0-1',
            title: 'Expandable search input in navbar',
            category: 'feature',
            description: 'Click or press Ctrl+K to open the search box.',
          },
          {
            id: 'item-0.3.0-2',
            title: 'Quick results dropdown grouped by type',
            category: 'feature',
          },
          {
            id: 'item-0.3.0-3',
            title: 'Search results page with filters panel',
            category: 'feature',
            description: 'Filter results by hub, content type, and date.',
          },
          {
            id: 'item-0.3.0-4',
            title: 'Keyboard navigation in search results',
            category: 'improvement',
          },
          {
            id: 'item-0.3.0-5',
            title: 'Empty state for no search results',
            category: 'improvement',
          },
        ],
      },
    ],
  },
  {
    id: 'release-0.2',
    version: '0.2',
    title: 'v0.2 — October 2025',
    summary: 'Core UI components and user preferences system.',
    patches: [
      {
        version: '0.2.5',
        date: '2025-10-25',
        title: 'User Profile & Settings',
        items: [
          {
            id: 'item-0.2.5-1',
            title: 'User profile menu dropdown',
            category: 'feature',
            description: 'Access settings, theme toggle, and sign out from your avatar.',
          },
          {
            id: 'item-0.2.5-2',
            title: 'Settings panel modal',
            category: 'feature',
            description: 'Manage layout, theme, and card visibility preferences.',
          },
          {
            id: 'item-0.2.5-3',
            title: 'Reset to defaults with confirmation',
            category: 'feature',
          },
          {
            id: 'item-0.2.5-4',
            title: 'Preferences stored in browser localStorage',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.2.2',
        date: '2025-10-15',
        title: 'Card Grid',
        items: [
          {
            id: 'item-0.2.2-1',
            title: 'Responsive card grid with auto-fit layout',
            category: 'feature',
            description: 'Cards automatically arrange based on screen width.',
          },
          {
            id: 'item-0.2.2-2',
            title: 'Function card with icon, title, and description',
            category: 'feature',
          },
          {
            id: 'item-0.2.2-3',
            title: 'Card context menu (pin, hide, open modes)',
            category: 'feature',
          },
          {
            id: 'item-0.2.2-4',
            title: 'Drag-and-drop card reordering',
            category: 'feature',
            description: 'Rearrange cards by dragging them to new positions.',
          },
        ],
      },
      {
        version: '0.2.0',
        date: '2025-10-10',
        title: 'Sidebar & Navigation',
        items: [
          {
            id: 'item-0.2.0-1',
            title: 'Collapsible sidebar with toggle',
            category: 'feature',
            description: 'Collapse to 64px or expand to 240px with the toggle button.',
          },
          {
            id: 'item-0.2.0-2',
            title: 'Resize sidebar by dragging edge',
            category: 'feature',
          },
          {
            id: 'item-0.2.0-3',
            title: 'Hub navigation with icons',
            category: 'feature',
            description: 'Navigate between Home, PM, Office, Sales, and Admin hubs.',
          },
          {
            id: 'item-0.2.0-4',
            title: 'Sidebar width persists across sessions',
            category: 'improvement',
          },
        ],
      },
    ],
  },
  {
    id: 'release-0.1',
    version: '0.1',
    title: 'v0.1 — September 2025',
    summary: 'Initial shell foundation with layout, theming, and status bar.',
    patches: [
      {
        version: '0.1.5',
        date: '2025-09-25',
        title: 'Status Bar & Health',
        items: [
          {
            id: 'item-0.1.5-1',
            title: 'Status bar with API health indicators',
            category: 'feature',
            description: 'See real-time health status for Vault and PropertyMe APIs.',
          },
          {
            id: 'item-0.1.5-2',
            title: 'Current user display from SharePoint',
            category: 'feature',
          },
          {
            id: 'item-0.1.5-3',
            title: 'System notifications in status bar',
            category: 'feature',
          },
          {
            id: 'item-0.1.5-4',
            title: 'Dismiss notifications for current session',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.1.2',
        date: '2025-09-15',
        title: 'Theme Support',
        items: [
          {
            id: 'item-0.1.2-1',
            title: 'Light and dark theme options',
            category: 'feature',
            description: 'Choose Light, Dark, or System theme in Settings.',
          },
          {
            id: 'item-0.1.2-2',
            title: 'Theme applied before React render (no flash)',
            category: 'improvement',
          },
          {
            id: 'item-0.1.2-3',
            title: 'System theme follows OS preference',
            category: 'feature',
          },
          {
            id: 'item-0.1.2-4',
            title: 'Theme toggle in profile menu',
            category: 'improvement',
          },
        ],
      },
      {
        version: '0.1.0',
        date: '2025-09-01',
        title: 'Initial Release',
        items: [
          {
            id: 'item-0.1.0-1',
            title: 'Shell layout with CSS Grid',
            category: 'feature',
            description: 'Responsive layout with navbar, sidebar, content area, and status bar.',
          },
          {
            id: 'item-0.1.0-2',
            title: 'Fixed 48px navbar at top',
            category: 'feature',
          },
          {
            id: 'item-0.1.0-3',
            title: 'Resizable 240px sidebar',
            category: 'feature',
          },
          {
            id: 'item-0.1.0-4',
            title: 'Fluid content area',
            category: 'feature',
          },
          {
            id: 'item-0.1.0-5',
            title: 'Fixed 24px status bar at bottom',
            category: 'feature',
          },
          {
            id: 'item-0.1.0-6',
            title: 'Responsive breakpoints for all screen sizes',
            category: 'improvement',
          },
        ],
      },
    ],
  },
];

// =============================================================================
// LEGACY FLAT STRUCTURE (for backwards compatibility)
// =============================================================================

/**
 * Flatten minor releases into the legacy IReleaseNote[] format
 * Using reduce instead of flatMap for ES5 compatibility
 */
export const releaseNotes: IReleaseNote[] = minorReleases.reduce<IReleaseNote[]>(
  (acc, minor) => {
    const patchNotes = minor.patches.map((patch: IPatchRelease): IReleaseNote => ({
      id: `release-${patch.version}`,
      version: patch.version,
      date: patch.date,
      title: patch.title,
      summary: `Part of ${minor.title}`,
      items: patch.items,
    }));
    return acc.concat(patchNotes);
  },
  []
);

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the latest patch release
 */
export function getLatestRelease(): IReleaseNote | undefined {
  return releaseNotes[0];
}

/**
 * Get the latest minor release
 */
export function getLatestMinorRelease(): IMinorRelease | undefined {
  return minorReleases[0];
}

/**
 * Get releases newer than a given date
 */
export function getReleasesAfter(dateString: string): IReleaseNote[] {
  const targetDate = new Date(dateString);
  return releaseNotes.filter((release) => new Date(release.date) > targetDate);
}

/**
 * Check if there are unread releases (newer than lastViewedDate)
 */
export function hasUnreadReleases(lastViewedDate: string | undefined): boolean {
  if (!lastViewedDate) return true;
  const latest = getLatestRelease();
  if (!latest) return false;
  return new Date(latest.date) > new Date(lastViewedDate);
}

/**
 * Count unread releases
 */
export function countUnreadReleases(lastViewedDate: string | undefined): number {
  if (!lastViewedDate) return releaseNotes.length;
  return getReleasesAfter(lastViewedDate).length;
}

/**
 * Get total count of items (features, improvements, etc.) for a minor release
 */
export function getMinorReleaseItemCounts(minor: IMinorRelease): Record<ReleaseCategory, number> {
  const counts: Record<ReleaseCategory, number> = {
    feature: 0,
    improvement: 0,
    bugfix: 0,
    security: 0,
  };

  minor.patches.forEach((patch) => {
    patch.items.forEach((item) => {
      counts[item.category]++;
    });
  });

  return counts;
}

export default releaseNotes;
