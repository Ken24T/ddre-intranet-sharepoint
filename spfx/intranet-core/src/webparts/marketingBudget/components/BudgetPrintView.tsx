/**
 * BudgetPrintView – Printer-optimised single-budget layout
 *
 * Renders a clean, printable budget summary including property details,
 * line items table, and totals with GST. Printing uses an iframe-copy
 * technique — no external dependencies required.
 */

import * as React from "react";
import type { Budget, BudgetLineItem } from "../models/types";
import { calculateBudgetSummary, getLineItemPrice } from "../models/budgetCalculations";
import styles from "./MarketingBudget.module.scss";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

export interface IBudgetPrintViewProps {
  budget: Budget;
  /** Called to dismiss / close the print view. */
  onDismiss?: () => void;
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Print the contents of an HTML element using a temporary iframe.
 * This avoids hiding app chrome with CSS — the iframe contains only the print content.
 */
export function printElement(element: HTMLElement): void {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-10000px";
  iframe.style.left = "-10000px";
  iframe.style.width = "0";
  iframe.style.height = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : undefined);
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px; color: #323130; }
    h1 { color: #001CAD; font-size: 22px; margin-bottom: 4px; }
    h2 { font-size: 16px; font-weight: 600; margin: 16px 0 8px; color: #323130; }
    .subtitle { font-size: 12px; color: #605e5c; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { text-align: left; font-size: 11px; color: #605e5c; border-bottom: 2px solid #edebe9; padding: 6px 8px; }
    td { font-size: 13px; padding: 6px 8px; border-bottom: 1px solid #edebe9; }
    .price { text-align: right; }
    .deselected { color: #a19f9d; text-decoration: line-through; }
    .totals { text-align: right; margin-top: 8px; }
    .totals .row { display: flex; justify-content: flex-end; gap: 24px; margin-bottom: 4px; }
    .totals .label { color: #605e5c; font-size: 13px; min-width: 140px; text-align: right; }
    .totals .value { font-size: 13px; font-weight: 600; min-width: 100px; text-align: right; }
    .totals .primary .value { font-size: 18px; color: #001CAD; }
    .meta { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 16px; }
    .meta-item { font-size: 13px; }
    .meta-item .label { color: #605e5c; font-size: 11px; display: block; }
    .notes { background: #faf9f8; padding: 12px; border-radius: 4px; font-size: 13px; white-space: pre-wrap; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #edebe9; font-size: 11px; color: #a19f9d; }
    .overridden { font-style: italic; }
  </style></head><body>${element.innerHTML}</body></html>`);
  doc.close();

  // Small delay to allow the iframe to render
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.print();
    }
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const BudgetPrintView: React.FC<IBudgetPrintViewProps> = ({ budget, onDismiss }) => {
  const printRef = React.useRef<HTMLDivElement>(null);
  const summary = React.useMemo(() => calculateBudgetSummary(budget.lineItems), [budget.lineItems]);

  const handlePrint = React.useCallback((): void => {
    if (printRef.current) {
      printElement(printRef.current);
    }
  }, []);

  const selectedItems = budget.lineItems.filter((li) => li.isSelected);
  const deselectedItems = budget.lineItems.filter((li) => !li.isSelected);

  return (
    <div className={styles.printViewContainer} data-testid="print-view">
      {/* Action bar — visible on screen only */}
      <div className={styles.printActionBar}>
        <button type="button" className={styles.printButton} onClick={handlePrint}>
          Print / Save as PDF
        </button>
        {onDismiss && (
          <button type="button" className={styles.printCloseButton} onClick={onDismiss}>
            Close
          </button>
        )}
      </div>

      {/* Print content — this div gets printed */}
      <div ref={printRef} className={styles.printContent} data-testid="print-content">
        <h1>Marketing Budget</h1>
        <div className="subtitle">
          {budget.propertyAddress || "No address"} — {formatDate(budget.createdAt)}
        </div>

        {/* Property Details */}
        <h2>Property Details</h2>
        <div className="meta">
          <div className="meta-item">
            <span className="label">Address</span>
            {budget.propertyAddress || "—"}
          </div>
          {budget.clientName && (
            <div className="meta-item">
              <span className="label">Client</span>
              {budget.clientName}
            </div>
          )}
          {budget.agentName && (
            <div className="meta-item">
              <span className="label">Agent</span>
              {budget.agentName}
            </div>
          )}
          <div className="meta-item">
            <span className="label">Type</span>
            {budget.propertyType}
          </div>
          <div className="meta-item">
            <span className="label">Size</span>
            {budget.propertySize}
          </div>
          <div className="meta-item">
            <span className="label">Tier</span>
            {budget.tier}
          </div>
          <div className="meta-item">
            <span className="label">Status</span>
            {budget.status}
          </div>
        </div>

        {/* Selected Line Items */}
        <h2>Selected Services ({selectedItems.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Variant</th>
              <th className="price">Price (inc. GST)</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((li: BudgetLineItem, idx: number) => (
              <tr key={`sel-${idx}`} className={li.isOverridden ? "overridden" : ""}>
                <td>{li.serviceName || `Service #${li.serviceId}`}</td>
                <td>{li.variantName || li.variantId || "—"}</td>
                <td className="price">
                  {formatCurrency(getLineItemPrice(li))}
                  {li.isOverridden ? " *" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Deselected items (if any) */}
        {deselectedItems.length > 0 && (
          <>
            <h2>Not Included ({deselectedItems.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Variant</th>
                  <th className="price">List Price</th>
                </tr>
              </thead>
              <tbody>
                {deselectedItems.map((li: BudgetLineItem, idx: number) => (
                  <tr key={`desel-${idx}`} className="deselected">
                    <td>{li.serviceName || `Service #${li.serviceId}`}</td>
                    <td>{li.variantName || li.variantId || "—"}</td>
                    <td className="price">{formatCurrency(getLineItemPrice(li))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Totals */}
        <div className="totals">
          <div className="row">
            <span className="label">Items selected</span>
            <span className="value">{summary.selectedCount} / {summary.totalCount}</span>
          </div>
          <div className="row">
            <span className="label">Subtotal (inc. GST)</span>
            <span className="value">{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="row">
            <span className="label">GST component</span>
            <span className="value">{formatCurrency(summary.gst)}</span>
          </div>
          <div className="row primary">
            <span className="label">Total (inc. GST)</span>
            <span className="value">{formatCurrency(summary.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {budget.notes && (
          <>
            <h2>Notes</h2>
            <div className="notes">{budget.notes}</div>
          </>
        )}

        {/* Footer */}
        <div className="footer">
          DDRE Marketing Budget — Printed {new Date().toLocaleDateString("en-AU")}
          {budget.lineItems.some((item) => item.isOverridden) ? " — * indicates overridden price" : ""}
        </div>
      </div>
    </div>
  );
};
