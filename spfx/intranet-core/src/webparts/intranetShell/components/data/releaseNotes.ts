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
        version: '0.5.24',
        date: '2026-01-22',
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
