/**
 * ServicesView — Browse marketing services and their variant pricing.
 *
 * Displays services grouped by vendor in a DetailsList. Clicking a row
 * expands an inline panel showing variants, pricing, and metadata.
 * Services are read-only reference data (managed via seed import).
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
  Dropdown,
} from '@fluentui/react';
import type { IColumn, IDropdownOption } from '@fluentui/react';
import type { Service, Vendor } from '../../../models/types';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import styles from './MarketingBudget.module.scss';

export interface IServicesViewProps {
  repository: IBudgetRepository;
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
  if (service.variants.length === 0) return '—';
  const prices = service.variants.map((v) => v.basePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toFixed(2)}`;
  return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
};

export const ServicesView: React.FC<IServicesViewProps> = ({ repository }) => {
  const [services, setServices] = React.useState<Service[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [searchText, setSearchText] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const [svcList, vendorList] = await Promise.all([
          repository.getAllServices(),
          repository.getVendors(),
        ]);
        if (!cancelled) {
          setServices(svcList);
          setVendors(vendorList);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => { cancelled = true; };
  }, [repository]);

  /** Vendor ID → name lookup. */
  const vendorMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const v of vendors) {
      if (v.id !== undefined) map.set(v.id, v.name);
    }
    return map;
  }, [vendors]);

  /** Distinct categories for the filter dropdown. */
  const categoryOptions: IDropdownOption[] = React.useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    const opts: IDropdownOption[] = [{ key: 'all', text: 'All categories' }];
    Array.from(cats)
      .sort()
      .forEach((c) => opts.push({ key: c, text: c.charAt(0).toUpperCase() + c.slice(1) }));
    return opts;
  }, [services]);

  /** Filtered rows. */
  const rows: IServiceRow[] = React.useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return services
      .filter((s) => {
        if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
        if (searchText && !s.name.toLowerCase().includes(lowerSearch)) return false;
        return true;
      })
      .map((s) => ({
        key: String(s.id ?? 0),
        id: s.id ?? 0,
        name: s.name,
        category: s.category,
        vendorName: s.vendorId !== null ? (vendorMap.get(s.vendorId) ?? 'Unknown') : '—',
        variantCount: s.variants.length,
        variantSelector: s.variantSelector ?? 'none',
        priceRange: formatPriceRange(s),
        _service: s,
      }));
  }, [services, searchText, categoryFilter, vendorMap]);

  const columns: IColumn[] = React.useMemo(
    (): IColumn[] => [
      { key: 'name', name: 'Service', fieldName: 'name', minWidth: 150, maxWidth: 250, isResizable: true },
      {
        key: 'category', name: 'Category', fieldName: 'category', minWidth: 90, maxWidth: 130, isResizable: true,
        onRender: (item: IServiceRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: 'capitalize' }}>{item.category}</Text>
        ),
      },
      { key: 'vendor', name: 'Vendor', fieldName: 'vendorName', minWidth: 120, maxWidth: 180, isResizable: true },
      { key: 'variants', name: 'Variants', fieldName: 'variantCount', minWidth: 60, maxWidth: 80, isResizable: true },
      {
        key: 'selector', name: 'Selection', fieldName: 'variantSelector', minWidth: 80, maxWidth: 110, isResizable: true,
        onRender: (item: IServiceRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: 'capitalize' }}>{item.variantSelector}</Text>
        ),
      },
      { key: 'price', name: 'Price Range', fieldName: 'priceRange', minWidth: 100, maxWidth: 160, isResizable: true },
    ],
    []
  );

  const handleRowClick = React.useCallback((item: IServiceRow): void => {
    setExpandedId((prev) => (prev === item.id ? undefined : item.id));
  }, []);

  /** Expanded detail for a service. */
  const renderExpandedDetail = (service: Service): React.ReactNode => (
    <div className={styles.refDetailPanel}>
      <Text className={styles.refDetailTitle}>{service.name}</Text>
      <div className={styles.refDetailMeta}>
        <span>Category: <strong style={{ textTransform: 'capitalize' }}>{service.category}</strong></span>
        <span>Vendor: <strong>{service.vendorId !== null ? (vendorMap.get(service.vendorId) ?? '—') : 'System'}</strong></span>
        <span>Selection: <strong style={{ textTransform: 'capitalize' }}>{service.variantSelector ?? 'None'}</strong></span>
        <span>GST inclusive: <strong>{service.includesGst ? 'Yes' : 'No'}</strong></span>
      </div>

      <Text className={styles.sectionTitle} style={{ marginTop: 12, fontSize: 13 }}>Variants</Text>
      <div className={styles.refItemList}>
        {service.variants.length === 0 ? (
          <Text variant="small" style={{ color: '#605e5c', padding: '8px 0' }}>No variants defined.</Text>
        ) : (
          service.variants.map((v) => (
            <div key={v.id} className={styles.refItemRow}>
              <span className={styles.refItemName}>{v.name}</span>
              <span className={styles.refItemVariant}>
                {v.sizeMatch ? `Size: ${v.sizeMatch}` : v.tierMatch ? `Tier: ${v.tierMatch}` : ''}
              </span>
              <span className={styles.refItemPrice}>${v.basePrice.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {/* Show included services for package variants */}
      {service.variants.some((v) => v.includedServices && v.includedServices.length > 0) && (
        <>
          <Text className={styles.sectionTitle} style={{ marginTop: 12, fontSize: 13 }}>Included Services</Text>
          <div className={styles.refItemList}>
            {service.variants
              .filter((v) => v.includedServices && v.includedServices.length > 0)
              .map((v) => (
                <div key={v.id} style={{ marginBottom: 8 }}>
                  <Text variant="small" style={{ fontWeight: 600 }}>{v.name}:</Text>
                  {v.includedServices!.map((inc, idx) => (
                    <div key={idx} className={styles.refItemRow} style={{ paddingLeft: 16 }}>
                      <Icon iconName="StatusCircleCheckmark" style={{ color: '#001CAD', fontSize: 12, flexShrink: 0 }} />
                      <span className={styles.refItemName}>{inc.serviceName}</span>
                      <span className={styles.refItemVariant}>{inc.variantName ?? ''}</span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <Text className={styles.viewTitle}>Services</Text>
        <Text className={styles.viewSubtitle}>
          Marketing services and their variant pricing used in budget line items.
        </Text>
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={(): void => setError(undefined)} dismissButtonAriaLabel="Close">
          {error}
        </MessageBar>
      )}

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search services…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? '')}
          className={styles.filterSearch}
        />
        <Dropdown
          placeholder="Category"
          options={categoryOptions}
          selectedKey={categoryFilter}
          onChange={(_, option): void => setCategoryFilter(String(option?.key ?? 'all'))}
          className={styles.filterDropdown}
        />
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading services…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon iconName="Settings" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
          <Text variant="large">No services found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
            Services are loaded with reference data.
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
            onActiveItemChanged={(item): void => handleRowClick(item as IServiceRow)}
          />
          {expandedId !== undefined && (
            (() => {
              const service = services.find((s) => s.id === expandedId);
              return service ? renderExpandedDetail(service) : undefined;
            })()
          )}
        </>
      )}
    </div>
  );
};
