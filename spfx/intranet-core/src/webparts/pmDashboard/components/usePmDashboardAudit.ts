/**
 * usePmDashboardAudit – Audit logging hook for the PM Dashboard.
 *
 * Wraps the shell's IAuditLogger with PM Dashboard-specific convenience
 * methods. Every event is tagged with hub: 'property-management' and
 * tool: 'pm-dashboard' so events can be filtered in the Audit Log Viewer.
 *
 * Field-level change tracking: mutation events include column name,
 * old value, and new value in the metadata object.
 */

import { useAudit } from "../../intranetShell/components/AuditContext";
import type { IAuditLogger, LogOptions } from "../../intranetShell/components/AuditContext";
import type { DashboardSection } from "../models/types";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PM_DASHBOARD_OPTIONS: Pick<LogOptions, "hub" | "tool"> = {
  hub: "property-management",
  tool: "pm-dashboard",
};

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function opts(metadata: Record<string, unknown>): LogOptions {
  return { ...PM_DASHBOARD_OPTIONS, metadata };
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export interface IPmDashboardAudit {
  /** Underlying logger instance */
  readonly logger: IAuditLogger;

  // ── Data Mutations ──────────────────────────────────────

  /** A property or blank row was added */
  logRowAdded(section: DashboardSection, rowId: string, method: "button" | "context-menu" | "propertyme"): void;

  /** A row was removed */
  logRowDeleted(section: DashboardSection, rowId: string, property?: string): void;

  /** A row was reordered via drag-and-drop */
  logRowReordered(section: DashboardSection, rowId: string, oldIndex: number, newIndex: number): void;

  /** A cell value was edited (text, comments, ECR BY, etc.) */
  logCellEdited(section: DashboardSection, rowId: string, column: string, oldValue: string, newValue: string): void;

  /** PM dropdown changed on a row */
  logPmAssigned(section: DashboardSection, rowId: string, oldPm: string, newPm: string): void;

  /** Date cell changed */
  logDateChanged(section: DashboardSection, rowId: string, oldDate: string, newDate: string): void;

  /** Checkbox cell toggled (STS, Sign, KEY, Signed, BOND, 2WKS, ECR) */
  logCheckboxToggled(section: DashboardSection, rowId: string, column: string, checked: boolean): void;

  /** PropertyMe URL linked to a row */
  logPropertyLinked(section: DashboardSection, rowId: string, url: string, address?: string): void;

  /** VAC cell value changed (PM assigned to vacancy) */
  logVacAssigned(section: DashboardSection, rowId: string, oldVac: string, newVac: string): void;

  // ── Navigation & Views ─────────────────────────────────

  /** Dashboard opened / data loaded */
  logDashboardOpened(): void;

  /** Pivot tab switched (Tables / Portfolio / Maintenance) */
  logViewSwitched(fromView: string, toView: string): void;

  /** PM selector changed */
  logPmSelected(pmInitials: string, previousPm: string): void;

  /** Settings panel toggled open/closed */
  logSettingsPanelToggled(open: boolean): void;

  /** PM settings (add/edit/delete) */
  logPmSettingsUpdated(action: "added" | "edited" | "deleted", pmName: string): void;

  // ── PropertyMe Integration ─────────────────────────────

  /** PropertyMe URL pasted via input box */
  logPropertyMeUrlAdded(url: string, address?: string): void;

  /** Property dropped from PropertyMe extension */
  logPropertyMeDrop(section: DashboardSection, url: string, address?: string): void;

  // ── Collaboration ──────────────────────────────────────

  /** Real-time data synced from another user */
  logDataSynced(source: "polling" | "push"): void;

  /** User presence detected online/offline */
  logPresenceChanged(userId: string, status: "online" | "offline"): void;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function usePmDashboardAudit(): IPmDashboardAudit {
  const logger = useAudit();

  return {
    logger,

    // ── Data Mutations ────────────────────────────────────

    logRowAdded(section, rowId, method) {
      logger.logUserInteraction("row_added", opts({ section, rowId, method }));
    },

    logRowDeleted(section, rowId, property) {
      logger.logUserInteraction("row_deleted", opts({ section, rowId, property }));
    },

    logRowReordered(section, rowId, oldIndex, newIndex) {
      logger.logUserInteraction("row_reordered", opts({ section, rowId, oldIndex, newIndex }));
    },

    logCellEdited(section, rowId, column, oldValue, newValue) {
      logger.logUserInteraction("cell_edited", opts({ section, rowId, column, oldValue, newValue }));
    },

    logPmAssigned(section, rowId, oldPm, newPm) {
      logger.logUserInteraction("pm_assigned", opts({ section, rowId, oldPm, newPm }));
    },

    logDateChanged(section, rowId, oldDate, newDate) {
      logger.logUserInteraction("date_changed", opts({ section, rowId, oldDate, newDate }));
    },

    logCheckboxToggled(section, rowId, column, checked) {
      logger.logUserInteraction("checkbox_toggled", opts({ section, rowId, column, checked }));
    },

    logPropertyLinked(section, rowId, url, address) {
      logger.logUserInteraction("property_linked", opts({ section, rowId, url, address }));
    },

    logVacAssigned(section, rowId, oldVac, newVac) {
      logger.logUserInteraction("vac_assigned", opts({ section, rowId, oldVac, newVac }));
    },

    // ── Navigation & Views ───────────────────────────────

    logDashboardOpened() {
      logger.logNavigation("dashboard_opened", PM_DASHBOARD_OPTIONS);
    },

    logViewSwitched(fromView, toView) {
      logger.logNavigation("view_switched", opts({ fromView, toView }));
    },

    logPmSelected(pmInitials, previousPm) {
      logger.logUserInteraction("pm_selected", opts({ pmInitials, previousPm }));
    },

    logSettingsPanelToggled(open) {
      logger.logSettings(
        open ? "settings_panel_opened" : "settings_panel_closed",
        PM_DASHBOARD_OPTIONS,
      );
    },

    logPmSettingsUpdated(action, pmName) {
      logger.logSettings("pm_settings_updated", opts({ action, pmName }));
    },

    // ── PropertyMe Integration ───────────────────────────

    logPropertyMeUrlAdded(url, address) {
      logger.logUserInteraction("property_linked", opts({ source: "url-input", url, address }));
    },

    logPropertyMeDrop(section, url, address) {
      logger.logUserInteraction("property_linked", opts({ source: "drag-drop", section, url, address }));
    },

    // ── Collaboration ────────────────────────────────────

    logDataSynced(source) {
      logger.logSystem("data_synced", opts({ source }));
    },

    logPresenceChanged(userId, status) {
      logger.logSystem("presence_detected", opts({ userId, status }));
    },
  };
}
