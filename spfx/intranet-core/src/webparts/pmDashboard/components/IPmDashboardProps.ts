import type { IDashboardRepository } from "../services/IDashboardRepository";

export interface IPmDashboardProps {
  /** Current user's display name */
  userDisplayName: string;
  /** Whether the current SP theme is dark */
  isDarkTheme: boolean;
  /** Data access layer */
  repository: IDashboardRepository;
}
