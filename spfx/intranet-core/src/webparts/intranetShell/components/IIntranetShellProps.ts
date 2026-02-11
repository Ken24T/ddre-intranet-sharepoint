import * as React from 'react';

/**
 * Props for the IntranetShell component.
 * Keep SharePoint-specific concerns out - pass data as props.
 */
export interface IIntranetShellProps {
  /** User's display name from SharePoint context */
  userDisplayName: string;
  /** User's email address */
  userEmail: string;
  /** Site title for branding */
  siteTitle: string;
  /** App version string */
  appVersion: string;
  /** Optional: User is admin (can hide cards for all users) */
  isAdmin?: boolean;
  /** Optional: Dark theme flag (for future theme support) */
  isDarkTheme?: boolean;
  /** Optional: Teams context flag */
  hasTeamsContext?: boolean;
  /**
   * Dev-only: map of card IDs to inline React components.
   * When a card detail is opened and a matching renderer exists,
   * it is rendered directly instead of an iframe. This allows
   * the Vite dev harness to host multiple apps on a single port.
   *
   * Each renderer receives `{ isAdmin: boolean }` so it can
   * respect the shell's admin/user toggle.
   */
  cardDetailRenderers?: Record<string, React.ComponentType<{ isAdmin: boolean }>>;
}
