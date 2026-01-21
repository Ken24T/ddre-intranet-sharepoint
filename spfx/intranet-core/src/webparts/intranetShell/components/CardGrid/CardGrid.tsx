import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { FunctionCard } from '../FunctionCard';
import type { CardOpenBehavior, IFunctionCard } from '../FunctionCard';
import { getHubColor } from '../theme/colors';
import { useAudit } from '../AuditContext';
import { HelpTooltip } from '../HelpTooltip';
import { cardGridTooltips } from '../data/helpTooltips';
import styles from './CardGrid.module.scss';

export interface ICardGridProps {
  /** Cards to display */
  cards: IFunctionCard[];
  /** Current hub key for theming */
  hubKey: string;
  /** IDs of pinned cards */
  pinnedCardIds: string[];
  /** IDs of hidden cards */
  hiddenCardIds: string[];
  /** IDs of favourite cards */
  favouriteCardIds?: string[];
  /** Card open behavior overrides */
  cardOpenBehaviors?: Record<string, CardOpenBehavior>;
  /** Saved card order for this hub */
  savedOrder?: string[];
  /** Whether user is admin (can hide cards) */
  isAdmin?: boolean;
  /** Called when card order changes */
  onOrderChange?: (cardIds: string[]) => void;
  /** Called when card is pinned/unpinned */
  onPinChange?: (cardId: string, isPinned: boolean) => void;
  /** Called when card is hidden */
  onHideCard?: (cardId: string) => void;
  /** Called when card is added/removed from favourites */
  onFavouriteChange?: (cardId: string, isFavourite: boolean) => void;
  /** Called when card open behavior changes */
  onCardOpenBehaviorChange?: (
    cardId: string,
    behavior: CardOpenBehavior
  ) => void;
  /** Called when card is clicked */
  onCardClick?: (card: IFunctionCard) => void;
  /** Called when card help is requested */
  onCardHelp?: (card: IFunctionCard) => void;
}

/**
 * CardGrid - Responsive grid of draggable function cards.
 * Supports drag-and-drop reordering with pinned cards at top.
 */
export const CardGrid: React.FC<ICardGridProps> = ({
  cards,
  hubKey,
  pinnedCardIds,
  hiddenCardIds,
  favouriteCardIds = [],
  cardOpenBehaviors = {},
  savedOrder,
  isAdmin = false,
  onOrderChange,
  onPinChange,
  onHideCard,
  onFavouriteChange,
  onCardOpenBehaviorChange,
  onCardClick,
  onCardHelp,
}) => {
  const audit = useAudit();
  
  // Get hub theme color
  const hubColor = getHubColor(hubKey);

  // Filter out hidden cards
  const visibleCards = cards.filter((card) => hiddenCardIds.indexOf(card.id) === -1);

  // Get pinned and unpinned card IDs
  const pinnedIds = visibleCards
    .filter((c) => pinnedCardIds.indexOf(c.id) !== -1)
    .map((c) => c.id);
  const unpinnedIds = visibleCards
    .filter((c) => pinnedCardIds.indexOf(c.id) === -1)
    .map((c) => c.id);

  // Compute initial order: use savedOrder if available, otherwise default
  const getInitialOrder = (): string[] => {
    if (savedOrder && savedOrder.length > 0) {
      // Filter saved order to only include visible cards, add any new cards at end
      const validSaved = savedOrder.filter((id) => visibleCards.some((c) => c.id === id));
      const newCards = visibleCards
        .filter((c) => savedOrder.indexOf(c.id) === -1)
        .map((c) => c.id);
      return [...validSaved, ...newCards];
    }
    return [...pinnedIds, ...unpinnedIds];
  };

  const [items, setItems] = React.useState<string[]>(getInitialOrder);

  // Reset items when hub changes (hubKey) or visible cards change
  React.useEffect(() => {
    setItems(getInitialOrder());
  }, [hubKey, visibleCards.map((c) => c.id).sort().join(',')]);

  // Re-sort when pinned cards change (but preserve relative order)
  React.useEffect(() => {
    setItems((currentItems) => {
      const pinned = currentItems.filter((id) => pinnedCardIds.indexOf(id) !== -1);
      const unpinned = currentItems.filter((id) => pinnedCardIds.indexOf(id) === -1);
      return [...pinned, ...unpinned];
    });
  }, [pinnedCardIds.join(',')]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px drag before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over.id as string);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);
        onOrderChange?.(newItems);
        return newItems;
      });
    }
  };

  const handleContextMenu = (
    cardId: string,
    action:
      | 'pin'
      | 'unpin'
      | 'hide'
      | 'openNewTab'
      | 'addFavourite'
      | 'removeFavourite'
      | 'help'
      | 'setOpenInline'
      | 'setOpenNewTab'
      | 'setOpenNewWindow'
  ): void => {
    const card = cards.find((c) => c.id === cardId);
    const cardTitle = card?.title ?? cardId;

    switch (action) {
      case 'pin':
        audit.logCardAction('card_expanded', {
          hub: hubKey,
          metadata: { cardId, cardTitle, action: 'pinned' },
        });
        onPinChange?.(cardId, true);
        break;
      case 'unpin':
        audit.logCardAction('card_collapsed', {
          hub: hubKey,
          metadata: { cardId, cardTitle, action: 'unpinned' },
        });
        onPinChange?.(cardId, false);
        break;
      case 'hide':
        audit.logCardAction('card_closed', {
          hub: hubKey,
          metadata: { cardId, cardTitle, action: 'hidden' },
        });
        onHideCard?.(cardId);
        break;
      case 'setOpenInline':
        audit.logCardAction('card_settings_opened', {
          hub: hubKey,
          metadata: { cardId, cardTitle, setting: 'openBehavior', value: 'inline' },
        });
        onCardOpenBehaviorChange?.(cardId, 'inline');
        break;
      case 'setOpenNewTab':
        audit.logCardAction('card_settings_opened', {
          hub: hubKey,
          metadata: { cardId, cardTitle, setting: 'openBehavior', value: 'newTab' },
        });
        onCardOpenBehaviorChange?.(cardId, 'newTab');
        break;
      case 'setOpenNewWindow':
        audit.logCardAction('card_settings_opened', {
          hub: hubKey,
          metadata: { cardId, cardTitle, setting: 'openBehavior', value: 'newWindow' },
        });
        onCardOpenBehaviorChange?.(cardId, 'newWindow');
        break;
      case 'openNewTab': {
        if (card?.url) {
          audit.logCardAction('card_opened', {
            hub: hubKey,
            tool: cardId,
            metadata: { cardTitle, openMethod: 'newTab' },
          });
          window.open(card.url, '_blank');
        }
        break;
      }
      case 'addFavourite':
        audit.logCardAction('card_favourited', {
          hub: hubKey,
          metadata: { cardId, cardTitle },
        });
        onFavouriteChange?.(cardId, true);
        break;
      case 'removeFavourite':
        audit.logCardAction('card_unfavourited', {
          hub: hubKey,
          metadata: { cardId, cardTitle },
        });
        onFavouriteChange?.(cardId, false);
        break;
      case 'help': {
        if (card) {
          onCardHelp?.(card);
        }
        break;
      }
    }
  };

  const handleCardClick = (cardId: string): void => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      audit.logCardAction('card_opened', {
        hub: hubKey,
        tool: cardId,
        metadata: { cardTitle: card.title, openMethod: 'click' },
      });
      onCardClick?.(card);
    }
  };

  if (visibleCards.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No cards to display</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className={styles.gridContainer}>
          <div className={styles.gridHint}>
            <span className={styles.hintText}>
              Drag cards to reorder • Click the menu for more options
            </span>
            <HelpTooltip tooltip={cardGridTooltips.reorderCards} />
          </div>
          <div className={styles.grid}>
          {items.map((id) => {
            const card = visibleCards.find((c) => c.id === id);
            if (!card) return null;
            return (
              <FunctionCard
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                themeColor={hubColor.accent}
                openBehavior={cardOpenBehaviors[card.id] || card.openBehavior}
                isPinned={pinnedCardIds.indexOf(card.id) !== -1}
                isFavourite={favouriteCardIds.indexOf(card.id) !== -1}
                isAdmin={isAdmin}
                onClick={() => handleCardClick(card.id)}
                onContextMenu={(action) => handleContextMenu(card.id, action)}
              />
            );
          })}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};
