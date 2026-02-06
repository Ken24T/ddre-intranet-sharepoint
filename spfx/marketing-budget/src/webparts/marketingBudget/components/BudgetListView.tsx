/**
 * BudgetListView — Displays all budgets in a filterable list.
 *
 * Shows a summary row for each budget with address, status, and line item count.
 * Supports filtering by status and text search.
 * Includes "New Budget" button and click-to-edit via BudgetEditorPanel.
 */

import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Dropdown,
  PrimaryButton,
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
import { BudgetEditorPanel } from './BudgetEditorPanel';
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
  /** The original budget for editing. */
  _budget: Budget;
}

const statusOptions: IDropdownOption[] = [
  { key: 'all', text: 'All statuses' },
  { key: 'draft', text: 'Draft' },
  { key: 'approved', text: 'Approved' },
  { key: 'sent', text: 'Sent' },
  { key: 'archived', text: 'Archived' },
];

export const BudgetListView: React.FC<IBudgetListViewProps> = ({ repository }) => {
  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [searchText, setSearchText] = React.useState('');

  // Editor panel state
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editBudget, setEditBudget] = React.useState<Budget | undefined>(undefined);

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

  const columns: IColumn[] = React.useMemo(
    (): IColumn[] => [
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
        onRender: (item: IBudgetRow): JSX.Element => (
          <Text
            variant="small"
            style={{
              textTransform: 'capitalize',
              fontWeight: item.status === 'draft' ? 400 : 600,
            }}
          >
            {item.status}
          </Text>
        ),
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
    ],
    []
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
        createdAt: new Date(b.createdAt).toLocaleDateString('en-AU'),
        _budget: b,
      })),
    [budgets]
  );

  /** Open editor for a new budget. */
  const handleNewBudget = React.useCallback((): void => {
    setEditBudget(undefined);
    setIsEditorOpen(true);
  }, []);

  /** Open editor for an existing budget. */
  const handleRowClick = React.useCallback(
    (item: IBudgetRow): void => {
      setEditBudget(item._budget);
      setIsEditorOpen(true);
    },
    []
  );

  /** Close editor and refresh list if a budget was saved. */
  const handleEditorSaved = React.useCallback(
    (_saved: Budget): void => {
      setIsEditorOpen(false);
      setEditBudget(undefined);
      loadBudgets(); // eslint-disable-line @typescript-eslint/no-floating-promises
    },
    [loadBudgets]
  );

  const handleEditorDismiss = React.useCallback((): void => {
    setIsEditorOpen(false);
    setEditBudget(undefined);
  }, []);

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
        <PrimaryButton
          text="New Budget"
          iconProps={{ iconName: 'Add' }}
          onClick={handleNewBudget}
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
            Click &quot;New Budget&quot; above to create your first property marketing budget.
          </Text>
        </div>
      ) : (
        <DetailsList
          items={rows}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          isHeaderVisible={true}
          onActiveItemChanged={(item): void => handleRowClick(item as IBudgetRow)}
        />
      )}

      {/* Budget editor panel */}
      <BudgetEditorPanel
        budget={editBudget}
        repository={repository}
        isOpen={isEditorOpen}
        onDismiss={handleEditorDismiss}
        onSaved={handleEditorSaved}
      />
    </div>
  );
};
