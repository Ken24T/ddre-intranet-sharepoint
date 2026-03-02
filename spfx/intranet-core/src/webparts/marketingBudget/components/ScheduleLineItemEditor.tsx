/**
 * ScheduleLineItemEditor — Visual editor for composing ScheduleLineItem[].
 *
 * Allows toggling services on/off, selecting variants, reordering via
 * up/down buttons, and adding/removing services. Used inside the
 * SchedulesView editor panel.
 */

import * as React from "react";
import {
  Checkbox,
  Dropdown,
  IconButton,
  Text,
} from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react";
import type { ScheduleLineItem, Service } from "../models/types";
import styles from "./MarketingBudget.module.scss";

export interface IScheduleLineItemEditorProps {
  lineItems: ScheduleLineItem[];
  services: Service[];
  onChange: (lineItems: ScheduleLineItem[]) => void;
}

export const ScheduleLineItemEditor: React.FC<IScheduleLineItemEditorProps> = ({
  lineItems,
  services,
  onChange,
}) => {
  /** Service ID → Service lookup. */
  const serviceMap = React.useMemo(() => {
    const map = new Map<number, Service>();
    for (const s of services) {
      if (s.id !== undefined) map.set(s.id, s);
    }
    return map;
  }, [services]);

  /** Services not yet in the line items list. */
  const availableServices = React.useMemo(() => {
    const existingIds = lineItems.map((li) => li.serviceId);
    return services.filter(
      (s) => s.id !== undefined && s.isActive === 1 && existingIds.indexOf(s.id!) < 0,
    );
  }, [services, lineItems]);

  const addServiceOptions: IDropdownOption[] = React.useMemo(
    () => availableServices.map((s) => ({ key: s.id!, text: s.name })),
    [availableServices],
  );

  const handleToggle = React.useCallback(
    (index: number, checked: boolean): void => {
      const updated = lineItems.map((li, i) =>
        i === index ? { ...li, isSelected: checked } : li,
      );
      onChange(updated);
    },
    [lineItems, onChange],
  );

  const handleVariantChange = React.useCallback(
    (index: number, variantId: string | null): void => {
      const updated = lineItems.map((li, i) =>
        i === index ? { ...li, variantId } : li,
      );
      onChange(updated);
    },
    [lineItems, onChange],
  );

  const handleRemove = React.useCallback(
    (index: number): void => {
      const updated = lineItems.filter((_, i) => i !== index);
      onChange(updated);
    },
    [lineItems, onChange],
  );

  const handleMoveUp = React.useCallback(
    (index: number): void => {
      if (index === 0) return;
      const updated = lineItems.map((li) => ({ ...li }));
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      onChange(updated);
    },
    [lineItems, onChange],
  );

  const handleMoveDown = React.useCallback(
    (index: number): void => {
      if (index >= lineItems.length - 1) return;
      const updated = lineItems.map((li) => ({ ...li }));
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      onChange(updated);
    },
    [lineItems, onChange],
  );

  const handleAddService = React.useCallback(
    (_: unknown, option?: IDropdownOption): void => {
      if (!option) return;
      const svc = serviceMap.get(Number(option.key));
      const defaultVariantId =
        svc && svc.variants.length > 0 ? svc.variants[0].id : null;
      const newItem: ScheduleLineItem = {
        serviceId: Number(option.key),
        variantId: defaultVariantId,
        isSelected: true,
      };
      onChange([...lineItems, newItem]);
    },
    [lineItems, onChange, serviceMap],
  );

  return (
    <div className={styles.lineItemEditorContainer}>
      {lineItems.length === 0 ? (
        <Text
          variant="small"
          style={{ color: "#605e5c", padding: "8px 0", display: "block" }}
        >
          No line items. Use the dropdown below to add services.
        </Text>
      ) : (
        lineItems.map((li, idx) => {
          const svc = serviceMap.get(li.serviceId);
          const variantOptions: IDropdownOption[] = svc
            ? svc.variants.map((v) => ({
                key: v.id,
                text: `${v.name} ($${v.basePrice.toFixed(2)})`,
              }))
            : [];
          return (
            <div
              key={`${li.serviceId}-${idx}`}
              className={styles.lineItemEditorRow}
            >
              <Checkbox
                checked={li.isSelected}
                onChange={(_, checked): void =>
                  handleToggle(idx, checked ?? false)
                }
                title={li.isSelected ? "Enabled" : "Disabled"}
              />
              <span className={styles.lineItemEditorService}>
                {svc?.name ?? `Service #${li.serviceId}`}
              </span>
              {variantOptions.length > 0 && (
                <Dropdown
                  options={variantOptions}
                  selectedKey={li.variantId ?? undefined}
                  onChange={(_, opt): void =>
                    handleVariantChange(
                      idx,
                      opt ? String(opt.key) : null,
                    )
                  }
                  className={styles.lineItemEditorVariant}
                  placeholder="Select variant"
                />
              )}
              <div className={styles.lineItemEditorReorder}>
                <IconButton
                  iconProps={{ iconName: "ChevronUp" }}
                  title="Move up"
                  ariaLabel="Move up"
                  disabled={idx === 0}
                  onClick={(): void => handleMoveUp(idx)}
                  styles={{ root: { width: 24, height: 20 } }}
                />
                <IconButton
                  iconProps={{ iconName: "ChevronDown" }}
                  title="Move down"
                  ariaLabel="Move down"
                  disabled={idx === lineItems.length - 1}
                  onClick={(): void => handleMoveDown(idx)}
                  styles={{ root: { width: 24, height: 20 } }}
                />
              </div>
              <IconButton
                iconProps={{ iconName: "Delete" }}
                title="Remove"
                ariaLabel={`Remove ${svc?.name ?? "service"}`}
                onClick={(): void => handleRemove(idx)}
                styles={{ root: { color: "#a4262c" } }}
              />
            </div>
          );
        })
      )}
      {availableServices.length > 0 && (
        <Dropdown
          placeholder="Add a service…"
          options={addServiceOptions}
          onChange={handleAddService}
          selectedKey={undefined}
          styles={{ root: { marginTop: 8, maxWidth: 300 } }}
        />
      )}
    </div>
  );
};
