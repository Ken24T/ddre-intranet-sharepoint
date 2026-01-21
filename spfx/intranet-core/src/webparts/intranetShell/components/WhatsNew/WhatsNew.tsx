/**
 * WhatsNew - Release notes panel for the Help Centre
 * Phase 11b: What's New Panel
 */

import * as React from 'react';
import { Icon, useTheme } from '@fluentui/react';
import { useAudit } from '../AuditContext';
import {
  releaseNotes,
  categoryLabels,
  categoryColors,
  type IReleaseNote,
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
// RELEASE CARD COMPONENT
// =============================================================================

interface IReleaseCardProps {
  release: IReleaseNote;
  isNew?: boolean;
  defaultExpanded?: boolean;
  onExpand?: () => void;
}

const ReleaseCard: React.FC<IReleaseCardProps> = ({
  release,
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
    const date = new Date(release.date);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [release.date]);

  return (
    <div className={`${styles.releaseCard} ${isExpanded ? styles.expanded : ''}`}>
      <button
        type="button"
        className={styles.releaseHeader}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className={styles.releaseHeaderLeft}>
          <span className={styles.releaseVersion}>v{release.version}</span>
          {isNew && <span className={styles.newBadge}>New</span>}
        </div>
        <div className={styles.releaseHeaderCenter}>
          <h3 className={styles.releaseTitle}>{release.title}</h3>
          <span className={styles.releaseDate}>{formattedDate}</span>
        </div>
        <Icon
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          className={styles.expandIcon}
        />
      </button>

      {isExpanded && (
        <div className={styles.releaseContent}>
          <p className={styles.releaseSummary}>{release.summary}</p>
          <ul className={styles.releaseItems}>
            {release.items.map((item) => (
              <li key={item.id} className={styles.releaseItem}>
                <CategoryBadge category={item.category} />
                <div className={styles.releaseItemContent}>
                  <span className={styles.releaseItemTitle}>{item.title}</span>
                  {item.description && (
                    <span className={styles.releaseItemDescription}>
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
// MAIN COMPONENT
// =============================================================================

export const WhatsNew: React.FC<IWhatsNewProps> = ({
  onReleaseViewed,
  lastViewedDate,
}) => {
  const theme = useTheme();
  const audit = useAudit();

  const isReleaseNew = React.useCallback(
    (releaseDate: string): boolean => {
      if (!lastViewedDate) return true;
      return new Date(releaseDate) > new Date(lastViewedDate);
    },
    [lastViewedDate]
  );

  const handleReleaseExpand = React.useCallback(
    (release: IReleaseNote): void => {
      audit.logContentView('detail_viewed', {
        metadata: {
          type: 'release_note',
          releaseId: release.id,
          releaseVersion: release.version,
          releaseTitle: release.title,
        },
      });
      onReleaseViewed?.(release.id, release.date);
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
        {releaseNotes.map((release, index) => (
          <ReleaseCard
            key={release.id}
            release={release}
            isNew={isReleaseNew(release.date)}
            defaultExpanded={index === 0}
            onExpand={() => handleReleaseExpand(release)}
          />
        ))}
      </div>
    </div>
  );
};

export default WhatsNew;
