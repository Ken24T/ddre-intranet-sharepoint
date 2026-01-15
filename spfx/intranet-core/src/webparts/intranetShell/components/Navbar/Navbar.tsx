import * as React from 'react';
import { Icon, Toggle } from '@fluentui/react';
import { UserProfileMenu, ThemeMode } from '../UserProfileMenu';
import styles from '../IntranetShell.module.scss';

export interface INavbarProps {
  siteTitle: string;
  userDisplayName: string;
  userEmail: string;
  userPhotoUrl?: string;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  /** Dev mode: current admin state */
  isAdmin?: boolean;
  /** Dev mode: toggle admin rights */
  onToggleAdmin?: () => void;
}

/**
 * Navbar - Fixed 48px top navigation bar.
 * Contains hamburger menu, logo, search (placeholder), and user actions.
 */
export const Navbar: React.FC<INavbarProps> = ({
  siteTitle,
  userDisplayName,
  userEmail,
  userPhotoUrl,
  themeMode,
  onThemeModeChange,
  onOpenSettings,
  onToggleSidebar,
  isAdmin = false,
  onToggleAdmin,
}) => {
  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <button
        className={styles.toggleButton}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <Icon iconName="GlobalNavButton" />
      </button>

      <div className={styles.navbarLogo}>
        <Icon iconName="Home" />
        <span>{siteTitle}</span>
      </div>

      <div className={styles.navbarSpacer} />

      {/* Search placeholder - Phase 6 */}
      <div style={{ opacity: 0.7 }}>
        <Icon iconName="Search" />
      </div>

      {/* ⚠️ DEV ONLY - Admin/User toggle for testing permission-based UI.
          This MUST NEVER appear in Test or Prod SPFx builds.
          
          SAFETY: This toggle only renders when onToggleAdmin prop is provided.
          - Vite dev server (dev/src/App.tsx) passes onToggleAdmin → renders
          - SPFx web part (IntranetShellWebPart.ts) does NOT pass it → never renders
          
          The /dev/ folder is completely separate from SPFx bundling and is not
          included in the .sppkg package. */}
      {onToggleAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16, gap: 8 }}>
          <Toggle
            checked={isAdmin}
            onChange={onToggleAdmin}
            onText="Admin"
            offText="User"
            styles={{
              root: { marginBottom: 0 },
              label: { color: 'white', fontSize: 12 },
              pill: { 
                background: isAdmin ? '#107c10' : 'rgba(255,255,255,0.3)',
              },
            }}
          />
        </div>
      )}

      <div className={styles.navbarActions}>
        {/* Notifications placeholder - Phase 5 */}
        <button className={styles.toggleButton} aria-label="Notifications" title="Notifications">
          <Icon iconName="Ringer" />
        </button>

        {/* User Profile Menu */}
        <UserProfileMenu
          displayName={userDisplayName}
          email={userEmail}
          photoUrl={userPhotoUrl}
          themeMode={themeMode}
          onThemeModeChange={onThemeModeChange}
          onOpenSettings={onOpenSettings}
        />
      </div>
    </nav>
  );
};
