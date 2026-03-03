/**
 * Unit tests for usePmDashboardAudit hook.
 *
 * Verifies that each PM Dashboard audit method calls the correct
 * underlying IAuditLogger method with the right action, hub, tool,
 * and metadata (field-level tracking with old/new values).
 */

import * as React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { AuditProvider } from "../../intranetShell/components/AuditContext";
import type { IAuditLogger, LogOptions } from "../../intranetShell/components/AuditContext";
import { usePmDashboardAudit } from "./usePmDashboardAudit";

// ─────────────────────────────────────────────────────────────
// Mock Logger
// ─────────────────────────────────────────────────────────────

function createMockLogger(): IAuditLogger & {
  calls: { method: string; action: string; options?: LogOptions }[];
} {
  const calls: { method: string; action: string; options?: LogOptions }[] = [];

  const capture = (method: string): ((action: string, options?: LogOptions) => void) => (action: string, options?: LogOptions): void => {
    calls.push({ method, action, options });
  };

  return {
    calls,
    logNavigation: capture("logNavigation") as IAuditLogger["logNavigation"],
    logCardAction: capture("logCardAction") as IAuditLogger["logCardAction"],
    logSettings: capture("logSettings") as IAuditLogger["logSettings"],
    logContentView: capture("logContentView") as IAuditLogger["logContentView"],
    logSearch: capture("logSearch") as IAuditLogger["logSearch"],
    logUserInteraction: capture("logUserInteraction") as IAuditLogger["logUserInteraction"],
    logNotification: capture("logNotification") as IAuditLogger["logNotification"],
    logSystem: capture("logSystem") as IAuditLogger["logSystem"],
    logError: capture("logError") as IAuditLogger["logError"],
    logHelpSearch: capture("logHelpSearch") as IAuditLogger["logHelpSearch"],
    isEnabled: () => true,
    setEnabled: () => {},
    getSessionId: () => "test-session",
  };
}

// ─────────────────────────────────────────────────────────────
// Test setup helpers
// ─────────────────────────────────────────────────────────────

function setup(): ReturnType<typeof createMockLogger> & {
  audit: ReturnType<typeof usePmDashboardAudit>;
} {
  const logger = createMockLogger();

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(AuditProvider, { logger, children } as unknown as React.Attributes & { logger: IAuditLogger; children: React.ReactNode });

  const { result } = renderHook(() => usePmDashboardAudit(), { wrapper });

  return { ...logger, audit: result.current };
}

function lastCall(
  logger: ReturnType<typeof createMockLogger>,
): { method: string; action: string; options?: LogOptions } {
  return logger.calls[logger.calls.length - 1];
}

// ─────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────

describe("usePmDashboardAudit", () => {
  // ── Data Mutation Events ─────────────────────────────────

  describe("data mutation events", () => {
    it("logRowAdded emits user_interaction:row_added with section, rowId, method", () => {
      const { audit, ...logger } = setup();
      audit.logRowAdded("vacates", "row-1", "button");

      const call = lastCall(logger);
      expect(call.method).toBe("logUserInteraction");
      expect(call.action).toBe("row_added");
      expect(call.options?.hub).toBe("property-management");
      expect(call.options?.tool).toBe("pm-dashboard");
      expect(call.options?.metadata).toEqual({
        section: "vacates",
        rowId: "row-1",
        method: "button",
      });
    });

    it("logRowDeleted emits user_interaction:row_deleted with property name", () => {
      const { audit, ...logger } = setup();
      audit.logRowDeleted("entries", "row-2", "42 Smith St");

      const call = lastCall(logger);
      expect(call.action).toBe("row_deleted");
      expect(call.options?.metadata).toEqual({
        section: "entries",
        rowId: "row-2",
        property: "42 Smith St",
      });
    });

    it("logRowReordered emits user_interaction:row_reordered with old/new index", () => {
      const { audit, ...logger } = setup();
      audit.logRowReordered("vacates", "row-3", 2, 5);

      const call = lastCall(logger);
      expect(call.action).toBe("row_reordered");
      expect(call.options?.metadata).toEqual({
        section: "vacates",
        rowId: "row-3",
        oldIndex: 2,
        newIndex: 5,
      });
    });

    it("logCellEdited includes column name, old value, and new value", () => {
      const { audit, ...logger } = setup();
      audit.logCellEdited("vacates", "row-1", "Comments", "old note", "new note");

      const call = lastCall(logger);
      expect(call.action).toBe("cell_edited");
      expect(call.options?.metadata).toEqual({
        section: "vacates",
        rowId: "row-1",
        column: "Comments",
        oldValue: "old note",
        newValue: "new note",
      });
    });

    it("logPmAssigned includes old and new PM initials", () => {
      const { audit, ...logger } = setup();
      audit.logPmAssigned("entries", "row-4", "KB", "SN");

      const call = lastCall(logger);
      expect(call.action).toBe("pm_assigned");
      expect(call.options?.metadata).toEqual({
        section: "entries",
        rowId: "row-4",
        oldPm: "KB",
        newPm: "SN",
      });
    });

    it("logDateChanged includes old and new dates", () => {
      const { audit, ...logger } = setup();
      audit.logDateChanged("vacates", "row-5", "15/02", "20/03");

      const call = lastCall(logger);
      expect(call.action).toBe("date_changed");
      expect(call.options?.metadata).toEqual({
        section: "vacates",
        rowId: "row-5",
        oldDate: "15/02",
        newDate: "20/03",
      });
    });

    it("logCheckboxToggled includes column name and checked state", () => {
      const { audit, ...logger } = setup();
      audit.logCheckboxToggled("vacates", "row-6", "STS", true);

      const call = lastCall(logger);
      expect(call.action).toBe("checkbox_toggled");
      expect(call.options?.metadata).toEqual({
        section: "vacates",
        rowId: "row-6",
        column: "STS",
        checked: true,
      });
    });

    it("logPropertyLinked includes URL and optional address", () => {
      const { audit, ...logger } = setup();
      audit.logPropertyLinked("entries", "row-7", "https://app.propertyme.com/p/123", "10 Main St");

      const call = lastCall(logger);
      expect(call.action).toBe("property_linked");
      expect(call.options?.metadata).toEqual({
        section: "entries",
        rowId: "row-7",
        url: "https://app.propertyme.com/p/123",
        address: "10 Main St",
      });
    });

    it("logVacAssigned includes old and new VAC values", () => {
      const { audit, ...logger } = setup();
      audit.logVacAssigned("vacates", "row-8", "", "KB");

      const call = lastCall(logger);
      expect(call.action).toBe("vac_assigned");
      expect(call.options?.metadata).toEqual({
        section: "vacates",
        rowId: "row-8",
        oldVac: "",
        newVac: "KB",
      });
    });
  });

  // ── Navigation & View Events ─────────────────────────────

  describe("navigation and view events", () => {
    it("logDashboardOpened emits navigation:dashboard_opened", () => {
      const { audit, ...logger } = setup();
      audit.logDashboardOpened();

      const call = lastCall(logger);
      expect(call.method).toBe("logNavigation");
      expect(call.action).toBe("dashboard_opened");
      expect(call.options?.hub).toBe("property-management");
      expect(call.options?.tool).toBe("pm-dashboard");
    });

    it("logViewSwitched emits navigation:view_switched with from/to views", () => {
      const { audit, ...logger } = setup();
      audit.logViewSwitched("tables", "portfolio");

      const call = lastCall(logger);
      expect(call.method).toBe("logNavigation");
      expect(call.action).toBe("view_switched");
      expect(call.options?.metadata).toEqual({
        fromView: "tables",
        toView: "portfolio",
      });
    });

    it("logPmSelected emits user_interaction:pm_selected with previous PM", () => {
      const { audit, ...logger } = setup();
      audit.logPmSelected("SN", "KB");

      const call = lastCall(logger);
      expect(call.method).toBe("logUserInteraction");
      expect(call.action).toBe("pm_selected");
      expect(call.options?.metadata).toEqual({
        pmInitials: "SN",
        previousPm: "KB",
      });
    });

    it("logSettingsPanelToggled emits settings:settings_panel_opened when open", () => {
      const { audit, ...logger } = setup();
      audit.logSettingsPanelToggled(true);

      const call = lastCall(logger);
      expect(call.method).toBe("logSettings");
      expect(call.action).toBe("settings_panel_opened");
    });

    it("logSettingsPanelToggled emits settings:settings_panel_closed when closed", () => {
      const { audit, ...logger } = setup();
      audit.logSettingsPanelToggled(false);

      const call = lastCall(logger);
      expect(call.method).toBe("logSettings");
      expect(call.action).toBe("settings_panel_closed");
    });

    it("logPmSettingsUpdated emits settings:pm_settings_updated with action details", () => {
      const { audit, ...logger } = setup();
      audit.logPmSettingsUpdated("added", "Sophie Nguyen");

      const call = lastCall(logger);
      expect(call.method).toBe("logSettings");
      expect(call.action).toBe("pm_settings_updated");
      expect(call.options?.metadata).toEqual({
        action: "added",
        pmName: "Sophie Nguyen",
      });
    });
  });

  // ── PropertyMe Integration Events ───────────────────────

  describe("PropertyMe integration events", () => {
    it("logPropertyMeUrlAdded emits property_linked with source: url-input", () => {
      const { audit, ...logger } = setup();
      audit.logPropertyMeUrlAdded("https://app.propertyme.com/p/456", "7 Oak Ave");

      const call = lastCall(logger);
      expect(call.action).toBe("property_linked");
      expect(call.options?.metadata).toEqual({
        source: "url-input",
        url: "https://app.propertyme.com/p/456",
        address: "7 Oak Ave",
      });
    });

    it("logPropertyMeDrop emits property_linked with source: drag-drop", () => {
      const { audit, ...logger } = setup();
      audit.logPropertyMeDrop("vacates", "https://app.propertyme.com/p/789", "3 Elm St");

      const call = lastCall(logger);
      expect(call.action).toBe("property_linked");
      expect(call.options?.metadata).toEqual({
        source: "drag-drop",
        section: "vacates",
        url: "https://app.propertyme.com/p/789",
        address: "3 Elm St",
      });
    });
  });

  // ── Collaboration Events ────────────────────────────────

  describe("collaboration events", () => {
    it("logDataSynced emits system:data_synced with sync source", () => {
      const { audit, ...logger } = setup();
      audit.logDataSynced("polling");

      const call = lastCall(logger);
      expect(call.method).toBe("logSystem");
      expect(call.action).toBe("data_synced");
      expect(call.options?.metadata).toEqual({ source: "polling" });
    });

    it("logPresenceChanged emits system:presence_detected", () => {
      const { audit, ...logger } = setup();
      audit.logPresenceChanged("sophie@disher.com.au", "online");

      const call = lastCall(logger);
      expect(call.method).toBe("logSystem");
      expect(call.action).toBe("presence_detected");
      expect(call.options?.metadata).toEqual({
        userId: "sophie@disher.com.au",
        status: "online",
      });
    });
  });

  // ── Tool identifier ─────────────────────────────────────

  describe("tool identifier", () => {
    it("all events include hub: property-management and tool: pm-dashboard", () => {
      const { audit, ...logger } = setup();

      audit.logRowAdded("vacates", "r1", "button");
      audit.logDashboardOpened();
      audit.logDataSynced("polling");

      logger.calls.forEach((call) => {
        expect(call.options?.hub).toBe("property-management");
        expect(call.options?.tool).toBe("pm-dashboard");
      });
    });
  });

  // ── No-op fallback when outside AuditProvider ──────────

  describe("no-op fallback", () => {
    it("does not throw when used outside AuditProvider", () => {
      const { result } = renderHook(() => usePmDashboardAudit());
      const audit = result.current;

      expect(() => {
        audit.logRowAdded("vacates", "r1", "button");
        audit.logDashboardOpened();
        audit.logCellEdited("entries", "r2", "Comments", "", "test");
      }).not.toThrow();
    });
  });
});
