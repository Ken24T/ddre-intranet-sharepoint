/**
 * Unit tests for SchedulesView component.
 */

import * as React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SchedulesView } from "./SchedulesView";
import type { IBudgetRepository } from "../../../services/IBudgetRepository";
import type {
  Schedule,
  Service,
  Vendor,
  Suburb,
  Budget,
  DataExport,
} from "../../../models/types";

const mockSchedules: Schedule[] = [
  {
    id: 1,
    name: "House - Large - Premium",
    propertyType: "house",
    propertySize: "large",
    tier: "premium",
    defaultVendorId: 1,
    lineItems: [
      { serviceId: 1, variantId: "8-photos", isSelected: true },
      { serviceId: 2, variantId: "medium", isSelected: false },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    isActive: 1,
  },
  {
    id: 2,
    name: "Unit - Small - Basic",
    propertyType: "unit",
    propertySize: "small",
    tier: "basic",
    lineItems: [{ serviceId: 1, variantId: "4-photos", isSelected: true }],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    isActive: 1,
  },
];

const mockServices: Service[] = [
  {
    id: 1,
    name: "Photography",
    category: "photography",
    vendorId: 1,
    variantSelector: "manual",
    variants: [
      { id: "4-photos", name: "4 Photos", basePrice: 220 },
      { id: "8-photos", name: "8 Photos", basePrice: 330 },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 2,
    name: "Floor Plan",
    category: "floorPlans",
    vendorId: 1,
    variantSelector: "propertySize",
    variants: [
      { id: "medium", name: "Medium", basePrice: 180, sizeMatch: "medium" },
    ],
    includesGst: true,
    isActive: 1,
  },
];

const createMockRepo = (): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue([]),
  getVendor: jest.fn().mockResolvedValue(undefined),
  saveVendor: jest.fn().mockResolvedValue({} as Vendor),
  deleteVendor: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue([]),
  getAllServices: jest.fn().mockResolvedValue(mockServices),
  getServicesByVendor: jest.fn().mockResolvedValue([]),
  getServicesByCategory: jest.fn().mockResolvedValue([]),
  saveService: jest.fn().mockResolvedValue({} as Service),
  deleteService: jest.fn().mockResolvedValue(undefined),
  getSuburbs: jest.fn().mockResolvedValue([]),
  getSuburbsByTier: jest.fn().mockResolvedValue([]),
  saveSuburb: jest.fn().mockResolvedValue({} as Suburb),
  deleteSuburb: jest.fn().mockResolvedValue(undefined),
  getSchedules: jest.fn().mockResolvedValue(mockSchedules),
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

describe("SchedulesView", () => {
  it("renders the schedules header", async () => {
    const repo = createMockRepo();
    render(<SchedulesView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText("Schedules")).toBeInTheDocument();
    });
  });

  it("loads and displays schedule rows", async () => {
    const repo = createMockRepo();
    render(<SchedulesView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText("House - Large - Premium")).toBeInTheDocument();
      expect(screen.getByText("Unit - Small - Basic")).toBeInTheDocument();
    });
  });

  it("shows item counts in the list", async () => {
    const repo = createMockRepo();
    render(<SchedulesView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument(); // 2 line items
    });
  });

  it("calls getSchedules and getAllServices on mount", async () => {
    const repo = createMockRepo();
    render(<SchedulesView repository={repo} />);
    await waitFor(() => {
      expect(repo.getSchedules).toHaveBeenCalled();
      expect(repo.getAllServices).toHaveBeenCalled();
    });
  });

  it("shows empty state when no schedules match search", async () => {
    const repo = createMockRepo();
    (repo.getSchedules as jest.Mock).mockResolvedValue([]);
    render(<SchedulesView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText("No schedules found")).toBeInTheDocument();
    });
  });

  it("filters schedules when search text is entered", async () => {
    const repo = createMockRepo();
    render(<SchedulesView repository={repo} />);
    await waitFor(() => {
      expect(screen.getByText("House - Large - Premium")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search schedules\u2026");
    fireEvent.change(searchInput, { target: { value: "Unit" } });

    await waitFor(() => {
      expect(screen.getByText("Unit - Small - Basic")).toBeInTheDocument();
      expect(
        screen.queryByText("House - Large - Premium"),
      ).not.toBeInTheDocument();
    });
  });
});
