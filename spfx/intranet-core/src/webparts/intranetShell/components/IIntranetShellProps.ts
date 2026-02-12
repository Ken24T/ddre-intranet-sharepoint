import * as React from 'react';
import type { IAuditEventMessage } from './appBridge';
import type { HubKey } from './services/ShellGroupResolver';

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
  /** SharePoint site absolute URL (e.g. https://disher.sharepoint.com/sites/dev-intranet) */
  siteUrl?: string;
  /** App version string */
  appVersion: string;
  /** Optional: User is admin (member of DDRE-Admins group) */
  isAdmin?: boolean;
  /** Hub keys the user is allowed to see (resolved from SP group membership) */
  visibleHubs?: HubKey[];
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
  /**
   * Callback invoked when an embedded app sends an AUDIT_EVENT message.
   * Wired by IntranetShellWithTasks using useAudit().
   */
  onAppAuditEvent?: (event: IAuditEventMessage) => void;
}
