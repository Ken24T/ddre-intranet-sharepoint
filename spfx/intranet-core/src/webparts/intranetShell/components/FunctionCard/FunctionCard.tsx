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
  isPinned = false,
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'pin',
      text: isPinned ? 'Unpin from top' : 'Pin to top',
      iconProps: { iconName: isPinned ? 'Unpin' : 'Pin' },
      onClick: () => onContextMenu?.(isPinned ? 'unpin' : 'pin'),
    },
    {
      key: 'hide',
      text: 'Hide card',
      iconProps: { iconName: 'Hide3' },
      onClick: () => onContextMenu?.('hide'),
    },
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
      style={style}
      className={`${styles.card} ${isPinned ? styles.cardPinned : ''}`}
      {...attributes}
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
        {...listeners}
      >
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>

      <div className={styles.dragHandle} {...listeners}>
        <Icon iconName="GripperDotsVertical" />
      </div>

      {isMenuVisible && menuTarget && (
        <ContextualMenu
          items={menuItems}
          target={menuTarget}
          onDismiss={handleMenuDismiss}
        />
      )}
    </div>
  );
};
