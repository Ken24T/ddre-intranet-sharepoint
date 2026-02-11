/**
 * DataManagementView – Unit Tests
 */

import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DataManagementView } from "./DataManagementView";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from "../models/types";

// ─── Mock repo ──────────────────────────────────────────────

const createMockRepo = (): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue([
    { id: 1, name: "Vendor 1", isActive: 1 },
    { id: 2, name: "Vendor 2", isActive: 1 },
  ]),
  getVendor: jest.fn().mockResolvedValue(undefined),
  saveVendor: jest.fn().mockResolvedValue({} as Vendor),
  deleteVendor: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue([
    {
      id: 1, name: "Service 1", category: "photography", vendorId: 1,
      variantSelector: null, variants: [], includesGst: true, isActive: 1,
    },
  ]),
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
  getBudgets: jest.fn().mockResolvedValue([]),
  getBudget: jest.fn().mockResolvedValue(undefined),
  saveBudget: jest.fn().mockResolvedValue({} as Budget),
  deleteBudget: jest.fn().mockResolvedValue(undefined),
  clearAllData: jest.fn().mockResolvedValue(undefined),
  seedData: jest.fn().mockResolvedValue(undefined),
  exportAll: jest.fn().mockResolvedValue({} as DataExport),
  importAll: jest.fn().mockResolvedValue(undefined),
});

// ─── Tests ──────────────────────────────────────────────────

describe("DataManagementView", () => {
  it("shows admin-only lock screen for non-admin users", () => {
    const repo = createMockRepo();
    render(<DataManagementView repository={repo} userRole="viewer" />);
    expect(screen.getByText("Admin access required")).toBeInTheDocument();
  });

  it("shows admin-only lock screen for editors", () => {
    const repo = createMockRepo();
    render(<DataManagementView repository={repo} userRole="editor" />);
    expect(screen.getByText("Admin access required")).toBeInTheDocument();
  });

  it("renders data management view for admins", () => {
    const repo = createMockRepo();
    render(<DataManagementView repository={repo} userRole="admin" />);
    expect(screen.getByTestId("data-management-view")).toBeInTheDocument();
    expect(screen.getByText("Data Management")).toBeInTheDocument();
  });

  it("renders export panel with checkboxes", () => {
    const repo = createMockRepo();
    render(<DataManagementView repository={repo} userRole="admin" />);
    expect(screen.getByTestId("export-panel")).toBeInTheDocument();
    expect(screen.getByText("Export Selected")).toBeInTheDocument();
    // All 5 entity type checkboxes
    expect(screen.getByText("Vendors")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Suburbs")).toBeInTheDocument();
    expect(screen.getByText("Schedules")).toBeInTheDocument();
    expect(screen.getByText("Budgets")).toBeInTheDocument();
  });

  it("renders import panel with file picker", () => {
    const repo = createMockRepo();
    render(<DataManagementView repository={repo} userRole="admin" />);
    expect(screen.getByTestId("import-panel")).toBeInTheDocument();
    expect(screen.getByText("Choose File…")).toBeInTheDocument();
  });

  it("shows title and subtitle", () => {
    const repo = createMockRepo();
    render(<DataManagementView repository={repo} userRole="admin" />);
    expect(screen.getByText("Data Management")).toBeInTheDocument();
    expect(screen.getByText(/Export and import/)).toBeInTheDocument();
  });
});
