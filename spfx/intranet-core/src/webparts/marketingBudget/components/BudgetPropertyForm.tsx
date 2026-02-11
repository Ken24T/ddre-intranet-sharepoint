/* eslint-disable @rushstack/no-new-null */
/**
 * BudgetPropertyForm — Property details and client/agent fields.
 *
 * Extracted from BudgetEditorPanel to keep files under ~300 lines.
 */

import * as React from "react";
import { Dropdown, TextField } from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react";
import type {
  BudgetTier,
  PropertySize,
  PropertyType,
} from "../models/types";
import {
  propertyTypeOptions,
  propertySizeOptions,
  budgetTierOptions,
} from "./budgetEditorConstants";
import styles from "./MarketingBudget.module.scss";

export interface IBudgetPropertyFormProps {
  address: string;
  propertyType: PropertyType;
  propertySize: PropertySize;
  tier: BudgetTier;
  suburbId: number | null;
  vendorId: number | null;
  clientName: string;
  agentName: string;
  suburbOptions: IDropdownOption[];
  vendorOptions: IDropdownOption[];
  onAddressChange: (value: string) => void;
  onPropertyTypeChange: (value: PropertyType) => void;
  onPropertySizeChange: (value: PropertySize) => void;
  onTierChange: (value: BudgetTier) => void;
  onSuburbIdChange: (value: number | null) => void;
  onVendorIdChange: (value: number | null) => void;
  onClientNameChange: (value: string) => void;
  onAgentNameChange: (value: string) => void;
  /** When true, all fields are disabled (read-only view). */
  readOnly?: boolean;
}

export const BudgetPropertyForm: React.FC<IBudgetPropertyFormProps> = ({
  address,
  propertyType,
  propertySize,
  tier,
  suburbId,
  vendorId,
  clientName,
  agentName,
  suburbOptions,
  vendorOptions,
  onAddressChange,
  onPropertyTypeChange,
  onPropertySizeChange,
  onTierChange,
  onSuburbIdChange,
  onVendorIdChange,
  onClientNameChange,
  onAgentNameChange,
  readOnly,
}) => (
  <>
    <TextField
      label="Property Address"
      value={address}
      onChange={(_, val): void => onAddressChange(val ?? "")}
      required
      placeholder="e.g. 42 Jubilee Terrace, Bardon QLD 4065"
      readOnly={readOnly}
    />

    <div className={styles.formRow}>
      <div className={styles.formField}>
        <Dropdown
          label="Property Type"
          options={propertyTypeOptions}
          selectedKey={propertyType}
          onChange={(_, opt): void =>
            onPropertyTypeChange((opt?.key ?? "house") as PropertyType)
          }
          disabled={readOnly}
        />
      </div>
      <div className={styles.formField}>
        <Dropdown
          label="Property Size"
          options={propertySizeOptions}
          selectedKey={propertySize}
          onChange={(_, opt): void =>
            onPropertySizeChange((opt?.key ?? "medium") as PropertySize)
          }
          disabled={readOnly}
        />
      </div>
      <div className={styles.formField}>
        <Dropdown
          label="Budget Tier"
          options={budgetTierOptions}
          selectedKey={tier}
          onChange={(_, opt): void =>
            onTierChange((opt?.key ?? "standard") as BudgetTier)
          }
          disabled={readOnly}
        />
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.formField}>
        <Dropdown
          label="Suburb"
          options={suburbOptions}
          selectedKey={suburbId ? String(suburbId) : ""}
          onChange={(_, opt): void => {
            const id = opt?.key ? Number(opt.key) : null;
            onSuburbIdChange(id || null);
          }}
          placeholder="Select suburb…"
          disabled={readOnly}
        />
      </div>
      <div className={styles.formField}>
        <Dropdown
          label="Preferred Vendor"
          options={vendorOptions}
          selectedKey={vendorId ? String(vendorId) : ""}
          onChange={(_, opt): void => {
            const id = opt?.key ? Number(opt.key) : null;
            onVendorIdChange(id || null);
          }}
          placeholder="Select vendor…"
          disabled={readOnly}
        />
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.formField}>
        <TextField
          label="Client Name"
          value={clientName}
          onChange={(_, val): void => onClientNameChange(val ?? "")}
          placeholder="Property owner name"
          readOnly={readOnly}
        />
      </div>
      <div className={styles.formField}>
        <TextField
          label="Agent Name"
          value={agentName}
          onChange={(_, val): void => onAgentNameChange(val ?? "")}
          placeholder="Listing agent"
          readOnly={readOnly}
        />
      </div>
    </div>
  </>
);
