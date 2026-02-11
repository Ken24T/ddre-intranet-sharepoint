/**
 * Unit tests for VendorsView component.
 */

import * as React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VendorsView } from "./VendorsView";
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
  {
    id: 1,
    name: "Mountford Media",
    shortCode: "MM",
    contactEmail: "hello@mountford.com.au",
    contactPhone: "07 1234 5678",
    isActive: 1,
  },
  { id: 2, name: "Urban Angles", shortCode: "UA", isActive: 1 },
];

const mockServices: Service[] = [
  {
    id: 1,
    name: "Photography",
    category: "photography",
    vendorId: 1,
    variantSelector: "manual",
    variants: [{ id: "default", name: "Standard", basePrice: 100 }],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 2,
    name: "Aerial Photos",
    category: "aerial",
    vendorId: 2,
    variantSelector: null,
    variants: [{ id: "default", name: "Standard", basePrice: 250 }],
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

describe("VendorsView", () => {
  it("renders the vendors header", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Vendors")).toBeInTheDocument();
    });
  });

  it("displays vendor names", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Mountford Media")).toBeInTheDocument();
      expect(screen.getByText("Urban Angles")).toBeInTheDocument();
    });
  });

  it("shows vendor short code", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("MM")).toBeInTheDocument();
      expect(screen.getByText("UA")).toBeInTheDocument();
    });
  });

  it("shows contact email when available", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("hello@mountford.com.au")).toBeInTheDocument();
    });
  });

  it("shows service count per vendor", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      // Both vendors have 1 service each
      const ones = screen.getAllByText("1");
      expect(ones.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("shows empty state when no vendors", async () => {
    const repo = createMockRepo();
    (repo.getVendors as jest.Mock).mockResolvedValue([]);
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("No vendors found")).toBeInTheDocument();
    });
  });

  it("filters vendors by search text", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Urban Angles")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search vendors\u2026");
    fireEvent.change(searchInput, { target: { value: "Mountford" } });

    await waitFor(() => {
      expect(screen.getByText("Mountford Media")).toBeInTheDocument();
      expect(screen.queryByText("Urban Angles")).not.toBeInTheDocument();
    });
  });

  // ─── Role-based access control ──────────────────────────

  it("shows New Vendor button for admin", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("New Vendor")).toBeInTheDocument();
    });
  });

  it("hides New Vendor button for viewer", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="viewer" />);
    await waitFor(() => {
      expect(screen.getByText("Mountford Media")).toBeInTheDocument();
    });
    expect(screen.queryByText("New Vendor")).not.toBeInTheDocument();
  });

  it("hides New Vendor button for editor", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="editor" />);
    await waitFor(() => {
      expect(screen.getByText("Mountford Media")).toBeInTheDocument();
    });
    expect(screen.queryByText("New Vendor")).not.toBeInTheDocument();
  });

  it("shows actions column for admin", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Mountford Media")).toBeInTheDocument();
    });
    const actionButtons = screen.getAllByTitle("Actions");
    expect(actionButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("hides actions column for viewer", async () => {
    const repo = createMockRepo();
    render(<VendorsView repository={repo} userRole="viewer" />);
    await waitFor(() => {
      expect(screen.getByText("Mountford Media")).toBeInTheDocument();
    });
    expect(screen.queryByTitle("Actions")).not.toBeInTheDocument();
  });
});
