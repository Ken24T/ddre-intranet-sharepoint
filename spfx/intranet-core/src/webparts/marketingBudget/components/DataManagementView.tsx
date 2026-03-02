/**
 * DataManagementView – Selective export/import of reference data and budgets
 *
 * Admin-only view providing:
 * • Export: choose entity types → download JSON file
 * • Import: upload JSON file → preview contents → choose types to import
 */

import * as React from "react";
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  Icon,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type { UserRole } from "../models/permissions";
import type { DataExport } from "../models/types";
import type { ExportEntityType, ImportSummary } from "../models/exportHelpers";
import {
  ALL_ENTITY_TYPES,
  exportSelective,
  analyseImport,
  importSelective,
  downloadJson,
} from "../models/exportHelpers";
import styles from "./MarketingBudget.module.scss";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

export interface IDataManagementViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
}

// ─────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────

const ENTITY_LABELS: Record<ExportEntityType, { label: string; icon: string }> = {
  vendors: { label: "Vendors", icon: "People" },
  services: { label: "Services", icon: "Settings" },
  suburbs: { label: "Suburbs", icon: "MapPin" },
  schedules: { label: "Schedules", icon: "CalendarWeek" },
  budgets: { label: "Budgets", icon: "Financial" },
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const DataManagementView: React.FC<IDataManagementViewProps> = ({
  repository,
  userRole,
}) => {
  // ─── Export state ───────────────────────────────────────
  const [exportTypes, setExportTypes] = React.useState<Set<ExportEntityType>>(
    () => new Set(ALL_ENTITY_TYPES),
  );
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportMessage, setExportMessage] = React.useState<string | undefined>(undefined);

  // ─── Import state ───────────────────────────────────────
  const [importData, setImportData] = React.useState<Partial<DataExport> | undefined>(undefined);
  const [importSummary, setImportSummary] = React.useState<ImportSummary | undefined>(undefined);
  const [importTypes, setImportTypes] = React.useState<Set<ExportEntityType>>(new Set());
  const [isImporting, setIsImporting] = React.useState(false);
  const [importMessage, setImportMessage] = React.useState<string | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  // ─── Shared ─────────────────────────────────────────────
  const [error, setError] = React.useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ─── Export handlers ────────────────────────────────────

  const toggleExportType = (type: ExportEntityType, checked: boolean): void => {
    setExportTypes((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(type);
      } else {
        next.delete(type);
      }
      return next;
    });
  };

  const handleExport = React.useCallback(async (): Promise<void> => {
    setIsExporting(true);
    setError(undefined);
    setExportMessage(undefined);
    try {
      const types = Array.from(exportTypes);
      const data = await exportSelective(repository, types);
      const filename = `ddre-budget-export-${new Date().toISOString().slice(0, 10)}.json`;
      downloadJson(data, filename);
      setExportMessage(`Exported ${types.join(", ")} to ${filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [repository, exportTypes]);

  // ─── Import handlers ────────────────────────────────────

  const handleFileSelect = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      setError(undefined);
      setImportMessage(undefined);
      setImportData(undefined);
      setImportSummary(undefined);

      const reader = new FileReader();
      reader.onload = (e): void => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text) as Partial<DataExport>;
          const summary = analyseImport(parsed);
          setImportData(parsed);
          setImportSummary(summary);
          setImportTypes(new Set(summary.availableTypes));
        } catch {
          setError("Invalid JSON file. Please select a valid export file.");
        }
      };
      reader.readAsText(file);

      // Reset file input so the same file can be re-selected
      event.target.value = "";
    },
    [],
  );

  const toggleImportType = (type: ExportEntityType, checked: boolean): void => {
    setImportTypes((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(type);
      } else {
        next.delete(type);
      }
      return next;
    });
  };

  const handleImportConfirmed = React.useCallback(async (): Promise<void> => {
    if (!importData) return;
    setShowConfirmDialog(false);
    setIsImporting(true);
    setError(undefined);
    setImportMessage(undefined);
    try {
      const types = Array.from(importTypes);
      const result = await importSelective(importData, types, repository);
      const parts: string[] = [];
      for (const t of types) {
        if (result.imported[t] > 0) {
          parts.push(`${result.imported[t]} ${t}`);
        }
      }
      setImportMessage(`Imported: ${parts.join(", ")}`);
      setImportData(undefined);
      setImportSummary(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  }, [importData, importTypes, repository]);

  // ─── Access check ───────────────────────────────────────

  if (userRole !== "admin") {
    return (
      <div className={styles.centeredState}>
        <Icon iconName="Lock" style={{ fontSize: 48, color: "#a19f9d", marginBottom: 16 }} />
        <Text variant="large">Admin access required</Text>
        <Text variant="medium" style={{ color: "#605e5c", marginTop: 8 }}>
          Data management is only available to administrators.
        </Text>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className={styles.viewContainer} data-testid="data-management-view">
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Data Management</Text>
        <Text className={styles.viewSubtitle}>
          Export and import reference data and budgets
        </Text>
      </div>

      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={(): void => setError(undefined)}
          dismissButtonAriaLabel="Close"
        >
          {error}
        </MessageBar>
      )}

      <div className={styles.dataManagementPanels}>
        {/* ── Export Panel ──────────────────────────────── */}
        <div className={styles.dataManagementPanel} data-testid="export-panel">
          <Text className={styles.dashboardSectionTitle}>
            <Icon iconName="Upload" /> Export Data
          </Text>
          <Text variant="small" style={{ color: "#605e5c", marginBottom: 12, display: "block" }}>
            Select which data types to include in the export file.
          </Text>

          {ALL_ENTITY_TYPES.map((type) => (
            <Checkbox
              key={type}
              label={`${ENTITY_LABELS[type].label}`}
              checked={exportTypes.has(type)}
              onChange={(_e, checked): void => toggleExportType(type, !!checked)}
              className={styles.entityCheckbox}
            />
          ))}

          <div style={{ marginTop: 16 }}>
            <PrimaryButton
              text={isExporting ? "Exporting…" : "Export Selected"}
              iconProps={{ iconName: "Download" }}
              onClick={handleExport}
              disabled={isExporting || exportTypes.size === 0}
            />
          </div>

          {exportMessage && (
            <MessageBar messageBarType={MessageBarType.success} style={{ marginTop: 8 }}>
              {exportMessage}
            </MessageBar>
          )}
        </div>

        {/* ── Import Panel ──────────────────────────────── */}
        <div className={styles.dataManagementPanel} data-testid="import-panel">
          <Text className={styles.dashboardSectionTitle}>
            <Icon iconName="Download" /> Import Data
          </Text>
          <Text variant="small" style={{ color: "#605e5c", marginBottom: 12, display: "block" }}>
            Upload a previously exported JSON file to import data. Records are merged additively.
          </Text>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <DefaultButton
            text="Choose File…"
            iconProps={{ iconName: "OpenFile" }}
            onClick={(): void => fileInputRef.current?.click()}
          />

          {isImporting && (
            <Spinner size={SpinnerSize.small} label="Importing…" style={{ marginTop: 12 }} />
          )}

          {importSummary && (
            <div className={styles.importSummary} data-testid="import-summary">
              <Text variant="mediumPlus" style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>
                File contents:
              </Text>
              {ALL_ENTITY_TYPES.map((type) => {
                const count = importSummary[type];
                const available = importSummary.availableTypes.indexOf(type) >= 0;
                return (
                  <Checkbox
                    key={type}
                    label={`${ENTITY_LABELS[type].label} (${count})`}
                    checked={importTypes.has(type)}
                    disabled={!available}
                    onChange={(_e, checked): void => toggleImportType(type, !!checked)}
                    className={styles.entityCheckbox}
                  />
                );
              })}

              <div style={{ marginTop: 16 }}>
                <PrimaryButton
                  text="Import Selected"
                  iconProps={{ iconName: "Import" }}
                  onClick={(): void => setShowConfirmDialog(true)}
                  disabled={isImporting || importTypes.size === 0}
                />
              </div>
            </div>
          )}

          {importMessage && (
            <MessageBar messageBarType={MessageBarType.success} style={{ marginTop: 8 }}>
              {importMessage}
            </MessageBar>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        hidden={!showConfirmDialog}
        onDismiss={(): void => setShowConfirmDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Confirm Import",
          subText: `This will add ${Array.from(importTypes).map((t) => `${importSummary?.[t] || 0} ${t}`).join(", ")} to your data. Existing records will not be removed. Continue?`,
        }}
      >
        <DialogFooter>
          <PrimaryButton text="Import" onClick={handleImportConfirmed} />
          <DefaultButton text="Cancel" onClick={(): void => setShowConfirmDialog(false)} />
        </DialogFooter>
      </Dialog>
    </div>
  );
};
