/**
 * BudgetListView — Displays all budgets in a filterable list.
 *
 * Shows a summary card for each budget with address, status, and totals.
 * Supports filtering by status and a text search.
 */

import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Dropdown,
  SearchBox,
  Text,
  Icon,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
} from '@fluentui/react';
import type { IColumn, IDropdownOption } from '@fluentui/react';
import type { Budget, BudgetStatus } from '../../../models/types';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import styles from './MarketingBudget.module.scss';

export interface IBudgetListViewProps {
  repository: IBudgetRepository;
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
}

const statusOptions: IDropdownOption[] = [
  { key: 'all', text: 'All statuses' },
  { key: 'draft', text: 'Draft' },
  { key: 'approved', text: 'Approved' },
  { key: 'sent', text: 'Sent' },
  { key: 'archived', text: 'Archived' },
];

const columns: IColumn[] = [
  {
    key: 'address',
    name: 'Property Address',
    fieldName: 'propertyAddress',
    minWidth: 180,
    maxWidth: 300,
    isResizable: true,
  },
  {
    key: 'type',
    name: 'Type',
    fieldName: 'propertyType',
    minWidth: 80,
    maxWidth: 120,
    isResizable: true,
  },
  {
    key: 'status',
    name: 'Status',
    fieldName: 'status',
    minWidth: 80,
    maxWidth: 100,
    isResizable: true,
  },
  {
    key: 'lineItems',
    name: 'Items',
    fieldName: 'lineItemCount',
    minWidth: 50,
    maxWidth: 70,
    isResizable: true,
  },
  {
    key: 'created',
    name: 'Created',
    fieldName: 'createdAt',
    minWidth: 100,
    maxWidth: 140,
    isResizable: true,
  },
];

export const BudgetListView: React.FC<IBudgetListViewProps> = ({ repository }) => {
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [searchText, setSearchText] = React.useState('');

  const loadBudgets = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: { status?: BudgetStatus; search?: string } = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter as BudgetStatus;
      }
      if (searchText) {
        filters.search = searchText;
      }
      const result = await repository.getBudgets(filters);
      setBudgets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  }, [repository, statusFilter, searchText]);

  React.useEffect(() => {
    loadBudgets(); // eslint-disable-line @typescript-eslint/no-floating-promises
  }, [loadBudgets]);

  const rows: IBudgetRow[] = React.useMemo(
    () =>
      budgets.map((b) => ({
        key: String(b.id ?? 0),
        id: b.id ?? 0,
        propertyAddress: b.propertyAddress,
        propertyType: b.propertyType,
        status: b.status,
        lineItemCount: b.lineItems.length,
        createdAt: new Date(b.createdAt).toLocaleDateString('en-AU'),
      })),
    [budgets]
  );

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
          onChange={(_, val): void => setSearchText(val ?? '')}
          className={styles.filterSearch}
        />
        <Dropdown
          placeholder="Filter by status"
          options={statusOptions}
          selectedKey={statusFilter}
          onChange={(_, option): void => setStatusFilter(String(option?.key ?? 'all'))}
          className={styles.filterDropdown}
        />
      </div>

      {isLoading ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading budgets…" />
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.centeredState}>
          <Icon iconName="Financial" style={{ fontSize: 48, marginBottom: 16, color: '#001CAD' }} />
          <Text variant="large">No budgets yet</Text>
          <Text variant="medium" style={{ marginTop: 8, color: '#605e5c' }}>
            Budgets will appear here once created. Editor coming in Stage 4.
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
    </div>
  );
};
