/**
 * AuditTimeline — Displays a chronological list of audit log entries
 * for a specific entity (e.g. a budget).
 *
 * Shows each entry as a timestamped row with action icon, summary text,
 * and the user who made the change. Entries are displayed newest-first.
 *
 * Kept under 200 lines; uses Fluent UI primitives only.
 */

import * as React from "react";
import {
  Icon,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import type { IAuditLogger } from "../services/IAuditLogger";
import type { AuditEntry, AuditAction, AuditEntityType } from "../models/auditTypes";
import styles from "./MarketingBudget.module.scss";

// ─── Props ──────────────────────────────────────────────────

export interface IAuditTimelineProps {
  auditLogger: IAuditLogger;
  entityType: AuditEntityType;
  entityId: number;
}

// ─── Action → icon mapping ──────────────────────────────────

const ACTION_ICONS: Record<AuditAction, string> = {
  create: "Add",
  update: "Edit",
  delete: "Delete",
  statusChange: "Flow",
  import: "Upload",
  seed: "Database",
};

// ─── Helpers ────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Component ──────────────────────────────────────────────

export const AuditTimeline: React.FC<IAuditTimelineProps> = ({
  auditLogger,
  entityType,
  entityId,
}) => {
  const [entries, setEntries] = React.useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const results = await auditLogger.getByEntity(entityType, entityId);
        if (!cancelled) setEntries(results);
      } catch {
        // Silently fail — timeline is non-critical
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load(); // eslint-disable-line @typescript-eslint/no-floating-promises

    return (): void => {
      cancelled = true;
    };
  }, [auditLogger, entityType, entityId]);

  if (isLoading) {
    return (
      <div className={styles.centeredState}>
        <Spinner size={SpinnerSize.small} label="Loading history…" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Text variant="small" className={styles.emptyHint}>
        No change history recorded yet.
      </Text>
    );
  }

  return (
    <div
      className={styles.auditTimeline}
      data-testid="audit-timeline"
      role="list"
      aria-label="Change history"
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={styles.auditEntry}
          role="listitem"
        >
          <div className={styles.auditEntryIcon}>
            <Icon iconName={ACTION_ICONS[entry.action] || "Info"} />
          </div>
          <div className={styles.auditEntryBody}>
            <Text variant="smallPlus" className={styles.auditEntrySummary}>
              {entry.summary}
            </Text>
            <Text variant="tiny" className={styles.auditEntryMeta}>
              {entry.user} · {formatTimestamp(entry.timestamp)}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
};
