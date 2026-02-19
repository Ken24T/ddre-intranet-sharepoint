/**
 * Unit tests for ServicesView component.
 */

import * as React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ServicesView } from "./ServicesView";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from "../models/types";

const mockVendors: Vendor[] = [
  { id: 1, name: "Mountford Media", shortCode: "MM", isActive: 1 },
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
      { id: "small", name: "Small", basePrice: 150, sizeMatch: "small" },
      { id: "medium", name: "Medium", basePrice: 180, sizeMatch: "medium" },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 3,
    name: "REA Premium",
    category: "internet",
    vendorId: null,
    variantSelector: "suburbTier",
    variants: [
      { id: "tier-a", name: "Tier A", basePrice: 1499, tierMatch: "A" },
      { id: "tier-b", name: "Tier B", basePrice: 1099, tierMatch: "B" },
    ],
    includesGst: true,
    isActive: 1,
  },
];

const createMockRepo = (): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue(mockVendors),
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

describe("ServicesView", () => {
  it("renders the services header and subtitle", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(
        screen.getByText(/Marketing services and their variant pricing/),
      ).toBeInTheDocument();
    });
  });

  it("loads and displays service names", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
      expect(screen.getByText("Floor Plan")).toBeInTheDocument();
      expect(screen.getByText("REA Premium")).toBeInTheDocument();
    });
  });

  it("shows vendor name for vendor services", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(
        screen.getAllByText("Mountford Media").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows price range for services with multiple variants", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      // Photography: $220.00 – $330.00
      expect(screen.getByText("$220.00 – $330.00")).toBeInTheDocument();
    });
  });

  it("shows variant count", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      // Photography has 2 variants, Floor Plan has 2, REA has 2
      const twos = screen.getAllByText("2");
      expect(twos.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("shows empty state when no services", async () => {
    const repo = createMockRepo();
    (repo.getAllServices as jest.Mock).mockResolvedValue([]);
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("No services found")).toBeInTheDocument();
    });
  });

  it("filters services by search text", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search services\u2026");
    fireEvent.change(searchInput, { target: { value: "REA" } });

    await waitFor(() => {
      expect(screen.getByText("REA Premium")).toBeInTheDocument();
      expect(screen.queryByText("Photography")).not.toBeInTheDocument();
    });
  });

  // ─── Role-gating tests ────────────────────────────────

  it("shows 'New Service' button for admin users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("New Service")).toBeInTheDocument();
    });
  });

  it("hides 'New Service' button for viewer users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="viewer" />);
    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });
    expect(screen.queryByText("New Service")).not.toBeInTheDocument();
  });

  it("hides 'New Service' button for editor users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="editor" />);
    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });
    expect(screen.queryByText("New Service")).not.toBeInTheDocument();
  });

  it("shows actions column for admin users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });
    const actionBtns = screen.getAllByTitle("Actions");
    expect(actionBtns.length).toBeGreaterThan(0);
  });

  it("hides actions column for viewer users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="viewer" />);
    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });
    expect(screen.queryByTitle("Actions")).not.toBeInTheDocument();
  });

  it("shows expanded quick actions for admin users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="admin" />);

    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Photography"));

    await waitFor(() => {
      expect(screen.getByText("Edit Service")).toBeInTheDocument();
      expect(screen.getByText("Duplicate Service")).toBeInTheDocument();
      expect(screen.getByText("Delete Service")).toBeInTheDocument();
    });
  });

  it("hides expanded quick actions for viewer users", async () => {
    const repo = createMockRepo();
    render(<ServicesView repository={repo} userRole="viewer" />);

    await waitFor(() => {
      expect(screen.getByText("Photography")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Photography"));

    await waitFor(() => {
      expect(screen.getByText("Variants")).toBeInTheDocument();
    });
    expect(screen.queryByText("Edit Service")).not.toBeInTheDocument();
    expect(screen.queryByText("Duplicate Service")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete Service")).not.toBeInTheDocument();
  });
});
