import * as React from 'react';
import { Icon, IconButton, ContextualMenu, IContextualMenuItem } from '@fluentui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IFunctionCardProps } from './IFunctionCardProps';
import styles from './FunctionCard.module.scss';

/**
 * FunctionCard - A draggable card representing a function/feature.
 * Displays icon, title, description with context menu for pin/hide/open.
 */
export const FunctionCard: React.FC<IFunctionCardProps> = ({
  id,
  title,
  description,
  icon,
  themeColor = '#0078d4',
  openBehavior = 'inline',
  isPinned = false,
  isFavourite = false,
  isAdmin = false,
  onClick,
  onContextMenu,
}) => {
  const [menuTarget, setMenuTarget] = React.useState<HTMLElement | null>(null);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Convert hex to RGB for rgba shadows
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 120, 212';
  };

  const themeRgb = hexToRgb(themeColor);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    '--card-theme-color': themeColor,
    '--card-theme-rgb': themeRgb,
  } as React.CSSProperties;

  const openBehaviorMenuItems: IContextualMenuItem[] = [
    {
      key: 'openInline',
      text: 'Open in hub area',
      canCheck: true,
      checked: openBehavior === 'inline',
      onClick: () => onContextMenu?.('setOpenInline'),
    },
    {
      key: 'openNewTab',
      text: 'Open in new tab',
      canCheck: true,
      checked: openBehavior === 'newTab',
      onClick: () => onContextMenu?.('setOpenNewTab'),
    },
    {
      key: 'openNewWindow',
      text: 'Open in new window',
      canCheck: true,
      checked: openBehavior === 'newWindow',
      onClick: () => onContextMenu?.('setOpenNewWindow'),
    },
  ];

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'pin',
      text: isPinned ? 'Unpin from top' : 'Pin to top',
      iconProps: { iconName: isPinned ? 'Unpin' : 'Pin' },
      onClick: () => onContextMenu?.(isPinned ? 'unpin' : 'pin'),
    },
    {
      key: 'favourite',
      text: isFavourite ? 'Remove from favourites' : 'Add to favourites',
      iconProps: { iconName: isFavourite ? 'HeartFill' : 'Heart' },
      onClick: () => onContextMenu?.(isFavourite ? 'removeFavourite' : 'addFavourite'),
    },
    {
      key: 'help',
      text: 'What does this do?',
      iconProps: { iconName: 'Lightbulb' },
      onClick: () => onContextMenu?.('help'),
    },
    // Hide card option only visible to admins
    ...(isAdmin ? [{
      key: 'hide',
      text: 'Hide card',
      iconProps: { iconName: 'Hide3' },
      onClick: () => onContextMenu?.('hide'),
    }] : []),
    ...(isAdmin ? [{
      key: 'openBehavior',
      text: 'Open behavior',
      iconProps: { iconName: 'Page' },
      subMenuProps: {
        items: openBehaviorMenuItems,
      },
    }] : []),
    {
      key: 'divider',
      itemType: 1, // ContextualMenuItemType.Divider
    },
    {
      key: 'openNewTab',
      text: 'Open in new tab',
      iconProps: { iconName: 'OpenInNewTab' },
      onClick: () => onContextMenu?.('openNewTab'),
    },
  ];

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>): void => {
    setMenuTarget(event.currentTarget);
    setIsMenuVisible(true);
  };

  const handleMenuDismiss = (): void => {
    setIsMenuVisible(false);
    setMenuTarget(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, cursor: isDragging ? 'grabbing' : 'grab' }}
      className={`${styles.card} ${isPinned ? styles.cardPinned : ''} ${isDragging ? styles.cardDragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <Icon iconName={icon} />
        </div>
        <div className={styles.cardActions}>
          {isPinned && (
            <Icon iconName="Pin" className={styles.pinnedIndicator} title="Pinned" />
          )}
          <IconButton
            iconProps={{ iconName: 'More' }}
            title="More options"
            ariaLabel="More options"
            className={styles.moreButton}
            onClick={handleMoreClick}
          />
        </div>
      </div>

      <div
        className={styles.cardContent}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        role="button"
        tabIndex={0}
      >
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>

      {isMenuVisible && menuTarget && (
        <ContextualMenu
          items={menuItems}
          target={menuTarget}
          onDismiss={handleMenuDismiss}
          onMenuDismissed={handleMenuDismiss}
          calloutProps={{
            onMouseLeave: handleMenuDismiss,
          }}
        />
      )}
    </div>
  );
};
