/**
 * Unit tests for the MarketingBudget component.
 *
 * Verifies the skeleton renders correctly with mock repository data.
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketingBudget from './MarketingBudget';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import type { Vendor, Service, Suburb, Schedule, Budget, DataExport } from '../../../models/types';

// ─── Mock repository ────────────────────────────────────────

const createMockRepository = (budgets: Budget[] = []): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue([]),
  getVendor: jest.fn().mockResolvedValue(undefined),
  saveVendor: jest.fn().mockResolvedValue({} as Vendor),
  deleteVendor: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue([]),
  getAllServices: jest.fn().mockResolvedValue([]),
  getServicesByVendor: jest.fn().mockResolvedValue([]),
  getServicesByCategory: jest.fn().mockResolvedValue([]),
  saveService: jest.fn().mockResolvedValue({} as Service),
  deleteService: jest.fn().mockResolvedValue(undefined),
  getSuburbs: jest.fn().mockResolvedValue([]),
  getSuburbsByTier: jest.fn().mockResolvedValue([]),
  saveSuburb: jest.fn().mockResolvedValue({} as Suburb),
  deleteSuburb: jest.fn().mockResolvedValue(undefined),
  getSchedules: jest.fn().mockResolvedValue([]),
  getSchedule: jest.fn().mockResolvedValue(undefined),
  saveSchedule: jest.fn().mockResolvedValue({} as Schedule),
  deleteSchedule: jest.fn().mockResolvedValue(undefined),
  getBudgets: jest.fn().mockResolvedValue(budgets),
  getBudget: jest.fn().mockResolvedValue(undefined),
  saveBudget: jest.fn().mockResolvedValue({} as Budget),
  deleteBudget: jest.fn().mockResolvedValue(undefined),
  clearAllData: jest.fn().mockResolvedValue(undefined),
  seedData: jest.fn().mockResolvedValue(undefined),
  exportAll: jest.fn().mockResolvedValue({} as DataExport),
  importAll: jest.fn().mockResolvedValue(undefined),
});

// ─── Tests ──────────────────────────────────────────────────

describe('MarketingBudget component', () => {
  it('renders the title', () => {
    const repo = createMockRepository();
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );
    expect(screen.getByText('Marketing Budgets')).toBeInTheDocument();
  });

  it('displays the user greeting', () => {
    const repo = createMockRepository();
    render(
      <MarketingBudget
        userDisplayName="Ken Boyle"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );
    expect(screen.getByText(/G'day Ken Boyle/)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const repo = createMockRepository();
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );
    expect(screen.getByText('Loading budgets…')).toBeInTheDocument();
  });

  it('shows budget count after loading', async () => {
    const mockBudgets: Budget[] = [
      {
        id: 1,
        propertyAddress: '123 Test St',
        propertyType: 'house',
        propertySize: 'medium',
        tier: 'standard',
        suburbId: 1,
        vendorId: 1,
        scheduleId: 1,
        lineItems: [],
        status: 'draft',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        propertyAddress: '456 Test Ave',
        propertyType: 'unit',
        propertySize: 'small',
        tier: 'basic',
        suburbId: 2,
        vendorId: 1,
        scheduleId: 1,
        lineItems: [],
        status: 'approved',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    const repo = createMockRepository(mockBudgets);
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2 budgets found')).toBeInTheDocument();
    });
  });

  it('shows singular budget count for one budget', async () => {
    const mockBudgets: Budget[] = [
      {
        id: 1,
        propertyAddress: '123 Test St',
        propertyType: 'house',
        propertySize: 'medium',
        tier: 'standard',
        suburbId: 1,
        vendorId: 1,
        scheduleId: 1,
        lineItems: [],
        status: 'draft',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    const repo = createMockRepository(mockBudgets);
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('1 budget found')).toBeInTheDocument();
    });
  });

  it('calls getBudgets on the repository', () => {
    const repo = createMockRepository();
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );
    expect(repo.getBudgets).toHaveBeenCalled();
  });
});
