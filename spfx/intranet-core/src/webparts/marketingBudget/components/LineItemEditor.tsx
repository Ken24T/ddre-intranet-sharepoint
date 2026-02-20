/**
 * LineItemEditor — Editable list of budget line items.
 *
 * Each row shows: checkbox, service name, variant picker, price, override toggle.
 * Variant selection depends on the service's variantSelector type:
 * - `manual`: user picks from a dropdown
 * - `propertySize` / `suburbTier`: auto-resolved, shown as read-only
 * - null / single variant: shown as fixed text
 */

import * as React from "react";
import {
  Checkbox,
  Dropdown,
  Icon,
  Text,
  TextField,
  TooltipHost,
} from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react";
import type {
  BudgetLineItem,
  Service,
  VariantContext,
} from "../models/types";
import {
  getServiceVariant,
  hasSelectableVariants,
} from "../models/variantHelpers";
import { getLineItemPrice } from "../models/budgetCalculations";
import styles from "./MarketingBudget.module.scss";

export interface ILineItemEditorProps {
  lineItems: BudgetLineItem[];
  services: Service[];
  context: VariantContext;
  onChange: (lineItems: BudgetLineItem[]) => void;
  readOnly?: boolean;
}

/** Format a number as AUD currency. */
function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });
}

export const LineItemEditor: React.FC<ILineItemEditorProps> = ({
  lineItems,
  services,
  context,
  onChange,
  readOnly = false,
}) => {
  /** Update a single line item by index. */
  const updateItem = React.useCallback(
    (index: number, updates: Partial<BudgetLineItem>): void => {
      const updated = lineItems.map((li, i) =>
        i === index ? { ...li, ...updates } : li,
      );
      onChange(updated);
    },
    [lineItems, onChange],
  );

  /** Toggle selection of a line item. */
  const handleToggle = React.useCallback(
    (index: number, checked: boolean): void => {
      updateItem(index, { isSelected: checked });
    },
    [updateItem],
  );

  /** Change the selected variant for a manual-select service. */
  const handleVariantChange = React.useCallback(
    (index: number, variantId: string, service: Service): void => {
      const variant = service.variants.find((v) => v.id === variantId);
      if (!variant) return;

      updateItem(index, {
        variantId,
        variantName: variant.name,
        schedulePrice: variant.basePrice,
        // Clear any override when variant changes
        isOverridden: false,
        overridePrice: null,
      });
    },
    [updateItem],
  );

  /** Toggle price override mode. */
  const handleOverrideToggle = React.useCallback(
    (index: number, lineItem: BudgetLineItem): void => {
      if (lineItem.isOverridden) {
        // Revert to schedule price
        updateItem(index, { isOverridden: false, overridePrice: null });
      } else {
        // Start override with current effective price
        updateItem(index, {
          isOverridden: true,
          overridePrice: getLineItemPrice(lineItem),
        });
      }
    },
    [updateItem],
  );

  /** Update override price value. */
  const handlePriceChange = React.useCallback(
    (index: number, value: string): void => {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed >= 0) {
        updateItem(index, { overridePrice: parsed });
      }
    },
    [updateItem],
  );

  if (lineItems.length === 0) {
    return (
      <div className={styles.centeredState} style={{ minHeight: 100 }}>
        <Icon
          iconName="AllApps"
          style={{ fontSize: 32, marginBottom: 8, color: "#605e5c" }}
        />
        <Text variant="medium" style={{ color: "#605e5c" }}>
          No line items. Select a schedule template to populate items.
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.lineItemEditor}>
      {/* Header row */}
      <div className={styles.lineItemRow + " " + styles.lineItemHeaderRow}>
        <div className={styles.lineItemCheck} />
        <div className={styles.lineItemService}>
          <Text variant="smallPlus" style={{ fontWeight: 600 }}>
            Service
          </Text>
        </div>
        <div className={styles.lineItemVariant}>
          <Text variant="smallPlus" style={{ fontWeight: 600 }}>
            Variant
          </Text>
        </div>
        <div className={styles.lineItemPrice}>
          <Text variant="smallPlus" style={{ fontWeight: 600 }}>
            Price (inc. GST)
          </Text>
        </div>
        <div className={styles.lineItemActions} />
      </div>

      {/* Line item rows */}
      {lineItems.map((li, index) => {
        const service = services.find((s) => s.id === li.serviceId);
        const variant = service
          ? getServiceVariant(service, context, li.variantId)
          : undefined;
        const isManual = service ? hasSelectableVariants(service) : false;
        const effectivePrice = getLineItemPrice(li);

        const variantOptions: IDropdownOption[] = service
          ? service.variants.map((v) => ({
              key: v.id,
              text: `${v.name} — ${formatCurrency(v.basePrice)}`,
            }))
          : [];

        return (
          <div
            key={`${li.serviceId}-${index}`}
            className={`${styles.lineItemRow} ${!li.isSelected ? styles.lineItemDeselected : ""}`}
          >
            {/* Toggle */}
            <div className={styles.lineItemCheck}>
              <Checkbox
                checked={li.isSelected}
                onChange={(_, checked): void => handleToggle(index, !!checked)}
                disabled={readOnly}
              />
            </div>

            {/* Service name */}
            <div className={styles.lineItemService}>
              <Text variant="medium">
                {li.serviceName ?? `Service #${li.serviceId}`}
              </Text>
              {service?.category && (
                <Text
                  variant="tiny"
                  style={{ color: "#605e5c", textTransform: "capitalize" }}
                >
                  {service.category}
                </Text>
              )}
            </div>

            {/* Variant selector / display */}
            <div className={styles.lineItemVariant}>
              {isManual && !readOnly ? (
                <Dropdown
                  options={variantOptions}
                  selectedKey={li.variantId ?? undefined}
                  onChange={(_, opt): void =>
                    handleVariantChange(index, String(opt?.key ?? ""), service!)
                  }
                  disabled={!li.isSelected}
                  styles={{ root: { minWidth: 160 } }}
                />
              ) : (
                <Text variant="small" style={{ color: "#605e5c" }}>
                  {variant?.name ?? li.variantName ?? "—"}
                </Text>
              )}
            </div>

            {/* Price */}
            <div className={styles.lineItemPrice}>
              {li.isOverridden && !readOnly ? (
                <TextField
                  type="number"
                  value={String(li.overridePrice ?? effectivePrice)}
                  onChange={(_, val): void =>
                    handlePriceChange(index, val ?? "0")
                  }
                  prefix="$"
                  disabled={!li.isSelected}
                  styles={{ root: { width: 110 } }}
                />
              ) : (
                <Text
                  variant="medium"
                  style={{
                    fontWeight: li.isOverridden ? 600 : 400,
                    color: li.isOverridden ? "#001CAD" : undefined,
                  }}
                >
                  {formatCurrency(effectivePrice)}
                </Text>
              )}
            </div>

            {/* Override toggle */}
            <div className={styles.lineItemActions}>
              {!readOnly && li.isSelected && (
                <TooltipHost
                  content={
                    li.isOverridden
                      ? "Revert to schedule price"
                      : "Override price"
                  }
                >
                  <button
                    type="button"
                    className={styles.overrideBtn}
                    onClick={(): void => handleOverrideToggle(index, li)}
                    aria-label={
                      li.isOverridden ? "Revert price" : "Override price"
                    }
                  >
                    <Icon
                      iconName={li.isOverridden ? "Undo" : "Edit"}
                      style={{ fontSize: 14 }}
                    />
                  </button>
                </TooltipHost>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
