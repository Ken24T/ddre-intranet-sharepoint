/**
 * BudgetComparisonView – Side-by-side budget comparison
 *
 * Allows the user to select two budgets and view their line items side by side,
 * with price differences highlighted. Useful for re-quoting or tier changes.
 */

import * as React from "react";
import {
  Dropdown,
  type IDropdownOption,
  Icon,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type { UserRole } from "../models/permissions";
import type { Budget, BudgetLineItem } from "../models/types";
import { getLineItemPrice, calculateBudgetSummary } from "../models/budgetCalculations";
import styles from "./MarketingBudget.module.scss";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

export interface IBudgetComparisonViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
  /** Pre-selected budget IDs (e.g. from BudgetListView "Compare" action). */
  initialLeftId?: number;
  initialRightId?: number;
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ComparisonRow {
  serviceId: number;
  serviceName: string;
  leftPrice: number | undefined;
  rightPrice: number | undefined;
  leftVariant: string;
  rightVariant: string;
  leftSelected: boolean;
  rightSelected: boolean;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });
}

function buildComparisonRows(left: Budget, right: Budget): ComparisonRow[] {
  const serviceIds = new Set<number>();
  const leftMap = new Map<number, BudgetLineItem>();
  const rightMap = new Map<number, BudgetLineItem>();

  for (const li of left.lineItems) {
    leftMap.set(li.serviceId, li);
    serviceIds.add(li.serviceId);
  }
  for (const li of right.lineItems) {
    rightMap.set(li.serviceId, li);
    serviceIds.add(li.serviceId);
  }

  const rows: ComparisonRow[] = [];
  serviceIds.forEach((sid) => {
    const l = leftMap.get(sid);
    const r = rightMap.get(sid);
    rows.push({
      serviceId: sid,
      serviceName: (l && l.serviceName) || (r && r.serviceName) || `Service #${sid}`,
      leftPrice: l ? getLineItemPrice(l) : undefined,
      rightPrice: r ? getLineItemPrice(r) : undefined,
      leftVariant: (l && (l.variantName || l.variantId || "")) || "",
      rightVariant: (r && (r.variantName || r.variantId || "")) || "",
      leftSelected: l ? l.isSelected : false,
      rightSelected: r ? r.isSelected : false,
    });
  });

  return rows;
}

function getDiffClass(left: number | undefined, right: number | undefined): string {
  if (left === undefined || right === undefined) return styles.comparisonMissing;
  if (left < right) return styles.comparisonHigher;
  if (left > right) return styles.comparisonLower;
  return "";
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const BudgetComparisonView: React.FC<IBudgetComparisonViewProps> = ({
  repository,
  initialLeftId,
  initialRightId,
}) => {
  const [allBudgets, setAllBudgets] = React.useState<Budget[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [leftId, setLeftId] = React.useState<number | undefined>(initialLeftId);
  const [rightId, setRightId] = React.useState<number | undefined>(initialRightId);

  const loadBudgets = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      try {
        const budgets = await repository.getBudgets();
        if (!signal.cancelled) setAllBudgets(budgets);
      } catch (err) {
        if (!signal.cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load budgets");
        }
      } finally {
        if (!signal.cancelled) setIsLoading(false);
      }
    },
    [repository],
  );

  React.useEffect(() => {
    const signal = { cancelled: false };
    loadBudgets(signal); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => { signal.cancelled = true; };
  }, [loadBudgets]);

  const options: IDropdownOption[] = React.useMemo(
    () =>
      allBudgets.map((b) => ({
        key: b.id!,
        text: `${b.propertyAddress || "No address"} (${b.status})`,
      })),
    [allBudgets],
  );

  const leftBudget = React.useMemo(
    () => allBudgets.find((b) => b.id === leftId),
    [allBudgets, leftId],
  );
  const rightBudget = React.useMemo(
    () => allBudgets.find((b) => b.id === rightId),
    [allBudgets, rightId],
  );

  const rows = React.useMemo(
    () => (leftBudget && rightBudget ? buildComparisonRows(leftBudget, rightBudget) : []),
    [leftBudget, rightBudget],
  );

  const leftSummary = React.useMemo(
    () => leftBudget ? calculateBudgetSummary(leftBudget.lineItems) : undefined,
    [leftBudget],
  );
  const rightSummary = React.useMemo(
    () => rightBudget ? calculateBudgetSummary(rightBudget.lineItems) : undefined,
    [rightBudget],
  );

  // ─── Render ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.centeredState}>
        <Spinner size={SpinnerSize.large} label="Loading budgets…" />
      </div>
    );
  }

  if (error) {
    return <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>;
  }

  return (
    <div className={styles.viewContainer} data-testid="comparison-view">
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Budget Comparison</Text>
        <Text className={styles.viewSubtitle}>
          Select two budgets to compare side by side
        </Text>
      </div>

      {/* Selectors */}
      <div className={styles.comparisonSelectors}>
        <Dropdown
          label="Budget A"
          placeholder="Select a budget…"
          options={options}
          selectedKey={leftId}
          onChange={(_e, option): void => setLeftId(option ? (option.key as number) : undefined)}
          className={styles.comparisonDropdown}
        />
        <Icon iconName="Switch" className={styles.comparisonSwitch} />
        <Dropdown
          label="Budget B"
          placeholder="Select a budget…"
          options={options}
          selectedKey={rightId}
          onChange={(_e, option): void => setRightId(option ? (option.key as number) : undefined)}
          className={styles.comparisonDropdown}
        />
      </div>

      {/* Comparison table */}
      {leftBudget && rightBudget && (
        <div className={styles.comparisonTable} data-testid="comparison-table">
          {/* Header */}
          <div className={`${styles.comparisonRow} ${styles.comparisonHeaderRow}`}>
            <div className={styles.comparisonService}>Service</div>
            <div className={styles.comparisonColA}>Budget A</div>
            <div className={styles.comparisonColB}>Budget B</div>
            <div className={styles.comparisonDiff}>Diff</div>
          </div>

          {/* Rows */}
          {rows.map((row) => {
            const diff =
              row.leftPrice !== undefined && row.rightPrice !== undefined
                ? row.rightPrice - row.leftPrice
                : undefined;
            const diffClass = getDiffClass(row.leftPrice, row.rightPrice);

            return (
              <div
                key={row.serviceId}
                className={`${styles.comparisonRow} ${diffClass}`}
              >
                <div className={styles.comparisonService}>
                  {row.serviceName}
                  {row.leftVariant || row.rightVariant
                    ? ` (${row.leftVariant || row.rightVariant})`
                    : ""}
                </div>
                <div className={styles.comparisonColA}>
                  {row.leftPrice !== undefined
                    ? formatCurrency(row.leftPrice)
                    : "—"}
                  {!row.leftSelected && row.leftPrice !== undefined && (
                    <span className={styles.comparisonDeselected}> (not selected)</span>
                  )}
                </div>
                <div className={styles.comparisonColB}>
                  {row.rightPrice !== undefined
                    ? formatCurrency(row.rightPrice)
                    : "—"}
                  {!row.rightSelected && row.rightPrice !== undefined && (
                    <span className={styles.comparisonDeselected}> (not selected)</span>
                  )}
                </div>
                <div className={styles.comparisonDiff}>
                  {diff !== undefined
                    ? (diff >= 0 ? "+" : "") + formatCurrency(diff)
                    : "—"}
                </div>
              </div>
            );
          })}

          {/* Totals row */}
          {leftSummary && rightSummary && (
            <div className={`${styles.comparisonRow} ${styles.comparisonTotalRow}`}>
              <div className={styles.comparisonService}>
                <strong>Total (inc. GST)</strong>
              </div>
              <div className={styles.comparisonColA}>
                <strong>{formatCurrency(leftSummary.total)}</strong>
              </div>
              <div className={styles.comparisonColB}>
                <strong>{formatCurrency(rightSummary.total)}</strong>
              </div>
              <div className={styles.comparisonDiff}>
                <strong>
                  {(rightSummary.total - leftSummary.total >= 0 ? "+" : "")}
                  {formatCurrency(rightSummary.total - leftSummary.total)}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {(!leftBudget || !rightBudget) && (
        <div className={styles.centeredState}>
          <Icon iconName="CompareSingle" style={{ fontSize: 48, color: "#001CAD", marginBottom: 16 }} />
          <Text variant="large">Select two budgets above to compare</Text>
        </div>
      )}
    </div>
  );
};
