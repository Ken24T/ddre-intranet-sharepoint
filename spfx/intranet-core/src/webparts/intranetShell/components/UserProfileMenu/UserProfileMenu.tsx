import * as React from 'react';
import {
  Persona,
  PersonaSize,
  Callout,
  DirectionalHint,
  Icon,
  FocusZone,
} from '@fluentui/react';
import styles from './UserProfileMenu.module.scss';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface IUserProfileMenuProps {
  /** User's display name */
  displayName: string;
  /** User's email address */
  email: string;
  /** URL to user's profile photo (optional) */
  photoUrl?: string;
  /** Current theme mode */
  themeMode: ThemeMode;
  /** Called when theme mode changes */
  onThemeModeChange: (mode: ThemeMode) => void;
  /** Called when Settings is clicked */
  onOpenSettings: () => void;
  /** Help & Support URL */
  helpUrl?: string;
  /** Whether current user is admin */
  isAdmin?: boolean;
  /** Whether AI Assistant is currently hidden */
  isAiAssistantHidden?: boolean;
  /** Called when user wants to show AI Assistant */
  onShowAiAssistant?: () => void;
  /** Called when user wants to hide AI Assistant */
  onHideAiAssistant?: () => void;
}

/**
 * UserProfileMenu - Dropdown menu from the user avatar in navbar.
 * Shows user info, theme toggle, settings link, and help.
 */
export const UserProfileMenu: React.FC<IUserProfileMenuProps> = ({
  displayName,
  email,
  photoUrl,
  themeMode,
  onThemeModeChange,
  onOpenSettings,
  helpUrl = 'https://support.ddre.com.au',
  isAdmin = false,
  isAiAssistantHidden = false,
  onShowAiAssistant,
  onHideAiAssistant,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  const handleSettingsClick = (): void => {
    closeMenu();
    onOpenSettings();
  };

  const handleThemeClick = (): void => {
    // Cycle through themes: light → dark → system → light
    const nextTheme: ThemeMode =
      themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    onThemeModeChange(nextTheme);
  };

  const handleHelpClick = (): void => {
    closeMenu();
    window.open(helpUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShowAiAssistant = (): void => {
    closeMenu();
    onShowAiAssistant?.();
  };

  const handleHideAiAssistant = (): void => {
    closeMenu();
    onHideAiAssistant?.();
  };

  // Get initials for fallback avatar
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() || '?';
  };

  const getThemeIcon = (): string => {
    switch (themeMode) {
      case 'dark':
        return 'ClearNight';
      case 'system':
        return 'DeviceRun';
      default:
        return 'Sunny';
    }
  };

  const getThemeLabel = (): string => {
    switch (themeMode) {
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className={styles.avatarButton}
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`User menu for ${displayName}`}
        title={displayName}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className={styles.avatarImage} />
        ) : (
          <span className={styles.avatarInitials}>{getInitials(displayName)}</span>
        )}
      </button>

      {isOpen && (
        <Callout
          target={buttonRef.current}
          onDismiss={closeMenu}
          directionalHint={DirectionalHint.bottomRightEdge}
          isBeakVisible={false}
          gapSpace={4}
          calloutWidth={280}
          className={styles.callout}
        >
          <FocusZone>
            <div className={styles.menu}>
              {/* User Header */}
              <div className={styles.userHeader}>
                <Persona
                  imageUrl={photoUrl}
                  imageInitials={getInitials(displayName)}
                  text={displayName}
                  secondaryText={email}
                  size={PersonaSize.size48}
                  hidePersonaDetails={false}
                />
              </div>

              <div className={styles.divider} />

              {/* Settings */}
              <button className={styles.menuItem} onClick={handleSettingsClick}>
                <Icon iconName="Settings" className={styles.menuIcon} />
                <span>Settings</span>
              </button>

              <div className={styles.divider} />

              {/* Theme Toggle */}
              <button className={styles.menuItem} onClick={handleThemeClick}>
                <Icon iconName={getThemeIcon()} className={styles.menuIcon} />
                <span>Theme: {getThemeLabel()}</span>
                <Icon iconName="ChevronRight" className={styles.menuChevron} />
              </button>

              {/* AI Assistant Toggle */}
              {isAdmin && (onShowAiAssistant || onHideAiAssistant) && (
                <>
                  <div className={styles.divider} />
                  {isAiAssistantHidden ? (
                    <button className={styles.menuItem} onClick={handleShowAiAssistant}>
                      <Icon iconName="Robot" className={styles.menuIcon} />
                      <span>Show AI Assistant</span>
                    </button>
                  ) : (
                    <button className={styles.menuItem} onClick={handleHideAiAssistant}>
                      <Icon iconName="Hide" className={styles.menuIcon} />
                      <span>Hide AI Assistant</span>
                    </button>
                  )}
                </>
              )}

              <div className={styles.divider} />

              {/* Help & Support */}
              <button className={styles.menuItem} onClick={handleHelpClick}>
                <Icon iconName="Help" className={styles.menuIcon} />
                <span>Help & Support</span>
                <Icon iconName="OpenInNewTab" className={styles.menuChevron} />
              </button>
            </div>
          </FocusZone>
        </Callout>
      )}
    </>
  );
};
