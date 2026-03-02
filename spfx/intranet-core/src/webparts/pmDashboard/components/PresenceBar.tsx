/**
 * PresenceBar – Shows coloured dots for users currently online.
 *
 * Each dot represents an active user. Hovering a dot shows a tooltip
 * with the user's display name and selected PM. The current user's
 * dot has a subtle ring. Dots for users who recently made changes
 * can optionally pulse (see P2.5 blinking).
 */

import * as React from "react";
import { TooltipHost, DirectionalHint, Stack } from "@fluentui/react";
import type { IPresenceUser } from "../services/IRealtimeService";
import styles from "./PmDashboard.module.scss";

export interface IPresenceBarProps {
  /** Currently online users. */
  users: IPresenceUser[];
  /** The current user's email/ID (to highlight their dot). */
  currentUserId: string;
}

/**
 * A compact presence bar rendered as a row of coloured dots.
 */
export const PresenceBar: React.FC<IPresenceBarProps> = ({
  users,
  currentUserId,
}) => {
  if (users.length === 0) return null;

  return (
    <Stack horizontal tokens={{ childrenGap: 6 }} verticalAlign="center" className={styles.presenceBar}>
      {users.map((user) => {
        const isSelf = user.userId === currentUserId;
        const tooltipContent = user.selectedPm
          ? `${user.displayName} (viewing ${user.selectedPm})`
          : user.displayName;

        return (
          <TooltipHost
            key={user.userId}
            content={tooltipContent}
            directionalHint={DirectionalHint.bottomCenter}
            calloutProps={{ gapSpace: 4 }}
          >
            <span
              className={`${styles.presenceDot}${isSelf ? ` ${styles.presenceDotSelf}` : ""}`}
              style={{ backgroundColor: user.colour || "#001cad" }}
              role="status"
              aria-label={`${user.displayName} is online`}
            />
          </TooltipHost>
        );
      })}
    </Stack>
  );
};
