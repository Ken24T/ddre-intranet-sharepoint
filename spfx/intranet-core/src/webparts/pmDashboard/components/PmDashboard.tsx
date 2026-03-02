/**
 * PmDashboard – Root component for the Property Manager Dashboard.
 *
 * Manages all state via useReducer; loads/saves data through the
 * injected repository. Renders three section tables (Vacates,
 * Entries, Lost) side-by-side with a PM selector and settings panel.
 */

import * as React from "react";
import { Spinner, SpinnerSize, MessageBar, MessageBarType, IconButton } from "@fluentui/react";
import type { IPmDashboardProps } from "./IPmDashboardProps";
import type {
  IDashboardData,
  IPropertyManager,
  IPropertyRow,
  DashboardSection,
} from "../models/types";
import {
  createPropertyRow,
  createBlankRow,
  insertRow,
  removeRow,
  updateCell,
  updateRowPm,
  reorderByDate,
  reorderRows,
  updateDateFromDragPosition,
  validateAndCleanData,
} from "../models/rowOperations";
import { getDayOfWeek } from "../models/dateHelpers";
import { getInitials } from "../models/pmHelpers";
import { SectionTable } from "./SectionTable";
import { ContextMenu, type IContextMenuAction } from "./ContextMenu";
import { PmSelector } from "./PmSelector";
import { SettingsPanel } from "./SettingsPanel";
import { PropertyMeInput } from "./PropertyMeInput";
import type { IPropertyMeInputResult } from "./PropertyMeInput";
import { useShellBridge } from "./useShellBridge";
import type { PmDashboardView } from "./useShellBridge";
import styles from "./PmDashboard.module.scss";

// ─────────────────────────────────────────────────────────────
// State & Actions
// ─────────────────────────────────────────────────────────────

interface DashboardState {
  data: IDashboardData;
  propertyManagers: IPropertyManager[];
  selectedPm: string;
  loading: boolean;
  error: string | undefined;
  dirty: boolean;
}

type DashboardAction =
  | { type: "LOAD_START" }
  | {
      type: "LOAD_SUCCESS";
      data: IDashboardData;
      propertyManagers: IPropertyManager[];
    }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "SET_DATA"; data: IDashboardData }
  | { type: "SET_PROPERTY_MANAGERS"; pms: IPropertyManager[] }
  | { type: "SELECT_PM"; initials: string }
  | { type: "MARK_CLEAN" }
  | {
      type: "UPDATE_SECTION";
      section: DashboardSection;
      rows: IPropertyRow[];
    };

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: undefined };

    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        data: action.data,
        propertyManagers: action.propertyManagers,
        dirty: false,
      };

    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.error };

    case "SET_DATA":
      return { ...state, data: action.data, dirty: true };

    case "SET_PROPERTY_MANAGERS":
      return { ...state, propertyManagers: action.pms, dirty: true };

    case "SELECT_PM":
      return { ...state, selectedPm: action.initials };

    case "MARK_CLEAN":
      return { ...state, dirty: false };

    case "UPDATE_SECTION":
      return {
        ...state,
        data: { ...state.data, [action.section]: action.rows },
        dirty: true,
      };

    default:
      return state;
  }
}

const INITIAL_STATE: DashboardState = {
  data: { vacates: [], entries: [], lost: [] },
  propertyManagers: [],
  selectedPm: "",
  loading: true,
  error: undefined,
  dirty: false,
};

// ─────────────────────────────────────────────────────────────
// Context Menu State
// ─────────────────────────────────────────────────────────────

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  section: DashboardSection;
  rowId: string;
}

const INITIAL_CONTEXT_MENU: ContextMenuState = {
  visible: false,
  x: 0,
  y: 0,
  section: "vacates",
  rowId: "",
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const PmDashboard: React.FC<IPmDashboardProps> = ({
  repository,
}) => {
  const [state, dispatch] = React.useReducer(dashboardReducer, INITIAL_STATE);
  const [contextMenu, setContextMenu] =
    React.useState<ContextMenuState>(INITIAL_CONTEXT_MENU);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = React.useRef(true);

  // ─── AppBridge (sidebar navigation) ────────────────────
  const [activeView, setActiveView] = React.useState<PmDashboardView>("dashboard");

  const handleViewChange = React.useCallback(
    (view: PmDashboardView): void => {
      setActiveView(view);
      if (view === "settings") {
        setSettingsOpen(true);
      }
    },
    [],
  );

  useShellBridge(activeView, handleViewChange);

  // ─── Load data ─────────────────────────────────────────
  React.useEffect(() => {
    mountedRef.current = true;

    const load = async (): Promise<void> => {
      dispatch({ type: "LOAD_START" });
      try {
        const [data, pms] = await Promise.all([
          repository.loadData(),
          repository.loadPropertyManagers(),
        ]);
        if (mountedRef.current) {
          dispatch({
            type: "LOAD_SUCCESS",
            data: validateAndCleanData(data),
            propertyManagers: pms,
          });
        }
      } catch (err) {
        if (mountedRef.current) {
          dispatch({
            type: "LOAD_ERROR",
            error: err instanceof Error ? err.message : "Failed to load data",
          });
        }
      }
    };

    load().catch(console.error);

    return () => {
      mountedRef.current = false;
    };
  }, [repository]);

  // ─── Auto-save with debounce ───────────────────────────
  React.useEffect(() => {
    if (!state.dirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      repository
        .saveData(state.data)
        .then(() => {
          if (mountedRef.current) dispatch({ type: "MARK_CLEAN" });
        })
        .catch((err) => {
          console.error("Auto-save failed:", err);
        });
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.dirty, state.data, repository]);

  // ─── Cell change handler ───────────────────────────────
  const handleCellChange = React.useCallback(
    (
      section: DashboardSection,
      rowId: string,
      colIndex: number,
      value: string,
    ): void => {
      let rows = updateCell(state.data[section], rowId, colIndex, value);

      // If Date column changed, recalculate Day column for entries
      if (colIndex === 0 && section === "entries") {
        const dayValue = getDayOfWeek(value);
        rows = updateCell(rows, rowId, 1, dayValue);
      }

      dispatch({ type: "UPDATE_SECTION", section, rows });
    },
    [state.data],
  );

  // ─── PM change handler ────────────────────────────────
  const handlePmChange = React.useCallback(
    (section: DashboardSection, rowId: string, initials: string): void => {
      const rows = updateRowPm(state.data[section], rowId, section, initials);
      dispatch({ type: "UPDATE_SECTION", section, rows });
    },
    [state.data],
  );

  // ─── Date change handler (reorders by date) ───────────
  const handleDateChange = React.useCallback(
    (section: DashboardSection, rowId: string, value: string): void => {
      let rows = updateCell(state.data[section], rowId, 0, value);

      // Recalculate Day for entries
      if (section === "entries") {
        const dayValue = getDayOfWeek(value);
        rows = updateCell(rows, rowId, 1, dayValue);
      }

      // Reorder by new date
      rows = reorderByDate(rows, rowId, value);

      dispatch({ type: "UPDATE_SECTION", section, rows });
    },
    [state.data],
  );

  // ─── Drag-and-drop reorder handler ────────────────────
  const handleReorder = React.useCallback(
    (section: DashboardSection, activeId: string, overId: string): void => {
      const currentRows = state.data[section];
      const oldIndex = currentRows.findIndex((r) => r.id === activeId);
      const newIndex = currentRows.findIndex((r) => r.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      // Build new ID order
      const ids = currentRows.map((r) => r.id);
      const [moved] = ids.splice(oldIndex, 1);
      ids.splice(newIndex, 0, moved);

      let rows = reorderRows(currentRows, ids);
      rows = updateDateFromDragPosition(rows, activeId, section);

      dispatch({ type: "UPDATE_SECTION", section, rows });
    },
    [state.data],
  );

  // ─── PropertyMe URL handler ───────────────────────────
  const handlePropertyMeAdd = React.useCallback(
    (result: IPropertyMeInputResult): void => {
      // Default to vacates section for new PropertyMe imports
      const section: DashboardSection = "vacates";
      const activePm =
        state.selectedPm ||
        (state.propertyManagers.length > 0
          ? getInitials(state.propertyManagers[0])
          : "");

      const newRow = createPropertyRow(section, activePm);
      // Set property address from extraction
      if (result.address) {
        newRow.columns[1] = result.address; // Property column (index 1 for vacates)
      }
      newRow.propertyUrl = result.url;

      const rows = [...state.data[section], newRow];
      dispatch({ type: "UPDATE_SECTION", section, rows });
    },
    [state.data, state.selectedPm, state.propertyManagers],
  );

  // ─── Add row handler ──────────────────────────────────
  const handleAddRow = React.useCallback(
    (section: DashboardSection): void => {
      const activePm =
        state.selectedPm ||
        (state.propertyManagers.length > 0
          ? getInitials(state.propertyManagers[0])
          : "");

      const newRow = createPropertyRow(section, activePm);
      const rows = [...state.data[section], newRow];
      dispatch({ type: "UPDATE_SECTION", section, rows });
    },
    [state.data, state.selectedPm, state.propertyManagers],
  );

  // ─── Context menu handlers ────────────────────────────
  const handleContextMenu = React.useCallback(
    (e: React.MouseEvent, section: DashboardSection, rowId: string): void => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        section,
        rowId,
      });
    },
    [],
  );

  const dismissContextMenu = React.useCallback((): void => {
    setContextMenu(INITIAL_CONTEXT_MENU);
  }, []);

  const contextMenuActions = React.useMemo((): IContextMenuAction[] => {
    if (!contextMenu.visible) return [];

    const { section, rowId } = contextMenu;
    const activePm =
      state.selectedPm ||
      (state.propertyManagers.length > 0
        ? getInitials(state.propertyManagers[0])
        : "");

    return [
      {
        label: "Add property row",
        icon: "➕",
        onClick: () => {
          const row = state.data[section].find((r) => r.id === rowId);
          const inheritedDate = row?.columns?.[0] || undefined;
          const newRow = createPropertyRow(section, activePm, inheritedDate);
          const rows = insertRow(state.data[section], newRow, rowId);
          dispatch({ type: "UPDATE_SECTION", section, rows });
        },
      },
      {
        label: "Add blank row",
        icon: "➖",
        onClick: () => {
          const newRow = createBlankRow();
          const rows = insertRow(state.data[section], newRow, rowId);
          dispatch({ type: "UPDATE_SECTION", section, rows });
        },
      },
      {
        label: "Add URL from clipboard",
        icon: "🔗",
        onClick: () => {
          navigator.clipboard
            .readText()
            .then((text) => {
              if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
                const currentRows = state.data[section];
                const updatedRows = currentRows.map((r) =>
                  r.id === rowId ? { ...r, propertyUrl: text.trim() } : r,
                );
                dispatch({ type: "UPDATE_SECTION", section, rows: updatedRows });
              }
            })
            .catch(console.error);
        },
      },
      {
        label: "Remove row",
        icon: "🗑️",
        danger: true,
        onClick: () => {
          const rows = removeRow(state.data[section], rowId);
          dispatch({ type: "UPDATE_SECTION", section, rows });
        },
      },
    ];
  }, [contextMenu, state.data, state.selectedPm, state.propertyManagers]);

  // ─── PM Selector handler ──────────────────────────────
  const handleSelectPm = React.useCallback((initials: string): void => {
    dispatch({ type: "SELECT_PM", initials });
  }, []);

  // ─── Settings handlers ────────────────────────────────
  const handleOpenSettings = React.useCallback((): void => {
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = React.useCallback((): void => {
    setSettingsOpen(false);
    setActiveView("dashboard");
  }, []);

  const handleSavePropertyManagers = React.useCallback(
    (pms: IPropertyManager[]): void => {
      dispatch({ type: "SET_PROPERTY_MANAGERS", pms });
      repository.savePropertyManagers(pms).catch(console.error);
    },
    [repository],
  );

  // ─── Render ────────────────────────────────────────────

  if (state.loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.large} label="Loading dashboard…" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.errorContainer}>
        <MessageBar messageBarType={MessageBarType.error}>
          {state.error}
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.pmDashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Property Manager Dashboard</h2>
        </div>
        <div className={styles.headerActions}>
          <PmSelector
            propertyManagers={state.propertyManagers}
            selectedPm={state.selectedPm}
            onSelect={handleSelectPm}
          />
          <IconButton
            iconProps={{ iconName: "Settings" }}
            title="Settings"
            onClick={handleOpenSettings}
          />
        </div>
      </div>

      {/* PropertyMe URL Input */}
      <PropertyMeInput
        onAdd={handlePropertyMeAdd}
        disabled={!state.selectedPm}
      />

      {/* Section Tables */}
      <div className={styles.sectionsContainer}>
        <SectionTable
          section="vacates"
          title="Vacates"
          rows={state.data.vacates}
          propertyManagers={state.propertyManagers}
          onCellChange={handleCellChange}
          onPmChange={handlePmChange}
          onDateChange={handleDateChange}
          onContextMenu={handleContextMenu}
          onAddRow={handleAddRow}
          onReorder={handleReorder}
          readOnly={!state.selectedPm}
        />
        <SectionTable
          section="entries"
          title="Entries"
          rows={state.data.entries}
          propertyManagers={state.propertyManagers}
          onCellChange={handleCellChange}
          onPmChange={handlePmChange}
          onDateChange={handleDateChange}
          onContextMenu={handleContextMenu}
          onAddRow={handleAddRow}
          onReorder={handleReorder}
          readOnly={!state.selectedPm}
        />
        <SectionTable
          section="lost"
          title="Lost Managements"
          rows={state.data.lost}
          propertyManagers={state.propertyManagers}
          onCellChange={handleCellChange}
          onPmChange={handlePmChange}
          onDateChange={handleDateChange}
          onContextMenu={handleContextMenu}
          onAddRow={handleAddRow}
          onReorder={handleReorder}
          readOnly={!state.selectedPm}
        />
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={contextMenuActions}
          onDismiss={dismissContextMenu}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onDismiss={handleCloseSettings}
        propertyManagers={state.propertyManagers}
        onSave={handleSavePropertyManagers}
      />
    </div>
  );
};
