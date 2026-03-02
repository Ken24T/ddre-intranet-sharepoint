/**
 * PresenceBar – Shows coloured dots for users currently online.
 *
 * Each dot represents an active user. Hovering a dot shows a tooltip
 * with the user's display name and selected PM. The current user's
 * dot has a subtle ring. Dots pulse when the user recently made a
 * data change (lastChanged within the blink window).
 */

import * as React from "react";
import { TooltipHost, DirectionalHint, Stack } from "@fluentui/react";
import type { IPresenceUser } from "../services/IRealtimeService";
import styles from "./PmDashboard.module.scss";

/** How recently a change must be to trigger the blink (ms). */
const BLINK_WINDOW_MS = 8000;

export interface IPresenceBarProps {
  /** Currently online users. */
  users: IPresenceUser[];
  /** The current user's email/ID (to highlight their dot). */
  currentUserId: string;
}

/**
 * Returns true if the user's lastChanged is within the blink window.
 */
function isRecentlyChanged(lastChanged: string): boolean {
  if (!lastChanged) return false;
  const changedAt = new Date(lastChanged).getTime();
  if (isNaN(changedAt)) return false;
  return Date.now() - changedAt < BLINK_WINDOW_MS;
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
        const blinking = isRecentlyChanged(user.lastChanged);
        const tooltipContent = user.selectedPm
          ? `${user.displayName} (viewing ${user.selectedPm})`
          : user.displayName;

        const classNames = [styles.presenceDot];
        if (isSelf) classNames.push(styles.presenceDotSelf);
        if (blinking) classNames.push(styles.presenceDotBlink);

        return (
          <TooltipHost
            key={user.userId}
            content={tooltipContent}
            directionalHint={DirectionalHint.bottomCenter}
            calloutProps={{ gapSpace: 4 }}
          >
            <span
              className={classNames.join(" ")}
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
