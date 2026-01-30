import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogViewer } from './AuditLogViewer';
import { AuditProvider, ConsoleAuditLogger } from '../AuditContext';

// Create a mock logger for tests (silence console.log)
const mockLogger = new ConsoleAuditLogger();

// Wrapper to provide audit context
const renderWithProvider = (ui: React.ReactElement): ReturnType<typeof render> => {
  return render(<AuditProvider logger={mockLogger}>{ui}</AuditProvider>);
};

describe('AuditLogViewer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-21T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.setSystemTime(undefined);
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('shows loading spinner initially', () => {
      renderWithProvider(<AuditLogViewer />);
      expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
    });

    it('shows audit logs after loading', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      // Fast-forward past the loading delay
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Audit Logs/i })).toBeInTheDocument();
      });
    });

    it('displays the title and subtitle', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Audit Logs/i })).toBeInTheDocument();
        // Should show entry count (16 mock entries including help_search events)
        expect(screen.getByText(/16 entries/)).toBeInTheDocument();
      });
    });

    it('renders the filter bar', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by user...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Action...')).toBeInTheDocument();
      });
    });

    it('renders summary widgets', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Events')).toBeInTheDocument();
        expect(screen.getByText('By Type')).toBeInTheDocument();
        expect(screen.getByText('Top Users')).toBeInTheDocument();
        expect(screen.getByText('Activity (24h)')).toBeInTheDocument();
      });
    });

    it('renders the Export CSV button', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });
    });
  });

  describe('filtering', () => {
    it('filters by user search', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading audit logs...')).not.toBeInTheDocument();
      });

      // Verify entries are loaded before filtering
      expect(screen.getByText(/entries/)).toBeInTheDocument();
      
      const userSearch = screen.getByPlaceholderText('Search by user...');
      fireEvent.change(userSearch, { target: { value: 'Ken' } });

      await waitFor(() => {
        // Filtering should reduce the count (Ken has fewer events than total)
        const filteredSubtitle = screen.getByText(/entries.*\(filtered\)/);
        expect(filteredSubtitle).toBeInTheDocument();
      });
    });

    it('filters by action search', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading audit logs...')).not.toBeInTheDocument();
      });

      const actionSearch = screen.getByPlaceholderText('Action...');
      fireEvent.change(actionSearch, { target: { value: 'hub_changed' } });

      await waitFor(() => {
        // Should show filtered indicator
        expect(screen.getByText(/\(filtered\)/)).toBeInTheDocument();
      });
    });

    it('shows clear button when filters are active', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading audit logs...')).not.toBeInTheDocument();
      });

      const userSearch = screen.getByPlaceholderText('Search by user...');
      fireEvent.change(userSearch, { target: { value: 'Ken' } });

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    it('clears filters when Clear button is clicked', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading audit logs...')).not.toBeInTheDocument();
      });

      const userSearch = screen.getByPlaceholderText('Search by user...');
      fireEvent.change(userSearch, { target: { value: 'Ken' } });

      await waitFor(() => {
        expect(screen.getByText(/\(filtered\)/)).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      // After clearing, the user search field should be empty
      await waitFor(() => {
        expect(userSearch).toHaveValue('');
      });
    });
  });

  describe('empty state', () => {
    it('shows empty message when no results match filters', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText(/16 entries/)).toBeInTheDocument();
      });

      const userSearch = screen.getByPlaceholderText('Search by user...');
      fireEvent.change(userSearch, { target: { value: 'nonexistent-user-xyz' } });

      await waitFor(() => {
        expect(screen.getByText('No audit logs found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
      });
    });
  });

  describe('export', () => {
    it('disables export button when no results', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText(/16 entries/)).toBeInTheDocument();
      });

      const userSearch = screen.getByPlaceholderText('Search by user...');
      fireEvent.change(userSearch, { target: { value: 'nonexistent-user-xyz' } });

      await waitFor(() => {
        const exportButton = screen.getByText('Export CSV').closest('button');
        expect(exportButton).toBeDisabled();
      });
    });

    it('enables export button when results exist', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        const exportButton = screen.getByText('Export CSV').closest('button');
        expect(exportButton).not.toBeDisabled();
      });
    });
  });

  describe('onClose callback', () => {
    it('renders Back button when onClose is provided', async () => {
      const onClose = jest.fn();
      renderWithProvider(<AuditLogViewer onClose={onClose} />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
    });

    it('calls onClose when Back button is clicked', async () => {
      const onClose = jest.fn();
      renderWithProvider(<AuditLogViewer onClose={onClose} />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Back'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not render Back button when onClose is not provided', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Audit Logs/i })).toBeInTheDocument();
      });

      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  describe('footer', () => {
    it('shows retention policy note', async () => {
      renderWithProvider(<AuditLogViewer />);
      
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText(/Logs are retained indefinitely/)).toBeInTheDocument();
        expect(screen.getByText(/Admin access only/)).toBeInTheDocument();
      });
    });
  });
});
