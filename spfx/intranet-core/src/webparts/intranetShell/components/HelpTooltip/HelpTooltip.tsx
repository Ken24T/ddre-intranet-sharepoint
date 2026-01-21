import * as React from 'react';
import { IconButton, TooltipHost, DirectionalHint, ITooltipHostStyles } from '@fluentui/react';
import { useAudit } from '../AuditContext';
import styles from './HelpTooltip.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export interface IHelpTooltipContent {
  /** Unique identifier for the tooltip (used for analytics) */
  id: string;
  /** Short title displayed at top of tooltip */
  title: string;
  /** Main explanatory content */
  content: string;
  /** Optional link to full help article */
  learnMoreUrl?: string;
}

export interface IHelpTooltipProps {
  /** Tooltip content configuration */
  tooltip: IHelpTooltipContent;
  /** Size of the help icon (default: 14) */
  iconSize?: number;
  /** Direction hint for tooltip placement */
  directionalHint?: DirectionalHint;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * HelpTooltip - A small "?" icon that displays contextual help on hover.
 * 
 * Usage:
 * ```tsx
 * <HelpTooltip tooltip={helpTooltips.settingsTheme} />
 * ```
 */
export const HelpTooltip: React.FC<IHelpTooltipProps> = ({
  tooltip,
  iconSize = 10,
  directionalHint = DirectionalHint.topCenter,
  className,
}) => {
  const audit = useAudit();
  const [hasLoggedView, setHasLoggedView] = React.useState(false);

  const handleTooltipVisible = React.useCallback(() => {
    if (!hasLoggedView) {
      audit.logUserInteraction('help_tooltip_viewed', {
        metadata: {
          tooltipId: tooltip.id,
          tooltipTitle: tooltip.title,
        },
      });
      setHasLoggedView(true);
    }
  }, [audit, hasLoggedView, tooltip.id, tooltip.title]);

  const handleLearnMoreClick = React.useCallback(() => {
    audit.logUserInteraction('help_tooltip_learn_more', {
      metadata: {
        tooltipId: tooltip.id,
        tooltipTitle: tooltip.title,
        url: tooltip.learnMoreUrl,
      },
    });
  }, [audit, tooltip.id, tooltip.title, tooltip.learnMoreUrl]);

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipTitle}>{tooltip.title}</div>
      <div className={styles.tooltipBody}>{tooltip.content}</div>
      {tooltip.learnMoreUrl && (
        <a
          href={tooltip.learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.learnMoreLink}
          onClick={handleLearnMoreClick}
        >
          Learn more →
        </a>
      )}
    </div>
  );

  const tooltipHostStyles: Partial<ITooltipHostStyles> = {
    root: { display: 'inline-flex', alignItems: 'center' },
  };

  return (
    <TooltipHost
      content={tooltipContent}
      directionalHint={directionalHint}
      calloutProps={{
        gapSpace: 4,
        beakWidth: 8,
        className: styles.tooltipCallout,
      }}
      onTooltipToggle={(isVisible) => {
        if (isVisible) {
          handleTooltipVisible();
        }
      }}
      styles={tooltipHostStyles}
    >
      <IconButton
        iconProps={{ iconName: 'Info', styles: { root: { fontSize: iconSize } } }}
        className={`${styles.helpIcon} ${className ?? ''}`}
        ariaLabel={`Help: ${tooltip.title}`}
        title=""
      />
    </TooltipHost>
  );
};

export default HelpTooltip;
