/**
 * SortableLineItem — A single draggable line item row.
 *
 * Uses @dnd-kit/sortable to enable drag-and-drop reordering.
 * Renders: drag handle, checkbox, service name, variant picker, price, actions.
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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BudgetLineItem, Service, VariantContext } from "../models/types";
import {
  getServiceVariant,
  hasSelectableVariants,
} from "../models/variantHelpers";
import { getLineItemPrice } from "../models/budgetCalculations";
import styles from "./MarketingBudget.module.scss";

// ─── Helpers ────────────────────────────────────────────────

/** Format a number as AUD currency. */
function formatCurrency(value: number): string {
  return value.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });
}

// ─── Props ──────────────────────────────────────────────────

export interface ISortableLineItemProps {
  lineItem: BudgetLineItem;
  index: number;
  services: Service[];
  context: VariantContext;
  readOnly: boolean;
  onToggle: (index: number, checked: boolean) => void;
  onVariantChange: (index: number, variantId: string, service: Service) => void;
  onOverrideToggle: (index: number, lineItem: BudgetLineItem) => void;
  onPriceChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

// ─── Component ─────────────────────────────────────────────

export const SortableLineItem: React.FC<ISortableLineItemProps> = ({
  lineItem: li,
  index,
  services,
  context,
  readOnly,
  onToggle,
  onVariantChange,
  onOverrideToggle,
  onPriceChange,
  onRemove,
}) => {
  const sortableId = `line-${li.serviceId}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId, disabled: readOnly });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : undefined,
  };

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
      ref={setNodeRef}
      style={style}
      className={`${styles.lineItemRow} ${!li.isSelected ? styles.lineItemDeselected : ""} ${isDragging ? styles.lineItemDragging : ""}`}
    >
      {/* Drag handle */}
      {!readOnly && (
        <div
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${li.serviceName ?? "line item"}`}
        >
          <Icon iconName="GripperDotsVertical" />
        </div>
      )}

      {/* Toggle */}
      <div className={styles.lineItemCheck}>
        <Checkbox
          checked={li.isSelected}
          onChange={(_, checked): void => onToggle(index, !!checked)}
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
              onVariantChange(index, String(opt?.key ?? ""), service!)
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
            onChange={(_, val): void => onPriceChange(index, val ?? "0")}
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

      {/* Override toggle + remove */}
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
              onClick={(): void => onOverrideToggle(index, li)}
              aria-label={li.isOverridden ? "Revert price" : "Override price"}
            >
              <Icon
                iconName={li.isOverridden ? "Undo" : "Edit"}
                style={{ fontSize: 14 }}
              />
            </button>
          </TooltipHost>
        )}
        {!readOnly && (
          <TooltipHost content="Remove line item">
            <button
              type="button"
              className={styles.overrideBtn}
              onClick={(): void => onRemove(index)}
              aria-label={`Remove ${li.serviceName ?? "line item"}`}
            >
              <Icon
                iconName="Delete"
                style={{ fontSize: 14, color: "#a4262c" }}
              />
            </button>
          </TooltipHost>
        )}
      </div>
    </div>
  );
};
