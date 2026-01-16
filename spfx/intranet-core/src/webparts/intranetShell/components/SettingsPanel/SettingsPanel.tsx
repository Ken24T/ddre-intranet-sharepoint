import * as React from 'react';
import {
  Panel,
  PanelType,
  Dropdown,
  IDropdownOption,
  DefaultButton,
  ActionButton,
  Icon,
} from '@fluentui/react';
import { ConfirmationDialog } from '../Modal/ConfirmationDialog';
import { HiddenCardsManager } from '../Modal/HiddenCardsManager';
import type { CardOpenBehavior } from '../FunctionCard';
import type { ThemeMode } from '../UserProfileMenu';
import styles from './SettingsPanel.module.scss';

export interface ISettingsPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Called when panel should close */
  onDismiss: () => void;
  /** Current theme mode */
  themeMode: ThemeMode;
  /** Called when theme changes */
  onThemeModeChange: (mode: ThemeMode) => void;
  /** Whether sidebar starts collapsed */
  sidebarDefaultCollapsed: boolean;
  /** Called when sidebar default changes */
  onSidebarDefaultChange: (collapsed: boolean) => void;
  /** List of hidden card IDs with their titles */
  hiddenCards: Array<{ id: string; title: string; hubKey: string }>;
  /** Called when a card should be restored */
  onRestoreCard: (cardId: string) => void;
  /** Called when all settings should reset */
  onResetAll: () => void;
  /** Whether current user is admin */
  isAdmin?: boolean;
  /** Cards available for admin configuration */
  cards?: Array<{ id: string; title: string; hubKey: string }>;
  /** Current card open behavior preferences */
  cardOpenBehaviors?: Record<string, CardOpenBehavior>;
  /** Called when card open behavior changes */
  onCardOpenBehaviorChange?: (cardId: string, behavior: CardOpenBehavior) => void;
  /** Whether AI Assistant is currently hidden */
  isAiAssistantHidden?: boolean;
  /** Called when AI Assistant should be shown */
  onShowAiAssistant?: () => void;
  /** Called when AI Assistant should be hidden */
  onHideAiAssistant?: () => void;
}

/**
 * SettingsPanel - Slide-out panel for user preferences.
 * Includes theme, layout, hidden cards management, and reset option.
 */
export const SettingsPanel: React.FC<ISettingsPanelProps> = ({
  isOpen,
  onDismiss,
  themeMode,
  onThemeModeChange,
  sidebarDefaultCollapsed,
  onSidebarDefaultChange,
  hiddenCards,
  onRestoreCard,
  onResetAll,
  isAdmin = false,
  cards = [],
  cardOpenBehaviors = {},
  onCardOpenBehaviorChange,
  isAiAssistantHidden = false,
  onShowAiAssistant,
  onHideAiAssistant,
}) => {
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [showHiddenCardsManager, setShowHiddenCardsManager] = React.useState(false);

  const themeOptions: IDropdownOption[] = [
    { key: 'light', text: 'Light' },
    { key: 'dark', text: 'Dark' },
    { key: 'system', text: 'System (auto)' },
  ];

  const sidebarOptions: IDropdownOption[] = [
    { key: 'expanded', text: 'Expanded' },
    { key: 'collapsed', text: 'Collapsed' },
  ];

  const aiAssistantOptions: IDropdownOption[] = [
    { key: 'visible', text: 'Show at startup' },
    { key: 'hidden', text: 'Hide at startup' },
  ];

  const cardOpenBehaviorOptions: IDropdownOption[] = [
    { key: 'inline', text: 'Open in hub area' },
    { key: 'newTab', text: 'Open in new tab' },
    { key: 'newWindow', text: 'Open in new window' },
  ];

  const handleThemeChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (option) {
      onThemeModeChange(option.key as ThemeMode);
    }
  };

  const handleSidebarChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (option) {
      onSidebarDefaultChange(option.key === 'collapsed');
    }
  };

  const handleResetClick = (): void => {
    setShowResetDialog(true);
  };

  const handleResetConfirm = (): void => {
    setShowResetDialog(false);
    onResetAll();
    onDismiss();
  };

  const handleResetCancel = (): void => {
    setShowResetDialog(false);
  };

  const handleAiAssistantChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) return;
    if (option.key === 'hidden') {
      onHideAiAssistant?.();
    } else {
      onShowAiAssistant?.();
    }
  };

  const handleCardBehaviorChange = (
    cardId: string
  ): ((
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => void) => (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option || !onCardOpenBehaviorChange) return;
    onCardOpenBehaviorChange(cardId, option.key as CardOpenBehavior);
  };

  const onRenderFooterContent = (): JSX.Element => (
    <div className={styles.footer}>
      <DefaultButton
        text="Reset to Defaults"
        iconProps={{ iconName: 'Refresh' }}
        onClick={handleResetClick}
        className={styles.resetButton}
      />
    </div>
  );

  return (
    <>
      <Panel
        isOpen={isOpen}
        onDismiss={onDismiss}
        headerText="Settings"
        type={PanelType.medium}
        closeButtonAriaLabel="Close settings"
        onRenderFooterContent={onRenderFooterContent}
        isFooterAtBottom={true}
      >
        <div className={styles.content}>
          {/* Appearance Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <div className={styles.setting}>
              <Dropdown
                label="Theme"
                selectedKey={themeMode}
                options={themeOptions}
                onChange={handleThemeChange}
                styles={{ dropdown: { width: 200 } }}
              />
              <p className={styles.settingDescription}>
                Choose your preferred color theme. System will match your device settings.
              </p>
            </div>
          </div>

          {/* Layout Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Layout</h3>
            <div className={styles.setting}>
              <Dropdown
                label="Sidebar default state"
                selectedKey={sidebarDefaultCollapsed ? 'collapsed' : 'expanded'}
                options={sidebarOptions}
                onChange={handleSidebarChange}
                styles={{ dropdown: { width: 200 } }}
              />
              <p className={styles.settingDescription}>
                How the sidebar appears when you first load the page.
              </p>
            </div>
          </div>

          {/* Card Behavior (Admin Only) */}
          {isAdmin && cards.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Card Behavior (Admin)</h3>
              <p className={styles.settingDescription}>
                Configure how each card opens when selected.
              </p>
              <div className={styles.cardBehaviorList}>
                {cards.map((card) => (
                  <div key={card.id} className={styles.cardBehaviorItem}>
                    <div className={styles.cardBehaviorMeta}>
                      <span className={styles.cardBehaviorTitle}>{card.title}</span>
                      <span className={styles.cardBehaviorHub}>{card.hubKey}</span>
                    </div>
                    <Dropdown
                      selectedKey={cardOpenBehaviors[card.id] || 'inline'}
                      options={cardOpenBehaviorOptions}
                      onChange={handleCardBehaviorChange(card.id)}
                      styles={{ dropdown: { width: 200 } }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Assistant (Admin Only) */}
          {isAdmin && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>AI Assistant (Admin)</h3>
              <div className={styles.setting}>
                <Dropdown
                  label="AI Assistant"
                  selectedKey={isAiAssistantHidden ? 'hidden' : 'visible'}
                  options={aiAssistantOptions}
                  onChange={handleAiAssistantChange}
                  styles={{ dropdown: { width: 200 } }}
                />
                <p className={styles.settingDescription}>
                  Controls whether the AI Assistant is shown when users open the intranet.
                </p>
              </div>
            </div>
          )}

          {/* Hidden Cards Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Hidden Cards</h3>
            {hiddenCards.length === 0 ? (
              <p className={styles.emptyMessage}>
                <Icon iconName="CheckMark" className={styles.emptyIcon} />
                No hidden cards. All cards are visible.
              </p>
            ) : (
              <>
                <p className={styles.settingDescription}>
                  You have {hiddenCards.length} hidden card{hiddenCards.length !== 1 ? 's' : ''}.
                </p>
                <ActionButton
                  iconProps={{ iconName: 'ViewAll' }}
                  text="Manage Hidden Cards..."
                  onClick={() => setShowHiddenCardsManager(true)}
                  className={styles.manageButton}
                />
              </>
            )}
          </div>
        </div>
      </Panel>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showResetDialog}
        onDismiss={handleResetCancel}
        onConfirm={handleResetConfirm}
        title="Reset to Defaults"
        message="Reset all settings to defaults?"
        description="This will reset your theme, layout, card order, and restore all hidden cards. This cannot be undone."
        confirmText="Reset"
        variant="destructive"
      />

      {/* Hidden Cards Manager */}
      <HiddenCardsManager
        isOpen={showHiddenCardsManager}
        onDismiss={() => setShowHiddenCardsManager(false)}
        hiddenCards={hiddenCards}
        onRestoreCard={onRestoreCard}
      />
    </>
  );
};
