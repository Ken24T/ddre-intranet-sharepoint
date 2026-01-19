import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Dropdown,
  IDropdownOption,
  DatePicker,
  DefaultButton,
  TextField,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Icon,
  TooltipHost,
  DirectionalHint,
  Modal,
  IconButton,
  Selection,
} from '@fluentui/react';
import { useAudit } from '../AuditContext';
import type { EventType } from '../AuditContext';
import styles from './AuditLogViewer.module.scss';

// =============================================================================
// TYPES
// =============================================================================

interface IAuditLogEntry {
  eventId: string;
  eventType: EventType;
  action: string;
  timestamp: string;
  userId: string;
  userDisplayName?: string;
  sessionId: string;
  appVersion: string;
  hub?: string;
  tool?: string;
  metadata?: Record<string, unknown>;
}

type DateRangePreset = 'today' | 'last7' | 'last30' | 'custom';

interface IFilters {
  userId: string;
  eventType: EventType | '';
  hub: string;
  action: string;
  datePreset: DateRangePreset;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface IAuditLogViewerProps {
  /** Called when user clicks back/close */
  onClose?: () => void;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockLogEntries: IAuditLogEntry[] = [
  {
    eventId: 'e001',
    eventType: 'navigation',
    action: 'hub_changed',
    timestamp: '2026-01-20T09:15:00.000Z',
    userId: 'ken.boyle@dougdisher.com.au',
    userDisplayName: 'Ken Boyle',
    sessionId: 'sess-001',
    appVersion: '0.4.1',
    hub: 'sales',
    metadata: { previousHub: 'home', source: 'sidebar' },
  },
  {
    eventId: 'e002',
    eventType: 'card_action',
    action: 'card_opened',
    timestamp: '2026-01-20T09:16:30.000Z',
    userId: 'ken.boyle@dougdisher.com.au',
    userDisplayName: 'Ken Boyle',
    sessionId: 'sess-001',
    appVersion: '0.4.1',
    hub: 'sales',
    tool: 'vault-contacts',
    metadata: { cardTitle: 'Vault Contacts', openMethod: 'click' },
  },
  {
    eventId: 'e003',
    eventType: 'search',
    action: 'search_executed',
    timestamp: '2026-01-20T09:18:00.000Z',
    userId: 'sophie.nguyen@dougdisher.com.au',
    userDisplayName: 'Sophie Nguyen',
    sessionId: 'sess-002',
    appVersion: '0.4.1',
    hub: 'property-management',
    metadata: { query: 'maintenance', resultCount: 12 },
  },
  {
    eventId: 'e004',
    eventType: 'settings',
    action: 'theme_changed',
    timestamp: '2026-01-20T09:20:00.000Z',
    userId: 'liam.harris@dougdisher.com.au',
    userDisplayName: 'Liam Harris',
    sessionId: 'sess-003',
    appVersion: '0.4.1',
    metadata: { previousTheme: 'light', newTheme: 'dark' },
  },
  {
    eventId: 'e005',
    eventType: 'card_action',
    action: 'card_favourited',
    timestamp: '2026-01-20T09:22:00.000Z',
    userId: 'amelia.jones@dougdisher.com.au',
    userDisplayName: 'Amelia Jones',
    sessionId: 'sess-004',
    appVersion: '0.4.1',
    hub: 'office',
    metadata: { cardId: 'leave-requests', cardTitle: 'Leave Requests' },
  },
  {
    eventId: 'e006',
    eventType: 'system',
    action: 'app_loaded',
    timestamp: '2026-01-20T09:25:00.000Z',
    userId: 'ken.boyle@dougdisher.com.au',
    userDisplayName: 'Ken Boyle',
    sessionId: 'sess-005',
    appVersion: '0.4.1',
  },
  {
    eventId: 'e007',
    eventType: 'error',
    action: 'api_error',
    timestamp: '2026-01-20T09:30:00.000Z',
    userId: 'sophie.nguyen@dougdisher.com.au',
    userDisplayName: 'Sophie Nguyen',
    sessionId: 'sess-002',
    appVersion: '0.4.1',
    hub: 'sales',
    tool: 'vault-contacts',
    metadata: { endpoint: '/api/v1/vault/contacts', statusCode: 503 },
  },
  {
    eventId: 'e008',
    eventType: 'navigation',
    action: 'hub_changed',
    timestamp: '2026-01-20T09:32:00.000Z',
    userId: 'liam.harris@dougdisher.com.au',
    userDisplayName: 'Liam Harris',
    sessionId: 'sess-003',
    appVersion: '0.4.1',
    hub: 'administration',
    metadata: { previousHub: 'home', source: 'sidebar' },
  },
  {
    eventId: 'e009',
    eventType: 'content_view',
    action: 'document_opened',
    timestamp: '2026-01-20T09:35:00.000Z',
    userId: 'amelia.jones@dougdisher.com.au',
    userDisplayName: 'Amelia Jones',
    sessionId: 'sess-004',
    appVersion: '0.4.1',
    hub: 'library',
    metadata: { documentName: 'Policy_Handbook.pdf', documentId: 'doc-123' },
  },
  {
    eventId: 'e010',
    eventType: 'user_interaction',
    action: 'ai_query_submitted',
    timestamp: '2026-01-20T09:40:00.000Z',
    userId: 'ken.boyle@dougdisher.com.au',
    userDisplayName: 'Ken Boyle',
    sessionId: 'sess-005',
    appVersion: '0.4.1',
    hub: 'home',
    metadata: { query: 'How do I submit leave?', responseTime: 1250 },
  },
];

// =============================================================================
// HELPERS
// =============================================================================

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getEventTypeIcon(eventType: EventType): string {
  switch (eventType) {
    case 'navigation':
      return 'Nav2DMapView';
    case 'card_action':
      return 'GridViewSmall';
    case 'settings':
      return 'Settings';
    case 'content_view':
      return 'View';
    case 'search':
      return 'Search';
    case 'user_interaction':
      return 'Chat';
    case 'notification':
      return 'Ringer';
    case 'system':
      return 'System';
    case 'error':
      return 'ErrorBadge';
    default:
      return 'Info';
  }
}

function getEventTypeColor(eventType: EventType): string {
  switch (eventType) {
    case 'navigation':
      return '#0078d4';
    case 'card_action':
      return '#107c10';
    case 'settings':
      return '#5c2d91';
    case 'content_view':
      return '#008272';
    case 'search':
      return '#ff8c00';
    case 'user_interaction':
      return '#0078d4';
    case 'notification':
      return '#ffb900';
    case 'system':
      return '#605e5c';
    case 'error':
      return '#d13438';
    default:
      return '#605e5c';
  }
}

function getDateRangeFromPreset(preset: DateRangePreset): { start: Date | undefined; end: Date | undefined } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case 'today':
      return { start: today, end: now };
    case 'last7': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start: weekAgo, end: now };
    }
    case 'last30': {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { start: monthAgo, end: now };
    }
    case 'custom':
    default:
      return { start: undefined, end: undefined };
  }
}

// =============================================================================
// SUMMARY WIDGET COMPONENT
// =============================================================================

interface ISummaryStats {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  topUsers: Array<{ name: string; count: number }>;
  eventsByHour: number[];
}

function calculateStats(logs: IAuditLogEntry[]): ISummaryStats {
  const eventsByType: Record<string, number> = {};
  const userCounts: Record<string, { name: string; count: number }> = {};
  const eventsByHour: number[] = new Array(24).fill(0);

  for (const log of logs) {
    // Count by type
    eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;
    
    // Count by user
    const userName = log.userDisplayName || log.userId;
    if (!userCounts[log.userId]) {
      userCounts[log.userId] = { name: userName, count: 0 };
    }
    userCounts[log.userId].count++;
    
    // Count by hour
    const hour = new Date(log.timestamp).getHours();
    eventsByHour[hour]++;
  }

  const topUsers = Object.keys(userCounts)
    .map((key) => userCounts[key])
    .sort((a: { name: string; count: number }, b: { name: string; count: number }) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEvents: logs.length,
    eventsByType: eventsByType as Record<EventType, number>,
    topUsers,
    eventsByHour,
  };
}

const SummaryWidgets: React.FC<{ stats: ISummaryStats }> = ({ stats }) => {
  const maxHourValue = Math.max(...stats.eventsByHour, 1);
  
  // Get top event types for display
  const eventTypeKeys = Object.keys(stats.eventsByType) as EventType[];
  const topEventTypes = eventTypeKeys
    .map((key) => ({ type: key, count: stats.eventsByType[key] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className={styles.summaryWidgets}>
      <div className={styles.widget}>
        <div className={styles.widgetLabel}>Total Events</div>
        <div className={styles.widgetValue}>{stats.totalEvents.toLocaleString()}</div>
      </div>
      
      <div className={styles.widget}>
        <div className={styles.widgetLabel}>By Type</div>
        <div className={styles.eventTypeBars}>
          {topEventTypes.map((item) => (
            <TooltipHost key={item.type} content={`${item.type}: ${item.count}`}>
              <div className={styles.eventTypeBar}>
                <Icon
                  iconName={getEventTypeIcon(item.type)}
                  style={{ color: getEventTypeColor(item.type), fontSize: 14 }}
                />
                <span className={styles.eventTypeCount}>{item.count}</span>
              </div>
            </TooltipHost>
          ))}
        </div>
      </div>
      
      <div className={styles.widget}>
        <div className={styles.widgetLabel}>Top Users</div>
        <div className={styles.topUsers}>
          {stats.topUsers.slice(0, 3).map((user, i) => (
            <TooltipHost key={i} content={`${user.name}: ${user.count} events`}>
              <span className={styles.topUser}>
                {user.name.split(' ')[0]} ({user.count})
              </span>
            </TooltipHost>
          ))}
        </div>
      </div>
      
      <div className={styles.widget}>
        <div className={styles.widgetLabel}>Activity (24h)</div>
        <div className={styles.sparkline}>
          {stats.eventsByHour.map((count, hour) => (
            <TooltipHost key={hour} content={`${hour}:00 - ${count} events`}>
              <div
                className={styles.sparklineBar}
                style={{ height: `${(count / maxHourValue) * 100}%` }}
              />
            </TooltipHost>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// DETAIL MODAL COMPONENT
// =============================================================================

interface IDetailModalProps {
  entry: IAuditLogEntry | undefined;
  onDismiss: () => void;
}

const DetailModal: React.FC<IDetailModalProps> = ({ entry, onDismiss }) => {
  if (!entry) return <></>;

  const fields = [
    { label: 'Event ID', value: entry.eventId },
    { label: 'Timestamp', value: formatTimestamp(entry.timestamp) },
    { label: 'User', value: entry.userDisplayName || entry.userId },
    { label: 'Email', value: entry.userId },
    { label: 'Session', value: entry.sessionId },
    { label: 'Event Type', value: entry.eventType },
    { label: 'Action', value: entry.action },
    { label: 'Hub', value: entry.hub || '—' },
    { label: 'Tool', value: entry.tool || '—' },
    { label: 'App Version', value: entry.appVersion },
  ];

  return (
    <Modal
      isOpen={true}
      onDismiss={onDismiss}
      isBlocking={false}
      containerClassName={styles.detailModal}
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>
          <Icon
            iconName={getEventTypeIcon(entry.eventType)}
            style={{ color: getEventTypeColor(entry.eventType) }}
          />
          <span>Event Details</span>
        </div>
        <IconButton
          iconProps={{ iconName: 'Cancel' }}
          ariaLabel="Close"
          onClick={onDismiss}
        />
      </div>
      <div className={styles.modalBody}>
        <div className={styles.detailFields}>
          {fields.map((field) => (
            <div key={field.label} className={styles.detailField}>
              <span className={styles.detailLabel}>{field.label}</span>
              <span className={styles.detailValue}>{field.value}</span>
            </div>
          ))}
        </div>
        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
          <div className={styles.metadataSection}>
            <h4 className={styles.metadataTitle}>Metadata</h4>
            <pre className={styles.metadataJson}>
              {JSON.stringify(entry.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * AuditLogViewer - Admin interface for viewing audit logs.
 * Shows a filterable, sortable list of user activity events.
 */
export const AuditLogViewer: React.FC<IAuditLogViewerProps> = ({ onClose }) => {
  const audit = useAudit();

  // State
  const [logs, setLogs] = React.useState<IAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = React.useState<IAuditLogEntry | undefined>(undefined);
  const [filters, setFilters] = React.useState<IFilters>({
    userId: '',
    eventType: '',
    hub: '',
    action: '',
    datePreset: 'last7',
    startDate: undefined,
    endDate: undefined,
  });

  // Selection for row clicks
  const selection = React.useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selected = selection.getSelection()[0] as IAuditLogEntry | undefined;
          if (selected) {
            setSelectedEntry(selected);
            selection.setAllSelected(false);
          }
        },
      }),
    []
  );

  // Log that user viewed audit logs
  React.useEffect(() => {
    audit.logContentView('dashboard_viewed', {
      hub: 'administration',
      tool: 'audit-logs',
    });
  }, [audit]);

  // Simulate loading logs (mock data for now)
  React.useEffect(() => {
    setIsLoading(true);
    setError(undefined);

    // Simulate API call
    const timer = setTimeout(() => {
      try {
        setLogs(mockLogEntries);
        setIsLoading(false);
      } catch {
        setError('Failed to load audit logs. Please try again.');
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Calculate effective date range from preset or custom dates
  const effectiveDates = React.useMemo(() => {
    if (filters.datePreset === 'custom') {
      return { start: filters.startDate, end: filters.endDate };
    }
    return getDateRangeFromPreset(filters.datePreset);
  }, [filters.datePreset, filters.startDate, filters.endDate]);

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (filters.userId && !log.userId.toLowerCase().includes(filters.userId.toLowerCase()) &&
          !(log.userDisplayName?.toLowerCase().includes(filters.userId.toLowerCase()))) {
        return false;
      }
      if (filters.eventType && log.eventType !== filters.eventType) {
        return false;
      }
      if (filters.hub && log.hub !== filters.hub) {
        return false;
      }
      if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) {
        return false;
      }
      if (effectiveDates.start) {
        const logDate = new Date(log.timestamp);
        if (logDate < effectiveDates.start) return false;
      }
      if (effectiveDates.end) {
        const logDate = new Date(log.timestamp);
        const endOfDay = new Date(effectiveDates.end);
        endOfDay.setHours(23, 59, 59, 999);
        if (logDate > endOfDay) return false;
      }
      return true;
    });
  }, [logs, filters.userId, filters.eventType, filters.hub, filters.action, effectiveDates]);

  // Calculate summary stats
  const stats = React.useMemo(() => calculateStats(filteredLogs), [filteredLogs]);

  // Column definitions
  const columns: IColumn[] = React.useMemo(
    () => [
      {
        key: 'eventType',
        name: 'Type',
        fieldName: 'eventType',
        minWidth: 40,
        maxWidth: 50,
        onRender: (item: IAuditLogEntry) => (
          <TooltipHost
            content={item.eventType}
            directionalHint={DirectionalHint.topCenter}
          >
            <Icon
              iconName={getEventTypeIcon(item.eventType)}
              style={{ color: getEventTypeColor(item.eventType), fontSize: 16 }}
            />
          </TooltipHost>
        ),
      },
      {
        key: 'timestamp',
        name: 'Time',
        fieldName: 'timestamp',
        minWidth: 140,
        maxWidth: 160,
        onRender: (item: IAuditLogEntry) => (
          <span className={styles.timestamp}>{formatTimestamp(item.timestamp)}</span>
        ),
      },
      {
        key: 'user',
        name: 'User',
        fieldName: 'userDisplayName',
        minWidth: 120,
        maxWidth: 180,
        onRender: (item: IAuditLogEntry) => (
          <TooltipHost content={item.userId} directionalHint={DirectionalHint.topCenter}>
            <span className={styles.user}>{item.userDisplayName || item.userId}</span>
          </TooltipHost>
        ),
      },
      {
        key: 'action',
        name: 'Action',
        fieldName: 'action',
        minWidth: 120,
        maxWidth: 180,
        onRender: (item: IAuditLogEntry) => (
          <span className={styles.action}>{item.action.replace(/_/g, ' ')}</span>
        ),
      },
      {
        key: 'hub',
        name: 'Hub',
        fieldName: 'hub',
        minWidth: 100,
        maxWidth: 140,
        onRender: (item: IAuditLogEntry) => (
          <span className={styles.hub}>{item.hub || '—'}</span>
        ),
      },
      {
        key: 'tool',
        name: 'Tool',
        fieldName: 'tool',
        minWidth: 100,
        maxWidth: 140,
        onRender: (item: IAuditLogEntry) => (
          <span className={styles.tool}>{item.tool || '—'}</span>
        ),
      },
      {
        key: 'metadata',
        name: 'Details',
        fieldName: 'metadata',
        minWidth: 200,
        isMultiline: true,
        onRender: (item: IAuditLogEntry) => {
          if (!item.metadata || Object.keys(item.metadata).length === 0) {
            return <span className={styles.metadata}>—</span>;
          }
          const metadataKeys = Object.keys(item.metadata) as Array<keyof typeof item.metadata>;
          const summary = metadataKeys
            .slice(0, 3)
            .map((key) => `${key}: ${String(item.metadata![key])}`)
            .join(', ');
          return (
            <TooltipHost
              content={JSON.stringify(item.metadata, null, 2)}
              directionalHint={DirectionalHint.leftCenter}
            >
              <span className={styles.metadata}>{summary}</span>
            </TooltipHost>
          );
        },
      },
    ],
    []
  );

  // Event type options
  const eventTypeOptions: IDropdownOption[] = [
    { key: '', text: 'All types' },
    { key: 'navigation', text: 'Navigation' },
    { key: 'card_action', text: 'Card Action' },
    { key: 'settings', text: 'Settings' },
    { key: 'content_view', text: 'Content View' },
    { key: 'search', text: 'Search' },
    { key: 'user_interaction', text: 'User Interaction' },
    { key: 'notification', text: 'Notification' },
    { key: 'system', text: 'System' },
    { key: 'error', text: 'Error' },
  ];

  // Hub options
  const hubOptions: IDropdownOption[] = [
    { key: '', text: 'All hubs' },
    { key: 'home', text: 'Home' },
    { key: 'sales', text: 'Sales' },
    { key: 'property-management', text: 'Property Management' },
    { key: 'office', text: 'Office' },
    { key: 'administration', text: 'Administration' },
    { key: 'library', text: 'Library' },
  ];

  // Date preset options
  const datePresetOptions: IDropdownOption[] = [
    { key: 'today', text: 'Today' },
    { key: 'last7', text: 'Last 7 days' },
    { key: 'last30', text: 'Last 30 days' },
    { key: 'custom', text: 'Custom range' },
  ];

  const handleClearFilters = (): void => {
    setFilters({
      userId: '',
      eventType: '',
      hub: '',
      action: '',
      datePreset: 'last7',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleExport = (): void => {
    // Generate CSV
    const headers = ['Timestamp', 'User', 'Event Type', 'Action', 'Hub', 'Tool', 'Metadata'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.userDisplayName || log.userId,
      log.eventType,
      log.action,
      log.hub || '',
      log.tool || '',
      JSON.stringify(log.metadata || {}),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    audit.logContentView('document_downloaded', {
      hub: 'administration',
      tool: 'audit-logs',
      metadata: { format: 'csv', rowCount: filteredLogs.length },
    });
  };

  const hasFilters = Boolean(
    filters.userId ||
    filters.eventType ||
    filters.hub ||
    filters.action ||
    filters.datePreset !== 'last7' ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className={styles.auditLogViewer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <Icon iconName="ComplianceAudit" className={styles.titleIcon} />
            Audit Logs
          </h2>
          <span className={styles.subtitle}>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            {hasFilters && ' (filtered)'}
          </span>
        </div>
        <div className={styles.headerRight}>
          <DefaultButton
            iconProps={{ iconName: 'Download' }}
            text="Export CSV"
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
          />
          {onClose && (
            <DefaultButton
              iconProps={{ iconName: 'Back' }}
              text="Back"
              onClick={onClose}
            />
          )}
        </div>
      </div>

      {/* Summary Widgets */}
      {!isLoading && filteredLogs.length > 0 && <SummaryWidgets stats={stats} />}

      <div className={styles.filters}>
        <TextField
          placeholder="Search by user..."
          iconProps={{ iconName: 'Search' }}
          value={filters.userId}
          onChange={(_, value) => setFilters((f) => ({ ...f, userId: value || '' }))}
          className={styles.filterField}
        />
        <Dropdown
          placeholder="Event type"
          options={eventTypeOptions}
          selectedKey={filters.eventType}
          onChange={(_, option) =>
            setFilters((f) => ({ ...f, eventType: (option?.key as EventType | '') || '' }))
          }
          className={styles.filterDropdown}
        />
        <Dropdown
          placeholder="Hub"
          options={hubOptions}
          selectedKey={filters.hub}
          onChange={(_, option) =>
            setFilters((f) => ({ ...f, hub: (option?.key as string) || '' }))
          }
          className={styles.filterDropdown}
        />
        <TextField
          placeholder="Action..."
          value={filters.action}
          onChange={(_, value) => setFilters((f) => ({ ...f, action: value || '' }))}
          className={styles.filterField}
        />
        <Dropdown
          placeholder="Date range"
          options={datePresetOptions}
          selectedKey={filters.datePreset}
          onChange={(_, option) =>
            setFilters((f) => ({
              ...f,
              datePreset: (option?.key as DateRangePreset) || 'last7',
              // Clear custom dates when switching to preset
              startDate: option?.key === 'custom' ? f.startDate : undefined,
              endDate: option?.key === 'custom' ? f.endDate : undefined,
            }))
          }
          className={styles.filterDropdown}
        />
        {filters.datePreset === 'custom' && (
          <>
            <DatePicker
              placeholder="Start date"
              value={filters.startDate}
              onSelectDate={(date) => setFilters((f) => ({ ...f, startDate: date || undefined }))}
              className={styles.filterDate}
            />
            <DatePicker
              placeholder="End date"
              value={filters.endDate}
              onSelectDate={(date) => setFilters((f) => ({ ...f, endDate: date || undefined }))}
              className={styles.filterDate}
            />
          </>
        )}
        {hasFilters && (
          <DefaultButton
            iconProps={{ iconName: 'ClearFilter' }}
            text="Clear"
            onClick={handleClearFilters}
          />
        )}
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(undefined)}>
          {error}
        </MessageBar>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          <Spinner size={SpinnerSize.large} label="Loading audit logs..." />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className={styles.empty}>
          <Icon iconName="SearchIssue" className={styles.emptyIcon} />
          <p className={styles.emptyText}>No audit logs found</p>
          <p className={styles.emptyHint}>
            {hasFilters
              ? 'Try adjusting your filters'
              : 'Audit events will appear here as users interact with the intranet'}
          </p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <DetailsList
            items={filteredLogs}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.single}
            selection={selection}
            isHeaderVisible={true}
            compact={true}
          />
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.footerNote}>
          <Icon iconName="Info" /> Logs are retained indefinitely. Admin access only.
        </span>
      </div>

      {/* Detail Modal */}
      <DetailModal entry={selectedEntry} onDismiss={() => setSelectedEntry(undefined)} />
    </div>
  );
};

export default AuditLogViewer;
