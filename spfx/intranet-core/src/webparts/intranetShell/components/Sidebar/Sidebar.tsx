import * as React from 'react';
import { Icon } from '@fluentui/react';
import styles from '../IntranetShell.module.scss';
import { useAudit } from '../AuditContext';
import type { IAppNavItem } from '../appBridge';
import type { HubKey } from '../services/ShellGroupResolver';

export interface ISidebarProps {
  isCollapsed: boolean;
  activeHubKey?: string;
  hasFavourites?: boolean;
  /** Whether the current user has admin privileges */
  isAdmin?: boolean;
  /** Hub keys the user is allowed to see (from ShellGroupResolver) */
  visibleHubs?: HubKey[];
  /** Whether there are unread release notes */
  hasUnreadReleases?: boolean;
  /** App-provided nav items that replace the hub nav (except Home). */
  appNavItems?: IAppNavItem[];
  /** Active key within the app navigation. */
  appActiveKey?: string;
  onHubChange?: (hubKey: string) => void;
  /** Called when the user clicks an app sidebar item. */
  onAppNavigate?: (key: string) => void;
  onOpenHelp?: () => void;
}

interface INavItem {
  key: string;
  label: string;
  icon: string;
}

// Hub navigation items (base order)
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
  hasFavourites = false,
  isAdmin = false,
  visibleHubs,
  hasUnreadReleases = false,
  appNavItems,
  appActiveKey,
  onHubChange,
  onAppNavigate,
  onOpenHelp,
}) => {
  const audit = useAudit();
  const isAppMode = appNavItems !== undefined && appNavItems.length > 0;

  const handleHubClick = (e: React.MouseEvent, hubKey: string): void => {
    e.preventDefault();
    
    // Log hub navigation
    audit.logNavigation('hub_changed', {
      hub: hubKey,
      metadata: { previousHub: activeHubKey, source: 'sidebar' },
    });
    
    onHubChange?.(hubKey);
  };

  const handleAppClick = (e: React.MouseEvent, key: string): void => {
    e.preventDefault();
    onAppNavigate?.(key);
  };

  const orderedItems = React.useMemo(() => {
    // Filter hubs by user's group-based access
    let items = visibleHubs
      ? navItems.filter((item) => visibleHubs.indexOf(item.key as HubKey) !== -1)
      : isAdmin
        ? navItems
        : navItems.filter((item) => item.key !== 'administration');

    if (hasFavourites) {
      const favouriteItem: INavItem = { key: 'favourites', label: 'Favourites', icon: 'Heart' };
      const homeIndex = items.findIndex((item) => item.key === 'home');
      const libraryIndex = items.findIndex((item) => item.key === 'library');
      const insertIndex = libraryIndex > homeIndex ? libraryIndex : homeIndex + 1;
      items = [...items];
      items.splice(insertIndex, 0, favouriteItem);
    }

    return items;
  }, [hasFavourites, isAdmin, visibleHubs]);

  return (
    <aside
      className={styles.sidebar}
      role="complementary"
      aria-label="Sidebar navigation"
    >
      <div className={styles.sidebarNavContainer}>
        <nav id="sidebar-nav" className={styles.sidebarNav} tabIndex={-1}>
          {/* Home is always shown — returns user to the intranet */}
          <a
            key="home"
            href="#home"
            className={`${styles.sidebarItem} ${!isAppMode && activeHubKey === 'home' ? styles.sidebarItemActive : ''}`}
            title="Home"
            onClick={(e) => handleHubClick(e, 'home')}
            aria-current={!isAppMode && activeHubKey === 'home' ? 'page' : undefined}
          >
            <span className={styles.sidebarItemIcon}>
              <Icon iconName="Home" />
            </span>
            {!isCollapsed && (
              <span className={styles.sidebarItemLabel}>Home</span>
            )}
          </a>

          {isAppMode ? (
            /* ── App-provided navigation ─────────────── */
            appNavItems.map((item) => (
              <a
                key={`app-${item.key}`}
                href={`#${item.key}`}
                className={`${styles.sidebarItem} ${item.key === appActiveKey ? styles.sidebarItemActive : ''}`}
                title={item.label}
                onClick={(e) => handleAppClick(e, item.key)}
                aria-current={item.key === appActiveKey ? 'page' : undefined}
              >
                <span className={styles.sidebarItemIcon}>
                  <Icon iconName={item.icon} />
                </span>
                {!isCollapsed && (
                  <span className={styles.sidebarItemLabel}>{item.label}</span>
                )}
              </a>
            ))
          ) : (
            /* ── Standard hub navigation ─────────────── */
            <>
              {orderedItems
                .filter((item) => item.key !== 'home')
                .map((item) => (
                  <a
                    key={item.key}
                    href={`#${item.key}`}
                    className={`${styles.sidebarItem} ${item.key === activeHubKey ? styles.sidebarItemActive : ''}`}
                    title={item.label}
                    onClick={(e) => handleHubClick(e, item.key)}
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
            </>
          )}

          {/* Help Centre — always shown in standard mode, hidden in app mode */}
          {!isAppMode && onOpenHelp && (
            <a
              className={`${styles.sidebarItem} ${styles.sidebarHelpItem}`}
              href="#help"
              onClick={(event) => {
                event.preventDefault();
                onOpenHelp();
              }}
              title="Help Centre"
            >
              <span className={styles.sidebarItemIcon}>
                <Icon iconName="Lightbulb" />
                {hasUnreadReleases && <span className={styles.newBadge} aria-label="New updates available" />}
              </span>
              {!isCollapsed && (
                <span className={styles.sidebarItemLabel}>Help Centre</span>
              )}
            </a>
          )}
        </nav>
      </div>
    </aside>
  );
};
