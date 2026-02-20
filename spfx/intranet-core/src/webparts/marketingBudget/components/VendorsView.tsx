/**
 * VendorsView — Browse vendors and their associated services.
 *
 * Displays vendors in a DetailsList with contact details.
 * Clicking a row shows the vendor's services inline.
 * Admin users can add, edit and delete vendors via the "..." context menu.
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
import type { Vendor, Service } from "../models/types";
import type { UserRole } from "../models/permissions";
import { canManageReferenceData } from "../models/permissions";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import styles from "./MarketingBudget.module.scss";

export interface IVendorsViewProps {
  repository: IBudgetRepository;
  userRole: UserRole;
  onDataChanged?: () => void;
}

interface IVendorRow {
  key: string;
  id: number;
  name: string;
  shortCode: string;
  contactEmail: string;
  contactPhone: string;
  serviceCount: number;
  _vendor: Vendor;
}

interface IVendorNameCellProps {
  vendor: Vendor;
  serviceCount: number;
}

const VendorNameCell: React.FC<IVendorNameCellProps> = ({
  vendor,
  serviceCount,
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

  return (
    <>
      <div
        ref={cellRef}
        className={styles.budgetRowAddress}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {vendor.name}
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
              <Icon iconName="People" />
              <span>VENDOR</span>
            </div>
            <div className={styles.budgetCalloutBody}>
              <p className={styles.budgetCalloutAddress}>{vendor.name}</p>
              {vendor.shortCode && (
                <div className={styles.budgetCalloutMeta}>
                  <Icon iconName="Tag" className={styles.budgetCalloutMetaIcon} />
                  <span>{vendor.shortCode}</span>
                </div>
              )}
              {vendor.contactEmail && (
                <div className={styles.budgetCalloutMeta}>
                  <Icon iconName="Mail" className={styles.budgetCalloutMetaIcon} />
                  <span>{vendor.contactEmail}</span>
                </div>
              )}
              {vendor.contactPhone && (
                <div className={styles.budgetCalloutMeta}>
                  <Icon iconName="Phone" className={styles.budgetCalloutMetaIcon} />
                  <span>{vendor.contactPhone}</span>
                </div>
              )}
            </div>
            <div className={styles.budgetCalloutTotals}>
              <span className={styles.budgetCalloutTotalLabel}>Services</span>
              <span className={styles.budgetCalloutTotalValue}>{serviceCount}</span>
            </div>
          </div>
        </Callout>
      )}
    </>
  );
};

const activeStatusOptions: IDropdownOption[] = [
  { key: 1, text: "Active" },
  { key: 0, text: "Inactive" },
];

export const VendorsView: React.FC<IVendorsViewProps> = ({ repository, userRole, onDataChanged }) => {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<number | undefined>(
    undefined,
  );

  // Editor panel state
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editVendor, setEditVendor] = React.useState<Vendor | undefined>(undefined);
  const [editorName, setEditorName] = React.useState("");
  const [editorShortCode, setEditorShortCode] = React.useState("");
  const [editorEmail, setEditorEmail] = React.useState("");
  const [editorPhone, setEditorPhone] = React.useState("");
  const [editorIsActive, setEditorIsActive] = React.useState<number>(1);
  const [isSaving, setIsSaving] = React.useState(false);

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = React.useState<Vendor | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isAdmin = canManageReferenceData(userRole);

  const loadData = React.useCallback(
    async (signal: { cancelled: boolean }): Promise<void> => {
      setIsLoading(true);
      try {
        const [vendorList, svcList] = await Promise.all([
          repository.getVendors(),
          repository.getAllServices(),
        ]);
        if (!signal.cancelled) {
          setVendors(vendorList);
          setServices(svcList);
        }
      } catch (err) {
        if (!signal.cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load vendors",
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

  /** Services grouped by vendor ID. */
  const servicesByVendor = React.useMemo(() => {
    const map = new Map<number, Service[]>();
    for (const s of services) {
      if (s.vendorId !== null) {
        const existing = map.get(s.vendorId) ?? [];
        existing.push(s);
        map.set(s.vendorId, existing);
      }
    }
    return map;
  }, [services]);

  const rows: IVendorRow[] = React.useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return vendors
      .filter((v) => !searchText || v.name.toLowerCase().includes(lowerSearch))
      .map((v) => ({
        key: String(v.id ?? 0),
        id: v.id ?? 0,
        name: v.name,
        shortCode: v.shortCode ?? "—",
        contactEmail: v.contactEmail ?? "—",
        contactPhone: v.contactPhone ?? "—",
        serviceCount: servicesByVendor.get(v.id ?? 0)?.length ?? 0,
        _vendor: v,
      }));
  }, [vendors, searchText, servicesByVendor]);

  // ─── Editor helpers ────────────────────────────────────

  const openEditor = React.useCallback((vendor?: Vendor): void => {
    setEditVendor(vendor);
    setEditorName(vendor?.name ?? "");
    setEditorShortCode(vendor?.shortCode ?? "");
    setEditorEmail(vendor?.contactEmail ?? "");
    setEditorPhone(vendor?.contactPhone ?? "");
    setEditorIsActive(vendor?.isActive ?? 1);
    setIsEditorOpen(true);
  }, []);

  const closeEditor = React.useCallback((): void => {
    setIsEditorOpen(false);
    setEditVendor(undefined);
  }, []);

  const handleSave = React.useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      const vendor: Vendor = {
        ...(editVendor ?? { isActive: 1 }),
        name: editorName.trim(),
        shortCode: editorShortCode.trim() || undefined,
        contactEmail: editorEmail.trim() || undefined,
        contactPhone: editorPhone.trim() || undefined,
        isActive: editorIsActive,
      };
      await repository.saveVendor(vendor);
      closeEditor();
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vendor");
    } finally {
      setIsSaving(false);
    }
  }, [editVendor, editorName, editorShortCode, editorEmail, editorPhone, editorIsActive, repository, closeEditor, loadData, onDataChanged]);

  // ─── Delete helpers ────────────────────────────────────

  const handleDeleteConfirm = React.useCallback(async (): Promise<void> => {
    if (!pendingDelete?.id) return;
    setIsDeleting(true);
    try {
      await repository.deleteVendor(pendingDelete.id);
      setPendingDelete(undefined);
      loadData({ cancelled: false }); // eslint-disable-line @typescript-eslint/no-floating-promises
      onDataChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vendor");
      setPendingDelete(undefined);
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete, repository, loadData, onDataChanged]);

  // ─── Row menu builder ─────────────────────────────────

  const getRowMenuItems = React.useCallback(
    (vendor: Vendor): IContextualMenuItem[] => {
      const items: IContextualMenuItem[] = [];
      if (!isAdmin) return items;

      items.push({
        key: "edit",
        text: "Edit",
        iconProps: { iconName: "Edit" },
        onClick: (): void => openEditor(vendor),
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
        onClick: (): void => setPendingDelete(vendor),
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
        name: "Vendor Name",
        fieldName: "name",
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        onRender: (item: IVendorRow): JSX.Element => (
          <VendorNameCell
            vendor={item._vendor}
            serviceCount={item.serviceCount}
          />
        ),
      },
      {
        key: "code",
        name: "Code",
        fieldName: "shortCode",
        minWidth: 50,
        maxWidth: 80,
        isResizable: true,
      },
      {
        key: "email",
        name: "Email",
        fieldName: "contactEmail",
        minWidth: 160,
        maxWidth: 240,
        isResizable: true,
      },
      {
        key: "phone",
        name: "Phone",
        fieldName: "contactPhone",
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
      },
      {
        key: "services",
        name: "Services",
        fieldName: "serviceCount",
        minWidth: 60,
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
        onRender: (item: IVendorRow): JSX.Element => {
          const menuItems = getRowMenuItems(item._vendor);
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

  const handleRowClick = React.useCallback((item: IVendorRow): void => {
    setExpandedId((prev) => (prev === item.id ? undefined : item.id));
  }, []);

  /** Render expanded vendor detail with their services. */
  const renderExpandedDetail = (vendor: Vendor): React.ReactNode => {
    const vendorServices = servicesByVendor.get(vendor.id ?? 0) ?? [];
    return (
      <div className={styles.refDetailPanel}>
        <Text className={styles.refDetailTitle}>{vendor.name}</Text>
        <div className={styles.refDetailMeta}>
          {vendor.shortCode && (
            <span>
              Code: <strong>{vendor.shortCode}</strong>
            </span>
          )}
          {vendor.contactEmail && (
            <span>
              Email: <strong>{vendor.contactEmail}</strong>
            </span>
          )}
          {vendor.contactPhone && (
            <span>
              Phone: <strong>{vendor.contactPhone}</strong>
            </span>
          )}
        </div>

        <Text
          className={styles.sectionTitle}
          style={{ marginTop: 12, fontSize: 13 }}
        >
          Services ({vendorServices.length})
        </Text>
        <div className={styles.refItemList}>
          {vendorServices.length === 0 ? (
            <Text
              variant="small"
              style={{ color: "#605e5c", padding: "8px 0" }}
            >
              No services assigned.
            </Text>
          ) : (
            vendorServices.map((svc) => (
              <div key={svc.id} className={styles.refItemRow}>
                <Icon
                  iconName="Settings"
                  style={{ color: "#001CAD", fontSize: 14, flexShrink: 0 }}
                />
                <span className={styles.refItemName}>{svc.name}</span>
                <span
                  className={styles.refItemVariant}
                  style={{ textTransform: "capitalize" }}
                >
                  {svc.category}
                </span>
                <span className={styles.refItemPrice}>
                  {svc.variants.length} variant
                  {svc.variants.length !== 1 ? "s" : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Vendors</Text>
        <Text className={styles.viewSubtitle}>
          External vendors who provide marketing services for property
          campaigns.
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
          placeholder="Search vendors…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? "")}
          className={styles.filterSearch}
        />
        {isAdmin && (
          <PrimaryButton
            text="New Vendor"
            iconProps={{ iconName: "Add" }}
            onClick={(): void => openEditor()}
          />
        )}
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading vendors…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon
            iconName="People"
            style={{ fontSize: 48, marginBottom: 16, color: "#001CAD" }}
          />
          <Text variant="large">No vendors found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: "#605e5c" }}>
            Vendors are loaded with reference data.
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
              handleRowClick(item as IVendorRow)
            }
          />
          {expandedId !== undefined &&
            (() => {
              const vendor = vendors.find((v) => v.id === expandedId);
              return vendor ? renderExpandedDetail(vendor) : undefined;
            })()}
        </div>
      )}

      {/* Editor panel */}
      <Panel
        isOpen={isEditorOpen}
        onDismiss={closeEditor}
        type={PanelType.custom}
        customWidth="400px"
        headerText={editVendor ? `Edit — ${editVendor.name}` : "New Vendor"}
        isFooterAtBottom={true}
        onRenderFooterContent={(): JSX.Element => (
          <div className={styles.editorFooterRight}>
            <DefaultButton text="Cancel" onClick={closeEditor} disabled={isSaving} />
            <PrimaryButton
              text={isSaving ? "Saving…" : editVendor ? "Save Changes" : "Create Vendor"}
              onClick={handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
              disabled={isSaving || !editorName.trim()}
            />
          </div>
        )}
      >
        <div className={styles.editorContent}>
          <TextField
            label="Vendor Name"
            value={editorName}
            onChange={(_, val): void => setEditorName(val ?? "")}
            required
            placeholder="e.g. Mountford Media"
          />
          <TextField
            label="Short Code"
            value={editorShortCode}
            onChange={(_, val): void => setEditorShortCode(val ?? "")}
            placeholder="e.g. MM"
            maxLength={10}
          />
          <Separator />
          <TextField
            label="Contact Email"
            value={editorEmail}
            onChange={(_, val): void => setEditorEmail(val ?? "")}
            placeholder="hello@vendor.com.au"
          />
          <TextField
            label="Contact Phone"
            value={editorPhone}
            onChange={(_, val): void => setEditorPhone(val ?? "")}
            placeholder="07 1234 5678"
          />
          <Separator />
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
          title: "Delete vendor",
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
