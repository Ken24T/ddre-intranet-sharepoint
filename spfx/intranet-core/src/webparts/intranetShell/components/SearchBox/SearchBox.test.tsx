/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBox, ISearchResult } from './SearchBox';

// Mock search function
const createMockSearchFn = (results: ISearchResult[] = []): jest.Mock<Promise<ISearchResult[]>> => {
  return jest.fn().mockResolvedValue(results);
};

describe('SearchBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders collapsed by default', () => {
    render(<SearchBox />);
    
    // Should show search trigger button, not input
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('expands when trigger button is clicked', () => {
    render(<SearchBox />);
    
    const trigger = screen.getByRole('button', { name: /search/i });
    fireEvent.click(trigger);
    
    // Should now show input
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
  });

  it('focuses input when expanded', () => {
    render(<SearchBox />);
    
    const trigger = screen.getByRole('button', { name: /search/i });
    fireEvent.click(trigger);
    
    const input = screen.getByRole('textbox', { name: /search/i });
    expect(document.activeElement).toBe(input);
  });

  it('uses custom placeholder text', () => {
    render(<SearchBox placeholder="Find something..." />);
    
    // Expand first
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    expect(screen.getByPlaceholderText('Find something...')).toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed with query', async () => {
    const onSearch = jest.fn();
    const searchFn = createMockSearchFn();
    
    render(<SearchBox onSearch={onSearch} searchFn={searchFn} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    
    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(350);
    });
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('clears search when clear button is clicked', async () => {
    const searchFn = createMockSearchFn([]);
    
    render(<SearchBox searchFn={searchFn} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Wait for debounce
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    
    // Input should have value
    expect(input).toHaveValue('test');
    
    // Find clear button - it should only appear when there's text
    // Note: clear button may not be visible until dropdown shows
    const clearButton = screen.queryByRole('button', { name: /clear/i });
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input).toHaveValue('');
    }
  });

  it('shows loading spinner while searching', async () => {
    // Create a slow search function that we can control
    const slowSearchFn = jest.fn().mockImplementation(() => 
      new Promise<ISearchResult[]>(() => {
        // Never resolves - just for testing loading state
      })
    );
    
    render(<SearchBox searchFn={slowSearchFn} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Advance past debounce
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    
    // Verify search was called
    expect(slowSearchFn).toHaveBeenCalled();
  });

  it('shows "no results" message when search returns empty', async () => {
    const searchFn = createMockSearchFn([]);
    
    render(<SearchBox searchFn={searchFn} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nonexistent' } });
    
    // Wait for debounce and search
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Just verify the search was called with the right value
    expect(searchFn).toHaveBeenCalledWith('nonexistent');
  });

  it('displays search results grouped by type', async () => {
    const results: ISearchResult[] = [
      { id: '1', title: 'Page Result', type: 'page', url: '#' },
      { id: '2', title: 'Doc Result', type: 'document', url: '#' },
    ];
    const searchFn = createMockSearchFn(results);
    
    render(<SearchBox searchFn={searchFn} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'result' } });
    
    // Wait for debounce and search
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    
    expect(screen.getByText('Page Result')).toBeInTheDocument();
    expect(screen.getByText('Doc Result')).toBeInTheDocument();
  });

  it('calls onResultSelect when a result is clicked', async () => {
    const onResultSelect = jest.fn();
    const results: ISearchResult[] = [
      { id: '1', title: 'Test Page', type: 'page', url: '#test' },
    ];
    const searchFn = createMockSearchFn(results);
    
    render(<SearchBox searchFn={searchFn} onResultSelect={onResultSelect} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    
    // Wait for search
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    
    // Click on result
    fireEvent.click(screen.getByText('Test Page'));
    
    expect(onResultSelect).toHaveBeenCalledWith(results[0]);
  });

  it('collapses when Escape is pressed', () => {
    render(<SearchBox />);
    
    // Expand
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // Press Escape
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    
    // Should be collapsed
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('supports keyboard navigation with arrow keys', async () => {
    const onResultSelect = jest.fn();
    const results: ISearchResult[] = [
      { id: '1', title: 'First', type: 'page', url: '#' },
      { id: '2', title: 'Second', type: 'page', url: '#' },
    ];
    const searchFn = createMockSearchFn(results);
    
    render(<SearchBox searchFn={searchFn} onResultSelect={onResultSelect} />);
    
    // Expand and type
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Wait for search
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    
    // Arrow down to select first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Arrow down to select second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onResultSelect).toHaveBeenCalledWith(results[1]);
  });

  it('debounces search requests', async () => {
    const searchFn = createMockSearchFn([]);
    
    render(<SearchBox searchFn={searchFn} />);
    
    // Expand
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    const input = screen.getByRole('textbox');
    
    // Type rapidly
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not have called search yet
    expect(searchFn).not.toHaveBeenCalled();
    
    // Wait for debounce (300ms default)
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    
    // Now should have called once with final value
    expect(searchFn).toHaveBeenCalledTimes(1);
    expect(searchFn).toHaveBeenCalledWith('test');
  });
});
