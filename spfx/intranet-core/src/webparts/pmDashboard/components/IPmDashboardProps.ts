import type { IDashboardRepository } from "../services/IDashboardRepository";

export interface IPmDashboardProps {
  /** Current user's display name */
  userDisplayName: string;
  /** Current user's email (login name) */
  userEmail: string;
  /** Whether the current SP theme is dark */
  isDarkTheme: boolean;
  /** Data access layer */
  repository: IDashboardRepository;
}
