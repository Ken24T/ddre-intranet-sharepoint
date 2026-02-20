/**
 * BudgetListView — Displays all budgets in a filterable list.
 *
 * Shows a summary row for each budget with address, status, and line item count.
 * Supports filtering by status and text search.
 * Includes "New Budget" button and click-to-edit via BudgetEditorPanel.
 */

import * as React from "react";
import {
  Callout,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  TextField,
  Dialog,
  DialogFooter,
  DialogType,
  DirectionalHint,
  Dropdown,
  IconButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SearchBox,
  SelectionMode,
  Spinner,
  SpinnerSize,
  Text,
  Icon,
} from "@fluentui/react";
import type { IColumn, IDropdownOption, IContextualMenuProps, IContextualMenuItem } from "@fluentui/react";
import type { Budget, BudgetStatus } from "../models/types";
import type { UserRole } from "../models/permissions";
import {
  canCreateBudget,
  canDeleteBudget,
  canDuplicateBudget,
  canEditBudget,
  canTransitionBudget,
} from "../models/permissions";
import { calculateBudgetSummary } from "../models/budgetCalculations";
import { statusTransitions } from "./budgetEditorConstants";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import { BudgetEditorPanel } from "./BudgetEditorPanel";
import { DEFAULT_AGENT_NAME, normaliseDefaultAgentName } from "./settings";
import styles from "./MarketingBudget.module.scss";

export interface IBudgetListViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
  defaultAgentName: string;
  onDefaultAgentNameChange: (value: string) => void;
  onDataChanged?: () => void;
}

/** Column-friendly row shape. */
interface IBudgetRow {
  key: string;
  id: number;
  propertyAddress: string;
  propertyType: string;
  status: BudgetStatus;
  lineItemCount: number;
  createdAt: string;
  /** The original budget for editing. */
  _budget: Budget;
}

const statusOptions: IDropdownOption[] = [
  { key: "all", text: "All statuses" },
  { key: "draft", text: "Draft" },
  { key: "approved", text: "Approved" },
  { key: "sent", text: "Sent" },
  { key: "archived", text: "Archived" },
];

/** Maps budget status to a human-readable label. */
const statusLabels: Record<BudgetStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  sent: "Sent",
  archived: "Archived",
};

/** Maps budget status to the matching SCSS class suffix. */
const statusStyleMap: Record<BudgetStatus, string> = {
  draft: styles.statusDraft,
  approved: styles.statusApproved,
  sent: styles.statusSent,
  archived: styles.statusArchived,
};

/** Maps budget status to an icon name. */
const statusIconMap: Record<BudgetStatus, string> = {
  draft: "Edit",
  approved: "CheckMark",
  sent: "Mail",
  archived: "Archive",
};

/** Format a currency value in AUD. */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(value);

// ─── Budget Address Cell with hover Callout ──────────────

interface IBudgetAddressCellProps {
  budget: Budget;
}

const BudgetAddressCell: React.FC<IBudgetAddressCellProps> = ({ budget }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cellRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<number | undefined>(undefined);

  const handleMouseEnter = React.useCallback((): void => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsVisible(true), 350);
  }, []);

  const handleMouseLeave = React.useCallback((): void => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsVisible(false), 200);
  }, []);

  // Clean up timer on unmount
  React.useEffect(() => (): void => window.clearTimeout(timerRef.current), []);

  const summary = React.useMemo(
    () => calculateBudgetSummary(budget.lineItems),
    [budget.lineItems],
  );

  const statusClass = statusStyleMap[budget.status] ?? "";
  const statusIcon = statusIconMap[budget.status] ?? "Info";
  const statusLabel = statusLabels[budget.status] ?? budget.status;

  const createdDate = new Date(budget.createdAt);
  const formattedDate = createdDate.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div
        ref={cellRef}
        className={styles.budgetRowAddress}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        tabIndex={0}
      >
        {budget.propertyAddress}
      </div>
      {isVisible && cellRef.current && (
        <Callout
          target={cellRef.current}
          directionalHint={DirectionalHint.bottomLeftEdge}
          gapSpace={8}
          isBeakVisible={true}
          beakWidth={12}
          onMouseEnter={(): void => {
            window.clearTimeout(timerRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          onDismiss={(): void => setIsVisible(false)}
          setInitialFocus={false}
          className={styles.budgetCallout}
        >
          <div className={styles.budgetCalloutContent}>
            <div className={`${styles.budgetCalloutHeader} ${statusClass}`}>
              <Icon iconName={statusIcon} />
              <span>{statusLabel}</span>
            </div>
            <div className={styles.budgetCalloutBody}>
              <p className={styles.budgetCalloutAddress}>
                {budget.propertyAddress}
              </p>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="Home" className={styles.budgetCalloutMetaIcon} />
                <span>
                  {budget.propertyType.charAt(0).toUpperCase() +
                    budget.propertyType.slice(1)}{" "}
                  &middot; {budget.propertySize} &middot; {budget.tier}
                </span>
              </div>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="NumberedList" className={styles.budgetCalloutMetaIcon} />
                <span>
                  {summary.selectedCount} of {summary.totalCount} line items
                  selected
                </span>
              </div>
              {budget.agentName && (
                <div className={styles.budgetCalloutMeta}>
                  <Icon iconName="Contact" className={styles.budgetCalloutMetaIcon} />
                  <span>{budget.agentName}</span>
                </div>
              )}
              {budget.clientName && (
                <div className={styles.budgetCalloutMeta}>
                  <Icon iconName="People" className={styles.budgetCalloutMetaIcon} />
                  <span>{budget.clientName}</span>
                </div>
              )}
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="Calendar" className={styles.budgetCalloutMetaIcon} />
                <span>Created {formattedDate}</span>
              </div>
            </div>
            <div className={styles.budgetCalloutTotals}>
              <span className={styles.budgetCalloutTotalLabel}>Total (incl. GST)</span>
              <span className={styles.budgetCalloutTotalValue}>
                {formatCurrency(summary.total)}
              </span>
            </div>
          </div>
        </Callout>
      )}
    </>
  );
};

export const BudgetListView: React.FC<IBudgetListViewProps> = ({
  repository,
  userRole,
  defaultAgentName,
  onDefaultAgentNameChange,
  onDataChanged,
}) => {
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchText, setSearchText] = React.useState("");

  // Editor panel state
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editBudget, setEditBudget] = React.useState<Budget | undefined>(
    undefined,
  );

  // Delete confirmation state
  const [pendingDeleteBudget, setPendingDeleteBudget] = React.useState<Budget | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [defaultAgentNameDraft, setDefaultAgentNameDraft] =
    React.useState(defaultAgentName);

  const loadBudgets = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const filters: { status?: BudgetStatus; search?: string } = {};
        if (statusFilter !== "all") {
          filters.status = statusFilter as BudgetStatus;
        }
        if (searchText) {
          filters.search = searchText;
        }
        const result = await repository.getBudgets(filters);
        if (!signal.cancelled) setBudgets(result);
      } catch (err) {
        if (!signal.cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load budgets",
          );
      } finally {
        if (!signal.cancelled) setIsLoading(false);
      }
    },
    [repository, statusFilter, searchText],
  );

  React.useEffect(() => {
    const signal = { cancelled: false };
    loadBudgets(signal); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => {
      signal.cancelled = true;
    };
  }, [loadBudgets]);

  // ─── Delete handlers ───────────────────────────────────

  const handleDeleteClick = React.useCallback((budget: Budget): void => {
    setPendingDeleteBudget(budget);
  }, []);

  const handleDeleteCancel = React.useCallback((): void => {
    setPendingDeleteBudget(undefined);
  }, []);

  const handleDeleteConfirm = React.useCallback(async (): Promise<void> => {
    if (!pendingDeleteBudget?.id) return;
    setIsDeleting(true);
    try {
      await repository.deleteBudget(pendingDeleteBudget.id);
      setPendingDeleteBudget(undefined);
      loadBudgets({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget");
      setPendingDeleteBudget(undefined);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDeleteBudget, repository, loadBudgets, onDataChanged]);

  // ─── Duplicate handler ─────────────────────────────────

  const handleDuplicate = React.useCallback(
    async (budget: Budget): Promise<void> => {
      try {
        const duplicate: Budget = {
          ...budget,
          id: undefined,
          propertyAddress: `${budget.propertyAddress} (copy)`,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const saved = await repository.saveBudget(duplicate);
        onDataChanged?.();
        // Open the duplicate in the editor
        setEditBudget(saved);
        setIsEditorOpen(true);
        loadBudgets({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate budget",
        );
      }
    },
    [repository, loadBudgets, onDataChanged],
  );

  // ─── Quick status transition handler ───────────────────

  const handleQuickTransition = React.useCallback(
    async (budget: Budget, newStatus: BudgetStatus): Promise<void> => {
      try {
        await repository.saveBudget({
          ...budget,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
        loadBudgets({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update status",
        );
      }
    },
    [repository, loadBudgets],
  );

  // ─── Permission flags ──────────────────────────────────

  const showCreate = canCreateBudget(userRole);

  // ─── Row context menu builder ──────────────────────────

  /** Build role- and status-aware menu items for a budget row. */
  const getRowMenuItems = React.useCallback(
    (budget: Budget): IContextualMenuItem[] => {
      const items: IContextualMenuItem[] = [];

      // Edit — only when the user can edit this budget's status
      if (canEditBudget(userRole, budget.status)) {
        items.push({
          key: "edit",
          text: "Edit",
          iconProps: { iconName: "Edit" },
          onClick: (): void => {
            setEditBudget(budget);
            setIsEditorOpen(true);
          },
        });
      }

      // Duplicate — editor + admin
      if (canDuplicateBudget(userRole)) {
        items.push({
          key: "duplicate",
          text: "Duplicate",
          iconProps: { iconName: "Copy" },
          onClick: (): void => {
            handleDuplicate(budget); // eslint-disable-line @typescript-eslint/no-floating-promises
          },
        });
      }

      // Status transitions — admin only
      if (canTransitionBudget(userRole)) {
        const transitions = statusTransitions[budget.status] ?? [];
        if (transitions.length > 0 && items.length > 0) {
          items.push({ key: "divider-status", text: "-", itemType: 1 }); // ContextualMenuItemType.Divider = 1
        }
        for (const nextStatus of transitions) {
          const label =
            nextStatus === "draft"
              ? "Revert to Draft"
              : nextStatus === "archived"
                ? "Archive"
                : `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`;
          items.push({
            key: `transition-${nextStatus}`,
            text: label,
            iconProps: {
              iconName:
                nextStatus === "approved"
                  ? "CheckMark"
                  : nextStatus === "sent"
                    ? "Mail"
                    : nextStatus === "archived"
                      ? "Archive"
                      : "Undo",
            },
            onClick: (): void => {
              handleQuickTransition(budget, nextStatus); // eslint-disable-line @typescript-eslint/no-floating-promises
            },
          });
        }
      }

      // Delete — editor + admin
      if (canDeleteBudget(userRole)) {
        if (items.length > 0) {
          items.push({ key: "divider-delete", text: "-", itemType: 1 });
        }
        items.push({
          key: "delete",
          text: "Delete",
          iconProps: {
            iconName: "Delete",
            style: { color: "var(--errorText, #a4262c)" },
          },
          style: { color: "var(--errorText, #a4262c)" },
          onClick: (): void => {
            handleDeleteClick(budget);
          },
        });
      }

      return items;
    },
    [userRole, handleDeleteClick, handleDuplicate, handleQuickTransition],
  );

  // ─── Column definitions ────────────────────────────────

  /** Whether the current role has any row-level actions at all. */
  const hasRowActions = userRole !== "viewer";

  const columns: IColumn[] = React.useMemo(
    (): IColumn[] => {
      const cols: IColumn[] = [
        {
          key: "address",
          name: "Property Address",
          fieldName: "propertyAddress",
          minWidth: 180,
          maxWidth: 300,
          isResizable: true,
          onRender: (item: IBudgetRow): JSX.Element => (
            <BudgetAddressCell budget={item._budget} />
          ),
        },
        {
          key: "type",
          name: "Type",
          fieldName: "propertyType",
          minWidth: 80,
          maxWidth: 120,
          isResizable: true,
        },
        {
          key: "status",
          name: "Status",
          fieldName: "status",
          minWidth: 80,
          maxWidth: 100,
          isResizable: true,
          onRender: (item: IBudgetRow): JSX.Element => (
            <Text
              variant="small"
              style={{
                textTransform: "capitalize",
                fontWeight: item.status === "draft" ? 400 : 600,
              }}
            >
              {item.status}
            </Text>
          ),
        },
        {
          key: "lineItems",
          name: "Items",
          fieldName: "lineItemCount",
          minWidth: 50,
          maxWidth: 70,
          isResizable: true,
        },
        {
          key: "created",
          name: "Created",
          fieldName: "createdAt",
          minWidth: 100,
          maxWidth: 140,
          isResizable: true,
        },
      ];

      if (hasRowActions) {
        cols.push({
          key: "actions",
          name: "",
          minWidth: 40,
          maxWidth: 40,
          onRender: (item: IBudgetRow): JSX.Element => {
            const menuItems = getRowMenuItems(item._budget);
            if (menuItems.length === 0) return <></>;
            const menuProps: IContextualMenuProps = { items: menuItems };
            return (
              <IconButton
                menuIconProps={{ iconName: "More" }}
                menuProps={menuProps}
                title="Actions"
                ariaLabel={`Actions for ${item.propertyAddress}`}
              />
            );
          },
        });
      }

      return cols;
    },
    [hasRowActions, getRowMenuItems],
  );

  const rows: IBudgetRow[] = React.useMemo(
    () =>
      budgets.map((b) => ({
        key: String(b.id ?? 0),
        id: b.id ?? 0,
        propertyAddress: b.propertyAddress,
        propertyType: b.propertyType,
        status: b.status,
        lineItemCount: b.lineItems.length,
        createdAt: new Date(b.createdAt).toLocaleDateString("en-AU"),
        _budget: b,
      })),
    [budgets],
  );

  /** Open editor for a new budget. */
  const handleNewBudget = React.useCallback((): void => {
    setEditBudget(undefined);
    setIsEditorOpen(true);
  }, []);

  /** Close editor and refresh list if a budget was saved. */
  const handleEditorSaved = React.useCallback(
    (_saved: Budget): void => {
      setIsEditorOpen(false);
      setEditBudget(undefined);
      loadBudgets({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    },
    [loadBudgets, onDataChanged],
  );

  const handleEditorDismiss = React.useCallback((): void => {
    setIsEditorOpen(false);
    setEditBudget(undefined);
  }, []);

  const handleOpenSettings = React.useCallback((): void => {
    setDefaultAgentNameDraft(defaultAgentName);
    setIsSettingsOpen(true);
  }, [defaultAgentName]);

  const handleCloseSettings = React.useCallback((): void => {
    setIsSettingsOpen(false);
  }, []);

  const handleSaveSettings = React.useCallback((): void => {
    onDefaultAgentNameChange(
      normaliseDefaultAgentName(defaultAgentNameDraft),
    );
    setIsSettingsOpen(false);
  }, [defaultAgentNameDraft, onDefaultAgentNameChange]);

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Budgets</Text>
        <Text className={styles.viewSubtitle}>
          Property marketing budgets — create, edit, and track approvals.
        </Text>
      </div>

      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={(): void => setError(null)}
          dismissButtonAriaLabel="Close"
        >
          {error}
        </MessageBar>
      )}

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search by address…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? "")}
          className={styles.filterSearch}
        />
        <Dropdown
          placeholder="Filter by status"
          options={statusOptions}
          selectedKey={statusFilter}
          onChange={(_, option): void =>
            setStatusFilter(String(option?.key ?? "all"))
          }
          className={styles.filterDropdown}
        />
        <DefaultButton
          text="Settings"
          iconProps={{ iconName: "Settings" }}
          onClick={handleOpenSettings}
        />
        {showCreate && (
          <PrimaryButton
            text="New Budget"
            iconProps={{ iconName: "Add" }}
            onClick={handleNewBudget}
          />
        )}
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading budgets…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon
            iconName="Financial"
            style={{
              fontSize: 48,
              marginBottom: 16,
              color: "var(--hub-accent, #001CAD)",
            }}
          />
          <Text variant="large">No budgets yet</Text>
          <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
            Click &quot;New Budget&quot; above to create your first property
            marketing budget.
          </Text>
        </div>
      ) : (
        <DetailsList
          items={rows}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          isHeaderVisible={true}
        />
      )}

      {/* Budget editor panel */}
      <BudgetEditorPanel
        budget={editBudget}
        repository={repository}
        isOpen={isEditorOpen}
        onDismiss={handleEditorDismiss}
        onSaved={handleEditorSaved}
        userRole={userRole}
        defaultAgentName={defaultAgentName}
      />

      <Dialog
        hidden={!isSettingsOpen}
        onDismiss={handleCloseSettings}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Settings",
          subText:
            "Set the default Agent Name used when creating a new budget.",
        }}
        modalProps={{ isBlocking: false }}
      >
        <TextField
          label="Default Agent Name"
          value={defaultAgentNameDraft}
          onChange={(_, value): void =>
            setDefaultAgentNameDraft(value ?? "")
          }
          placeholder={DEFAULT_AGENT_NAME}
        />
        <DialogFooter>
          <PrimaryButton text="Save" onClick={handleSaveSettings} />
          <DefaultButton text="Cancel" onClick={handleCloseSettings} />
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        hidden={!pendingDeleteBudget}
        onDismiss={handleDeleteCancel}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Delete budget",
          subText: pendingDeleteBudget
            ? `Are you sure you want to delete the budget for "${pendingDeleteBudget.propertyAddress}"? This action cannot be undone.`
            : "",
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton
            text={isDeleting ? "Deleting…" : "Delete"}
            onClick={handleDeleteConfirm} // eslint-disable-line @typescript-eslint/no-floating-promises
            disabled={isDeleting}
            style={{
              backgroundColor: "var(--errorText, #a4262c)",
              borderColor: "var(--errorText, #a4262c)",
            }}
          />
          <DefaultButton
            text="Cancel"
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          />
        </DialogFooter>
      </Dialog>
    </div>
  );
};
