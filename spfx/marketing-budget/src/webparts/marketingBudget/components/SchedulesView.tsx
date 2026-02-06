/**
 * SchedulesView — View and inspect schedule templates (budget presets).
 *
 * Displays all schedules in a DetailsList. Clicking a row expands an inline
 * detail panel showing the schedule's line items and metadata. Schedules are
 * read-only reference data (managed via seed import).
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
import type { Schedule, Service } from '../../../models/types';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import styles from './MarketingBudget.module.scss';

export interface ISchedulesViewProps {
  repository: IBudgetRepository;
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

export const SchedulesView: React.FC<ISchedulesViewProps> = ({ repository }) => {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
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
        const [sched, svc] = await Promise.all([
          repository.getSchedules(),
          repository.getAllServices(),
        ]);
        if (!cancelled) {
          setSchedules(sched);
          setServices(svc);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load schedules');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => { cancelled = true; };
  }, [repository]);

  /** Build a service ID → Service lookup. */
  const serviceMap = React.useMemo(() => {
    const map = new Map<number, Service>();
    for (const s of services) {
      if (s.id !== undefined) map.set(s.id, s);
    }
    return map;
  }, [services]);

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

  const columns: IColumn[] = React.useMemo(
    (): IColumn[] => [
      { key: 'name', name: 'Schedule Name', fieldName: 'name', minWidth: 180, maxWidth: 300, isResizable: true },
      {
        key: 'type', name: 'Property Type', fieldName: 'propertyType', minWidth: 90, maxWidth: 120, isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: 'capitalize' }}>{item.propertyType}</Text>
        ),
      },
      {
        key: 'size', name: 'Size', fieldName: 'propertySize', minWidth: 70, maxWidth: 90, isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: 'capitalize' }}>{item.propertySize}</Text>
        ),
      },
      {
        key: 'tier', name: 'Tier', fieldName: 'tier', minWidth: 70, maxWidth: 90, isResizable: true,
        onRender: (item: IScheduleRow): JSX.Element => (
          <Text variant="small" style={{ textTransform: 'capitalize' }}>{item.tier}</Text>
        ),
      },
      { key: 'items', name: 'Items', fieldName: 'lineItemCount', minWidth: 50, maxWidth: 70, isResizable: true },
    ],
    []
  );

  const handleRowClick = React.useCallback((item: IScheduleRow): void => {
    setExpandedId((prev) => (prev === item.id ? undefined : item.id));
  }, []);

  /** Render the expanded detail section for a schedule. */
  const renderExpandedDetail = (schedule: Schedule): React.ReactNode => (
    <div className={styles.refDetailPanel}>
      <Text className={styles.refDetailTitle}>{schedule.name}</Text>
      <div className={styles.refDetailMeta}>
        <span>Type: <strong style={{ textTransform: 'capitalize' }}>{schedule.propertyType}</strong></span>
        <span>Size: <strong style={{ textTransform: 'capitalize' }}>{schedule.propertySize}</strong></span>
        <span>Tier: <strong style={{ textTransform: 'capitalize' }}>{schedule.tier}</strong></span>
      </div>
      <Text className={styles.sectionTitle} style={{ marginTop: 12, fontSize: 13 }}>Line Items</Text>
      <div className={styles.refItemList}>
        {schedule.lineItems.map((li, idx) => {
          const svc = serviceMap.get(li.serviceId);
          const variantName = svc?.variants.find((v) => v.id === li.variantId)?.name ?? li.variantId ?? '—';
          const variantPrice = svc?.variants.find((v) => v.id === li.variantId)?.basePrice;
          return (
            <div key={idx} className={styles.refItemRow}>
              <Icon
                iconName={li.isSelected ? 'CheckboxComposite' : 'Checkbox'}
                style={{ color: li.isSelected ? '#001CAD' : '#a19f9d', fontSize: 14, flexShrink: 0 }}
              />
              <span className={styles.refItemName}>{svc?.name ?? `Service #${li.serviceId}`}</span>
              <span className={styles.refItemVariant}>{variantName}</span>
              <span className={styles.refItemPrice}>
                {variantPrice !== undefined ? `$${variantPrice.toFixed(2)}` : '—'}
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
          Budget templates that define default services for a property type, size, and tier.
        </Text>
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={(): void => setError(undefined)} dismissButtonAriaLabel="Close">
          {error}
        </MessageBar>
      )}

      <div className={styles.filterBar}>
        <SearchBox
          placeholder="Search schedules…"
          value={searchText}
          onChange={(_, val): void => setSearchText(val ?? '')}
          className={styles.filterSearch}
        />
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading schedules…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon iconName="CalendarWeek" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
          <Text variant="large">No schedules found</Text>
          <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
            Schedule templates are loaded with reference data.
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
            onActiveItemChanged={(item): void => handleRowClick(item as IScheduleRow)}
          />
          {expandedId !== undefined && (
            (() => {
              const schedule = schedules.find((s) => s.id === expandedId);
              return schedule ? renderExpandedDetail(schedule) : undefined;
            })()
          )}
        </>
      )}
    </div>
  );
};
