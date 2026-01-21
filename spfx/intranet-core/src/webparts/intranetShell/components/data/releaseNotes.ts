/**
 * Release Notes Data Model and Mock Data
 * Phase 11b: What's New Panel
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

/** A release containing multiple items */
export interface IReleaseNote {
  /** Unique identifier for the release */
  id: string;
  /** Semantic version (e.g., "0.5.0") */
  version: string;
  /** Release date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Title for the release (e.g., "January 2026 Update") */
  title: string;
  /** Brief summary of the release */
  summary: string;
  /** List of changes in this release */
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
// MOCK DATA
// =============================================================================

export const releaseNotes: IReleaseNote[] = [
  {
    id: 'release-0.5.24',
    version: '0.5.24',
    date: '2026-01-22',
    title: 'Contextual Help Tooltips',
    summary: 'Added helpful info icons throughout the interface to explain complex features.',
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
    id: 'release-0.5.20',
    version: '0.5.20',
    date: '2026-01-20',
    title: 'Help Centre Enhancements',
    summary: 'Major improvements to the Help Centre including hub-based filtering, feedback controls, and content metadata.',
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
    id: 'release-0.5.15',
    version: '0.5.15',
    date: '2026-01-15',
    title: 'Admin Audit Logging',
    summary: 'New audit log viewer for administrators to monitor intranet activity.',
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
    id: 'release-0.5.10',
    version: '0.5.10',
    date: '2026-01-10',
    title: 'Tasks System',
    summary: 'Personal task management with notifications, checklists, and hub linking.',
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
    id: 'release-0.5.5',
    version: '0.5.5',
    date: '2026-01-05',
    title: 'AI Assistant',
    summary: 'Introduced the AI Assistant for quick help and answers.',
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
    id: 'release-0.5.0',
    version: '0.5.0',
    date: '2025-12-20',
    title: 'December 2025 Release',
    summary: 'Major release with theme support, status bar, and improved error handling.',
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
  {
    id: 'release-0.4.0',
    version: '0.4.0',
    date: '2025-12-01',
    title: 'User Preferences',
    summary: 'Personalisation features including card reordering, pinning, and hiding.',
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
];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the latest release
 */
export function getLatestRelease(): IReleaseNote | undefined {
  return releaseNotes[0];
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

export default releaseNotes;
