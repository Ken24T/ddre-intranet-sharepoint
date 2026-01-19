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
}
