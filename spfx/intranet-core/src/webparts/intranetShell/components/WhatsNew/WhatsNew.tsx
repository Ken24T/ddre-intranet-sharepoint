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
}

const SummaryBadges: React.FC<ISummaryBadgesProps> = ({ minor }) => {
  const counts = getMinorReleaseItemCounts(minor);

  return (
    <div className={styles.summaryBadges}>
      {counts.feature > 0 && (
        <span className={styles.summaryBadge} style={{ backgroundColor: categoryColors.feature.bg, color: categoryColors.feature.text }}>
          {counts.feature} {counts.feature === 1 ? 'Feature' : 'Features'}
        </span>
      )}
      {counts.improvement > 0 && (
        <span className={styles.summaryBadge} style={{ backgroundColor: categoryColors.improvement.bg, color: categoryColors.improvement.text }}>
          {counts.improvement} {counts.improvement === 1 ? 'Improvement' : 'Improvements'}
        </span>
      )}
      {counts.bugfix > 0 && (
        <span className={styles.summaryBadge} style={{ backgroundColor: categoryColors.bugfix.bg, color: categoryColors.bugfix.text }}>
          {counts.bugfix} {counts.bugfix === 1 ? 'Bug Fix' : 'Bug Fixes'}
        </span>
      )}
      {counts.security > 0 && (
        <span className={styles.summaryBadge} style={{ backgroundColor: categoryColors.security.bg, color: categoryColors.security.text }}>
          {counts.security} Security
        </span>
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
}

const PatchReleaseCard: React.FC<IPatchReleaseCardProps> = ({
  patch,
  isNew = false,
  defaultExpanded = false,
  onExpand,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleToggle = (): void => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded && onExpand) {
      onExpand();
    }
  };

  const formattedDate = React.useMemo(() => {
    const date = new Date(patch.date);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [patch.date]);

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
            {patch.items.map((item) => (
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

  const handleToggle = (): void => {
    setIsExpanded(!isExpanded);
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
    <div className={`${styles.minorCard} ${isExpanded ? styles.expanded : ''}`}>
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
        <SummaryBadges minor={minor} />
      </button>

      {isExpanded && (
        <div className={styles.minorContent}>
          <div className={styles.patchList}>
            {minor.patches.map((patch, index) => (
              <PatchReleaseCard
                key={patch.version}
                patch={patch}
                isNew={isPatchNew(patch.date)}
                defaultExpanded={index === 0}
                onExpand={() => onPatchExpand?.(patch)}
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
