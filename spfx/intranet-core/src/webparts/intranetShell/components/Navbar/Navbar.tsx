import * as React from 'react';
import { Icon } from '@fluentui/react';
import { UserProfileMenu, ThemeMode } from '../UserProfileMenu';
import { SearchBox, ISearchResult } from '../SearchBox';
import { TasksNavButton } from '../tasks/widgets/TasksNavButton';
import { NotificationButton } from '../notifications';
import styles from '../IntranetShell.module.scss';

export interface INavbarProps {
  siteTitle: string;
  userDisplayName: string;
  userEmail: string;
  userPhotoUrl?: string;
  /** Current hub gradient for navbar background */
  hubGradient?: string;
  /** Optional navbar text/icon color override */
  textColor?: string;
  /** Optional search theming variables */
  searchThemeVars?: React.CSSProperties;
  /** Optional accent color for avatar */
  avatarAccentColor?: string;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  /** Called when search is submitted (Enter key with query) */
  onSearch?: (query: string) => void;
  /** Called when a search result is clicked */
  onSearchResultSelect?: (result: ISearchResult) => void;
  /** Called when user opens Help Centre */
  onOpenHelp?: () => void;
  /** Dev mode: current admin state */
  isAdmin?: boolean;
  /** Whether AI Assistant is hidden */
  isAiAssistantHidden?: boolean;
  /** Called when user wants to show AI Assistant */
  onShowAiAssistant?: () => void;
  /** Called when user wants to hide AI Assistant */
  onHideAiAssistant?: () => void;
  /** Number of pending tasks */
  pendingTaskCount?: number;
  /** Whether tasks are loading */
  isTasksLoading?: boolean;
  /** Whether tasks panel is open */
  isTasksPanelOpen?: boolean;
  /** Called when user clicks tasks button */
  onToggleTasks?: () => void;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Whether there are overdue notifications */
  hasOverdueNotifications?: boolean;
  /** Whether notifications are loading */
  isNotificationsLoading?: boolean;
  /** Whether notification flyout is open */
  isNotificationFlyoutOpen?: boolean;
  /** Ref for notification button (flyout target) */
  notificationButtonRef?: React.RefObject<HTMLDivElement>;
  /** Called when user clicks notification button */
  onToggleNotifications?: () => void;
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
  hubGradient,
  textColor,
  searchThemeVars,
  avatarAccentColor,
  themeMode,
  onThemeModeChange,
  onOpenSettings,
  onToggleSidebar,
  onSearch,
  onSearchResultSelect,
  onOpenHelp,
  isAdmin = false,
  isAiAssistantHidden = false,
  onShowAiAssistant,
  onHideAiAssistant,
  pendingTaskCount = 0,
  isTasksLoading = false,
  isTasksPanelOpen = false,
  onToggleTasks,
  notificationCount = 0,
  hasOverdueNotifications = false,
  isNotificationsLoading = false,
  isNotificationFlyoutOpen = false,
  notificationButtonRef,
  onToggleNotifications,
}) => {
  return (
    <nav
      className={styles.navbar}
      role="navigation"
      aria-label="Main navigation"
      style={
        hubGradient || textColor
          ? ({
              background: hubGradient,
              color: textColor,
              ...(textColor ? { ['--navbar-text' as string]: textColor } : {}),
            } as React.CSSProperties)
          : undefined
      }
    >
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

      {/* Expandable Search */}
      <SearchBox 
        onSearch={onSearch}
        onResultSelect={onSearchResultSelect}
        themeVars={searchThemeVars}
        isAdmin={isAdmin}
      />

      <div className={styles.navbarActions}>
        {/* Tasks button */}
        {onToggleTasks && (
          <TasksNavButton
            pendingCount={pendingTaskCount}
            isLoading={isTasksLoading}
            isActive={isTasksPanelOpen}
            onClick={onToggleTasks}
          />
        )}

        {/* Notifications button */}
        <NotificationButton
          unreadCount={notificationCount}
          hasOverdue={hasOverdueNotifications}
          isLoading={isNotificationsLoading}
          isActive={isNotificationFlyoutOpen}
          buttonRef={notificationButtonRef}
          onClick={onToggleNotifications ?? (() => {})}
        />

        {onOpenHelp && (
          <button
            className={styles.toggleButton}
            aria-label="Help Centre"
            title="Help Centre"
            onClick={onOpenHelp}
            type="button"
          >
            <Icon iconName="Lightbulb" />
          </button>
        )}

        {/* User Profile Menu */}
        <UserProfileMenu
          displayName={userDisplayName}
          email={userEmail}
          photoUrl={userPhotoUrl}
          accentColor={avatarAccentColor}
          themeMode={themeMode}
          onThemeModeChange={onThemeModeChange}
          onOpenSettings={onOpenSettings}
          onOpenHelp={onOpenHelp}
          isAdmin={isAdmin}
          isAiAssistantHidden={isAiAssistantHidden}
          onShowAiAssistant={onShowAiAssistant}
          onHideAiAssistant={onHideAiAssistant}
        />
      </div>
    </nav>
  );
};
