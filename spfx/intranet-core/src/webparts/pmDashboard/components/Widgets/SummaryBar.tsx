/**
 * SummaryBar – KPI summary cards displayed above the dashboard tables.
 *
 * Shows at-a-glance metrics: total properties, occupancy rate,
 * rent collected/outstanding, and open maintenance requests.
 * Data comes from the PropertyMe service (mock or real).
 */

import * as React from "react";
import { Spinner, SpinnerSize, MessageBar, MessageBarType, Icon } from "@fluentui/react";
import type { DashboardSummary } from "../../services/IPropertyMeService";
import styles from "../PmDashboard.module.scss";

export interface ISummaryBarProps {
  summary: DashboardSummary | undefined;
  loading: boolean;
  error: string | undefined;
}

/** Format a dollar amount with commas and no cents. */
function formatCurrency(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("en-AU");
}

type AccentColour = "green" | "red" | "blue" | "amber";

const ACCENT_CLASS_MAP: Record<AccentColour, string> = {
  blue: styles.statCardBlue,
  green: styles.statCardGreen,
  red: styles.statCardRed,
  amber: styles.statCardAmber,
};

interface IStatCardProps {
  icon: string;
  label: string;
  value: string;
  accent?: AccentColour;
}

const StatCard: React.FC<IStatCardProps> = ({ icon, label, value, accent }) => (
  <div className={accent ? ACCENT_CLASS_MAP[accent] : styles.statCard}>
    <Icon iconName={icon} className={styles.statIcon} />
    <div className={styles.statContent}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  </div>
);

export const SummaryBar: React.FC<ISummaryBarProps> = ({
  summary,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className={styles.summaryBar}>
        <Spinner size={SpinnerSize.small} label="Loading metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.summaryBar}>
        <MessageBar messageBarType={MessageBarType.warning}>
          Unable to load dashboard metrics: {error}
        </MessageBar>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className={styles.summaryBar}>
      <StatCard
        icon="Home"
        label="Active Properties"
        value={`${summary.activeProperties} / ${summary.totalProperties}`}
        accent="blue"
      />
      <StatCard
        icon="People"
        label="Occupancy Rate"
        value={`${summary.occupancyRate}%`}
        accent={summary.occupancyRate >= 90 ? "green" : summary.occupancyRate >= 75 ? "amber" : "red"}
      />
      <StatCard
        icon="Money"
        label="Rent Collected"
        value={formatCurrency(summary.rentCollectedThisMonth)}
        accent="green"
      />
      <StatCard
        icon="AlertSolid"
        label="Rent Outstanding"
        value={formatCurrency(summary.rentOutstandingThisMonth)}
        accent={summary.rentOutstandingThisMonth > 0 ? "red" : "green"}
      />
      <StatCard
        icon="Toolbox"
        label="Open Maintenance"
        value={String(summary.openMaintenanceRequests)}
        accent={summary.openMaintenanceRequests > 5 ? "red" : "amber"}
      />
      <StatCard
        icon="Contact"
        label="Total Tenants"
        value={String(summary.totalTenants)}
        accent="blue"
      />
    </div>
  );
};
