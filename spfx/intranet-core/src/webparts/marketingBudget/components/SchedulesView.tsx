/**
 * SchedulesView — View and inspect schedule templates (budget presets).
 *
 * Displays all schedules in a DetailsList. Clicking a row expands an inline
 * detail panel showing the schedule's line items and metadata.
 * Admin users can add, edit and delete schedules via the "..." context menu.
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
import type { Schedule, Service, Vendor, PropertyType, PropertySize, BudgetTier } from "../models/types";
import type { UserRole } from "../models/permissions";
import { canManageReferenceData } from "../models/permissions";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import styles from "./MarketingBudget.module.scss";

export interface ISchedulesViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
  onDataChanged?: () => void;
}

interface IScheduleRow {
  key: string;
  id: number;
  name: string;
  propertyType: string;
  propertySize: string;
  tier: string;
  lineItemCount: number;
  _schedule: Schedule;
}

interface IScheduleNameCellProps {
  schedule: Schedule;
  vendorName: string;
}

const ScheduleNameCell: React.FC<IScheduleNameCellProps> = ({
  schedule,
  vendorName,
}) => {
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

  const selectedCount = schedule.lineItems.filter((li) => li.isSelected).length;
  const createdDate = new Date(schedule.createdAt);
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
        {schedule.name}
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
              <Icon iconName="CalendarWeek" />
              <span>SCHEDULE</span>
            </div>
            <div className={styles.budgetCalloutBody}>
              <p className={styles.budgetCalloutAddress}>{schedule.name}</p>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="Home" className={styles.budgetCalloutMetaIcon} />
                <span style={{ textTransform: "capitalize" }}>
                  {schedule.propertyType} · {schedule.propertySize} · {schedule.tier}
                </span>
              </div>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="NumberedList" className={styles.budgetCalloutMetaIcon} />
                <span>
                  {selectedCount} of {schedule.lineItems.length} line items selected
                </span>
              </div>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="People" className={styles.budgetCalloutMetaIcon} />
                <span>{vendorName}</span>
              </div>
              <div className={styles.budgetCalloutMeta}>
                <Icon iconName="Calendar" className={styles.budgetCalloutMetaIcon} />
                <span>Created {formattedDate}</span>
              </div>
            </div>
          </div>
        </Callout>
      )}
    </>
  );
};

const propertyTypeOptions: IDropdownOption[] = [
  { key: "house", text: "House" },
  { key: "unit", text: "Unit" },
  { key: "townhouse", text: "Townhouse" },
  { key: "land", text: "Land" },
  { key: "rural", text: "Rural" },
  { key: "commercial", text: "Commercial" },
];

const propertySizeOptions: IDropdownOption[] = [
  { key: "small", text: "Small" },
  { key: "medium", text: "Medium" },
  { key: "large", text: "Large" },
];

const budgetTierOptions: IDropdownOption[] = [
  { key: "basic", text: "Basic" },
  { key: "standard", text: "Standard" },
  { key: "premium", text: "Premium" },
];

const activeStatusOptions: IDropdownOption[] = [
  { key: 1, text: "Active" },
  { key: 0, text: "Inactive" },
];

export const SchedulesView: React.FC<ISchedulesViewProps> = ({
  repository,
  userRole,
  onDataChanged,
}) => {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<number | undefined>(
    undefined,
  );

  // Editor panel state
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editSchedule, setEditSchedule] = React.useState<Schedule | undefined>(undefined);
  const [editorName, setEditorName] = React.useState("");
  const [editorPropertyType, setEditorPropertyType] = React.useState<PropertyType>("house");
  const [editorPropertySize, setEditorPropertySize] = React.useState<PropertySize>("medium");
  const [editorTier, setEditorTier] = React.useState<BudgetTier>("standard");
  const [editorDefaultVendorId, setEditorDefaultVendorId] = React.useState<number | undefined>(undefined);
  const [editorIsActive, setEditorIsActive] = React.useState<number>(1);
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = React.useState<Schedule | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isAdmin = canManageReferenceData(userRole);

  const loadData = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      setIsLoading(true);
      try {
        const [sched, svc, vendorList] = await Promise.all([
          repository.getSchedules(),
          repository.getAllServices(),
          repository.getVendors(),
        ]);
        if (!signal.cancelled) {
          setSchedules(sched);
          setServices(svc);
          setVendors(vendorList);
        }
      } catch (err) {
        if (!signal.cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load schedules",
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

  /** Build a service ID → Service lookup. */
  const serviceMap = React.useMemo(() => {
    const map = new Map<number, Service>();
    for (const s of services) {
      if (s.id !== undefined) map.set(s.id, s);
    }
    return map;
  }, [services]);

  /** Vendor dropdown options for the editor. */
  const vendorOptions: IDropdownOption[] = React.useMemo(() => {
    const opts: IDropdownOption[] = [{ key: "", text: "(None)" }];
    for (const v of vendors) {
      if (v.id !== undefined) opts.push({ key: v.id, text: v.name });
    }
    return opts;
  }, [vendors]);

  const vendorNameMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const v of vendors) {
      if (v.id !== undefined) {
        map.set(v.id, v.name);
      }
    }
    return map;
  }, [vendors]);

  /** Filter and map to rows. */
  const rows: IScheduleRow[] = React.useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return schedules
      .filter((s) => !searchText || s.name.toLowerCase().includes(lowerSearch))
      .map((s) => ({
        key: String(s.id ?? 0),
        id: s.id ?? 0,
        name: s.name,
        propertyType: s.propertyType,
        propertySize: s.propertySize,
        tier: s.tier,
        lineItemCount: s.lineItems.length,
        _schedule: s,
      }));
  }, [schedules, searchText]);

  // ─── Editor helpers ────────────────────────────────────

  const openEditor = React.useCallback((schedule?: Schedule): void => {
    setEditSchedule(schedule);
    setEditorName(schedule?.name ?? "");
    setEditorPropertyType(schedule?.propertyType ?? "house");
    setEditorPropertySize(schedule?.propertySize ?? "medium");
    setEditorTier(schedule?.tier ?? "standard");
    setEditorDefaultVendorId(schedule?.defaultVendorId);
    setEditorIsActive(schedule?.isActive ?? 1);
    setIsEditorOpen(true);
  }, []);

  const closeEditor = React.useCallback((): void => {
    setIsEditorOpen(false);
    setEditSchedule(undefined);
  }, []);

  const handleSave = React.useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const schedule: Schedule = {
        ...(editSchedule ?? {
          lineItems: [],
          createdAt: now,
          isActive: 1,
        }),
        name: editorName.trim(),
        propertyType: editorPropertyType,
        propertySize: editorPropertySize,
        tier: editorTier,
        defaultVendorId: editorDefaultVendorId,
        isActive: editorIsActive,
        updatedAt: now,
      };
      await repository.saveSchedule(schedule);
      closeEditor();
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  }, [editSchedule, editorName, editorPropertyType, editorPropertySize, editorTier, editorDefaultVendorId, editorIsActive, repository, closeEditor, loadData]);

  // ─── Delete helpers ────────────────────────────────────

  const handleDeleteConfirm = React.useCallback(async (): Promise<void> => {
    if (!pendingDelete?.id) return;
    setIsDeleting(true);
    try {
      await repository.deleteSchedule(pendingDelete.id);
      setPendingDelete(undefined);
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete schedule");
      setPendingDelete(undefined);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete, repository, loadData]);

  // ─── Duplicate helper ─────────────────────────────────

  const handleDuplicate = React.useCallback(
    async (schedule: Schedule): Promise<void> => {
      try {
        const now = new Date().toISOString();
        const copy: Schedule = {
          ...schedule,
          id: undefined,
          name: `${schedule.name} (Copy)`,
          lineItems: schedule.lineItems.map((li) => ({ ...li })),
          createdAt: now,
          updatedAt: now,
        };
        await repository.saveSchedule(copy);
        loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
        onDataChanged?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to duplicate schedule");
      }
    },
    [repository, loadData, onDataChanged],
  );

  // ─── Row menu builder ─────────────────────────────────

  const getRowMenuItems = React.useCallback(
    (schedule: Schedule): IContextualMenuItem[] => {
      const items: IContextualMenuItem[] = [];
      if (!isAdmin) return items;

      items.push({
        key: "edit",
        text: "Edit",
        iconProps: { iconName: "Edit" },
        onClick: (): void => openEditor(schedule),
      });
      items.push({
        key: "duplicate",
        text: "Duplicate",
        iconProps: { iconName: "Copy" },
        onClick: (): void => {
          handleDuplicate(schedule); // eslint-disable-line @typescript-eslint/no-floating-promises
        },
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
        onClick: (): void => setPendingDelete(schedule),
      });
      return items;
    },
    [isAdmin, openEditor, handleDuplicate],
  );

  // ─── Column definitions ───────────────────────────────

  const columns: IColumn[] = React.useMemo((): IColumn[] => {
    const cols: IColumn[] = [
      {
        key: "name",
        name: "Schedule Name",
        fieldName: "name",
        minWidth: 180,
        maxWidth: 300,
        isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <ScheduleNameCell
            schedule={item._schedule}
            vendorName={
              item._schedule.defaultVendorId !== undefined
                ? (vendorNameMap.get(item._schedule.defaultVendorId) ?? "No default vendor")
                : "No default vendor"
            }
          />
        ),
      },
      {
        key: "type",
        name: "Property Type",
        fieldName: "propertyType",
        minWidth: 90,
        maxWidth: 120,
        isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: "capitalize" }}>
            {item.propertyType}
          </Text>
        ),
      },
      {
        key: "size",
        name: "Size",
        fieldName: "propertySize",
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: "capitalize" }}>
            {item.propertySize}
          </Text>
        ),
      },
      {
        key: "tier",
        name: "Tier",
        fieldName: "tier",
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: "capitalize" }}>
            {item.tier}
          </Text>
        ),
      },
      {
        key: "items",
        name: "Items",
        fieldName: "lineItemCount",
        minWidth: 50,
        maxWidth: 70,
        isResizable: true,
      },
    ];

    if (isAdmin) {
      cols.push({
        key: "actions",
        name: "",
        minWidth: 40,
        maxWidth: 40,
        onRender: (item: IScheduleRow): JSX.Element => {
          const menuItems = getRowMenuItems(item._schedule);
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
  }, [isAdmin, getRowMenuItems, vendorNameMap]);

  const handleRowClick = React.useCallback((item: IScheduleRow): void => {
    setExpandedId((prev) => (prev === item.id ? undefined : item.id));
  }, []);

  /** Render the expanded detail section for a schedule. */
  const renderExpandedDetail = (schedule: Schedule): React.ReactNode => (
    <div className={styles.refDetailPanel}>
      <Text className={styles.refDetailTitle}>{schedule.name}</Text>
      <div className={styles.refDetailMeta}>
        <span>
          Type:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {schedule.propertyType}
          </strong>
        </span>
        <span>
          Size:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {schedule.propertySize}
          </strong>
        </span>
        <span>
          Tier:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {schedule.tier}
          </strong>
        </span>
      </div>
      <Text
        className={styles.sectionTitle}
        style={{ marginTop: 12, fontSize: 13 }}
      >
        Line Items
      </Text>
      <div className={styles.refItemList}>
        {schedule.lineItems.map((li, idx) => {
          const svc = serviceMap.get(li.serviceId);
          const variantName =
            svc?.variants.find((v) => v.id === li.variantId)?.name ??
            li.variantId ??
            "—";
          const variantPrice = svc?.variants.find(
            (v) => v.id === li.variantId,
          )?.basePrice;
          return (
            <div key={idx} className={styles.refItemRow}>
              <Icon
                iconName={li.isSelected ? "CheckboxComposite" : "Checkbox"}
                style={{
                  color: li.isSelected
                    ? "var(--hub-accent, #001CAD)"
                    : "#a19f9d",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              />
              <span className={styles.refItemName}>
                {svc?.name ?? `Service #${li.serviceId}`}
              </span>
              <span className={styles.refItemVariant}>{variantName}</span>
              <span className={styles.refItemPrice}>
                {variantPrice !== undefined
                  ? `$${variantPrice.toFixed(2)}`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Schedules</Text>
        <Text className={styles.viewSubtitle}>
          Budget templates that define default services for a property type,
          size, and tier.
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

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search schedules…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? "")}
          className={styles.filterSearch}
        />
        {isAdmin && (
          <PrimaryButton
            text="New Schedule"
            iconProps={{ iconName: "Add" }}
            onClick={(): void => openEditor()}
          />
        )}
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading schedules…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon
            iconName="CalendarWeek"
            style={{
              fontSize: 48,
              marginBottom: 16,
              color: "var(--hub-accent, #001CAD)",
            }}
          />
          <Text variant="large">No schedules found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
            Schedule templates are loaded with reference data.
          </Text>
        </div>
      ) : (
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <DetailsList
            items={rows}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            isHeaderVisible={true}
            onRenderRow={(rowProps, defaultRender): JSX.Element | null => {
              if (!rowProps || !defaultRender) return null;
              return <div style={{ cursor: "pointer" }}>{defaultRender(rowProps)}</div>;
            }}
            onActiveItemChanged={(item): void =>
              handleRowClick(item as IScheduleRow)
            }
          />
          {expandedId !== undefined &&
            (() => {
              const schedule = schedules.find((s) => s.id === expandedId);
              return schedule ? renderExpandedDetail(schedule) : undefined;
            })()}
        </div>
      )}

      {/* Editor panel */}
      <Panel
        isOpen={isEditorOpen}
        onDismiss={closeEditor}
        type={PanelType.custom}
        customWidth="400px"
        headerText={editSchedule ? `Edit — ${editSchedule.name}` : "New Schedule"}
        isFooterAtBottom={true}
        onRenderFooterContent={(): JSX.Element => (
          <div className={styles.editorFooterRight}>
            <DefaultButton text="Cancel" onClick={closeEditor} disabled={isSaving} />
            <PrimaryButton
              text={isSaving ? "Saving…" : editSchedule ? "Save Changes" : "Create Schedule"}
              onClick={handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
              disabled={isSaving || !editorName.trim()}
            />
          </div>
        )}
      >
        <div className={styles.editorContent}>
          <TextField
            label="Schedule Name"
            value={editorName}
            onChange={(_, val): void => setEditorName(val ?? "")}
            required
            placeholder="e.g. House - Large - Premium"
          />
          <Separator />
          <Dropdown
            label="Property Type"
            options={propertyTypeOptions}
            selectedKey={editorPropertyType}
            onChange={(_, opt): void => setEditorPropertyType((opt?.key ?? "house") as PropertyType)}
          />
          <Dropdown
            label="Property Size"
            options={propertySizeOptions}
            selectedKey={editorPropertySize}
            onChange={(_, opt): void => setEditorPropertySize((opt?.key ?? "medium") as PropertySize)}
          />
          <Dropdown
            label="Budget Tier"
            options={budgetTierOptions}
            selectedKey={editorTier}
            onChange={(_, opt): void => setEditorTier((opt?.key ?? "standard") as BudgetTier)}
          />
          <Separator />
          <Dropdown
            label="Default Vendor"
            options={vendorOptions}
            selectedKey={editorDefaultVendorId ?? ""}
            onChange={(_, opt): void =>
              setEditorDefaultVendorId(opt?.key === "" ? undefined : Number(opt?.key))
            }
            placeholder="(Optional)"
          />
          <Dropdown
            label="Status"
            options={activeStatusOptions}
            selectedKey={editorIsActive}
            onChange={(_, opt): void => setEditorIsActive(Number(opt?.key ?? 1))}
          />
        </div>
      </Panel>

      {/* Delete confirmation dialog */}
      <Dialog
        hidden={!pendingDelete}
        onDismiss={(): void => setPendingDelete(undefined)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Delete schedule",
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
