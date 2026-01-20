import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import type { ITheme } from '@fluentui/react';
import styles from './IntranetShell.module.scss';
import type { IIntranetShellProps } from './IIntranetShellProps';

// Hero banner images
import heroHomeImageLightBlue from '../assets/hero-home-queenslander-light-blue.png';
import heroPropertyManagementImageLightBlue from '../assets/hero-property-management-hightrise-light-blue.png';
import heroSalesImageLightBlue from '../assets/hero-sales-low-rise-light-blue.png';
import heroOfficeImageLightBlue from '../assets/hero-office-palm-tree-light-blue.png';
import heroAdministrationImageLightBlue from '../assets/hero-administration-villa-light-blue.png';
import heroLibraryImageLightBlue from '../assets/hero-library-shop-light-blue.png';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { ContentArea } from './ContentArea/ContentArea';
import { StatusBar } from './StatusBar/StatusBar';
import { CardGrid } from './CardGrid';
import { SettingsPanel } from './SettingsPanel';
import { SearchResultsPage } from './SearchResultsPage';
import { AiAssistant } from './AiAssistant';
import { HelpCenter } from './HelpCenter/HelpCenter';
import { AuditLogViewer } from './AuditLogViewer';
import { SkipLinks } from './SkipLinks';
import { TasksPanelContainer } from './tasks/widgets/TasksPanelContainer';
import { MyTasksWidgetContainer } from './tasks/widgets/MyTasksWidgetContainer';
import { sampleCards, hubInfo } from './data';
import type { CardOpenBehavior, IFunctionCard } from './FunctionCard';
import type { IFavouriteCard } from './favouritesTypes';
import type { ISearchResult } from './SearchBox';
import { getHubColor, getResolvedTheme, getThemeCssVars, isDarkTheme } from './theme';
import type { ThemeMode } from './UserProfileMenu';
import { openMockHelpWindow } from './utils/helpMock';

// Local storage key for AI Assistant hidden state (mocked global setting)
const LOCAL_KEY_AI_HIDDEN = 'ddre-intranet-global-aiAssistantHidden';

export interface IIntranetShellState {
  isSidebarCollapsed: boolean;
  activeHubKey: string;
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  cardOrder: Record<string, string[]>;
  /** Admin-configured card open behavior overrides */
  cardOpenBehavior: Record<string, CardOpenBehavior>;
  /** Dev mode: toggle admin rights */
  isAdminMode: boolean;
  /** Current theme mode */
  themeMode: ThemeMode;
  /** Settings panel open state */
  isSettingsOpen: boolean;
  /** Active search query (undefined when not searching) */
  searchQuery: string | undefined;
  /** Active card opened inline */
  activeCardId?: string;
  /** AI Assistant hidden state (global) */
  isAiAssistantHidden: boolean;
  /** Help Centre open state */
  isHelpOpen: boolean;
  /** User favourites (per-user storage) */
  favourites: IFavouriteCard[];
  /** Tasks panel open state */
  isTasksPanelOpen: boolean;
}

/**
 * LocalStorage keys for user preferences
 */
const STORAGE_KEYS = {
  CARD_ORDER: 'ddre-intranet-cardOrder',
  PINNED_CARDS: 'ddre-intranet-pinnedCards',
  HIDDEN_CARDS: 'ddre-intranet-hiddenCards',
  FAVOURITES: 'ddre-intranet-favourites',
  SIDEBAR_COLLAPSED: 'ddre-intranet-sidebarCollapsed',
  THEME_MODE: 'ddre-intranet-themeMode',
};

/**
 * LocalStorage keys for global (admin) preferences - mocked locally in dev
 */
const GLOBAL_STORAGE_KEYS = {
  CARD_OPEN_BEHAVIOR: 'ddre-intranet-global-cardOpenBehavior',
  AI_ASSISTANT_HIDDEN: 'ddre-intranet-global-aiAssistantHidden',
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

const toRgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const getHubSurfaceColors = (
  accentColor: string | undefined,
  theme: ITheme,
  isDark: boolean
): { background: string; border: string } => {
  if (isDark) {
    return {
      background: theme.palette.neutralLighter,
      border: theme.palette.neutralLight,
    };
  }

  if (!accentColor) {
    return {
      background: 'var(--neutralLighter, #f3f2f1)',
      border: 'var(--neutralLight, #edebe9)',
    };
  }

  const rgb = hexToRgb(accentColor);
  if (!rgb) {
    return {
      background: 'rgba(255, 255, 255, 0.45)',
      border: 'rgba(0, 0, 0, 0.1)',
    };
  }

  const lightened = {
    r: Math.round(rgb.r + (255 - rgb.r) * 0.85),
    g: Math.round(rgb.g + (255 - rgb.g) * 0.85),
    b: Math.round(rgb.b + (255 - rgb.b) * 0.85),
  };

  return {
    background: `rgba(${lightened.r}, ${lightened.g}, ${lightened.b}, 0.45)`,
    border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
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
    
    // Load AI hidden state from mocked global storage
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
      cardOpenBehavior: loadFromStorage(GLOBAL_STORAGE_KEYS.CARD_OPEN_BEHAVIOR, {}),
      isAdminMode: props.isAdmin ?? false,
      themeMode: loadFromStorage(STORAGE_KEYS.THEME_MODE, 'light'),
      isSettingsOpen: false,
      searchQuery: undefined,
      activeCardId: undefined,
      isAiAssistantHidden: isAiHidden,
      isHelpOpen: false,
      favourites: loadFromStorage(STORAGE_KEYS.FAVOURITES, []),
      isTasksPanelOpen: false,
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
    this.setState({ isSettingsOpen: true, isHelpOpen: false });
  };

  private handleCloseSettings = (): void => {
    this.setState({ isSettingsOpen: false });
  };

  private handleHubChange = (hubKey: string): void => {
    this.setState({
      activeHubKey: hubKey,
      activeCardId: undefined,
      searchQuery: undefined,
      isHelpOpen: false,
    });
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

  private handleFavouriteChange = (cardId: string, isFavourite: boolean): void => {
    const sourceCard = sampleCards.find((card) => card.id === cardId);
    if (!sourceCard) {
      return;
    }

    this.setState((prevState) => {
      const alreadyFavourite = prevState.favourites.some((fav) => fav.cardId === cardId);

      if (isFavourite && alreadyFavourite) {
        return null;
      }

      if (!isFavourite && !alreadyFavourite) {
        return null;
      }

      const updatedFavourites = isFavourite
        ? [
            ...prevState.favourites,
            {
              cardId,
              sourceHubKey: sourceCard.hubKey,
              addedAt: new Date().toISOString(),
            },
          ]
        : prevState.favourites.filter((fav) => fav.cardId !== cardId);

      saveToStorage(STORAGE_KEYS.FAVOURITES, updatedFavourites);

      const shouldExitFavourites = updatedFavourites.length === 0 && prevState.activeHubKey === 'favourites';

      return {
        favourites: updatedFavourites,
        activeHubKey: shouldExitFavourites ? 'home' : prevState.activeHubKey,
        activeCardId: shouldExitFavourites ? undefined : prevState.activeCardId,
      };
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

  private getCardOpenBehavior = (card: IFunctionCard): CardOpenBehavior => {
    const { cardOpenBehavior } = this.state;
    if (cardOpenBehavior[card.id]) {
      return cardOpenBehavior[card.id];
    }
    if (card.openBehavior) {
      return card.openBehavior;
    }
    if (card.openInNewTab) {
      return 'newTab';
    }
    return 'inline';
  };

  private handleCardOpenBehaviorChange = (cardId: string, behavior: CardOpenBehavior): void => {
    this.setState((prevState) => {
      const newBehaviors = {
        ...prevState.cardOpenBehavior,
        [cardId]: behavior,
      };
      saveToStorage(GLOBAL_STORAGE_KEYS.CARD_OPEN_BEHAVIOR, newBehaviors);
      return { cardOpenBehavior: newBehaviors };
    });
  };

  private handleResetAll = (): void => {
    // Clear all localStorage keys
    const keys = [
      STORAGE_KEYS.CARD_ORDER,
      STORAGE_KEYS.PINNED_CARDS,
      STORAGE_KEYS.HIDDEN_CARDS,
      STORAGE_KEYS.FAVOURITES,
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

    // Clear mocked global settings only for admins
    if (this.state.isAdminMode) {
      try {
        localStorage.removeItem(GLOBAL_STORAGE_KEYS.CARD_OPEN_BEHAVIOR);
        localStorage.removeItem(GLOBAL_STORAGE_KEYS.AI_ASSISTANT_HIDDEN);
      } catch {
        // Ignore errors
      }
    }

    // Reset state to defaults
    this.setState({
      isSidebarCollapsed: false,
      pinnedCardIds: [],
      hiddenCardIds: [],
      cardOrder: {},
      favourites: [],
      cardOpenBehavior: this.state.isAdminMode
        ? {}
        : this.state.cardOpenBehavior,
      themeMode: 'light',
      activeCardId: undefined,
      activeHubKey: 'home',
      isAiAssistantHidden: this.state.isAdminMode
        ? false
        : this.state.isAiAssistantHidden,
    });
  };

  private handleCardClick = (card: IFunctionCard): void => {
    const behavior = this.getCardOpenBehavior(card);

    if (behavior === 'inline') {
      this.setState({ activeCardId: card.id });
      return;
    }

    if (behavior === 'newTab') {
      if (card.url) {
        window.open(card.url, '_blank');
      } else {
        this.openMockCardWindow(card, false);
      }
      return;
    }

    // newWindow
    if (card.url) {
      const width = window.screen?.width || 1280;
      const height = window.screen?.height || 720;
      const features = `popup=yes,width=${width},height=${height},left=0,top=0`;
      window.open(card.url, '_blank', features);
    } else {
      this.openMockCardWindow(card, true);
    }
  };

  private handleCloseCardDetail = (): void => {
    this.setState({ activeCardId: undefined });
  };

  private getMockCardHtml = (card: IFunctionCard): string => {
    const safeTitle = card.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeDescription = card.description
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 24px; background: #f9fafb; color: #323130; }
    .card { background: #fff; border: 1px solid #edebe9; border-radius: 12px; padding: 24px; max-width: 720px; box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 12px; color: #605e5c; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #c7e0f4; color: #005a9e; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Mock Content</span>
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>
    <p>This is a placeholder for the app/tool. It will be replaced when the real app is available.</p>
  </div>
</body>
</html>`;
  };

  private openMockCardWindow = (card: IFunctionCard, popup: boolean): void => {
    const width = window.screen?.width || 1280;
    const height = window.screen?.height || 720;
    const features = popup
      ? `popup=yes,width=${width},height=${height},left=0,top=0`
      : undefined;
    const newWindow = window.open('', '_blank', features);
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(this.getMockCardHtml(card));
      newWindow.document.close();
    }
  };

  private handleSearch = (query: string): void => {
    // Show search results page with the query
    this.setState({ searchQuery: query, isHelpOpen: false });
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

  private handleOpenHelp = (): void => {
    this.setState({ isHelpOpen: true, searchQuery: undefined, activeCardId: undefined });
  };

  private handleCloseHelp = (): void => {
    this.setState({ isHelpOpen: false });
  };

  private handleToggleTasksPanel = (): void => {
    this.setState((prevState) => ({
      isTasksPanelOpen: !prevState.isTasksPanelOpen,
    }));
  };

  private handleCloseTasksPanel = (): void => {
    this.setState({ isTasksPanelOpen: false });
  };

  private handleCardHelp = (card: IFunctionCard): void => {
    openMockHelpWindow({
      title: card.title,
      summary: card.description,
      helpUrl: card.helpUrl,
    });
  };

  private handleHideAiAssistant = (): void => {
    try {
      localStorage.setItem(GLOBAL_STORAGE_KEYS.AI_ASSISTANT_HIDDEN, 'true');
    } catch {
      // Ignore storage errors
    }
    this.setState({ isAiAssistantHidden: true });
  };

  private handleShowAiAssistant = (): void => {
    try {
      localStorage.removeItem(GLOBAL_STORAGE_KEYS.AI_ASSISTANT_HIDDEN);
    } catch {
      // Ignore storage errors
    }
    this.setState({ isAiAssistantHidden: false });
  };

  public render(): React.ReactElement<IIntranetShellProps> {
    const { userDisplayName, userEmail, siteTitle } = this.props;
    const {
      isSidebarCollapsed,
      activeHubKey,
      pinnedCardIds,
      hiddenCardIds,
      isAdminMode,
      cardOrder,
      cardOpenBehavior,
      themeMode,
      isSettingsOpen,
      searchQuery,
      activeCardId,
      isAiAssistantHidden,
      isHelpOpen,
      favourites,
      isTasksPanelOpen,
    } = this.state;

    // Get cards for current hub
    const hubCards = activeHubKey === 'favourites'
      ? favourites
          .map((fav) => sampleCards.find((card) => card.id === fav.cardId))
          .filter((card): card is IFunctionCard => Boolean(card))
      : sampleCards.filter((card) => card.hubKey === activeHubKey);
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

    // Active card (inline view)
    const activeCard = activeCardId
      ? sampleCards.find((card) => card.id === activeCardId)
      : undefined;

    // Card list for admin settings
    const cardList = sampleCards.map((card) => ({
      id: card.id,
      title: card.title,
      hubKey: card.hubKey,
    }));

    // Resolve theme based on mode (light/dark/system)
    const resolvedTheme = getResolvedTheme(themeMode);
    const isCurrentlyDark = isDarkTheme(themeMode);

    // Get hub-specific colors
    const themeHubKey = isHelpOpen ? 'help' : activeHubKey;
    const hubColor = getHubColor(themeHubKey);
    const hubSurface = getHubSurfaceColors(hubColor.accent, resolvedTheme, isCurrentlyDark);
    const aiAccentColor = hubColor.accent;
    const searchThemeVars = ((): React.CSSProperties => {
      if (isHelpOpen) {
        return {
          '--search-trigger-color': '#6b4a00',
          '--search-trigger-hover-color': '#4a3200',
          '--search-trigger-hover-bg': 'rgba(255, 255, 255, 0.4)',
          '--search-input-bg': 'rgba(255, 255, 255, 0.6)',
          '--search-icon-color': '#6b4a00',
          '--search-input-text': '#4a3200',
          '--search-input-placeholder': '#8a5a00',
          '--search-clear-color': '#6b4a00',
          '--search-clear-hover-color': '#4a3200',
          '--search-clear-hover-bg': 'rgba(255, 255, 255, 0.45)',
          '--search-dropdown-bg': 'rgba(255, 232, 160, 0.98)',
          '--search-dropdown-border': 'rgba(190, 140, 0, 0.25)',
          '--search-group-header': '#7a4b00',
          '--search-result-hover-bg': 'rgba(255, 255, 255, 0.6)',
          '--search-result-focus': 'rgba(122, 75, 0, 0.5)',
          '--search-result-icon': '#7a4b00',
          '--search-result-title': '#4a3200',
          '--search-result-meta': '#7a4b00',
          '--search-footer-bg': 'rgba(255, 222, 120, 0.9)',
          '--search-footer-text': '#4a3200',
          '--search-footer-hover-bg': 'rgba(255, 255, 255, 0.6)',
          '--search-empty-icon': '#7a4b00',
          '--search-empty-text': '#4a3200',
          '--search-empty-hint': '#7a4b00',
        } as React.CSSProperties;
      }

      const accent = hubColor.accent || '#0078d4';
      return {
        '--search-trigger-color': 'rgba(255, 255, 255, 0.85)',
        '--search-trigger-hover-color': '#ffffff',
        '--search-trigger-hover-bg': 'rgba(255, 255, 255, 0.15)',
        '--search-input-bg': 'rgba(255, 255, 255, 0.25)',
        '--search-icon-color': 'rgba(255, 255, 255, 0.95)',
        '--search-input-text': '#ffffff',
        '--search-input-placeholder': 'rgba(255, 255, 255, 0.75)',
        '--search-clear-color': 'rgba(255, 255, 255, 0.8)',
        '--search-clear-hover-color': '#ffffff',
        '--search-clear-hover-bg': 'rgba(255, 255, 255, 0.2)',
        '--search-dropdown-bg': toRgba(accent, 0.92),
        '--search-dropdown-border': 'rgba(255, 255, 255, 0.2)',
        '--search-group-header': 'rgba(255, 255, 255, 0.75)',
        '--search-result-hover-bg': 'rgba(255, 255, 255, 0.12)',
        '--search-result-focus': 'rgba(255, 255, 255, 0.55)',
        '--search-result-icon': 'rgba(255, 255, 255, 0.8)',
        '--search-result-title': '#ffffff',
        '--search-result-meta': 'rgba(255, 255, 255, 0.7)',
        '--search-footer-bg': toRgba(accent, 0.7),
        '--search-footer-text': 'rgba(255, 255, 255, 0.95)',
        '--search-footer-hover-bg': 'rgba(255, 255, 255, 0.15)',
        '--search-empty-icon': 'rgba(255, 255, 255, 0.8)',
        '--search-empty-text': '#ffffff',
        '--search-empty-hint': 'rgba(255, 255, 255, 0.7)',
      } as React.CSSProperties;
    })();

    const themeCssVars = getThemeCssVars(resolvedTheme);
    const shellStyle = {
      ...themeCssVars,
      '--hub-surface-bg': hubSurface.background,
      '--hub-surface-border': hubSurface.border,
    } as React.CSSProperties;

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
          hubGradient={hubColor.gradient}
          textColor={isHelpOpen ? '#4a3200' : undefined}
          searchThemeVars={searchThemeVars}
          avatarAccentColor={aiAccentColor}
          themeMode={themeMode}
          onThemeModeChange={this.handleThemeModeChange}
          onOpenSettings={this.handleOpenSettings}
          onToggleSidebar={this.handleToggleSidebar}
          onSearch={this.handleSearch}
          onSearchResultSelect={this.handleSearchResultSelect}
          onOpenHelp={this.handleOpenHelp}
          isAdmin={isAdminMode}
          onToggleAdmin={this.handleToggleAdmin}
          isAiAssistantHidden={isAiAssistantHidden}
          onShowAiAssistant={this.handleShowAiAssistant}
          onHideAiAssistant={this.handleHideAiAssistant}
          pendingTaskCount={0}
          isTasksLoading={false}
          isTasksPanelOpen={isTasksPanelOpen}
          onToggleTasks={this.handleToggleTasksPanel}
        />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activeHubKey={activeHubKey}
          hasFavourites={favourites.length > 0}
          onHubChange={this.handleHubChange}
          onOpenHelp={this.handleOpenHelp}
        />
        <ContentArea>
          {isHelpOpen ? (
            <HelpCenter
              cards={sampleCards.filter((card) => hiddenCardIds.indexOf(card.id) === -1)}
              onClose={this.handleCloseHelp}
            />
          ) : searchQuery ? (
            <SearchResultsPage
              query={searchQuery}
              onClearSearch={this.handleClearSearch}
            />
          ) : activeCard ? (
            <div className={styles.cardDetail}>
              <div className={styles.cardDetailHeader}>
                <div>
                  <h2 className={styles.cardDetailTitle}>{activeCard.title}</h2>
                  <p className={styles.cardDetailDescription}>{activeCard.description}</p>
                </div>
                <button
                  className={styles.cardDetailClose}
                  onClick={this.handleCloseCardDetail}
                  type="button"
                >
                  Back to cards
                </button>
              </div>
              {activeCard.id === 'audit-logs' ? (
                <AuditLogViewer />
              ) : activeCard.id === 'my-tasks' ? (
                <div className={styles.cardDetailFrame}>
                  <div className={styles.cardDetailWidget}>
                    <MyTasksWidgetContainer
                      accentColor={hubColor.accent}
                      onViewAll={this.handleToggleTasksPanel}
                      onAddTask={this.handleToggleTasksPanel}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.cardDetailFrame}>
                    <iframe
                      src={activeCard.url || undefined}
                      srcDoc={activeCard.url ? undefined : this.getMockCardHtml(activeCard)}
                      title={activeCard.title}
                      className={styles.cardDetailIframe}
                    />
                  </div>
                  <button
                    className={styles.cardDetailAction}
                    onClick={() =>
                      activeCard.url
                        ? window.open(activeCard.url, '_blank')
                        : this.openMockCardWindow(activeCard, false)
                    }
                    type="button"
                  >
                    Open in new tab
                  </button>
                </>
              )}
            </div>
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
                    src={heroHomeImageLightBlue}
                    alt=""
                    className={styles.heroImage}
                    aria-hidden="true"
                  />
                )}
                {activeHubKey === 'property-management' && (
                  <img
                    src={heroPropertyManagementImageLightBlue}
                    alt=""
                    className={styles.heroImage}
                    aria-hidden="true"
                  />
                )}
                {activeHubKey === 'sales' && (
                  <img
                    src={heroSalesImageLightBlue}
                    alt=""
                    className={styles.heroImage}
                    aria-hidden="true"
                  />
                )}
                {activeHubKey === 'office' && (
                  <img
                    src={heroOfficeImageLightBlue}
                    alt=""
                    className={styles.heroImage}
                    aria-hidden="true"
                  />
                )}
                {activeHubKey === 'administration' && (
                  <img
                    src={heroAdministrationImageLightBlue}
                    alt=""
                    className={styles.heroImage}
                    aria-hidden="true"
                  />
                )}
                {activeHubKey === 'library' && (
                  <img
                    src={heroLibraryImageLightBlue}
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
                  favouriteCardIds={favourites.map((fav) => fav.cardId)}
                  cardOpenBehaviors={cardOpenBehavior}
                  savedOrder={cardOrder[activeHubKey]}
                  isAdmin={isAdminMode}
                  onOrderChange={this.handleCardOrderChange}
                  onPinChange={this.handlePinChange}
                  onHideCard={this.handleHideCard}
                  onFavouriteChange={this.handleFavouriteChange}
                  onCardOpenBehaviorChange={this.handleCardOpenBehaviorChange}
                  onCardClick={this.handleCardClick}
                  onCardHelp={this.handleCardHelp}
                />
              </div>
            </>
          )}
        </ContentArea>
        <StatusBar userDisplayName={userDisplayName} appVersion={this.props.appVersion} />

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
          isAdmin={isAdminMode}
          cards={cardList}
          cardOpenBehaviors={cardOpenBehavior}
          onCardOpenBehaviorChange={this.handleCardOpenBehaviorChange}
          isAiAssistantHidden={isAiAssistantHidden}
          onShowAiAssistant={this.handleShowAiAssistant}
          onHideAiAssistant={this.handleHideAiAssistant}
        />

        {/* Tasks Panel - Phase 15 */}
        <TasksPanelContainer
          isOpen={isTasksPanelOpen}
          onDismiss={this.handleCloseTasksPanel}
        />

        {/* AI Assistant */}
        <AiAssistant
          isHidden={isAiAssistantHidden}
          onHide={this.handleHideAiAssistant}
          accentColor={aiAccentColor}
        />
        </div>
      </ThemeProvider>
    );
  }
}

// Also export as default for SPFx compatibility
export default IntranetShell;
