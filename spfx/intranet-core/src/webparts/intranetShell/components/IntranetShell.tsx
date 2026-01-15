import * as React from 'react';
import styles from './IntranetShell.module.scss';
import type { IIntranetShellProps } from './IIntranetShellProps';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { ContentArea } from './ContentArea/ContentArea';
import { StatusBar } from './StatusBar/StatusBar';
import { CardGrid } from './CardGrid';
import { sampleCards, hubInfo } from './data';
import type { IFunctionCard } from './FunctionCard';

export interface IIntranetShellState {
  isSidebarCollapsed: boolean;
  activeHubKey: string;
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  cardOrder: Record<string, string[]>;
}

/**
 * IntranetShell - Main layout component for the DDRE Intranet.
 * Uses CSS Grid to create a fixed navbar, resizable sidebar,
 * fluid content area, and fixed status bar.
 */
export class IntranetShell extends React.Component<IIntranetShellProps, IIntranetShellState> {
  constructor(props: IIntranetShellProps) {
    super(props);
    this.state = {
      isSidebarCollapsed: false,
      activeHubKey: 'home',
      pinnedCardIds: [],
      hiddenCardIds: [],
      cardOrder: {},
    };
  }

  private handleToggleSidebar = (): void => {
    this.setState((prevState) => ({
      isSidebarCollapsed: !prevState.isSidebarCollapsed,
    }));
  };

  private handleHubChange = (hubKey: string): void => {
    this.setState({ activeHubKey: hubKey });
  };

  private handleCardOrderChange = (cardIds: string[]): void => {
    const { activeHubKey, cardOrder } = this.state;
    this.setState({
      cardOrder: {
        ...cardOrder,
        [activeHubKey]: cardIds,
      },
    });
  };

  private handlePinChange = (cardId: string, isPinned: boolean): void => {
    this.setState((prevState) => ({
      pinnedCardIds: isPinned
        ? [...prevState.pinnedCardIds, cardId]
        : prevState.pinnedCardIds.filter((id) => id !== cardId),
    }));
  };

  private handleHideCard = (cardId: string): void => {
    this.setState((prevState) => ({
      hiddenCardIds: [...prevState.hiddenCardIds, cardId],
    }));
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
    const { isSidebarCollapsed, activeHubKey, pinnedCardIds, hiddenCardIds } = this.state;

    const shellClassName = `${styles.shell} ${isSidebarCollapsed ? styles.shellCollapsed : ''}`;

    // Get cards for current hub
    const hubCards = sampleCards.filter((card) => card.hubKey === activeHubKey);
    const currentHub = hubInfo[activeHubKey] || { title: 'Hub', description: '' };

    return (
      <div className={shellClassName}>
        <Navbar
          siteTitle={siteTitle}
          userDisplayName={userDisplayName}
          onToggleSidebar={this.handleToggleSidebar}
        />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activeHubKey={activeHubKey}
          onHubChange={this.handleHubChange}
        />
        <ContentArea>
          <div className={styles.contentHeader}>
            <h1 className={styles.contentTitle}>{currentHub.title}</h1>
            <p className={styles.contentSubtitle}>{currentHub.description}</p>
          </div>
          <CardGrid
            cards={hubCards}
            pinnedCardIds={pinnedCardIds}
            hiddenCardIds={hiddenCardIds}
            onOrderChange={this.handleCardOrderChange}
            onPinChange={this.handlePinChange}
            onHideCard={this.handleHideCard}
            onCardClick={this.handleCardClick}
          />
        </ContentArea>
        <StatusBar userEmail={userEmail} />
      </div>
    );
  }
}

// Also export as default for SPFx compatibility
export default IntranetShell;
