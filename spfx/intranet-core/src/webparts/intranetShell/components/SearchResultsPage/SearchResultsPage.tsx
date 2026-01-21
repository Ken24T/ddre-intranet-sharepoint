import * as React from 'react';
import { Icon, Checkbox, Spinner, SpinnerSize } from '@fluentui/react';
import type { ISearchResult, SearchResultType } from '../SearchBox';
import styles from './SearchResultsPage.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export interface ISearchResultsPageProps {
  /** The search query */
  query: string;
  /** Called when user wants to navigate back (clear search) */
  onClearSearch?: () => void;
  /** Whether user has admin role (filters admin-only hubs/results) */
  isAdmin?: boolean;
}

interface IFilterState {
  hubs: Set<string>;
  types: Set<SearchResultType>;
}

// =============================================================================
// MOCK DATA & SEARCH
// =============================================================================

const BASE_HUBS = ['home', 'pm', 'sales', 'admin', 'dante'];
const ALL_TYPES: SearchResultType[] = ['page', 'document', 'policy', 'person', 'tool'];

/** Get available hubs based on user role */
function getAvailableHubs(isAdmin: boolean): string[] {
  return isAdmin ? BASE_HUBS : BASE_HUBS.filter(h => h !== 'admin');
}

const hubLabels: Record<string, string> = {
  home: 'Home',
  pm: 'PM Hub',
  sales: 'Sales Hub',
  admin: 'Admin Hub',
  dante: 'Dante Library',
};

const typeLabels: Record<SearchResultType, string> = {
  page: 'Pages',
  document: 'Documents',
  policy: 'Policies',
  person: 'People',
  tool: 'Tools',
};

interface IFullSearchResult extends ISearchResult {
  hubKey: string;
  lastModified?: string;
}

const mockFullResults: IFullSearchResult[] = [
  { id: '1', title: 'Marketing Budget Guidelines', type: 'page', url: '#', metadata: 'Sales Hub · Page', hubKey: 'sales', snippet: 'Guidelines for managing marketing budget allocations across departments...', lastModified: '2026-01-10' },
  { id: '2', title: 'Annual Budget Process', type: 'page', url: '#', metadata: 'Admin Hub · Page', hubKey: 'admin', snippet: 'Overview of the annual budget planning and approval process...', lastModified: '2026-01-08' },
  { id: '3', title: 'Budget_Template_2026.xlsx', type: 'document', url: '#', metadata: 'PM Hub · Document', hubKey: 'pm', snippet: 'Excel template for project budget tracking and forecasting...', lastModified: '2026-01-05' },
  { id: '4', title: 'Q4_Budget_Report.pdf', type: 'document', url: '#', metadata: 'Sales Hub · Document', hubKey: 'sales', snippet: 'Quarterly budget report showing actuals vs projected spending...', lastModified: '2025-12-20' },
  { id: '5', title: 'Budget Approval Policy', type: 'policy', url: '#', metadata: 'Dante Library · Policy', hubKey: 'dante', snippet: 'Policy document outlining budget approval thresholds and signatories...', lastModified: '2025-11-15' },
  { id: '6', title: 'Capital Expenditure Budget Guide', type: 'page', url: '#', metadata: 'Admin Hub · Page', hubKey: 'admin', snippet: 'How to prepare and submit capital expenditure budget requests...', lastModified: '2026-01-12' },
  { id: '7', title: 'Sarah Mitchell', type: 'person', url: '#', metadata: 'Finance · sarah@disher.com.au', hubKey: 'admin', lastModified: undefined },
  { id: '8', title: 'Budget Calculator', type: 'tool', url: '#', metadata: 'PM Hub · Tool', hubKey: 'pm', snippet: 'Interactive tool for calculating project budget estimates...', lastModified: '2025-10-01' },
  { id: '9', title: 'Travel Budget Policy', type: 'policy', url: '#', metadata: 'Dante Library · Policy', hubKey: 'dante', snippet: 'Guidelines and limits for travel-related expenses and reimbursements...', lastModified: '2025-09-20' },
  { id: '10', title: 'Department Budget Requests', type: 'document', url: '#', metadata: 'Admin Hub · Document', hubKey: 'admin', snippet: 'Compiled budget requests from all departments for FY2026...', lastModified: '2026-01-02' },
];

async function mockFullSearch(
  query: string,
  filters: IFilterState,
  page: number,
  isAdmin: boolean = false
): Promise<{ results: IFullSearchResult[]; hasMore: boolean; total: number }> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
  
  if (!query.trim()) {
    return { results: [], hasMore: false, total: 0 };
  }
  
  const lowerQuery = query.toLowerCase();
  const availableHubs = getAvailableHubs(isAdmin);
  
  // Filter by query and exclude admin-only results for non-admin users
  let filtered = mockFullResults.filter(r => {
    // First check if user has access to this hub
    if (availableHubs.indexOf(r.hubKey) === -1) {
      return false;
    }
    // Then check query match
    return r.title.toLowerCase().indexOf(lowerQuery) !== -1 ||
      (r.snippet?.toLowerCase().indexOf(lowerQuery) ?? -1) !== -1 ||
      (r.metadata?.toLowerCase().indexOf(lowerQuery) ?? -1) !== -1;
  });
  
  // Apply hub filter
  if (filters.hubs.size > 0 && filters.hubs.size < availableHubs.length) {
    filtered = filtered.filter(r => filters.hubs.has(r.hubKey));
  }
  
  // Apply type filter
  if (filters.types.size > 0 && filters.types.size < ALL_TYPES.length) {
    filtered = filtered.filter(r => filters.types.has(r.type));
  }
  
  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  
  return {
    results: paged,
    hasMore: start + pageSize < filtered.length,
    total: filtered.length,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function getIconForType(type: SearchResultType): string {
  switch (type) {
    case 'page': return 'Page';
    case 'document': return 'Attach';
    case 'policy': return 'Library';
    case 'person': return 'Contact';
    case 'tool': return 'AppIconDefaultList';
    default: return 'Document';
  }
}

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp -- Query is escaped above
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // eslint-disable-next-line @rushstack/security/no-unsafe-regexp -- Query is escaped above
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <mark key={i} className={styles.highlight}>{part}</mark>
      : part
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SearchResultsPage: React.FC<ISearchResultsPageProps> = ({
  query,
  onClearSearch,
  isAdmin = false,
}) => {
  const [results, setResults] = React.useState<IFullSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState<IFilterState>({
    hubs: new Set<string>(),
    types: new Set<SearchResultType>(),
  });

  // Initial search
  React.useEffect(() => {
    const performSearch = async (): Promise<void> => {
      setIsLoading(true);
      setPage(1);
      setResults([]);
      
      const { results: newResults, hasMore: more, total: totalCount } = await mockFullSearch(query, filters, 1, isAdmin);
      setResults(newResults);
      setHasMore(more);
      setTotal(totalCount);
      setIsLoading(false);
    };
    
    performSearch().catch(() => {
      setIsLoading(false);
    });
  }, [query, filters, isAdmin]);

  const handleLoadMore = async (): Promise<void> => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const { results: moreResults, hasMore: more } = await mockFullSearch(query, filters, nextPage, isAdmin);
    setResults(prev => [...prev, ...moreResults]);
    setHasMore(more);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const handleHubFilterChange = (hubKey: string, checked: boolean): void => {
    setFilters(prev => {
      const newHubs = new Set(prev.hubs);
      if (checked) {
        newHubs.add(hubKey);
      } else {
        newHubs.delete(hubKey);
      }
      return { ...prev, hubs: newHubs };
    });
  };

  const handleTypeFilterChange = (type: SearchResultType, checked: boolean): void => {
    setFilters(prev => {
      const newTypes = new Set(prev.types);
      if (checked) {
        newTypes.add(type);
      } else {
        newTypes.delete(type);
      }
      return { ...prev, types: newTypes };
    });
  };

  const handleClearFilters = (): void => {
    setFilters({ hubs: new Set(), types: new Set() });
  };

  const hasActiveFilters = filters.hubs.size > 0 || filters.types.size > 0;

  return (
    <div className={styles.searchResultsPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Search Results for &ldquo;{query}&rdquo;
        </h1>
        {onClearSearch && (
          <button className={styles.clearButton} onClick={onClearSearch}>
            <Icon iconName="Cancel" />
            Clear search
          </button>
        )}
      </div>

      <div className={styles.content}>
        {/* Filters Panel */}
        <aside className={styles.filtersPanel}>
          <div className={styles.filterSection}>
            <div className={styles.filterHeader}>
              <h3>Hub</h3>
              {filters.hubs.size > 0 && (
                <button 
                  className={styles.filterClear}
                  onClick={() => setFilters(prev => ({ ...prev, hubs: new Set() }))}
                >
                  Clear
                </button>
              )}
            </div>
            <div className={styles.filterOptions}>
              {getAvailableHubs(isAdmin).map(hub => (
                <Checkbox
                  key={hub}
                  label={hubLabels[hub]}
                  checked={filters.hubs.has(hub)}
                  onChange={(_, checked) => handleHubFilterChange(hub, !!checked)}
                />
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterHeader}>
              <h3>Content Type</h3>
              {filters.types.size > 0 && (
                <button 
                  className={styles.filterClear}
                  onClick={() => setFilters(prev => ({ ...prev, types: new Set() }))}
                >
                  Clear
                </button>
              )}
            </div>
            <div className={styles.filterOptions}>
              {ALL_TYPES.map(type => (
                <Checkbox
                  key={type}
                  label={typeLabels[type]}
                  checked={filters.types.has(type)}
                  onChange={(_, checked) => handleTypeFilterChange(type, !!checked)}
                />
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button className={styles.clearAllFilters} onClick={handleClearFilters}>
              <Icon iconName="ClearFilter" />
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results List */}
        <main className={styles.resultsList}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <Spinner size={SpinnerSize.large} label="Searching..." />
            </div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon iconName="SearchIssue" className={styles.emptyIcon} />
              <span className={styles.emptyText}>No results for &ldquo;{query}&rdquo;</span>
              {hasActiveFilters && (
                <span className={styles.emptyHint}>
                  Try removing some filters or using different keywords
                </span>
              )}
            </div>
          ) : (
            <>
              <div className={styles.resultsCount}>
                Showing {results.length} of {total} results
              </div>
              
              <div className={styles.results}>
                {results.map(result => (
                  <a 
                    key={result.id} 
                    href={result.url} 
                    className={styles.resultItem}
                  >
                    <Icon 
                      iconName={getIconForType(result.type)} 
                      className={styles.resultIcon} 
                    />
                    <div className={styles.resultContent}>
                      <span className={styles.resultTitle}>
                        {highlightText(result.title, query)}
                      </span>
                      {result.snippet && (
                        <span className={styles.resultSnippet}>
                          {highlightText(result.snippet, query)}
                        </span>
                      )}
                      <span className={styles.resultMeta}>
                        {result.metadata}
                        {result.lastModified && ` · ${result.lastModified}`}
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              {hasMore && (
                <button 
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <Spinner size={SpinnerSize.small} />
                  ) : (
                    'Load more results'
                  )}
                </button>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
