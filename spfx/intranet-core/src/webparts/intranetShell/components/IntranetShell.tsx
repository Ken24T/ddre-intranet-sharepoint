import * as React from 'react';
import styles from './IntranetShell.module.scss';
import type { IIntranetShellProps } from './IIntranetShellProps';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { ContentArea } from './ContentArea/ContentArea';
import { StatusBar } from './StatusBar/StatusBar';
import { CardGrid } from './CardGrid';
import { SettingsPanel } from './SettingsPanel';
import { sampleCards, hubInfo } from './data';
import type { IFunctionCard } from './FunctionCard';
import { getHubColor } from './theme';
import type { ThemeMode } from './UserProfileMenu';

export interface IIntranetShellState {
  isSidebarCollapsed: boolean;
  activeHubKey: string;
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  cardOrder: Record<string, string[]>;
  /** Dev mode: toggle admin rights */
  isAdminMode: boolean;
  /** Current theme mode */
  themeMode: ThemeMode;
  /** Settings panel open state */
  isSettingsOpen: boolean;
}

/**
 * LocalStorage keys for user preferences
 */
const STORAGE_KEYS = {
  CARD_ORDER: 'ddre-intranet-cardOrder',
  PINNED_CARDS: 'ddre-intranet-pinnedCards',
  HIDDEN_CARDS: 'ddre-intranet-hiddenCards',
  SIDEBAR_COLLAPSED: 'ddre-intranet-sidebarCollapsed',
  THEME_MODE: 'ddre-intranet-themeMode',
};

/**
 * Helper to safely read from localStorage
 */
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Helper to safely write to localStorage
 */
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or private browsing - silently fail
  }
};

/**
 * IntranetShell - Main layout component for the DDRE Intranet.
 * Uses CSS Grid to create a fixed navbar, resizable sidebar,
 * fluid content area, and fixed status bar.
 */
export class IntranetShell extends React.Component<IIntranetShellProps, IIntranetShellState> {
  constructor(props: IIntranetShellProps) {
    super(props);
    this.state = {
      isSidebarCollapsed: loadFromStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
      activeHubKey: 'home',
      pinnedCardIds: loadFromStorage(STORAGE_KEYS.PINNED_CARDS, []),
      hiddenCardIds: loadFromStorage(STORAGE_KEYS.HIDDEN_CARDS, []),
      cardOrder: loadFromStorage(STORAGE_KEYS.CARD_ORDER, {}),
      isAdminMode: props.isAdmin ?? false,
      themeMode: loadFromStorage(STORAGE_KEYS.THEME_MODE, 'light'),
      isSettingsOpen: false,
    };
  }

  private handleToggleSidebar = (): void => {
    this.setState((prevState) => {
      const newCollapsed = !prevState.isSidebarCollapsed;
      saveToStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, newCollapsed);
      return { isSidebarCollapsed: newCollapsed };
    });
  };

  private handleToggleAdmin = (): void => {
    this.setState((prevState) => ({
      isAdminMode: !prevState.isAdminMode,
    }));
  };

  private handleThemeModeChange = (mode: ThemeMode): void => {
    saveToStorage(STORAGE_KEYS.THEME_MODE, mode);
    this.setState({ themeMode: mode });
  };

  private handleOpenSettings = (): void => {
    this.setState({ isSettingsOpen: true });
  };

  private handleCloseSettings = (): void => {
    this.setState({ isSettingsOpen: false });
  };

  private handleHubChange = (hubKey: string): void => {
    this.setState({ activeHubKey: hubKey });
  };

  private handleCardOrderChange = (cardIds: string[]): void => {
    const { activeHubKey, cardOrder } = this.state;
    const newCardOrder = {
      ...cardOrder,
      [activeHubKey]: cardIds,
    };
    saveToStorage(STORAGE_KEYS.CARD_ORDER, newCardOrder);
    this.setState({ cardOrder: newCardOrder });
  };

  private handlePinChange = (cardId: string, isPinned: boolean): void => {
    this.setState((prevState) => {
      const newPinnedCardIds = isPinned
        ? [...prevState.pinnedCardIds, cardId]
        : prevState.pinnedCardIds.filter((id) => id !== cardId);
      saveToStorage(STORAGE_KEYS.PINNED_CARDS, newPinnedCardIds);
      return { pinnedCardIds: newPinnedCardIds };
    });
  };

  private handleHideCard = (cardId: string): void => {
    this.setState((prevState) => {
      const newHiddenCardIds = [...prevState.hiddenCardIds, cardId];
      saveToStorage(STORAGE_KEYS.HIDDEN_CARDS, newHiddenCardIds);
      return { hiddenCardIds: newHiddenCardIds };
    });
  };

  private handleRestoreCard = (cardId: string): void => {
    this.setState((prevState) => {
      const newHiddenCardIds = prevState.hiddenCardIds.filter((id) => id !== cardId);
      saveToStorage(STORAGE_KEYS.HIDDEN_CARDS, newHiddenCardIds);
      return { hiddenCardIds: newHiddenCardIds };
    });
  };

  private handleSidebarDefaultChange = (collapsed: boolean): void => {
    saveToStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    this.setState({ isSidebarCollapsed: collapsed });
  };

  private handleResetAll = (): void => {
    // Clear all localStorage keys
    const keys = [
      STORAGE_KEYS.CARD_ORDER,
      STORAGE_KEYS.PINNED_CARDS,
      STORAGE_KEYS.HIDDEN_CARDS,
      STORAGE_KEYS.SIDEBAR_COLLAPSED,
      STORAGE_KEYS.THEME_MODE,
    ];
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore errors
      }
    });

    // Reset state to defaults
    this.setState({
      isSidebarCollapsed: false,
      pinnedCardIds: [],
      hiddenCardIds: [],
      cardOrder: {},
      themeMode: 'light',
    });
  };

  private handleCardClick = (card: IFunctionCard): void => {
    if (card.url) {
      if (card.openInNewTab) {
        window.open(card.url, '_blank');
      } else {
        window.location.href = card.url;
      }
    }
    // For cards without URLs, could open a detail panel in future
  };

  public render(): React.ReactElement<IIntranetShellProps> {
    const { userDisplayName, userEmail, siteTitle } = this.props;
    const { isSidebarCollapsed, activeHubKey, pinnedCardIds, hiddenCardIds, isAdminMode, cardOrder, themeMode, isSettingsOpen } = this.state;

    const shellClassName = `${styles.shell} ${isSidebarCollapsed ? styles.shellCollapsed : ''}`;

    // Get cards for current hub
    const hubCards = sampleCards.filter((card) => card.hubKey === activeHubKey);
    const currentHub = hubInfo[activeHubKey] || { title: 'Hub', description: '' };

    // Get hidden cards with their details for settings panel
    const hiddenCardsWithDetails = hiddenCardIds
      .map((id) => {
        const card = sampleCards.find((c) => c.id === id);
        return card ? { id: card.id, title: card.title, hubKey: card.hubKey } : null;
      })
      .filter((card): card is { id: string; title: string; hubKey: string } => card !== null);

    // Extract first name for welcome message
    const firstName = userDisplayName.split(' ')[0];

    // Get hub-specific colors
    const hubColor = getHubColor(activeHubKey);

    return (
      <div className={shellClassName}>
        <Navbar
          siteTitle={siteTitle}
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          themeMode={themeMode}
          onThemeModeChange={this.handleThemeModeChange}
          onOpenSettings={this.handleOpenSettings}
          onToggleSidebar={this.handleToggleSidebar}
          isAdmin={isAdminMode}
          onToggleAdmin={this.handleToggleAdmin}
        />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activeHubKey={activeHubKey}
          onHubChange={this.handleHubChange}
        />
        <ContentArea>
          <div className={styles.heroBanner} style={{ background: hubColor.gradient }}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{currentHub.title}</h1>
              <p className={styles.heroSubtitle}>
                {activeHubKey === 'home'
                  ? `Welcome back, ${firstName}!`
                  : currentHub.description}
              </p>
            </div>
          </div>
          <div className={styles.cardArea}>
            <CardGrid
              cards={hubCards}
              hubKey={activeHubKey}
              pinnedCardIds={pinnedCardIds}
              hiddenCardIds={hiddenCardIds}
              savedOrder={cardOrder[activeHubKey]}
              isAdmin={isAdminMode}
              onOrderChange={this.handleCardOrderChange}
              onPinChange={this.handlePinChange}
              onHideCard={this.handleHideCard}
              onCardClick={this.handleCardClick}
            />
          </div>
        </ContentArea>
        <StatusBar userEmail={userEmail} />

        <SettingsPanel
          isOpen={isSettingsOpen}
          onDismiss={this.handleCloseSettings}
          themeMode={themeMode}
          onThemeModeChange={this.handleThemeModeChange}
          sidebarDefaultCollapsed={isSidebarCollapsed}
          onSidebarDefaultChange={this.handleSidebarDefaultChange}
          hiddenCards={hiddenCardsWithDetails}
          onRestoreCard={this.handleRestoreCard}
          onResetAll={this.handleResetAll}
        />
      </div>
    );
  }
}

// Also export as default for SPFx compatibility
export default IntranetShell;
