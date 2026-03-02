import type { IDashboardRepository } from "../services/IDashboardRepository";
import type { IPresenceRepository } from "../services/IPresenceRepository";

export interface IPmDashboardProps {
  /** Current user's display name */
  userDisplayName: string;
  /** Current user's email (login name) */
  userEmail: string;
  /** Whether the current SP theme is dark */
  isDarkTheme: boolean;
  /** Data access layer */
  repository: IDashboardRepository;
  /** Presence storage layer */
  presenceRepository: IPresenceRepository;
}
