/**
 * BudgetTotals — Displays subtotal, GST, total, and item count for a budget.
 *
 * Uses the pure calculation functions from budgetCalculations.ts.
 */

import * as React from "react";
import { Text } from "@fluentui/react";
import type { BudgetLineItem } from "../models/types";
import { calculateBudgetSummary } from "../models/budgetCalculations";
import styles from "./MarketingBudget.module.scss";

export interface IBudgetTotalsProps {
  lineItems: BudgetLineItem[];
}

/** Format a number as AUD currency. */
function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });
}

export const BudgetTotals: React.FC<IBudgetTotalsProps> = ({ lineItems }) => {
  const summary = React.useMemo(
    () => calculateBudgetSummary(lineItems),
    [lineItems],
  );

  return (
    <div className={styles.totalsBar}>
      <div className={styles.totalsItem}>
        <Text variant="small" className={styles.totalsLabel}>
          Items
        </Text>
        <Text variant="mediumPlus" className={styles.totalsValue}>
          {summary.selectedCount} / {summary.totalCount}
        </Text>
      </div>
      <div className={styles.totalsItem}>
        <Text variant="small" className={styles.totalsLabel}>
          Subtotal (inc. GST)
        </Text>
        <Text variant="mediumPlus" className={styles.totalsValue}>
          {formatCurrency(summary.subtotal)}
        </Text>
      </div>
      <div className={styles.totalsItem}>
        <Text variant="small" className={styles.totalsLabel}>
          GST Component
        </Text>
        <Text variant="mediumPlus" className={styles.totalsValue}>
          {formatCurrency(summary.gst)}
        </Text>
      </div>
      <div className={styles.totalsPrimary}>
        <Text variant="small" className={styles.totalsLabel}>
          Total (inc. GST)
        </Text>
        <Text variant="xLarge" className={styles.totalsValue}>
          {formatCurrency(summary.total)}
        </Text>
      </div>
    </div>
  );
};
