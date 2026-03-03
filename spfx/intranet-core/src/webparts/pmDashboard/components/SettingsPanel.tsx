/**
 * SettingsPanel – Property Manager CRUD panel.
 *
 * Allows adding, editing, and removing property managers.
 * Opened from the gear icon in the dashboard header.
 */

import * as React from "react";
import {
  Panel,
  PanelType,
  TextField,
  PrimaryButton,
  DefaultButton,
  IconButton,
  Stack,
  Label,
} from "@fluentui/react";
import type { IPropertyManager } from "../models/types";
import { getInitials, getContrastColor } from "../models/pmHelpers";
import styles from "./PmDashboard.module.scss";

/**
 * Generate a unique ID for a new PM.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ISettingsPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  propertyManagers: IPropertyManager[];
  onSave: (pms: IPropertyManager[]) => void;
  onResetColumnWidths?: () => void;
}

interface IPmFormState {
  firstName: string;
  lastName: string;
  preferredName: string;
  color: string;
}

const EMPTY_FORM: IPmFormState = {
  firstName: "",
  lastName: "",
  preferredName: "",
  color: "#cccccc",
};

export const SettingsPanel: React.FC<ISettingsPanelProps> = ({
  isOpen,
  onDismiss,
  propertyManagers,
  onSave,
  onResetColumnWidths,
}) => {
  const [localPms, setLocalPms] = React.useState<IPropertyManager[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<IPmFormState>(EMPTY_FORM);

  // Sync local state when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalPms([...propertyManagers]);
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }, [isOpen, propertyManagers]);

  const handleFieldChange = React.useCallback(
    (field: keyof IPmFormState) =>
      (_: unknown, value?: string) => {
        setForm((prev) => ({ ...prev, [field]: value || "" }));
      },
    [],
  );

  const handleColorChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, color: e.target.value }));
    },
    [],
  );

  const handleAdd = React.useCallback((): void => {
    if (!form.firstName.trim() || !form.lastName.trim()) return;

    const newPm: IPropertyManager = {
      id: generateId(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      preferredName: form.preferredName.trim(),
      color: form.color,
    };

    setLocalPms((prev) => [...prev, newPm]);
    setForm(EMPTY_FORM);
  }, [form]);

  const handleEdit = React.useCallback(
    (pm: IPropertyManager): void => {
      setEditingId(pm.id);
      setForm({
        firstName: pm.firstName,
        lastName: pm.lastName,
        preferredName: pm.preferredName,
        color: pm.color,
      });
    },
    [],
  );

  const handleUpdate = React.useCallback((): void => {
    if (!editingId || !form.firstName.trim() || !form.lastName.trim()) return;

    setLocalPms((prev) =>
      prev.map((pm) =>
        pm.id === editingId
          ? {
              ...pm,
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              preferredName: form.preferredName.trim(),
              color: form.color,
            }
          : pm,
      ),
    );
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, [editingId, form]);

  const handleRemove = React.useCallback((pmId: string): void => {
    setLocalPms((prev) => prev.filter((pm) => pm.id !== pmId));
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, []);

  const handleSave = React.useCallback((): void => {
    onSave(localPms);
    onDismiss();
  }, [localPms, onSave, onDismiss]);

  const handleCancel = React.useCallback((): void => {
    if (editingId) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }, [editingId]);

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText="Property Managers"
      closeButtonAriaLabel="Close settings"
    >
      <div className={styles.settingsPanel}>
        {/* PM List */}
        <div className={styles.pmList}>
          {localPms.map((pm) => {
            const initials = getInitials(pm);
            const textColor = getContrastColor(pm.color);

            return (
              <div key={pm.id} className={styles.pmListItem}>
                <div
                  className={styles.pmColorSwatch}
                  style={{ backgroundColor: pm.color }}
                  title={pm.color}
                >
                  <span
                    style={{
                      color: textColor,
                      fontSize: 10,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    {initials}
                  </span>
                </div>
                <span className={styles.pmListItemName}>
                  {pm.preferredName || pm.firstName} {pm.lastName}
                </span>
                <IconButton
                  iconProps={{ iconName: "Edit" }}
                  title="Edit"
                  onClick={() => handleEdit(pm)}
                />
                <IconButton
                  iconProps={{ iconName: "Delete" }}
                  title="Remove"
                  onClick={() => handleRemove(pm.id)}
                />
              </div>
            );
          })}
        </div>

        {/* Add / Edit Form */}
        <Stack tokens={{ childrenGap: 8 }} style={{ marginTop: 16 }}>
          <Label>{editingId ? "Edit Property Manager" : "Add Property Manager"}</Label>
          <TextField
            label="First name"
            value={form.firstName}
            onChange={handleFieldChange("firstName")}
            required
          />
          <TextField
            label="Last name"
            value={form.lastName}
            onChange={handleFieldChange("lastName")}
            required
          />
          <TextField
            label="Preferred name"
            value={form.preferredName}
            onChange={handleFieldChange("preferredName")}
            placeholder="Optional short name"
          />
          <div>
            <Label>Row colour</Label>
            <input
              type="color"
              value={form.color}
              onChange={handleColorChange}
              style={{ width: 60, height: 32, cursor: "pointer", border: "none" }}
            />
          </div>

          <Stack horizontal tokens={{ childrenGap: 8 }}>
            {editingId ? (
              <>
                <PrimaryButton text="Update" onClick={handleUpdate} />
                <DefaultButton text="Cancel" onClick={handleCancel} />
              </>
            ) : (
              <PrimaryButton
                text="Add"
                onClick={handleAdd}
                disabled={!form.firstName.trim() || !form.lastName.trim()}
              />
            )}
          </Stack>
        </Stack>

        {/* Save All */}
        <Stack
          horizontal
          tokens={{ childrenGap: 8 }}
          style={{ marginTop: 24, borderTop: "1px solid #edebe9", paddingTop: 16 }}
        >
          <PrimaryButton text="Save Changes" onClick={handleSave} />
          <DefaultButton text="Discard" onClick={onDismiss} />
        </Stack>

        {/* Column Width Reset */}
        {onResetColumnWidths && (
          <Stack
            tokens={{ childrenGap: 4 }}
            style={{ marginTop: 24, borderTop: "1px solid #edebe9", paddingTop: 16 }}
          >
            <Label>Column Widths</Label>
            <DefaultButton
              text="Reset Column Widths"
              iconProps={{ iconName: "ResetDevice" }}
              onClick={onResetColumnWidths}
            />
          </Stack>
        )}
      </div>
    </Panel>
  );
};
