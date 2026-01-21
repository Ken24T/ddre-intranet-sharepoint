import * as React from 'react';
import { Icon, Spinner, SpinnerSize } from '@fluentui/react';
import { useAudit } from '../AuditContext';
import styles from './SearchBox.module.scss';

// =============================================================================
// TYPES
// =============================================================================

export type SearchResultType = 'page' | 'document' | 'policy' | 'person' | 'tool';

export interface ISearchResult {
  id: string;
  title: string;
  type: SearchResultType;
  url: string;
  snippet?: string;
  metadata?: string; // e.g., "Sales Hub · Document"
}

export interface ISearchBoxProps {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Controlled value for the search input */
  value?: string;
  /** Called when search is submitted (Enter key or click result) */
  onSearch?: (query: string) => void;
  /** Called when query changes */
  onQueryChange?: (query: string) => void;
  /** Called when a result is selected */
  onResultSelect?: (result: ISearchResult) => void;
  /** Optional: provide custom search function for quick results */
  searchFn?: (query: string) => Promise<ISearchResult[]>;
  /** Optional theme variables for styling */
  themeVars?: React.CSSProperties;
  /** Start expanded (shows input by default) */
  defaultExpanded?: boolean;
  /** Disable collapsing on outside click */
  collapseOnBlur?: boolean;
  /** Toggle quick results dropdown */
  showResults?: boolean;
}

// =============================================================================
// MOCK SEARCH (for dev harness)
// =============================================================================

const mockResults: ISearchResult[] = [
  { id: '1', title: 'Marketing Budget Guidelines', type: 'page', url: '#', metadata: 'Sales Hub · Page' },
  { id: '2', title: 'Annual Budget Process', type: 'page', url: '#', metadata: 'Admin Hub · Page' },
  { id: '3', title: 'Budget_Template_2026.xlsx', type: 'document', url: '#', metadata: 'PM Hub · Document' },
  { id: '4', title: 'Q4_Budget_Report.pdf', type: 'document', url: '#', metadata: 'Sales Hub · Document' },
  { id: '5', title: 'Budget Approval Policy', type: 'policy', url: '#', metadata: 'Dante Library · Policy' },
  { id: '6', title: 'Sarah Mitchell', type: 'person', url: '#', metadata: 'Finance · sarah@disher.com.au' },
  { id: '7', title: 'Property Tracker', type: 'tool', url: '#', metadata: 'PM Hub · Tool' },
];

async function mockSearch(query: string): Promise<ISearchResult[]> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockResults.filter(r => 
    r.title.toLowerCase().includes(lowerQuery) ||
    r.metadata?.toLowerCase().includes(lowerQuery)
  );
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

function groupResultsByType(results: ISearchResult[]): Map<SearchResultType, ISearchResult[]> {
  const grouped = new Map<SearchResultType, ISearchResult[]>();
  const typeOrder: SearchResultType[] = ['page', 'document', 'policy', 'person', 'tool'];
  const maxPerType: Record<SearchResultType, number> = { page: 3, document: 3, policy: 2, person: 2, tool: 2 };
  
  for (const type of typeOrder) {
    const items = results.filter(r => r.type === type).slice(0, maxPerType[type]);
    if (items.length > 0) {
      grouped.set(type, items);
    }
  }
  
  return grouped;
}

function getTypeLabel(type: SearchResultType): string {
  switch (type) {
    case 'page': return 'PAGES';
    case 'document': return 'DOCUMENTS';
    case 'policy': return 'POLICIES';
    case 'person': return 'PEOPLE';
    case 'tool': return 'TOOLS';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * SearchBox - Expandable search input with quick results dropdown.
 */
export const SearchBox: React.FC<ISearchBoxProps> = ({
  placeholder = 'Search pages, documents, people...',
  value,
  onSearch,
  onQueryChange,
  onResultSelect,
  searchFn = mockSearch,
  themeVars,
  defaultExpanded = false,
  collapseOnBlur = true,
  showResults = true,
}) => {
  const audit = useAudit();
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [query, setQuery] = React.useState(value ?? '');
  const [results, setResults] = React.useState<ISearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync internal query state with external value prop
  React.useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Flatten results for keyboard navigation
  const flatResults = React.useMemo(() => {
    const grouped = groupResultsByType(results);
    const flat: ISearchResult[] = [];
    grouped.forEach(items => flat.push(...items));
    return flat;
  }, [results]);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!showResults) {
      setResults([]);
      setShowDropdown(false);
      setHasSearched(false);
      return;
    }

    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchFn(query);
        setResults(searchResults);
        setShowDropdown(true); // Show dropdown even for empty results
        setHasSearched(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
        setShowDropdown(false);
        setHasSearched(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchFn, showResults]);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (collapseOnBlur) {
          setIsExpanded(false);
        }
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when expanded
  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleExpand = (): void => {
    setIsExpanded(true);
  };

  const handleClear = (): void => {
    setQuery('');
    onQueryChange?.('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleQueryChange = (value: string): void => {
    setQuery(value);
    onQueryChange?.(value);
  };

  const handleClose = (): void => {
    setIsExpanded(false);
    setShowDropdown(false);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleSubmit = (): void => {
    if (selectedIndex >= 0 && flatResults[selectedIndex]) {
      const result = flatResults[selectedIndex];
      audit.logSearch('search_result_clicked', {
        metadata: { query, resultId: result.id, resultTitle: result.title, resultType: result.type },
      });
      onResultSelect?.(result);
    } else if (query.trim()) {
      audit.logSearch('search_executed', {
        metadata: { query, resultCount: results.length },
      });
      onSearch?.(query);
    }
    setShowDropdown(false);
  };

  const handleResultClick = (result: ISearchResult): void => {
    audit.logSearch('search_result_clicked', {
      metadata: { query, resultId: result.id, resultTitle: result.title, resultType: result.type },
    });
    onResultSelect?.(result);
    setShowDropdown(false);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    switch (event.key) {
      case 'Escape':
        if (showDropdown) {
          setShowDropdown(false);
        } else {
          handleClose();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        handleSubmit();
        break;
    }
  };

  const groupedResults = groupResultsByType(results);

  // Track cumulative index for keyboard selection
  let cumulativeIndex = 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.searchBox} ${isExpanded ? styles.expanded : ''}`}
      style={themeVars}
    >
      {!isExpanded ? (
        <button
          className={styles.searchTrigger}
          onClick={handleExpand}
          aria-label="Open search"
          title="Search"
        >
          <Icon iconName="Search" />
        </button>
      ) : (
        <div className={styles.searchInputContainer}>
          <Icon iconName="Search" className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          {isLoading && (
            <Spinner size={SpinnerSize.small} className={styles.spinner} />
          )}
          {query && !isLoading && (
            <button
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear search"
            >
              <Icon iconName="Cancel" />
            </button>
          )}
        </div>
      )}

      {/* Quick Results Dropdown */}
      {showResults && showDropdown && isExpanded && (
        <div 
          className={styles.dropdown}
          role="listbox"
          aria-label="Search results"
        >
          {/* Empty state */}
          {hasSearched && results.length === 0 && (
            <div className={styles.emptyState}>
              <Icon iconName="SearchIssue" className={styles.emptyIcon} />
              <span className={styles.emptyText}>No results for &ldquo;{query}&rdquo;</span>
              <span className={styles.emptyHint}>Try different keywords or check spelling</span>
            </div>
          )}

          {Array.from(groupedResults.entries()).map(([type, items]) => {
            const startIndex = cumulativeIndex;
            cumulativeIndex += items.length;
            
            return (
              <div key={type} className={styles.resultGroup}>
                <div className={styles.groupHeader}>{getTypeLabel(type)}</div>
                {items.map((result, idx) => {
                  const absoluteIndex = startIndex + idx;
                  return (
                    <button
                      key={result.id}
                      className={`${styles.resultItem} ${selectedIndex === absoluteIndex ? styles.selected : ''}`}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                      role="option"
                      aria-selected={selectedIndex === absoluteIndex}
                    >
                      <Icon iconName={getIconForType(result.type)} className={styles.resultIcon} />
                      <div className={styles.resultContent}>
                        <span className={styles.resultTitle}>{result.title}</span>
                        {result.metadata && (
                          <span className={styles.resultMeta}>{result.metadata}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
          
          {results.length > 0 && (
            <div className={styles.dropdownFooter}>
              <button 
                className={styles.viewAllButton}
                onClick={handleSubmit}
              >
                Press Enter for all results →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
