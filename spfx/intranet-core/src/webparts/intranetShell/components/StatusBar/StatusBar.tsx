import * as React from 'react';
import styles from '../IntranetShell.module.scss';

export interface IStatusBarProps {
  userEmail: string;
}

/**
 * StatusBar - Fixed 24px bottom status bar.
 * Shows API health indicators, current user, and notifications.
 */
export const StatusBar: React.FC<IStatusBarProps> = ({ userEmail }) => {
  return (
    <footer className={styles.statusBar} role="contentinfo">
      <div className={styles.statusBarSection}>
        <span className={`${styles.statusIndicator} ${styles.statusIndicatorError}`} title="Vault: Disconnected" />
        <span>Vault</span>
      </div>
      <div className={styles.statusBarSection}>
        <span className={`${styles.statusIndicator} ${styles.statusIndicatorError}`} title="PropertyMe: Disconnected" />
        <span>PropertyMe</span>
      </div>

      <div className={styles.statusBarSpacer} />

      <div className={styles.statusBarSection}>
        <span>{userEmail}</span>
      </div>
    </footer>
  );
};
