/**
 * MaintenanceView – Maintenance request tracking view.
 *
 * Lists all maintenance requests with status and priority badges.
 * Supports filtering by status (open, in progress, completed, cancelled).
 */

import * as React from "react";
import {
  Dropdown,
  type IDropdownOption,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Icon,
} from "@fluentui/react";
import type {
  IPropertyMeService,
  MaintenanceRequest,
  Property,
} from "../../services/IPropertyMeService";
import styles from "../PmDashboard.module.scss";

export interface IMaintenanceViewProps {
  service: IPropertyMeService;
}

type MaintenanceStatusFilter = "all" | "open" | "in_progress" | "completed" | "cancelled";

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: "all", text: "All statuses" },
  { key: "open", text: "Open" },
  { key: "in_progress", text: "In Progress" },
  { key: "completed", text: "Completed" },
  { key: "cancelled", text: "Cancelled" },
];

const PRIORITY_CLASS_MAP: Record<string, string> = {
  urgent: styles.priorityUrgent,
  high: styles.priorityHigh,
  medium: styles.priorityMedium,
  low: styles.priorityLow,
};

const STATUS_CLASS_MAP: Record<string, string> = {
  open: styles.statusOpen,
  in_progress: styles.statusInProgress,
  completed: styles.statusCompleted,
  cancelled: styles.statusCancelled,
};

/** Format ISO timestamp to a readable date string. */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Format status string for display (e.g. "in_progress" → "In Progress"). */
function formatStatus(status: string): string {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const MaintenanceView: React.FC<IMaintenanceViewProps> = ({ service }) => {
  const [requests, setRequests] = React.useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = React.useState<Map<string, Property>>(new Map());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();
  const [statusFilter, setStatusFilter] = React.useState<MaintenanceStatusFilter>("all");

  // Load maintenance requests and properties for address lookup
  React.useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        const [maint, allProperties] = await Promise.all([
          statusFilter === "all"
            ? service.listMaintenance()
            : service.listMaintenance({ status: statusFilter as "open" | "in_progress" | "completed" | "cancelled" }),
          service.listProperties({ status: "all" }),
        ]);

        if (!cancelled) {
          setRequests(maint);
          const propMap = new Map<string, Property>();
          allProperties.forEach((p) => propMap.set(p.id, p));
          setProperties(propMap);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load maintenance requests");
          setLoading(false);
        }
      }
    };

    load().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [service, statusFilter]);

  const handleStatusChange = React.useCallback(
    (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
      if (option) {
        setStatusFilter(option.key as MaintenanceStatusFilter);
      }
    },
    [],
  );

  /** Get property address for a maintenance request. */
  const getPropertyAddress = React.useCallback(
    (propertyId: string): string => {
      const prop = properties.get(propertyId);
      if (!prop) return propertyId;
      return `${prop.address.street}, ${prop.address.suburb}`;
    },
    [properties],
  );

  // Count by status for summary
  const openCount = requests.filter(
    (r) => r.status === "open" || r.status === "in_progress",
  ).length;

  return (
    <div className={styles.maintenanceView}>
      {/* Controls */}
      <div className={styles.maintenanceControls}>
        <Dropdown
          selectedKey={statusFilter}
          options={STATUS_OPTIONS}
          onChange={handleStatusChange}
          styles={{ root: { width: 180 } }}
          label="Filter by status"
        />
        {!loading && (
          <span style={{ fontSize: 12, color: "#605e5c", alignSelf: "flex-end", paddingBottom: 4 }}>
            {requests.length} request{requests.length !== 1 ? "s" : ""}
            {statusFilter === "all" && openCount > 0 && ` (${openCount} open/in-progress)`}
          </span>
        )}
      </div>

      {/* Loading / Error */}
      {loading && (
        <Spinner size={SpinnerSize.small} label="Loading maintenance requests..." />
      )}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      {/* Maintenance List */}
      {!loading && !error && (
        <div className={styles.maintenanceList}>
          {requests.map((req) => (
            <div key={req.id} className={styles.maintenanceItem}>
              <div className={styles.maintenanceHeader}>
                <div>
                  <div className={styles.maintenanceDescription}>
                    {req.description}
                  </div>
                  <div className={styles.maintenanceProperty}>
                    <Icon iconName="Home" /> {getPropertyAddress(req.propertyId)}
                  </div>
                </div>
                <span className={PRIORITY_CLASS_MAP[req.priority] || styles.priorityMedium}>
                  {req.priority}
                </span>
              </div>

              <div className={styles.maintenanceFooter}>
                <span className={styles.maintenanceDate}>
                  <Icon iconName="Calendar" /> {formatDate(req.createdAt)}
                  {req.completedAt && (
                    <> — Completed {formatDate(req.completedAt)}</>
                  )}
                </span>
                <span className={STATUS_CLASS_MAP[req.status] || styles.statusOpen}>
                  {formatStatus(req.status)}
                </span>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className={styles.emptyState}>
              <Icon iconName="Toolbox" style={{ fontSize: 32 }} />
              <p>No maintenance requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
