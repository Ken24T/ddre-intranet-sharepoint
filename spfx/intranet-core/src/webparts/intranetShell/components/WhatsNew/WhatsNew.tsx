/**
 * WhatsNew - Release notes panel for the Help Centre
 * Phase 11b: What's New Panel
 *
 * Displays minor releases (e.g., v0.5) with nested patch releases (e.g., 0.5.24)
 */

import * as React from 'react';
import { Icon, useTheme } from '@fluentui/react';
import { useAudit } from '../AuditContext';
import {
  minorReleases,
  categoryLabels,
  categoryColors,
  getMinorReleaseItemCounts,
  type IMinorRelease,
  type IPatchRelease,
  type ReleaseCategory,
} from '../data/releaseNotes';
import styles from './WhatsNew.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export interface IWhatsNewProps {
  /** Called when user views a release (for tracking last viewed) */
  onReleaseViewed?: (releaseId: string, releaseDate: string) => void;
  /** The date of the last viewed release (for "New" badge logic) */
  lastViewedDate?: string | undefined;
}

// =============================================================================
// CATEGORY BADGE COMPONENT
// =============================================================================

interface ICategoryBadgeProps {
  category: ReleaseCategory;
}

const CategoryBadge: React.FC<ICategoryBadgeProps> = ({ category }) => {
  const colors = categoryColors[category];
  const label = categoryLabels[category];

  return (
    <span
      className={styles.categoryBadge}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
};

// =============================================================================
// SUMMARY BADGES COMPONENT
// =============================================================================

interface ISummaryBadgesProps {
  minor: IMinorRelease;
  activeFilter: ReleaseCategory | undefined;
  onFilterChange: (category: ReleaseCategory | undefined) => void;
}

const SummaryBadges: React.FC<ISummaryBadgesProps> = ({ minor, activeFilter, onFilterChange }) => {
  const counts = getMinorReleaseItemCounts(minor);

  const handleBadgeClick = (category: ReleaseCategory, e: React.MouseEvent): void => {
    e.stopPropagation(); // Don't toggle the minor release expand/collapse
    // Toggle filter: if already active, clear it; otherwise set it
    onFilterChange(activeFilter === category ? undefined : category);
  };

  const getBadgeClass = (category: ReleaseCategory): string => {
    if (activeFilter === undefined) return styles.summaryBadge;
    if (activeFilter === category) return `${styles.summaryBadge} ${styles.summaryBadgeActive}`;
    return `${styles.summaryBadge} ${styles.summaryBadgeDimmed}`;
  };

  return (
    <div className={styles.summaryBadges}>
      {counts.feature > 0 && (
        <button
          type="button"
          className={getBadgeClass('feature')}
          style={{ backgroundColor: categoryColors.feature.bg, color: categoryColors.feature.text }}
          onClick={(e) => handleBadgeClick('feature', e)}
          title={activeFilter === 'feature' ? 'Click to show all' : 'Click to filter by Features'}
        >
          {counts.feature} {counts.feature === 1 ? 'Feature' : 'Features'}
        </button>
      )}
      {counts.improvement > 0 && (
        <button
          type="button"
          className={getBadgeClass('improvement')}
          style={{ backgroundColor: categoryColors.improvement.bg, color: categoryColors.improvement.text }}
          onClick={(e) => handleBadgeClick('improvement', e)}
          title={activeFilter === 'improvement' ? 'Click to show all' : 'Click to filter by Improvements'}
        >
          {counts.improvement} {counts.improvement === 1 ? 'Improvement' : 'Improvements'}
        </button>
      )}
      {counts.bugfix > 0 && (
        <button
          type="button"
          className={getBadgeClass('bugfix')}
          style={{ backgroundColor: categoryColors.bugfix.bg, color: categoryColors.bugfix.text }}
          onClick={(e) => handleBadgeClick('bugfix', e)}
          title={activeFilter === 'bugfix' ? 'Click to show all' : 'Click to filter by Bug Fixes'}
        >
          {counts.bugfix} {counts.bugfix === 1 ? 'Bug Fix' : 'Bug Fixes'}
        </button>
      )}
      {counts.security > 0 && (
        <button
          type="button"
          className={getBadgeClass('security')}
          style={{ backgroundColor: categoryColors.security.bg, color: categoryColors.security.text }}
          onClick={(e) => handleBadgeClick('security', e)}
          title={activeFilter === 'security' ? 'Click to show all' : 'Click to filter by Security'}
        >
          {counts.security} Security
        </button>
      )}
      {activeFilter && (
        <button
          type="button"
          className={styles.clearFilterButton}
          onClick={(e) => { e.stopPropagation(); onFilterChange(undefined); }}
          title="Clear filter"
        >
          <Icon iconName="Cancel" className={styles.clearFilterIcon} />
          Clear
        </button>
      )}
    </div>
  );
};

// =============================================================================
// PATCH RELEASE COMPONENT
// =============================================================================

interface IPatchReleaseCardProps {
  patch: IPatchRelease;
  isNew?: boolean;
  defaultExpanded?: boolean;
  onExpand?: () => void;
  categoryFilter?: ReleaseCategory | undefined;
}

const PatchReleaseCard: React.FC<IPatchReleaseCardProps> = ({
  patch,
  isNew = false,
  defaultExpanded = false,
  onExpand,
  categoryFilter = undefined,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Filter items based on category filter
  const filteredItems = React.useMemo(() => {
    if (!categoryFilter) return patch.items;
    return patch.items.filter((item) => item.category === categoryFilter);
  }, [patch.items, categoryFilter]);

  // Don't render if no items match the filter
  if (filteredItems.length === 0) {
    return null;
  }

  const handleToggle = (): void => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded && onExpand) {
      onExpand();
    }
  };

  const formattedDate = new Date(patch.date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Show filtered count indicator
  const itemCountLabel = categoryFilter
    ? `${filteredItems.length} of ${patch.items.length} items`
    : `${patch.items.length} items`;

  return (
    <div className={`${styles.patchCard} ${isExpanded ? styles.expanded : ''}`}>
      <button
        type="button"
        className={styles.patchHeader}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className={styles.patchHeaderLeft}>
          <span className={styles.patchVersion}>v{patch.version}</span>
          {isNew && <span className={styles.newBadge}>New</span>}
          {categoryFilter && (
            <span className={styles.filteredCount}>{itemCountLabel}</span>
          )}
        </div>
        <div className={styles.patchHeaderCenter}>
          <span className={styles.patchTitle}>{patch.title}</span>
          <span className={styles.patchDate}>{formattedDate}</span>
        </div>
        <Icon
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          className={styles.expandIcon}
        />
      </button>

      {isExpanded && (
        <div className={styles.patchContent}>
          <ul className={styles.patchItems}>
            {filteredItems.map((item) => (
              <li key={item.id} className={styles.patchItem}>
                <CategoryBadge category={item.category} />
                <div className={styles.patchItemContent}>
                  <span className={styles.patchItemTitle}>{item.title}</span>
                  {item.description && (
                    <span className={styles.patchItemDescription}>
                      {item.description}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MINOR RELEASE COMPONENT
// =============================================================================

interface IMinorReleaseCardProps {
  minor: IMinorRelease;
  hasNewPatches: boolean;
  isPatchNew: (date: string) => boolean;
  defaultExpanded?: boolean;
  onPatchExpand?: (patch: IPatchRelease) => void;
}

const MinorReleaseCard: React.FC<IMinorReleaseCardProps> = ({
  minor,
  hasNewPatches,
  isPatchNew,
  defaultExpanded = false,
  onPatchExpand,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [categoryFilter, setCategoryFilter] = React.useState<ReleaseCategory | undefined>(undefined);

  const handleToggle = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (category: ReleaseCategory | undefined): void => {
    setCategoryFilter(category);
    // Auto-expand when filtering
    if (category !== undefined && !isExpanded) {
      setIsExpanded(true);
    }
  };

  // Date range for this minor release
  const dateRange = React.useMemo(() => {
    if (minor.patches.length === 0) return '';
    const dates = minor.patches.map((p) => new Date(p.date));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

    const formatDate = (d: Date): string =>
      d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

    if (earliest.getTime() === latest.getTime()) {
      return formatDate(earliest);
    }
    return `${formatDate(earliest)} — ${formatDate(latest)}`;
  }, [minor.patches]);

  return (
    <div className={`${styles.minorCard} ${isExpanded ? styles.expanded : ''} ${categoryFilter ? styles.filtered : ''}`}>
      <button
        type="button"
        className={styles.minorHeader}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className={styles.minorHeaderTop}>
          <div className={styles.minorHeaderLeft}>
            <span className={styles.minorVersion}>{minor.title}</span>
            {hasNewPatches && <span className={styles.newBadge}>New</span>}
          </div>
          <Icon
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            className={styles.expandIcon}
          />
        </div>
        <p className={styles.minorSummary}>{minor.summary}</p>
        <div className={styles.minorMeta}>
          <span className={styles.minorDateRange}>{dateRange}</span>
          <span className={styles.minorPatchCount}>
            {minor.patches.length} {minor.patches.length === 1 ? 'update' : 'updates'}
          </span>
        </div>
        <SummaryBadges minor={minor} activeFilter={categoryFilter} onFilterChange={handleFilterChange} />
      </button>

      {isExpanded && (
        <div className={styles.minorContent}>
          {categoryFilter && (
            <div className={styles.filterNotice}>
              <Icon iconName="Filter" className={styles.filterNoticeIcon} />
              <span>Showing {categoryLabels[categoryFilter].toLowerCase()}s only</span>
            </div>
          )}
          <div className={styles.patchList}>
            {minor.patches.map((patch, index) => (
              <PatchReleaseCard
                key={patch.version}
                patch={patch}
                isNew={isPatchNew(patch.date)}
                defaultExpanded={index === 0 || categoryFilter !== undefined}
                onExpand={() => onPatchExpand?.(patch)}
                categoryFilter={categoryFilter}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const WhatsNew: React.FC<IWhatsNewProps> = ({
  onReleaseViewed,
  lastViewedDate,
}) => {
  const theme = useTheme();
  const audit = useAudit();

  const isPatchNew = React.useCallback(
    (releaseDate: string): boolean => {
      if (!lastViewedDate) return true;
      return new Date(releaseDate) > new Date(lastViewedDate);
    },
    [lastViewedDate]
  );

  const hasNewPatchesInMinor = React.useCallback(
    (minor: IMinorRelease): boolean => {
      return minor.patches.some((patch) => isPatchNew(patch.date));
    },
    [isPatchNew]
  );

  const handlePatchExpand = React.useCallback(
    (patch: IPatchRelease): void => {
      audit.logContentView('detail_viewed', {
        metadata: {
          type: 'release_note',
          releaseVersion: patch.version,
          releaseTitle: patch.title,
        },
      });
      onReleaseViewed?.(`release-${patch.version}`, patch.date);
    },
    [audit, onReleaseViewed]
  );

  const whatsNewClassName = `${styles.whatsNew} ${theme.isInverted ? styles.dark : ''}`;

  return (
    <div className={whatsNewClassName}>
      <div className={styles.header}>
        <Icon iconName="Megaphone" className={styles.headerIcon} />
        <div className={styles.headerText}>
          <h2 className={styles.headerTitle}>What&apos;s New</h2>
          <p className={styles.headerSubtitle}>
            Latest updates and improvements to the DDRE Intranet
          </p>
        </div>
      </div>

      <div className={styles.releaseList}>
        {minorReleases.map((minor, index) => (
          <MinorReleaseCard
            key={minor.id}
            minor={minor}
            hasNewPatches={hasNewPatchesInMinor(minor)}
            isPatchNew={isPatchNew}
            defaultExpanded={index === 0}
            onPatchExpand={handlePatchExpand}
          />
        ))}
      </div>
    </div>
  );
};

export default WhatsNew;
