/**
 * SuburbsView — Browse suburbs and their pricing tiers.
 *
 * Displays suburbs in a DetailsList grouped/filterable by pricing tier.
 * Admin users can add, edit and delete suburbs via the "..." context menu.
 */

import * as React from "react";
import {
  Callout,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dialog,
  DialogFooter,
  DialogType,
  DirectionalHint,
  Dropdown,
  IconButton,
  Panel,
  PanelType,
  PrimaryButton,
  SelectionMode,
  Separator,
  Text,
  TextField,
  Icon,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  SearchBox,
} from "@fluentui/react";
import type { IColumn, IContextualMenuProps, IContextualMenuItem, IDropdownOption } from "@fluentui/react";
import type { Suburb, PricingTier } from "../models/types";
import type { UserRole } from "../models/permissions";
import { canManageReferenceData } from "../models/permissions";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import styles from "./MarketingBudget.module.scss";

export interface ISuburbsViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
  onDataChanged?: () => void;
}

interface ISuburbRow {
  key: string;
  id: number;
  name: string;
  pricingTier: string;
  postcode: string;
  state: string;
  _suburb: Suburb;
}

interface ISuburbNameCellProps {
  suburb: Suburb;
}

const SuburbNameCell: React.FC<ISuburbNameCellProps> = ({ suburb }) => {
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

  React.useEffect(() => (): void => window.clearTimeout(timerRef.current), []);

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
        {suburb.name}
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
            <div className={`${styles.budgetCalloutHeader} ${styles.statusDraft}`}>
              <Icon iconName="MapPin" />
              <span>SUBURB</span>
            </div>
            <div className={styles.budgetCalloutBody}>
              <p className={styles.budgetCalloutAddress}>{suburb.name}</p>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="Tag" className={styles.budgetCalloutMetaIcon} />
                <span>Tier {suburb.pricingTier}</span>
              </div>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="POI" className={styles.budgetCalloutMetaIcon} />
                <span>
                  {suburb.postcode ?? "—"} · {suburb.state ?? "QLD"}
                </span>
              </div>
            </div>
            <div className={styles.budgetCalloutTotals}>
              <span className={styles.budgetCalloutTotalLabel}>Pricing Tier</span>
              <span className={styles.budgetCalloutTotalValue}>
                {suburb.pricingTier}
              </span>
            </div>
          </div>
        </Callout>
      )}
    </>
  );
};

const tierColours: Record<PricingTier, string> = {
  A: "#107c10",
  B: "#0078d4",
  C: "#ca5010",
  D: "#d13438",
};

const tierFilterOptions: IDropdownOption[] = [
  { key: "all", text: "All tiers" },
  { key: "A", text: "Tier A" },
  { key: "B", text: "Tier B" },
  { key: "C", text: "Tier C" },
  { key: "D", text: "Tier D" },
];

const tierEditOptions: IDropdownOption[] = [
  { key: "A", text: "Tier A" },
  { key: "B", text: "Tier B" },
  { key: "C", text: "Tier C" },
  { key: "D", text: "Tier D" },
];

export const SuburbsView: React.FC<ISuburbsViewProps> = ({ repository, userRole, onDataChanged }) => {
  const [suburbs, setSuburbs] = React.useState<Suburb[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");

  // Editor panel state
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editSuburb, setEditSuburb] = React.useState<Suburb | undefined>(undefined);
  const [editorName, setEditorName] = React.useState("");
  const [editorTier, setEditorTier] = React.useState<PricingTier>("A");
  const [editorPostcode, setEditorPostcode] = React.useState("");
  const [editorState, setEditorState] = React.useState("QLD");
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = React.useState<Suburb | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isAdmin = canManageReferenceData(userRole);

  const loadData = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await repository.getSuburbs();
        if (!signal.cancelled) setSuburbs(result);
      } catch (err) {
        if (!signal.cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load suburbs",
          );
      } finally {
        if (!signal.cancelled) setIsLoading(false);
      }
    },
    [repository],
  );

  React.useEffect(() => {
    const signal = { cancelled: false };
    loadData(signal); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => {
      signal.cancelled = true;
    };
  }, [loadData]);

  const rows: ISuburbRow[] = React.useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return suburbs
      .filter((s) => {
        if (tierFilter !== "all" && s.pricingTier !== tierFilter) return false;
        if (searchText && !s.name.toLowerCase().includes(lowerSearch))
          return false;
        return true;
      })
      .map((s) => ({
        key: String(s.id ?? 0),
        id: s.id ?? 0,
        name: s.name,
        pricingTier: s.pricingTier,
        postcode: s.postcode ?? "—",
        state: s.state ?? "QLD",
        _suburb: s,
      }));
  }, [suburbs, searchText, tierFilter]);

  /** Tier summary counts. */
  const tierCounts = React.useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const s of suburbs) {
      counts[s.pricingTier] = (counts[s.pricingTier] ?? 0) + 1;
    }
    return counts;
  }, [suburbs]);

  // ─── Editor helpers ────────────────────────────────────

  const openEditor = React.useCallback((suburb?: Suburb): void => {
    setEditSuburb(suburb);
    setEditorName(suburb?.name ?? "");
    setEditorTier(suburb?.pricingTier ?? "A");
    setEditorPostcode(suburb?.postcode ?? "");
    setEditorState(suburb?.state ?? "QLD");
    setIsEditorOpen(true);
  }, []);

  const closeEditor = React.useCallback((): void => {
    setIsEditorOpen(false);
    setEditSuburb(undefined);
  }, []);

  const handleSave = React.useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      const suburb: Suburb = {
        ...(editSuburb ?? {}),
        name: editorName.trim(),
        pricingTier: editorTier,
        postcode: editorPostcode.trim() || undefined,
        state: editorState.trim() || undefined,
      };
      await repository.saveSuburb(suburb);
      closeEditor();
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save suburb");
    } finally {
      setIsSaving(false);
    }
  }, [editSuburb, editorName, editorTier, editorPostcode, editorState, repository, closeEditor, loadData, onDataChanged]);

  // ─── Delete helpers ────────────────────────────────────

  const handleDeleteConfirm = React.useCallback(async (): Promise<void> => {
    if (!pendingDelete?.id) return;
    setIsDeleting(true);
    try {
      await repository.deleteSuburb(pendingDelete.id);
      setPendingDelete(undefined);
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete suburb");
      setPendingDelete(undefined);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete, repository, loadData, onDataChanged]);

  // ─── Row menu builder ─────────────────────────────────

  const getRowMenuItems = React.useCallback(
    (suburb: Suburb): IContextualMenuItem[] => {
      const items: IContextualMenuItem[] = [];
      if (!isAdmin) return items;

      items.push({
        key: "edit",
        text: "Edit",
        iconProps: { iconName: "Edit" },
        onClick: (): void => openEditor(suburb),
      });
      items.push({
        key: "divider",
        text: "-",
        itemType: 1,
      });
      items.push({
        key: "delete",
        text: "Delete",
        iconProps: {
          iconName: "Delete",
          style: { color: "var(--errorText, #a4262c)" },
        },
        style: { color: "var(--errorText, #a4262c)" },
        onClick: (): void => setPendingDelete(suburb),
      });
      return items;
    },
    [isAdmin, openEditor],
  );

  // ─── Column definitions ───────────────────────────────

  const columns: IColumn[] = React.useMemo((): IColumn[] => {
    const cols: IColumn[] = [
      {
        key: "name",
        name: "Suburb",
        fieldName: "name",
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        onRender: (item: ISuburbRow): JSX.Element => (
          <SuburbNameCell suburb={item._suburb} />
        ),
      },
      {
        key: "tier",
        name: "Pricing Tier",
        fieldName: "pricingTier",
        minWidth: 90,
        maxWidth: 120,
        isResizable: true,
        onRender: (item: ISuburbRow): JSX.Element => (
          <Text
            variant="small"
            style={{
              fontWeight: 600,
              color: tierColours[item.pricingTier as PricingTier] ?? "#323130",
            }}
          >
            Tier {item.pricingTier}
          </Text>
        ),
      },
      {
        key: "postcode",
        name: "Postcode",
        fieldName: "postcode",
        minWidth: 70,
        maxWidth: 100,
        isResizable: true,
      },
      {
        key: "state",
        name: "State",
        fieldName: "state",
        minWidth: 50,
        maxWidth: 80,
        isResizable: true,
      },
    ];

    if (isAdmin) {
      cols.push({
        key: "actions",
        name: "",
        minWidth: 40,
        maxWidth: 40,
        onRender: (item: ISuburbRow): JSX.Element => {
          const menuItems = getRowMenuItems(item._suburb);
          if (menuItems.length === 0) return <></>;
          const menuProps: IContextualMenuProps = { items: menuItems };
          return (
            <IconButton
              menuIconProps={{ iconName: "More" }}
              menuProps={menuProps}
              title="Actions"
              ariaLabel={`Actions for ${item.name}`}
            />
          );
        },
      });
    }

    return cols;
  }, [isAdmin, getRowMenuItems]);

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Suburbs</Text>
        <Text className={styles.viewSubtitle}>
          Suburbs and their pricing tiers used for internet listing package
          selection.
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

      {/* Tier summary badges */}
      {!isLoading && suburbs.length > 0 && (
        <div className={styles.tierSummary}>
          {(["A", "B", "C", "D"] as PricingTier[]).map((tier) => (
            <div
              key={tier}
              className={styles.tierBadge}
              style={{ borderColor: tierColours[tier] }}
            >
              <Text
                variant="small"
                style={{ fontWeight: 600, color: tierColours[tier] }}
              >
                Tier {tier}
              </Text>
              <Text variant="small">
                {tierCounts[tier]} suburb{tierCounts[tier] !== 1 ? "s" : ""}
              </Text>
            </div>
          ))}
        </div>
      )}

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search suburbs…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? "")}
          className={styles.filterSearch}
        />
        <Dropdown
          placeholder="Pricing tier"
          options={tierFilterOptions}
          selectedKey={tierFilter}
          onChange={(_, option): void =>
            setTierFilter(String(option?.key ?? "all"))
          }
          className={styles.filterDropdown}
        />
        {isAdmin && (
          <PrimaryButton
            text="New Suburb"
            iconProps={{ iconName: "Add" }}
            onClick={(): void => openEditor()}
          />
        )}
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading suburbs…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon
            iconName="MapPin"
            style={{
              fontSize: 48,
              marginBottom: 16,
              color: "var(--hub-accent, #001CAD)",
            }}
          />
          <Text variant="large">No suburbs found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
            Suburbs are loaded with reference data.
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

      {/* Editor panel */}
      <Panel
        isOpen={isEditorOpen}
        onDismiss={closeEditor}
        type={PanelType.custom}
        customWidth="400px"
        headerText={editSuburb ? `Edit — ${editSuburb.name}` : "New Suburb"}
        isFooterAtBottom={true}
        onRenderFooterContent={(): JSX.Element => (
          <div className={styles.editorFooterRight}>
            <DefaultButton text="Cancel" onClick={closeEditor} disabled={isSaving} />
            <PrimaryButton
              text={isSaving ? "Saving…" : editSuburb ? "Save Changes" : "Create Suburb"}
              onClick={handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
              disabled={isSaving || !editorName.trim()}
            />
          </div>
        )}
      >
        <div className={styles.editorContent}>
          <TextField
            label="Suburb Name"
            value={editorName}
            onChange={(_, val): void => setEditorName(val ?? "")}
            required
            placeholder="e.g. Bardon"
          />
          <Dropdown
            label="Pricing Tier"
            options={tierEditOptions}
            selectedKey={editorTier}
            onChange={(_, opt): void => setEditorTier((opt?.key ?? "A") as PricingTier)}
          />
          <Separator />
          <TextField
            label="Postcode"
            value={editorPostcode}
            onChange={(_, val): void => setEditorPostcode(val ?? "")}
            placeholder="e.g. 4065"
            maxLength={4}
          />
          <TextField
            label="State"
            value={editorState}
            onChange={(_, val): void => setEditorState(val ?? "")}
            placeholder="QLD"
          />
        </div>
      </Panel>

      {/* Delete confirmation dialog */}
      <Dialog
        hidden={!pendingDelete}
        onDismiss={(): void => setPendingDelete(undefined)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Delete suburb",
          subText: pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`
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
            onClick={(): void => setPendingDelete(undefined)}
            disabled={isDeleting}
          />
        </DialogFooter>
      </Dialog>
    </div>
  );
};
