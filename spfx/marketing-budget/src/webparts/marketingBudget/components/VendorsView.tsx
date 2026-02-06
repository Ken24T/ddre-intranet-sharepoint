/**
 * VendorsView — Browse vendors and their associated services.
 *
 * Displays vendors in a DetailsList with contact details.
 * Clicking a row shows the vendor's services inline.
 * Vendors are read-only reference data (managed via seed import).
 */

import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Text,
  Icon,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  SearchBox,
} from '@fluentui/react';
import type { IColumn } from '@fluentui/react';
import type { Vendor, Service } from '../../../models/types';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import styles from './MarketingBudget.module.scss';

export interface IVendorsViewProps {
  repository: IBudgetRepository;
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

export const VendorsView: React.FC<IVendorsViewProps> = ({ repository }) => {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState('');
  const [expandedId, setExpandedId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const [vendorList, svcList] = await Promise.all([
          repository.getVendors(),
          repository.getAllServices(),
        ]);
        if (!cancelled) {
          setVendors(vendorList);
          setServices(svcList);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load vendors');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => { cancelled = true; };
  }, [repository]);

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
        shortCode: v.shortCode ?? '—',
        contactEmail: v.contactEmail ?? '—',
        contactPhone: v.contactPhone ?? '—',
        serviceCount: servicesByVendor.get(v.id ?? 0)?.length ?? 0,
        _vendor: v,
      }));
  }, [vendors, searchText, servicesByVendor]);

  const columns: IColumn[] = React.useMemo(
    (): IColumn[] => [
      { key: 'name', name: 'Vendor Name', fieldName: 'name', minWidth: 150, maxWidth: 250, isResizable: true },
      { key: 'code', name: 'Code', fieldName: 'shortCode', minWidth: 50, maxWidth: 80, isResizable: true },
      { key: 'email', name: 'Email', fieldName: 'contactEmail', minWidth: 160, maxWidth: 240, isResizable: true },
      { key: 'phone', name: 'Phone', fieldName: 'contactPhone', minWidth: 100, maxWidth: 150, isResizable: true },
      { key: 'services', name: 'Services', fieldName: 'serviceCount', minWidth: 60, maxWidth: 80, isResizable: true },
    ],
    []
  );

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
          {vendor.shortCode && <span>Code: <strong>{vendor.shortCode}</strong></span>}
          {vendor.contactEmail && <span>Email: <strong>{vendor.contactEmail}</strong></span>}
          {vendor.contactPhone && <span>Phone: <strong>{vendor.contactPhone}</strong></span>}
        </div>

        <Text className={styles.sectionTitle} style={{ marginTop: 12, fontSize: 13 }}>
          Services ({vendorServices.length})
        </Text>
        <div className={styles.refItemList}>
          {vendorServices.length === 0 ? (
            <Text variant="small" style={{ color: '#605e5c', padding: '8px 0' }}>No services assigned.</Text>
          ) : (
            vendorServices.map((svc) => (
              <div key={svc.id} className={styles.refItemRow}>
                <Icon iconName="Settings" style={{ color: '#001CAD', fontSize: 14, flexShrink: 0 }} />
                <span className={styles.refItemName}>{svc.name}</span>
                <span className={styles.refItemVariant} style={{ textTransform: 'capitalize' }}>{svc.category}</span>
                <span className={styles.refItemPrice}>
                  {svc.variants.length} variant{svc.variants.length !== 1 ? 's' : ''}
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
          External vendors who provide marketing services for property campaigns.
        </Text>
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={(): void => setError(undefined)} dismissButtonAriaLabel="Close">
          {error}
        </MessageBar>
      )}

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search vendors…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? '')}
          className={styles.filterSearch}
        />
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading vendors…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon iconName="People" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
          <Text variant="large">No vendors found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
            Vendors are loaded with reference data.
          </Text>
        </div>
      ) : (
        <>
          <DetailsList
            items={rows}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            isHeaderVisible={true}
            onActiveItemChanged={(item): void => handleRowClick(item as IVendorRow)}
          />
          {expandedId !== undefined && (
            (() => {
              const vendor = vendors.find((v) => v.id === expandedId);
              return vendor ? renderExpandedDetail(vendor) : undefined;
            })()
          )}
        </>
      )}
    </div>
  );
};
