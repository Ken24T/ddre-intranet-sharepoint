import * as React from 'react';
import { Icon } from '@fluentui/react';
import styles from '../IntranetShell.module.scss';

export interface ISidebarProps {
  isCollapsed: boolean;
}

interface INavItem {
  key: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

// Static nav items for Phase 1 - will be dynamic in Phase 2
const navItems: INavItem[] = [
  { key: 'home', label: 'Home', icon: 'Home', isActive: true },
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
export const Sidebar: React.FC<ISidebarProps> = ({ isCollapsed }) => {
  return (
    <aside
      className={styles.sidebar}
      role="complementary"
      aria-label="Sidebar navigation"
    >
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <a
            key={item.key}
            href={`#${item.key}`}
            className={`${styles.sidebarItem} ${item.isActive ? styles.sidebarItemActive : ''}`}
            title={item.label}
          >
            <span className={styles.sidebarItemIcon}>
              <Icon iconName={item.icon} />
            </span>
            {!isCollapsed && (
              <span className={styles.sidebarItemLabel}>{item.label}</span>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};
