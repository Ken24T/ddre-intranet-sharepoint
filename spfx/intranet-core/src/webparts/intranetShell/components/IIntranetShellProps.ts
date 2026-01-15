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
  /** Optional: Dark theme flag (for future theme support) */
  isDarkTheme?: boolean;
  /** Optional: Teams context flag */
  hasTeamsContext?: boolean;
}
