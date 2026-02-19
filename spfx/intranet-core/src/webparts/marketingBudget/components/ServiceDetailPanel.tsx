/**
 * ServiceDetailPanel — Expanded detail view for a single service.
 *
 * Shows variants with pricing, size/tier match info, and included
 * services for package-type variants. Extracted from ServicesView
 * to keep files under ~300 lines.
 */

import * as React from "react";
import { Text, Icon, DefaultButton } from "@fluentui/react";
import type { Service } from "../models/types";
import styles from "./MarketingBudget.module.scss";

export interface IServiceDetailPanelProps {
  service: Service;
  vendorName: string;
  isAdmin: boolean;
  onEdit: (service: Service) => void;
  onDuplicate: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const ServiceDetailPanel: React.FC<IServiceDetailPanelProps> = ({
  service,
  vendorName,
  isAdmin,
  onEdit,
  onDuplicate,
  onDelete,
}) => (
  <div className={styles.refDetailPanel}>
    <Text className={styles.refDetailTitle}>{service.name}</Text>
    {isAdmin && (
      <div className={styles.refDetailActions}>
        <DefaultButton
          text="Edit Service"
          iconProps={{ iconName: "Edit" }}
          onClick={(): void => onEdit(service)}
        />
        <DefaultButton
          text="Duplicate Service"
          iconProps={{ iconName: "Copy" }}
          onClick={(): void => onDuplicate(service)}
        />
        <DefaultButton
          text="Delete Service"
          iconProps={{ iconName: "Delete" }}
          onClick={(): void => onDelete(service)}
        />
      </div>
    )}
    <div className={styles.refDetailMeta}>
      <span>
        Category:{" "}
        <strong style={{ textTransform: "capitalize" }}>
          {service.category}
        </strong>
      </span>
      <span>
        Vendor: <strong>{vendorName}</strong>
      </span>
      <span>
        Selection:{" "}
        <strong style={{ textTransform: "capitalize" }}>
          {service.variantSelector ?? "None"}
        </strong>
      </span>
      <span>
        GST inclusive: <strong>{service.includesGst ? "Yes" : "No"}</strong>
      </span>
    </div>

    <Text
      className={styles.sectionTitle}
      style={{ marginTop: 12, fontSize: 13 }}
    >
      Variants
    </Text>
    <div className={styles.refItemList}>
      {service.variants.length === 0 ? (
        <Text variant="small" style={{ color: "#605e5c", padding: "8px 0" }}>
          No variants defined.
        </Text>
      ) : (
        service.variants.map((v) => (
          <div key={v.id} className={styles.refItemRow}>
            <span className={styles.refItemName}>{v.name}</span>
            <span className={styles.refItemVariant}>
              {v.sizeMatch
                ? `Size: ${v.sizeMatch}`
                : v.tierMatch
                  ? `Tier: ${v.tierMatch}`
                  : ""}
            </span>
            <span className={styles.refItemPrice}>
              ${v.basePrice.toFixed(2)}
            </span>
          </div>
        ))
      )}
    </div>

    {/* Included services for package variants */}
    {service.variants.some(
      (v) => v.includedServices && v.includedServices.length > 0,
    ) && (
      <>
        <Text
          className={styles.sectionTitle}
          style={{ marginTop: 12, fontSize: 13 }}
        >
          Included Services
        </Text>
        <div className={styles.refItemList}>
          {service.variants
            .filter(
              (v) => v.includedServices && v.includedServices.length > 0,
            )
            .map((v) => (
              <div key={v.id} style={{ marginBottom: 8 }}>
                <Text variant="small" style={{ fontWeight: 600 }}>
                  {v.name}:
                </Text>
                {v.includedServices!.map((inc, idx) => (
                  <div
                    key={idx}
                    className={styles.refItemRow}
                    style={{ paddingLeft: 16 }}
                  >
                    <Icon
                      iconName="StatusCircleCheckmark"
                      style={{
                        color: "#001CAD",
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    />
                    <span className={styles.refItemName}>
                      {inc.serviceName}
                    </span>
                    <span className={styles.refItemVariant}>
                      {inc.variantName ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </>
    )}
  </div>
);
