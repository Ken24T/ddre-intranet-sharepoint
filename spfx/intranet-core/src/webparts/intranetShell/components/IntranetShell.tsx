import * as React from 'react';
import styles from './IntranetShell.module.scss';
import type { IIntranetShellProps } from './IIntranetShellProps';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { ContentArea } from './ContentArea/ContentArea';
import { StatusBar } from './StatusBar/StatusBar';

export interface IIntranetShellState {
  isSidebarCollapsed: boolean;
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
    };
  }

  private handleToggleSidebar = (): void => {
    this.setState((prevState) => ({
      isSidebarCollapsed: !prevState.isSidebarCollapsed,
    }));
  };

  public render(): React.ReactElement<IIntranetShellProps> {
    const { userDisplayName, userEmail, siteTitle } = this.props;
    const { isSidebarCollapsed } = this.state;

    const shellClassName = `${styles.shell} ${isSidebarCollapsed ? styles.shellCollapsed : ''}`;

    return (
      <div className={shellClassName}>
        <Navbar
          siteTitle={siteTitle}
          userDisplayName={userDisplayName}
          onToggleSidebar={this.handleToggleSidebar}
        />
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <ContentArea>
          <h1 className={styles.contentTitle}>Welcome, {userDisplayName}</h1>
          <p className={styles.contentSubtitle}>
            Your personalized dashboard for DDRE operations
          </p>
          {/* Card grid will go here in Phase 2 */}
          <div style={{ marginTop: 24, padding: 24, background: '#f3f2f1', borderRadius: 8 }}>
            <p>🎉 Shell layout complete! Card grid coming in Phase 2.</p>
          </div>
        </ContentArea>
        <StatusBar userEmail={userEmail} />
      </div>
    );
  }
}

// Also export as default for SPFx compatibility
export default IntranetShell;
