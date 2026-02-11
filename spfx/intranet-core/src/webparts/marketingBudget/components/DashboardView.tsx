/**
 * DashboardView – At-a-glance budget metrics
 *
 * Shows:
 * • Status summary cards (draft / approved / sent / archived)
 * • Spend by service category (CSS bar chart)
 * • Spend by budget tier
 * • Monthly spend trend
 * • Quick-action buttons
 */

import * as React from "react";
import {
  Icon,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type { UserRole } from "../models/permissions";
import type { Budget, Service, BudgetStatus, ServiceCategory } from "../models/types";
import {
  countBudgetsByStatus,
  totalSpendByCategory,
  totalSpendByTier,
  monthlySpendTrend,
  overallSpendSummary,
} from "../models/dashboardAggregations";
import styles from "./MarketingBudget.module.scss";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

export interface IDashboardViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
  onNavigate?: (view: string) => void;
}

// ─────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BudgetStatus, { icon: string; label: string; className: string }> = {
  draft: { icon: "Edit", label: "Drafts", className: "statusDraft" },
  approved: { icon: "CompletedSolid", label: "Approved", className: "statusApproved" },
  sent: { icon: "Mail", label: "Sent", className: "statusSent" },
  archived: { icon: "Archive", label: "Archived", className: "statusArchived" },
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  photography: "Photography",
  floorPlans: "Floor Plans",
  aerial: "Aerial / Drone",
  video: "Video",
  virtualStaging: "Virtual Staging",
  internet: "Internet",
  legal: "Legal",
  print: "Print",
  signage: "Signage",
  other: "Other",
};

function formatCurrency(value: number): string {
  return "$" + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthNames[parseInt(month, 10) - 1] + " " + year;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const DashboardView: React.FC<IDashboardViewProps> = ({
  repository,
  userRole,
  onNavigate,
}) => {
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const loadData = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      try {
        const [allBudgets, allServices] = await Promise.all([
          repository.getBudgets(),
          repository.getServices(),
        ]);
        if (!signal.cancelled) {
          setBudgets(allBudgets);
          setServices(allServices);
        }
      } catch (err) {
        if (!signal.cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      } finally {
        if (!signal.cancelled) setIsLoading(false);
      }
    },
    [repository],
  );

  React.useEffect(() => {
    const signal = { cancelled: false };
    loadData(signal); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => { signal.cancelled = true; };
  }, [loadData]);

  // ─── Computations ───────────────────────────────────────
  const statusCounts = React.useMemo(() => countBudgetsByStatus(budgets), [budgets]);
  const categorySpend = React.useMemo(() => totalSpendByCategory(budgets, services), [budgets, services]);
  const tierSpend = React.useMemo(() => totalSpendByTier(budgets), [budgets]);
  const trend = React.useMemo(() => monthlySpendTrend(budgets), [budgets]);
  const summary = React.useMemo(() => overallSpendSummary(budgets), [budgets]);

  const maxCategorySpend = React.useMemo(() => {
    let max = 1;
    const cats = Object.keys(categorySpend) as ServiceCategory[];
    for (const cat of cats) {
      if (categorySpend[cat] > max) max = categorySpend[cat];
    }
    return max;
  }, [categorySpend]);

  const maxTrendSpend = React.useMemo(() => {
    const vals = trend.map((t) => t.total);
    return Math.max(...vals, 1);
  }, [trend]);

  // ─── Render ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.centeredState}>
        <Spinner size={SpinnerSize.large} label="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
    );
  }

  const activeCats = (Object.keys(categorySpend) as ServiceCategory[]).filter(
    (cat) => categorySpend[cat] > 0,
  );

  return (
    <div className={styles.viewContainer} data-testid="dashboard-view">
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Dashboard</Text>
        <Text className={styles.viewSubtitle}>
          {summary.totalBudgets} budget{summary.totalBudgets !== 1 ? "s" : ""} — {formatCurrency(summary.totalSpend)} total spend
        </Text>
      </div>

      {/* ── Status Cards ───────────────────────────────── */}
      <div className={styles.dashboardGrid} data-testid="status-cards">
        {(Object.keys(STATUS_CONFIG) as BudgetStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className={styles.dashboardCard}>
              <div className={styles.dashboardCardIcon}>
                <Icon iconName={cfg.icon} className={(styles as unknown as Record<string, string>)[cfg.className]} />
              </div>
              <div className={styles.dashboardCardValue}>{statusCounts[status]}</div>
              <div className={styles.dashboardCardLabel}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Spend by Category ──────────────────────────── */}
      {activeCats.length > 0 && (
        <div className={styles.dashboardSection}>
          <Text className={styles.dashboardSectionTitle}>Spend by Category</Text>
          <div className={styles.barChart} data-testid="category-chart">
            {activeCats.map((cat) => (
              <div key={cat} className={styles.barChartRow}>
                <div className={styles.barChartLabel}>{CATEGORY_LABELS[cat]}</div>
                <div className={styles.barChartTrack}>
                  <div
                    className={styles.barChartBar}
                    style={{ width: `${(categorySpend[cat] / maxCategorySpend) * 100}%` }}
                  />
                </div>
                <div className={styles.barChartValue}>{formatCurrency(categorySpend[cat])}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Spend by Tier ──────────────────────────────── */}
      <div className={styles.dashboardSection}>
        <Text className={styles.dashboardSectionTitle}>Spend by Tier</Text>
        <div className={styles.dashboardGrid} data-testid="tier-cards">
          {(["basic", "standard", "premium"] as const).map((tier) => (
            <div key={tier} className={styles.dashboardCard}>
              <div className={styles.dashboardCardValue}>{formatCurrency(tierSpend[tier])}</div>
              <div className={styles.dashboardCardLabel}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Monthly Trend ──────────────────────────────── */}
      {trend.length > 0 && (
        <div className={styles.dashboardSection}>
          <Text className={styles.dashboardSectionTitle}>Monthly Trend</Text>
          <div className={styles.barChart} data-testid="trend-chart">
            {trend.map((m) => (
              <div key={m.month} className={styles.barChartRow}>
                <div className={styles.barChartLabel}>{formatMonth(m.month)}</div>
                <div className={styles.barChartTrack}>
                  <div
                    className={styles.barChartBar}
                    style={{ width: `${(m.total / maxTrendSpend) * 100}%` }}
                  />
                </div>
                <div className={styles.barChartValue}>
                  {formatCurrency(m.total)} ({m.count})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────── */}
      {(userRole === "editor" || userRole === "admin") && onNavigate && (
        <div className={styles.dashboardActions}>
          <PrimaryButton
            text="View Budgets"
            iconProps={{ iconName: "Financial" }}
            onClick={(): void => onNavigate("budgets")}
          />
        </div>
      )}
    </div>
  );
};
