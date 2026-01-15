import * as React from 'react';
import { Icon } from '@fluentui/react';
import styles from '../IntranetShell.module.scss';

export interface INavbarProps {
  siteTitle: string;
  userDisplayName: string;
  onToggleSidebar: () => void;
}

/**
 * Navbar - Fixed 48px top navigation bar.
 * Contains hamburger menu, logo, search (placeholder), and user actions.
 */
export const Navbar: React.FC<INavbarProps> = ({
  siteTitle,
  userDisplayName,
  onToggleSidebar,
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

      <div className={styles.navbarActions}>
        {/* Notifications placeholder - Phase 5 */}
        <button className={styles.toggleButton} aria-label="Notifications" title="Notifications">
          <Icon iconName="Ringer" />
        </button>

        {/* User menu placeholder - Phase 3 */}
        <button className={styles.toggleButton} aria-label="User menu" title={userDisplayName}>
          <Icon iconName="Contact" />
        </button>
      </div>
    </nav>
  );
};
