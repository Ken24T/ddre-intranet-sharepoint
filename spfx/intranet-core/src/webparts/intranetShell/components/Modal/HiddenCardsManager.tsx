import * as React from 'react';
import { 
  PrimaryButton, 
  DefaultButton,
  Icon,
} from '@fluentui/react';
import { Modal } from './Modal';
import styles from './HiddenCardsManager.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export interface IHiddenCard {
  id: string;
  title: string;
  hubKey: string;
}

export interface IHiddenCardsManagerProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler when modal is dismissed */
  onDismiss: () => void;
  /** List of hidden cards */
  hiddenCards: IHiddenCard[];
  /** Handler when a card is restored */
  onRestoreCard: (cardId: string) => void;
  /** Handler to restore all cards */
  onRestoreAll?: () => void;
}

// =============================================================================
// HUB LABELS
// =============================================================================

const HUB_LABELS: Record<string, string> = {
  home: 'Home',
  office: 'Office',
  sales: 'Sales',
  'property-management': 'Property Management',
  admin: 'Administration',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Modal for managing hidden cards.
 * 
 * Users can:
 * - See all hidden cards grouped by hub
 * - Restore individual cards
 * - Restore all cards at once
 * 
 * @example
 * ```tsx
 * <HiddenCardsManager
 *   isOpen={showManager}
 *   onDismiss={() => setShowManager(false)}
 *   hiddenCards={hiddenCards}
 *   onRestoreCard={handleRestore}
 *   onRestoreAll={handleRestoreAll}
 * />
 * ```
 */
export const HiddenCardsManager: React.FC<IHiddenCardsManagerProps> = ({
  isOpen,
  onDismiss,
  hiddenCards,
  onRestoreCard,
  onRestoreAll,
}) => {
  // Group cards by hub
  const cardsByHub = React.useMemo(() => {
    const grouped: Record<string, IHiddenCard[]> = {};
    hiddenCards.forEach(card => {
      if (!grouped[card.hubKey]) {
        grouped[card.hubKey] = [];
      }
      grouped[card.hubKey].push(card);
    });
    return grouped;
  }, [hiddenCards]);

  const hubKeys = Object.keys(cardsByHub);
  const hasCards = hiddenCards.length > 0;

  const handleRestoreAll = (): void => {
    if (onRestoreAll) {
      onRestoreAll();
    } else {
      // Fallback: restore each card individually
      hiddenCards.forEach(card => onRestoreCard(card.id));
    }
  };

  const footer = hasCards ? (
    <>
      <DefaultButton
        text="Restore All"
        onClick={handleRestoreAll}
        iconProps={{ iconName: 'Refresh' }}
      />
      <PrimaryButton text="Done" onClick={onDismiss} />
    </>
  ) : (
    <PrimaryButton text="Done" onClick={onDismiss} />
  );

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      title="Hidden Cards"
      size="medium"
      footer={footer}
    >
      {!hasCards ? (
        <div className={styles.emptyState}>
          <Icon iconName="ViewAll" className={styles.emptyIcon} />
          <div className={styles.emptyText}>No hidden cards</div>
          <p className={styles.emptySubtext}>
            All your cards are currently visible. Hide cards from their context menu.
          </p>
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.intro}>
            These cards are hidden from your view. Click Restore to show them again.
          </p>

          {hubKeys.map(hubKey => (
            <div key={hubKey} className={styles.hubSection}>
              <div className={styles.hubLabel}>{HUB_LABELS[hubKey] || hubKey}</div>
              <div className={styles.cardList}>
                {cardsByHub[hubKey].map(card => (
                  <div key={card.id} className={styles.cardItem}>
                    <div className={styles.cardInfo}>
                      <Icon iconName="ProductVariant" className={styles.cardIcon} />
                      <span className={styles.cardTitle}>{card.title}</span>
                    </div>
                    <DefaultButton
                      className={styles.restoreButton}
                      text="Restore"
                      onClick={() => onRestoreCard(card.id)}
                      iconProps={{ iconName: 'RevToggleKey' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default HiddenCardsManager;
