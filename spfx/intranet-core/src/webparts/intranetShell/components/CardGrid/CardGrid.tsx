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
  /** Called when card open behavior changes */
  onCardOpenBehaviorChange?: (
    cardId: string,
    behavior: CardOpenBehavior
  ) => void;
  /** Called when card is clicked */
  onCardClick?: (card: IFunctionCard) => void;
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
  cardOpenBehaviors = {},
  savedOrder,
  isAdmin = false,
  onOrderChange,
  onPinChange,
  onHideCard,
  onCardOpenBehaviorChange,
  onCardClick,
}) => {
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
      | 'setOpenInline'
      | 'setOpenNewTab'
      | 'setOpenNewWindow'
  ): void => {
    switch (action) {
      case 'pin':
        onPinChange?.(cardId, true);
        break;
      case 'unpin':
        onPinChange?.(cardId, false);
        break;
      case 'hide':
        onHideCard?.(cardId);
        break;
      case 'setOpenInline':
        onCardOpenBehaviorChange?.(cardId, 'inline');
        break;
      case 'setOpenNewTab':
        onCardOpenBehaviorChange?.(cardId, 'newTab');
        break;
      case 'setOpenNewWindow':
        onCardOpenBehaviorChange?.(cardId, 'newWindow');
        break;
      case 'openNewTab': {
        const card = cards.find((c) => c.id === cardId);
        if (card?.url) {
          window.open(card.url, '_blank');
        }
        break;
      }
    }
  };

  const handleCardClick = (cardId: string): void => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
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
                isAdmin={isAdmin}
                onClick={() => handleCardClick(card.id)}
                onContextMenu={(action) => handleContextMenu(card.id, action)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
