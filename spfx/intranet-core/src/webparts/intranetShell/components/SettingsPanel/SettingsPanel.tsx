import * as React from 'react';
import {
  Panel,
  PanelType,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  Icon,
  IconButton,
} from '@fluentui/react';
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
}) => {
  const [showResetDialog, setShowResetDialog] = React.useState(false);

  const themeOptions: IDropdownOption[] = [
    { key: 'light', text: 'Light' },
    { key: 'dark', text: 'Dark' },
    { key: 'system', text: 'System (auto)' },
  ];

  const sidebarOptions: IDropdownOption[] = [
    { key: 'expanded', text: 'Expanded' },
    { key: 'collapsed', text: 'Collapsed' },
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
                  Cards you&apos;ve hidden. Click restore to show them again.
                </p>
                <div className={styles.hiddenCardsList}>
                  {hiddenCards.map((card) => (
                    <div key={card.id} className={styles.hiddenCardItem}>
                      <div className={styles.hiddenCardInfo}>
                        <span className={styles.hiddenCardTitle}>{card.title}</span>
                        <span className={styles.hiddenCardHub}>{card.hubKey}</span>
                      </div>
                      <IconButton
                        iconProps={{ iconName: 'View' }}
                        title="Restore card"
                        ariaLabel={`Restore ${card.title}`}
                        onClick={() => onRestoreCard(card.id)}
                        className={styles.restoreButton}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>

      {/* Reset Confirmation Dialog */}
      <Dialog
        hidden={!showResetDialog}
        onDismiss={handleResetCancel}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Reset to Defaults?',
          subText:
            'This will reset all your preferences including theme, layout, card order, and restore all hidden cards. This cannot be undone.',
        }}
        modalProps={{
          isBlocking: true,
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={handleResetConfirm} text="Reset" />
          <DefaultButton onClick={handleResetCancel} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </>
  );
};
