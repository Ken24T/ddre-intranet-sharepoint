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
import type { IFunctionCard } from '../FunctionCard';
import styles from './CardGrid.module.scss';

export interface ICardGridProps {
  /** Cards to display */
  cards: IFunctionCard[];
  /** IDs of pinned cards */
  pinnedCardIds: string[];
  /** IDs of hidden cards */
  hiddenCardIds: string[];
  /** Called when card order changes */
  onOrderChange?: (cardIds: string[]) => void;
  /** Called when card is pinned/unpinned */
  onPinChange?: (cardId: string, isPinned: boolean) => void;
  /** Called when card is hidden */
  onHideCard?: (cardId: string) => void;
  /** Called when card is clicked */
  onCardClick?: (card: IFunctionCard) => void;
}

/**
 * CardGrid - Responsive grid of draggable function cards.
 * Supports drag-and-drop reordering with pinned cards at top.
 */
export const CardGrid: React.FC<ICardGridProps> = ({
  cards,
  pinnedCardIds,
  hiddenCardIds,
  onOrderChange,
  onPinChange,
  onHideCard,
  onCardClick,
}) => {
  // Filter out hidden cards
  const visibleCards = cards.filter((card) => hiddenCardIds.indexOf(card.id) === -1);

  // Sort cards: pinned first, then by order
  const sortedCards = React.useMemo(() => {
    const pinned = visibleCards.filter((c) => pinnedCardIds.indexOf(c.id) !== -1);
    const unpinned = visibleCards.filter((c) => pinnedCardIds.indexOf(c.id) === -1);
    return [...pinned, ...unpinned];
  }, [visibleCards, pinnedCardIds]);

  const [items, setItems] = React.useState<string[]>(sortedCards.map((c) => c.id));

  // Update items when cards change
  React.useEffect(() => {
    setItems(sortedCards.map((c) => c.id));
  }, [sortedCards]);

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
    action: 'pin' | 'unpin' | 'hide' | 'openNewTab'
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
            const card = sortedCards.find((c) => c.id === id);
            if (!card) return null;
            return (
              <FunctionCard
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                isPinned={pinnedCardIds.indexOf(card.id) !== -1}
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
