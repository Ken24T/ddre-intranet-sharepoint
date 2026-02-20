/**
 * ServicesView — Browse marketing services and their variant pricing.
 *
 * Displays services grouped by vendor in a DetailsList. Clicking a row
 * expands an inline panel showing variants, pricing, and metadata.
 * Admin users can add, edit, duplicate and delete services via the "..."
 * context menu. The editor panel manages service-level fields; variant
 * editing is handled inline within the panel.
 */

import * as React from "react";
import {
  Checkbox,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dialog,
  DialogFooter,
  DialogType,
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
import type {
  Service,
  ServiceVariant,
  IncludedService,
  Vendor,
  ServiceCategory,
  VariantSelector,
} from "../models/types";
import type { UserRole } from "../models/permissions";
import { canManageReferenceData } from "../models/permissions";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import { ServiceDetailPanel } from "./ServiceDetailPanel";
import styles from "./MarketingBudget.module.scss";

export interface IServicesViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
}

interface IServiceRow {
  key: string;
  id: number;
  name: string;
  category: string;
  vendorName: string;
  variantCount: number;
  variantSelector: string;
  priceRange: string;
  _service: Service;
}

/** Format a price range string from a set of variants. */
const formatPriceRange = (service: Service): string => {
  if (service.variants.length === 0) return "—";
  const prices = service.variants.map((v) => v.basePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toFixed(2)}`;
  return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
};

const categoryOptions: IDropdownOption[] = [
  { key: "photography", text: "Photography" },
  { key: "floorPlans", text: "Floor Plans" },
  { key: "aerial", text: "Aerial" },
  { key: "video", text: "Video" },
  { key: "virtualStaging", text: "Virtual Staging" },
  { key: "internet", text: "Internet" },
  { key: "legal", text: "Legal" },
  { key: "print", text: "Print" },
  { key: "signage", text: "Signage" },
  { key: "other", text: "Other" },
];

const variantSelectorOptions: IDropdownOption[] = [
  { key: "none", text: "None (single default)" },
  { key: "manual", text: "Manual selection" },
  { key: "propertySize", text: "Auto by property size" },
  { key: "suburbTier", text: "Auto by suburb tier" },
];

const activeStatusOptions: IDropdownOption[] = [
  { key: 1, text: "Active" },
  { key: 0, text: "Inactive" },
];

export const ServicesView: React.FC<IServicesViewProps> = ({ repository, userRole }) => {
  const [services, setServices] = React.useState<Service[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [expandedRowKey, setExpandedRowKey] = React.useState<string | undefined>(
    undefined,
  );
  const [expandedService, setExpandedService] = React.useState<Service | undefined>(undefined);

  // Editor panel state
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editService, setEditService] = React.useState<Service | undefined>(undefined);
  const [editorName, setEditorName] = React.useState("");
  const [editorCategory, setEditorCategory] = React.useState<ServiceCategory>("photography");
  const [editorVendorId, setEditorVendorId] = React.useState<number | undefined>(undefined);
  const [editorVariantSelector, setEditorVariantSelector] = React.useState<string>("none");
  const [editorIncludesGst, setEditorIncludesGst] = React.useState(true);
  const [editorIsActive, setEditorIsActive] = React.useState<number>(1);
  const [editorVariants, setEditorVariants] = React.useState<ServiceVariant[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = React.useState<Service | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isAdmin = canManageReferenceData(userRole);

  const loadData = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      setIsLoading(true);
      try {
        const [svcList, vendorList] = await Promise.all([
          repository.getAllServices(),
          repository.getVendors(),
        ]);
        if (!signal.cancelled) {
          setServices(svcList);
          setVendors(vendorList);
        }
      } catch (err) {
        if (!signal.cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load services",
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

  /** Vendor ID → name lookup. */
  const vendorMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const v of vendors) {
      if (v.id !== undefined) map.set(v.id, v.name);
    }
    return map;
  }, [vendors]);

  /** Vendor dropdown options for the editor. */
  const vendorOptions: IDropdownOption[] = React.useMemo(() => {
    const opts: IDropdownOption[] = [{ key: "", text: "(System / no vendor)" }];
    for (const v of vendors) {
      if (v.id !== undefined) opts.push({ key: v.id, text: v.name });
    }
    return opts;
  }, [vendors]);

  /** Distinct categories for the filter dropdown. */
  const categoryFilterOptions: IDropdownOption[] = React.useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    const opts: IDropdownOption[] = [{ key: "all", text: "All categories" }];
    Array.from(cats)
      .sort()
      .forEach((c) =>
        opts.push({ key: c, text: c.charAt(0).toUpperCase() + c.slice(1) }),
      );
    return opts;
  }, [services]);

  /** Filtered rows. */
  const rows: IServiceRow[] = React.useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return services
      .filter((s) => {
        if (categoryFilter !== "all" && s.category !== categoryFilter)
          return false;
        if (searchText && !s.name.toLowerCase().includes(lowerSearch))
          return false;
        return true;
      })
      .map((s, idx) => ({
        key: s.id !== undefined ? `id-${s.id}` : `row-${idx}-${s.name}`,
        id: s.id ?? 0,
        name: s.name,
        category: s.category,
        vendorName:
          s.vendorId !== null ? (vendorMap.get(s.vendorId) ?? "Unknown") : "—",
        variantCount: s.variants.length,
        variantSelector: s.variantSelector ?? "none",
        priceRange: formatPriceRange(s),
        _service: s,
      }));
  }, [services, searchText, categoryFilter, vendorMap]);

  React.useEffect(() => {
    if (!expandedRowKey) return;
    const stillVisible = rows.some((row) => row.key === expandedRowKey);
    if (!stillVisible) {
      setExpandedRowKey(undefined);
      setExpandedService(undefined);
    }
  }, [rows, expandedRowKey]);

  // ─── Editor helpers ────────────────────────────────────

  const openEditor = React.useCallback((service?: Service): void => {
    setEditService(service);
    setEditorName(service?.name ?? "");
    setEditorCategory(service?.category ?? "photography");
    setEditorVendorId(service?.vendorId ?? undefined);
    setEditorVariantSelector(service?.variantSelector ?? "none");
    setEditorIncludesGst(service?.includesGst ?? true);
    setEditorIsActive(service?.isActive ?? 1);
    setEditorVariants(
      service?.variants.map((v) => ({ ...v, includedServices: v.includedServices?.map((i) => ({ ...i })) })) ?? [],
    );
    setIsEditorOpen(true);
  }, []);

  const closeEditor = React.useCallback((): void => {
    setIsEditorOpen(false);
    setEditService(undefined);
  }, []);

  const handleSave = React.useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      const service: Service = {
        ...(editService ?? { isActive: 1 }),
        name: editorName.trim(),
        category: editorCategory,
        vendorId: editorVendorId ?? null,
        variantSelector: editorVariantSelector === "none" ? null : (editorVariantSelector as VariantSelector),
        includesGst: editorIncludesGst,
        isActive: editorIsActive,
        variants: editorVariants,
      };
      await repository.saveService(service);
      closeEditor();
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setIsSaving(false);
    }
  }, [editService, editorName, editorCategory, editorVendorId, editorVariantSelector, editorIncludesGst, editorIsActive, editorVariants, repository, closeEditor, loadData]);

  // ─── Variant editing helpers ───────────────────────────

  const addVariant = React.useCallback((): void => {
    const newId = `var-${Date.now()}`;
    setEditorVariants((prev) => [
      ...prev,
      { id: newId, name: "", basePrice: 0 },
    ]);
  }, []);

  const removeVariant = React.useCallback((variantId: string): void => {
    setEditorVariants((prev) => prev.filter((v) => v.id !== variantId));
  }, []);

  const updateVariant = React.useCallback(
    (variantId: string, field: keyof ServiceVariant, value: string | number | IncludedService[] | undefined): void => {
      setEditorVariants((prev) =>
        prev.map((v) =>
          v.id === variantId ? { ...v, [field]: value } : v,
        ),
      );
    },
    [],
  );

  // ─── Delete helpers ────────────────────────────────────

  const handleDeleteConfirm = React.useCallback(async (): Promise<void> => {
    if (!pendingDelete?.id) return;
    setIsDeleting(true);
    try {
      await repository.deleteService(pendingDelete.id);
      setPendingDelete(undefined);
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
      setPendingDelete(undefined);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete, repository, loadData]);

  // ─── Duplicate helper ─────────────────────────────────

  const handleDuplicate = React.useCallback(
    async (service: Service): Promise<void> => {
      try {
        const copy: Service = {
          ...service,
          id: undefined,
          name: `${service.name} (Copy)`,
          variants: service.variants.map((v) => ({
            ...v,
            includedServices: v.includedServices?.map((i) => ({ ...i })),
          })),
        };
        await repository.saveService(copy);
        loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to duplicate service");
      }
    },
    [repository, loadData],
  );

  // ─── Row menu builder ─────────────────────────────────

  const getRowMenuItems = React.useCallback(
    (service: Service): IContextualMenuItem[] => {
      const items: IContextualMenuItem[] = [];
      if (!isAdmin) return items;

      items.push({
        key: "edit",
        text: "Edit",
        iconProps: { iconName: "Edit" },
        onClick: (): void => openEditor(service),
      });
      items.push({
        key: "duplicate",
        text: "Duplicate",
        iconProps: { iconName: "Copy" },
        onClick: (): void => {
          handleDuplicate(service); // eslint-disable-line @typescript-eslint/no-floating-promises
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
        iconProps: { iconName: "Delete", style: { color: "#a4262c" } },
        style: { color: "#a4262c" },
        onClick: (): void => setPendingDelete(service),
      });
      return items;
    },
    [isAdmin, openEditor, handleDuplicate],
  );

  const handleRowClick = React.useCallback((item: IServiceRow): void => {
    setExpandedRowKey((prev) => {
      const isClosing = prev === item.key;
      const next = isClosing ? undefined : item.key;
      setExpandedService(isClosing ? undefined : item._service);
      return next;
    });
  }, []);

  // ─── Column definitions ───────────────────────────────

  const columns: IColumn[] = React.useMemo((): IColumn[] => {
    const cols: IColumn[] = [
      {
        key: "name",
        name: "Service",
        fieldName: "name",
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        onRender: (item: IServiceRow): JSX.Element => (
          <button
            type="button"
            onClick={(event): void => {
              event.preventDefault();
              event.stopPropagation();
              handleRowClick(item);
            }}
            data-no-row-toggle="true"
            style={{
              border: "none",
              background: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              textAlign: "left",
              color: "inherit",
              font: "inherit",
            }}
          >
            {item.name}
          </button>
        ),
      },
      {
        key: "category",
        name: "Category",
        fieldName: "category",
        minWidth: 90,
        maxWidth: 130,
        isResizable: true,
        onRender: (item: IServiceRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: "capitalize" }}>
            {item.category}
          </Text>
        ),
      },
      {
        key: "vendor",
        name: "Vendor",
        fieldName: "vendorName",
        minWidth: 120,
        maxWidth: 180,
        isResizable: true,
      },
      {
        key: "variants",
        name: "Variants",
        fieldName: "variantCount",
        minWidth: 60,
        maxWidth: 80,
        isResizable: true,
      },
      {
        key: "selector",
        name: "Selection",
        fieldName: "variantSelector",
        minWidth: 80,
        maxWidth: 110,
        isResizable: true,
        onRender: (item: IServiceRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: "capitalize" }}>
            {item.variantSelector}
          </Text>
        ),
      },
      {
        key: "price",
        name: "Price Range",
        fieldName: "priceRange",
        minWidth: 100,
        maxWidth: 160,
        isResizable: true,
      },
    ];

    if (isAdmin) {
      cols.push({
        key: "actions",
        name: "",
        minWidth: 40,
        maxWidth: 40,
        onRender: (item: IServiceRow): JSX.Element => {
          const menuItems = getRowMenuItems(item._service);
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

  /** Resolve vendor display name for a service. */
  const getVendorName = React.useCallback(
    (service: Service): string =>
      service.vendorId !== null
        ? (vendorMap.get(service.vendorId) ?? "—")
        : "System",
    [vendorMap],
  );

  const renderServicesList = React.useCallback(
    (items: IServiceRow[], isHeaderVisible: boolean): React.ReactNode => (
      <DetailsList
        items={items}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={isHeaderVisible}
        onRenderRow={(rowProps, defaultRender): JSX.Element | null => {
          if (!rowProps || !defaultRender) return null;
          const rowItem = rowProps.item as IServiceRow;
          return (
            <div
              style={{ cursor: "pointer" }}
              onClick={(event): void => {
                const target = event.target as HTMLElement;
                if (target.closest("button, a, input, textarea, [role='button'], [data-no-row-toggle='true']")) {
                  return;
                }
                handleRowClick(rowItem);
              }}
              onKeyDown={(event): void => {
                if (event.key !== "Enter" && event.key !== " ") return;
                const target = event.target as HTMLElement;
                if (target.closest("button, a, input, textarea, [role='button'], [data-no-row-toggle='true']")) {
                  return;
                }
                event.preventDefault();
                handleRowClick(rowItem);
              }}
            >
              {defaultRender(rowProps)}
            </div>
          );
        }}
      />
    ),
    [columns, handleRowClick],
  );

  // ─── Variant editor row ────────────────────────────────

  const renderVariantEditor = (variant: ServiceVariant, idx: number): React.ReactNode => (
    <div key={variant.id} className={styles.variantEditorRow}>
      <div className={styles.variantEditorFields}>
        <TextField
          label={idx === 0 ? "Variant Name" : undefined}
          value={variant.name}
          onChange={(_, val): void => updateVariant(variant.id, "name", val ?? "")}
          placeholder="e.g. 8 Photos"
          styles={{ root: { flex: 2 } }}
        />
        <TextField
          label={idx === 0 ? "Price" : undefined}
          value={variant.basePrice === 0 && !variant.name ? "" : String(variant.basePrice)}
          onChange={(_, val): void => updateVariant(variant.id, "basePrice", parseFloat(val ?? "0") || 0)}
          prefix="$"
          type="number"
          styles={{ root: { flex: 1 } }}
        />
        {(editorVariantSelector === "propertySize") && (
          <Dropdown
            label={idx === 0 ? "Size Match" : undefined}
            options={[
              { key: "", text: "—" },
              { key: "small", text: "Small" },
              { key: "medium", text: "Medium" },
              { key: "large", text: "Large" },
            ]}
            selectedKey={variant.sizeMatch ?? ""}
            onChange={(_, opt): void =>
              updateVariant(variant.id, "sizeMatch", opt?.key === "" ? undefined : (opt?.key as string))
            }
            styles={{ root: { flex: 1 } }}
          />
        )}
        {(editorVariantSelector === "suburbTier") && (
          <Dropdown
            label={idx === 0 ? "Tier Match" : undefined}
            options={[
              { key: "", text: "—" },
              { key: "A", text: "Tier A" },
              { key: "B", text: "Tier B" },
              { key: "C", text: "Tier C" },
              { key: "D", text: "Tier D" },
            ]}
            selectedKey={variant.tierMatch ?? ""}
            onChange={(_, opt): void =>
              updateVariant(variant.id, "tierMatch", opt?.key === "" ? undefined : (opt?.key as string))
            }
            styles={{ root: { flex: 1 } }}
          />
        )}
        <IconButton
          iconProps={{ iconName: "Delete" }}
          title="Remove variant"
          ariaLabel={`Remove ${variant.name || "variant"}`}
          onClick={(): void => removeVariant(variant.id)}
          styles={{
            root: { marginTop: idx === 0 ? 28 : 0, color: "#a4262c" },
          }}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Services</Text>
        <Text className={styles.viewSubtitle}>
          Marketing services and their variant pricing used in budget line
          items.
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
          placeholder="Search services…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? "")}
          className={styles.filterSearch}
        />
        <Dropdown
          placeholder="Category"
          options={categoryFilterOptions}
          selectedKey={categoryFilter}
          onChange={(_, option): void =>
            setCategoryFilter(String(option?.key ?? "all"))
          }
          className={styles.filterDropdown}
        />
        {isAdmin && (
          <PrimaryButton
            text="New Service"
            iconProps={{ iconName: "Add" }}
            onClick={(): void => openEditor()}
          />
        )}
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading services…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon
            iconName="Settings"
            style={{ fontSize: 48, marginBottom: 16, color: "#001CAD" }}
          />
          <Text variant="large">No services found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
            Services are loaded with reference data.
          </Text>
        </div>
      ) : (
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          {((): React.ReactNode => {
            if (!expandedRowKey || !expandedService) {
              return renderServicesList(rows, true);
            }

            const expandedIndex = rows.findIndex((row) => row.key === expandedRowKey);
            if (expandedIndex < 0) {
              return renderServicesList(rows, true);
            }

            const topRows = rows.slice(0, expandedIndex + 1);
            const bottomRows = rows.slice(expandedIndex + 1);

            return (
              <>
                {renderServicesList(topRows, true)}
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  <ServiceDetailPanel
                    service={expandedService}
                    vendorName={getVendorName(expandedService)}
                  />
                </div>
                {bottomRows.length > 0 && renderServicesList(bottomRows, false)}
              </>
            );
          })()}
        </div>
      )}

      {/* Editor panel — wider to accommodate variant editing */}
      <Panel
        isOpen={isEditorOpen}
        onDismiss={closeEditor}
        type={PanelType.custom}
        customWidth="560px"
        headerText={editService ? `Edit — ${editService.name}` : "New Service"}
        isFooterAtBottom={true}
        onRenderFooterContent={(): JSX.Element => (
          <div className={styles.editorFooterRight}>
            <DefaultButton text="Cancel" onClick={closeEditor} disabled={isSaving} />
            <PrimaryButton
              text={isSaving ? "Saving…" : editService ? "Save Changes" : "Create Service"}
              onClick={handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
              disabled={isSaving || !editorName.trim()}
            />
          </div>
        )}
      >
        <div className={styles.editorContent}>
          <TextField
            label="Service Name"
            value={editorName}
            onChange={(_, val): void => setEditorName(val ?? "")}
            required
            placeholder="e.g. Photography"
          />
          <Dropdown
            label="Category"
            options={categoryOptions}
            selectedKey={editorCategory}
            onChange={(_, opt): void => setEditorCategory((opt?.key ?? "photography") as ServiceCategory)}
          />
          <Dropdown
            label="Vendor"
            options={vendorOptions}
            selectedKey={editorVendorId ?? ""}
            onChange={(_, opt): void =>
              setEditorVendorId(opt?.key === "" ? undefined : Number(opt?.key))
            }
          />
          <Separator />
          <Dropdown
            label="Variant Selector"
            options={variantSelectorOptions}
            selectedKey={editorVariantSelector}
            onChange={(_, opt): void => setEditorVariantSelector(String(opt?.key ?? "none"))}
          />
          <Checkbox
            label="Prices include GST"
            checked={editorIncludesGst}
            onChange={(_, checked): void => setEditorIncludesGst(checked ?? true)}
            styles={{ root: { marginTop: 12 } }}
          />
          <Dropdown
            label="Status"
            options={activeStatusOptions}
            selectedKey={editorIsActive}
            onChange={(_, opt): void => setEditorIsActive(Number(opt?.key ?? 1))}
          />

          <Separator />

          {/* Variant list editor */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text variant="mediumPlus" style={{ fontWeight: 600 }}>
              Variants ({editorVariants.length})
            </Text>
            <DefaultButton
              text="Add Variant"
              iconProps={{ iconName: "Add" }}
              onClick={addVariant}
            />
          </div>
          {editorVariants.length === 0 ? (
            <Text variant="small" style={{ color: "#605e5c", padding: "8px 0" }}>
              No variants. Click &quot;Add Variant&quot; to define pricing options.
            </Text>
          ) : (
            editorVariants.map((v, idx) => renderVariantEditor(v, idx))
          )}
        </div>
      </Panel>

      {/* Delete confirmation dialog */}
      <Dialog
        hidden={!pendingDelete}
        onDismiss={(): void => setPendingDelete(undefined)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Delete service",
          subText: pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"? This will remove it from all schedules and budgets. This action cannot be undone.`
            : "",
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton
            text={isDeleting ? "Deleting…" : "Delete"}
            onClick={handleDeleteConfirm} // eslint-disable-line @typescript-eslint/no-floating-promises
            disabled={isDeleting}
            style={{ backgroundColor: "#a4262c", borderColor: "#a4262c" }}
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
