/**
 * LineItemEditor — Editable list of budget line items with drag-and-drop reordering.
 *
 * Each row shows: drag handle, checkbox, service name, variant picker, price, override toggle.
 * Variant selection depends on the service's variantSelector type:
 * - `manual`: user picks from a dropdown
 * - `propertySize` / `suburbTier`: auto-resolved, shown as read-only
 * - null / single variant: shown as fixed text
 *
 * Drag-and-drop uses @dnd-kit/sortable for accessible reordering.
 */

import * as React from "react";
import {
  Dropdown,
  Icon,
  Text,
} from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  BudgetLineItem,
  Service,
  VariantContext,
} from "../models/types";
import { getServiceVariant } from "../models/variantHelpers";
import { getLineItemPrice } from "../models/budgetCalculations";
import { SortableLineItem } from "./SortableLineItem";
import styles from "./MarketingBudget.module.scss";

export interface ILineItemEditorProps {
  lineItems: BudgetLineItem[];
  services: Service[];
  context: VariantContext;
  onChange: (lineItems: BudgetLineItem[]) => void;
  readOnly?: boolean;
}

export const LineItemEditor: React.FC<ILineItemEditorProps> = ({
  lineItems,
  services,
  context,
  onChange,
  readOnly = false,
}) => {
  // ─── Callbacks ──────────────────────────────────────────

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

  const handleToggle = React.useCallback(
    (index: number, checked: boolean): void => {
      updateItem(index, { isSelected: checked });
    },
    [updateItem],
  );

  const handleVariantChange = React.useCallback(
    (index: number, variantId: string, service: Service): void => {
      const variant = service.variants.find((v) => v.id === variantId);
      if (!variant) return;
      updateItem(index, {
        variantId,
        variantName: variant.name,
        schedulePrice: variant.basePrice,
        isOverridden: false,
        overridePrice: null,
      });
    },
    [updateItem],
  );

  const handleOverrideToggle = React.useCallback(
    (index: number, lineItem: BudgetLineItem): void => {
      if (lineItem.isOverridden) {
        updateItem(index, { isOverridden: false, overridePrice: null });
      } else {
        updateItem(index, {
          isOverridden: true,
          overridePrice: getLineItemPrice(lineItem),
        });
      }
    },
    [updateItem],
  );

  const handlePriceChange = React.useCallback(
    (index: number, value: string): void => {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed >= 0) {
        updateItem(index, { overridePrice: parsed });
      }
    },
    [updateItem],
  );

  const handleAddService = React.useCallback(
    (serviceId: number): void => {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;
      const variant = service.variants.length > 0
        ? getServiceVariant(service, context, undefined)
        : undefined;

      const newItem: BudgetLineItem = {
        serviceId: service.id!,
        serviceName: service.name,
        variantId: variant?.id ?? null,
        variantName: variant?.name ?? null,
        isSelected: true,
        schedulePrice: variant?.basePrice ?? 0,
        overridePrice: null,
        isOverridden: false,
      };
      onChange([...lineItems, newItem]);
    },
    [services, context, lineItems, onChange],
  );

  const handleRemove = React.useCallback(
    (index: number): void => {
      onChange(lineItems.filter((_, i) => i !== index));
    },
    [lineItems, onChange],
  );

  // ─── DnD ────────────────────────────────────────────────

  /** Stable sortable IDs derived from service IDs. */
  const sortableIds = React.useMemo(
    () => lineItems.map((li) => `line-${li.serviceId}`),
    [lineItems],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent): void => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortableIds.indexOf(active.id as string);
      const newIndex = sortableIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      onChange(arrayMove(lineItems, oldIndex, newIndex));
    },
    [sortableIds, lineItems, onChange],
  );

  // ─── Available services dropdown ────────────────────────

  const availableServiceOptions: IDropdownOption[] = React.useMemo(() => {
    const usedIds = new Set(lineItems.map((li) => li.serviceId));
    return services
      .filter((s) => s.isActive === 1 && !usedIds.has(s.id!))
      .map((s) => ({ key: s.id!, text: `${s.name} (${s.category})` }));
  }, [services, lineItems]);

  const renderAddService = (): JSX.Element | null => {
    if (readOnly || availableServiceOptions.length === 0) return null;
    return (
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <Dropdown
          placeholder="Add a service…"
          options={availableServiceOptions}
          selectedKey={null}
          onChange={(_, opt): void => {
            if (opt) handleAddService(Number(opt.key));
          }}
          styles={{ root: { minWidth: 240 } }}
        />
      </div>
    );
  };

  // ─── Empty state ────────────────────────────────────────

  if (lineItems.length === 0) {
    return (
      <div className={styles.centeredState} style={{ minHeight: 100 }}>
        <Icon
          iconName="AllApps"
          style={{ fontSize: 32, marginBottom: 8, color: "#605e5c" }}
        />
        <Text variant="medium" style={{ color: "#605e5c" }}>
          No line items yet.
        </Text>
        <Text variant="small" style={{ color: "#a19f9d", marginTop: 4 }}>
          Apply a schedule template above, or add services individually below.
        </Text>
        {renderAddService()}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className={styles.lineItemEditor}>
      {/* Header row */}
      <div className={styles.lineItemRow + " " + styles.lineItemHeaderRow}>
        {!readOnly && <div className={styles.dragHandle} />}
        <div className={styles.lineItemCheck} />
        <div className={styles.lineItemService}>
          <Text variant="smallPlus" style={{ fontWeight: 600 }}>Service</Text>
        </div>
        <div className={styles.lineItemVariant}>
          <Text variant="smallPlus" style={{ fontWeight: 600 }}>Variant</Text>
        </div>
        <div className={styles.lineItemPrice}>
          <Text variant="smallPlus" style={{ fontWeight: 600 }}>Price (inc. GST)</Text>
        </div>
        <div className={styles.lineItemActions} />
      </div>

      {/* Sortable line item rows */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          {lineItems.map((li, index) => (
            <SortableLineItem
              key={`line-${li.serviceId}`}
              lineItem={li}
              index={index}
              services={services}
              context={context}
              readOnly={readOnly}
              onToggle={handleToggle}
              onVariantChange={handleVariantChange}
              onOverrideToggle={handleOverrideToggle}
              onPriceChange={handlePriceChange}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add another service */}
      {renderAddService()}
    </div>
  );
};
