import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import styles from './IntranetShell.module.scss';
import type { IIntranetShellProps } from './IIntranetShellProps';

// Hero banner images
import heroHomeImage from '../assets/hero-home.svg';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { ContentArea } from './ContentArea/ContentArea';
import { StatusBar } from './StatusBar/StatusBar';
import { CardGrid } from './CardGrid';
import { SettingsPanel } from './SettingsPanel';
import { SearchResultsPage } from './SearchResultsPage';
import { AiAssistant } from './AiAssistant';
import { SkipLinks } from './SkipLinks';
import { sampleCards, hubInfo } from './data';
import type { IFunctionCard } from './FunctionCard';
import type { ISearchResult } from './SearchBox';
import { getHubColor, getResolvedTheme, getThemeCssVars, isDarkTheme } from './theme';
import type { ThemeMode } from './UserProfileMenu';

// Local storage key for AI Assistant visibility preference
const LOCAL_KEY_AI_HIDDEN = 'ddre-ai-assistant-hidden';

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
  /** Active search query (undefined when not searching) */
  searchQuery: string | undefined;
  /** AI Assistant hidden state (persisted) */
  isAiAssistantHidden: boolean;
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
  AI_ASSISTANT_HIDDEN: 'ddre-ai-assistant-hidden',
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

// =============================================================================
// HUB SURFACE COLOR HELPERS
// =============================================================================

const hexToRgb = (hex: string): { r: number; g: number; b: number } | undefined => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : undefined;
};

const getHubSurfaceColors = (accentColor?: string): { background: string; border: string } => {
  if (!accentColor) {
    return {
      background: 'var(--neutralLighter, #f3f2f1)',
      border: 'var(--neutralLight, #edebe9)',
    };
  }

  const rgb = hexToRgb(accentColor);
  if (!rgb) {
    return {
      background: 'rgba(255, 255, 255, 0.35)',
      border: 'rgba(0, 0, 0, 0.08)',
    };
  }

  const lightened = {
    r: Math.round(rgb.r + (255 - rgb.r) * 0.9),
    g: Math.round(rgb.g + (255 - rgb.g) * 0.9),
    b: Math.round(rgb.b + (255 - rgb.b) * 0.9),
  };

  return {
    background: `rgba(${lightened.r}, ${lightened.g}, ${lightened.b}, 0.35)`,
    border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
  };
};

/**
 * IntranetShell - Main layout component for the DDRE Intranet.
 * Uses CSS Grid to create a fixed navbar, resizable sidebar,
 * fluid content area, and fixed status bar.
 */
export class IntranetShell extends React.Component<IIntranetShellProps, IIntranetShellState> {
  private systemThemeMediaQuery: MediaQueryList | null = null;

  constructor(props: IIntranetShellProps) {
    super(props);
    
    // Load AI hidden state from localStorage
    let isAiHidden = false;
    try {
      isAiHidden = localStorage.getItem(LOCAL_KEY_AI_HIDDEN) === 'true';
    } catch {
      // Ignore storage errors
    }

    this.state = {
      isSidebarCollapsed: loadFromStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
      activeHubKey: 'home',
      pinnedCardIds: loadFromStorage(STORAGE_KEYS.PINNED_CARDS, []),
      hiddenCardIds: loadFromStorage(STORAGE_KEYS.HIDDEN_CARDS, []),
      cardOrder: loadFromStorage(STORAGE_KEYS.CARD_ORDER, {}),
      isAdminMode: props.isAdmin ?? false,
      themeMode: loadFromStorage(STORAGE_KEYS.THEME_MODE, 'light'),
      isSettingsOpen: false,
      searchQuery: undefined,
      isAiAssistantHidden: isAiHidden,
    };
  }

  public componentDidMount(): void {
    // Listen for system theme changes when in 'system' mode
    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }

  public componentWillUnmount(): void {
    if (this.systemThemeMediaQuery) {
      this.systemThemeMediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
  }

  private handleSystemThemeChange = (): void => {
    // Force re-render when system theme changes (only matters if themeMode is 'system')
    if (this.state.themeMode === 'system') {
      this.forceUpdate();
    }
  };

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
      STORAGE_KEYS.AI_ASSISTANT_HIDDEN,
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
      isAiAssistantHidden: false,
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

  private handleSearch = (query: string): void => {
    // Show search results page with the query
    this.setState({ searchQuery: query });
  };

  private handleSearchResultSelect = (result: ISearchResult): void => {
    // Navigate to the selected result
    if (result.url && result.url !== '#') {
      window.location.href = result.url;
    }
  };

  private handleClearSearch = (): void => {
    this.setState({ searchQuery: undefined });
  };

  private handleHideAiAssistant = (): void => {
    try {
      localStorage.setItem(LOCAL_KEY_AI_HIDDEN, 'true');
    } catch {
      // Ignore storage errors
    }
    this.setState({ isAiAssistantHidden: true });
  };

  private handleShowAiAssistant = (): void => {
    try {
      localStorage.removeItem(LOCAL_KEY_AI_HIDDEN);
    } catch {
      // Ignore storage errors
    }
    this.setState({ isAiAssistantHidden: false });
  };

  public render(): React.ReactElement<IIntranetShellProps> {
    const { userDisplayName, userEmail, siteTitle } = this.props;
    const { isSidebarCollapsed, activeHubKey, pinnedCardIds, hiddenCardIds, isAdminMode, cardOrder, themeMode, isSettingsOpen, searchQuery, isAiAssistantHidden } = this.state;

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
    const hubSurface = getHubSurfaceColors(hubColor.accent);

    // Resolve theme based on mode (light/dark/system)
    const resolvedTheme = getResolvedTheme(themeMode);
    const themeCssVars = getThemeCssVars(resolvedTheme);
    const shellStyle = {
      ...themeCssVars,
      '--hub-surface-bg': hubSurface.background,
      '--hub-surface-border': hubSurface.border,
    } as React.CSSProperties;
    const isCurrentlyDark = isDarkTheme(themeMode);

    // Build shell class with theme modifier
    const shellClassName = [
      styles.shell,
      isSidebarCollapsed ? styles.shellCollapsed : '',
      isCurrentlyDark ? styles.shellDark : '',
    ].filter(Boolean).join(' ');

    return (
      <ThemeProvider theme={resolvedTheme}>
        <SkipLinks />
        <div className={shellClassName} style={shellStyle}>
        <Navbar
          siteTitle={siteTitle}
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          themeMode={themeMode}
          onThemeModeChange={this.handleThemeModeChange}
          onOpenSettings={this.handleOpenSettings}
          onToggleSidebar={this.handleToggleSidebar}
          onSearch={this.handleSearch}
          onSearchResultSelect={this.handleSearchResultSelect}
          isAdmin={isAdminMode}
          onToggleAdmin={this.handleToggleAdmin}
          isAiAssistantHidden={isAiAssistantHidden}
          onShowAiAssistant={this.handleShowAiAssistant}
          onHideAiAssistant={this.handleHideAiAssistant}
        />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activeHubKey={activeHubKey}
          onHubChange={this.handleHubChange}
        />
        <ContentArea>
          {searchQuery ? (
            <SearchResultsPage
              query={searchQuery}
              onClearSearch={this.handleClearSearch}
            />
          ) : (
            <>
              <div className={styles.heroBanner} style={{ background: hubColor.gradient }}>
                <div className={styles.heroContent}>
                  <h1 className={styles.heroTitle}>{currentHub.title}</h1>
                  <p className={styles.heroSubtitle}>
                    {activeHubKey === 'home'
                      ? `Welcome back, ${firstName}!`
                      : currentHub.description}
                  </p>
                </div>
                {activeHubKey === 'home' && (
                  <img
                    src={heroHomeImage}
                    alt=""
                    className={styles.heroImage}
                    aria-hidden="true"
                  />
                )}
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
            </>
          )}
        </ContentArea>
        <StatusBar userDisplayName={userDisplayName} />

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
          isAiAssistantHidden={isAiAssistantHidden}
          onShowAiAssistant={this.handleShowAiAssistant}
          onHideAiAssistant={this.handleHideAiAssistant}
        />

        {/* AI Assistant */}
        <AiAssistant
          isHidden={isAiAssistantHidden}
          onHide={this.handleHideAiAssistant}
          accentColor={hubColor.accent}
        />
        </div>
      </ThemeProvider>
    );
  }
}

// Also export as default for SPFx compatibility
export default IntranetShell;
