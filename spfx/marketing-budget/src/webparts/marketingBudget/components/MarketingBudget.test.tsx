/**
 * Unit tests for the MarketingBudget component (Stage 2).
 *
 * Verifies auto-seed behaviour, data status bar, and various UI states.
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketingBudget from './MarketingBudget';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import type { Vendor, Service, Suburb, Schedule, Budget, DataExport } from '../../../models/types';

// ─── Helpers ────────────────────────────────────────────────

const mockVendors: Vendor[] = [
  { id: 1, name: 'Mountford Media', shortCode: 'MM', isActive: 1 },
  { id: 2, name: 'Urban Angles', shortCode: 'UA', isActive: 1 },
];

const mockServices: Service[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Service ${i + 1}`,
  category: 'photography' as const,
  vendorId: 1,
  variantSelector: null,
  variants: [{ id: 'default', name: 'Standard', basePrice: 100.0 }],
  includesGst: true,
  isActive: 1,
}));

const mockSuburbs: Suburb[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Suburb ${i + 1}`,
  pricingTier: 'A' as const,
}));

const mockSchedules: Schedule[] = [
  {
    id: 1,
    name: 'House - Large - Premium',
    propertyType: 'house',
    propertySize: 'large',
    tier: 'premium',
    lineItems: [{ serviceId: 1, variantId: 'default', isSelected: true }],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: 1,
  },
];

/**
 * Creates a mock repo. If `preSeeded` is true, returns data from the start
 * (simulating a database that already has reference data). Otherwise starts
 * empty and populates after seedData() is called.
 */
const createMockRepository = (
  opts: { preSeeded?: boolean; budgets?: Budget[] } = {}
): IBudgetRepository => {
  const { preSeeded = false, budgets = [] } = opts;
  let seeded = preSeeded;

  return {
    getVendors: jest.fn().mockImplementation(() => Promise.resolve(seeded ? mockVendors : [])),
    getVendor: jest.fn().mockResolvedValue(undefined),
    saveVendor: jest.fn().mockResolvedValue({} as Vendor),
    deleteVendor: jest.fn().mockResolvedValue(undefined),
    getServices: jest.fn().mockImplementation(() => Promise.resolve(seeded ? mockServices : [])),
    getAllServices: jest.fn().mockResolvedValue([]),
    getServicesByVendor: jest.fn().mockResolvedValue([]),
    getServicesByCategory: jest.fn().mockResolvedValue([]),
    saveService: jest.fn().mockResolvedValue({} as Service),
    deleteService: jest.fn().mockResolvedValue(undefined),
    getSuburbs: jest.fn().mockImplementation(() => Promise.resolve(seeded ? mockSuburbs : [])),
    getSuburbsByTier: jest.fn().mockResolvedValue([]),
    saveSuburb: jest.fn().mockResolvedValue({} as Suburb),
    deleteSuburb: jest.fn().mockResolvedValue(undefined),
    getSchedules: jest.fn().mockImplementation(() => Promise.resolve(seeded ? mockSchedules : [])),
    getSchedule: jest.fn().mockResolvedValue(undefined),
    saveSchedule: jest.fn().mockResolvedValue({} as Schedule),
    deleteSchedule: jest.fn().mockResolvedValue(undefined),
    getBudgets: jest.fn().mockImplementation(() => Promise.resolve(seeded ? budgets : [])),
    getBudget: jest.fn().mockResolvedValue(undefined),
    saveBudget: jest.fn().mockResolvedValue({} as Budget),
    deleteBudget: jest.fn().mockResolvedValue(undefined),
    clearAllData: jest.fn().mockResolvedValue(undefined),
    seedData: jest.fn().mockImplementation(() => {
      seeded = true;
      return Promise.resolve();
    }),
    exportAll: jest.fn().mockResolvedValue({} as DataExport),
    importAll: jest.fn().mockResolvedValue(undefined),
  };
};

// ─── Tests ──────────────────────────────────────────────────

describe('MarketingBudget component', () => {
  it('renders the title', () => {
    const repo = createMockRepository({ preSeeded: true });
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
    const repo = createMockRepository({ preSeeded: true });
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

  it('auto-seeds when the database is empty', async () => {
    const repo = createMockRepository({ preSeeded: false });
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(repo.seedData).toHaveBeenCalledTimes(1);
    });
  });

  it('does not seed when database already has data', async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2 vendors')).toBeInTheDocument();
    });
    expect(repo.seedData).not.toHaveBeenCalled();
  });

  it('shows the data status bar after loading', async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2 vendors')).toBeInTheDocument();
      expect(screen.getByText('15 services')).toBeInTheDocument();
      expect(screen.getByText('10 suburbs')).toBeInTheDocument();
      expect(screen.getByText('1 schedules')).toBeInTheDocument();
      expect(screen.getByText('0 budgets')).toBeInTheDocument();
    });
  });

  it('shows seed complete notification after auto-seed', async () => {
    const repo = createMockRepository({ preSeeded: false });
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Reference data seeded/)).toBeInTheDocument();
    });

    // Verify the notification mentions vendor and service counts
    expect(screen.getByText(/2 vendors.*15 services/)).toBeInTheDocument();
  });

  it('shows budget count with pre-seeded data', async () => {
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

    const repo = createMockRepository({ preSeeded: true, budgets: mockBudgets });
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

    const repo = createMockRepository({ preSeeded: true, budgets: mockBudgets });
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

  it('calls getVendors, getServices, getSuburbs, getSchedules, getBudgets on mount', async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(
      <MarketingBudget
        userDisplayName="Test User"
        isDarkTheme={false}
        isSharePointContext={false}
        repository={repo}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2 vendors')).toBeInTheDocument();
    });

    expect(repo.getVendors).toHaveBeenCalled();
    expect(repo.getServices).toHaveBeenCalled();
    expect(repo.getSuburbs).toHaveBeenCalled();
    expect(repo.getSchedules).toHaveBeenCalled();
    expect(repo.getBudgets).toHaveBeenCalled();
  });
});
