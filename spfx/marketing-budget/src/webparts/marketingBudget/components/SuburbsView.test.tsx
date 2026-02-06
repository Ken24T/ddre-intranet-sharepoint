/**
 * Unit tests for SuburbsView component.
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuburbsView } from './SuburbsView';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import type { Vendor, Service, Suburb, Schedule, Budget, DataExport } from '../../../models/types';

const mockSuburbs: Suburb[] = [
  { id: 1, name: 'Bardon', pricingTier: 'A', postcode: '4065', state: 'QLD' },
  { id: 2, name: 'Toowong', pricingTier: 'A', postcode: '4066', state: 'QLD' },
  { id: 3, name: 'Ipswich', pricingTier: 'C', postcode: '4305', state: 'QLD' },
  { id: 4, name: 'Springfield', pricingTier: 'D', postcode: '4300', state: 'QLD' },
];

const createMockRepo = (): IBudgetRepository => ({
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
  getSuburbs: jest.fn().mockResolvedValue(mockSuburbs),
  getSuburbsByTier: jest.fn().mockResolvedValue([]),
  saveSuburb: jest.fn().mockResolvedValue({} as Suburb),
  deleteSuburb: jest.fn().mockResolvedValue(undefined),
  getSchedules: jest.fn().mockResolvedValue([]),
  getSchedule: jest.fn().mockResolvedValue(undefined),
  saveSchedule: jest.fn().mockResolvedValue({} as Schedule),
  deleteSchedule: jest.fn().mockResolvedValue(undefined),
  getBudgets: jest.fn().mockResolvedValue([]),
  getBudget: jest.fn().mockResolvedValue(undefined),
  saveBudget: jest.fn().mockResolvedValue({} as Budget),
  deleteBudget: jest.fn().mockResolvedValue(undefined),
  clearAllData: jest.fn().mockResolvedValue(undefined),
  seedData: jest.fn().mockResolvedValue(undefined),
  exportAll: jest.fn().mockResolvedValue({} as DataExport),
  importAll: jest.fn().mockResolvedValue(undefined),
});

describe('SuburbsView', () => {
  it('renders the suburbs header', async () => {
    const repo = createMockRepo();
    render(<SuburbsView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText('Suburbs')).toBeInTheDocument();
    });
  });

  it('displays suburb names', async () => {
    const repo = createMockRepo();
    render(<SuburbsView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText('Bardon')).toBeInTheDocument();
      expect(screen.getByText('Toowong')).toBeInTheDocument();
      expect(screen.getByText('Ipswich')).toBeInTheDocument();
      expect(screen.getByText('Springfield')).toBeInTheDocument();
    });
  });

  it('shows pricing tier labels', async () => {
    const repo = createMockRepo();
    render(<SuburbsView repository={repo} />);
    await waitFor(() => {
      expect(screen.getAllByText('Tier A').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Tier C').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Tier D').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows tier summary badges', async () => {
    const repo = createMockRepo();
    render(<SuburbsView repository={repo} />);
    await waitFor(() => {
      // "2 suburbs" for Tier A
      expect(screen.getByText('2 suburbs')).toBeInTheDocument();
      // "1 suburb" for Tier C and D
      expect(screen.getAllByText('1 suburb').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows postcodes', async () => {
    const repo = createMockRepo();
    render(<SuburbsView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText('4065')).toBeInTheDocument();
      expect(screen.getByText('4305')).toBeInTheDocument();
    });
  });

  it('shows empty state when no suburbs', async () => {
    const repo = createMockRepo();
    (repo.getSuburbs as jest.Mock).mockResolvedValue([]);
    render(<SuburbsView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText('No suburbs found')).toBeInTheDocument();
    });
  });
});
