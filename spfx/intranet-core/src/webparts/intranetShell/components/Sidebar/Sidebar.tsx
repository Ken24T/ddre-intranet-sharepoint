import * as React from 'react';
import { Icon } from '@fluentui/react';
import styles from '../IntranetShell.module.scss';

export interface ISidebarProps {
  isCollapsed: boolean;
  activeHubKey?: string;
  onHubChange?: (hubKey: string) => void;
  onOpenHelp?: () => void;
}

interface INavItem {
  key: string;
  label: string;
  icon: string;
}

// Hub navigation items
const navItems: INavItem[] = [
  { key: 'home', label: 'Home', icon: 'Home' },
  { key: 'library', label: 'Document Library', icon: 'Library' },
  { key: 'administration', label: 'Administration', icon: 'Settings' },
  { key: 'office', label: 'Office', icon: 'Teamwork' },
  { key: 'property-management', label: 'Property Management', icon: 'CityNext' },
  { key: 'sales', label: 'Sales', icon: 'Money' },
];

/**
 * Sidebar - Collapsible navigation sidebar (64px collapsed, 240px expanded).
 * Contains hub navigation links.
 */
export const Sidebar: React.FC<ISidebarProps> = ({
  isCollapsed,
  activeHubKey = 'home',
  onHubChange,
  onOpenHelp,
}) => {
  const handleClick = (e: React.MouseEvent, hubKey: string): void => {
    e.preventDefault();
    onHubChange?.(hubKey);
  };

  return (
    <aside
      className={styles.sidebar}
      role="complementary"
      aria-label="Sidebar navigation"
    >
      <div className={styles.sidebarNavContainer}>
        <nav id="sidebar-nav" className={styles.sidebarNav} tabIndex={-1}>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={`#${item.key}`}
              className={`${styles.sidebarItem} ${item.key === activeHubKey ? styles.sidebarItemActive : ''}`}
              title={item.label}
              onClick={(e) => handleClick(e, item.key)}
              aria-current={item.key === activeHubKey ? 'page' : undefined}
            >
              <span className={styles.sidebarItemIcon}>
                <Icon iconName={item.icon} />
              </span>
              {!isCollapsed && (
                <span className={styles.sidebarItemLabel}>{item.label}</span>
              )}
            </a>
          ))}
          {onOpenHelp && (
            <a
              className={`${styles.sidebarItem} ${styles.sidebarHelpItem}`}
              href="#help"
              onClick={(event) => {
                event.preventDefault();
                onOpenHelp();
              }}
              title="Help Center"
            >
              <span className={styles.sidebarItemIcon}>
                <Icon iconName="Lightbulb" />
              </span>
              {!isCollapsed && (
                <span className={styles.sidebarItemLabel}>Help Center</span>
              )}
            </a>
          )}
        </nav>
      </div>
    </aside>
  );
};
