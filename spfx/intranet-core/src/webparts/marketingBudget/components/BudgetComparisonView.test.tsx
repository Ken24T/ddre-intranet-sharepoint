/**
 * BudgetComparisonView – Unit Tests
 */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BudgetComparisonView } from "./BudgetComparisonView";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
  BudgetLineItem,
} from "../models/types";

// ─── Test data ──────────────────────────────────────────────

function makeLi(
  serviceId: number,
  price: number,
  name: string = "Service",
): BudgetLineItem {
  return {
    serviceId,
    serviceName: name,
    variantId: "v1",
    variantName: "Standard",
    isSelected: true,
    schedulePrice: price,
    overridePrice: null,
    isOverridden: false,
  };
}

const budget1: Budget = {
  id: 1,
  propertyAddress: "1 Test St",
  propertyType: "house",
  propertySize: "medium",
  tier: "standard",
  suburbId: null,
  vendorId: null,
  scheduleId: null,
  lineItems: [makeLi(1, 500, "Photography"), makeLi(2, 200, "Floor Plans")],
  status: "draft",
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

const budget2: Budget = {
  id: 2,
  propertyAddress: "2 Test Ave",
  propertyType: "unit",
  propertySize: "small",
  tier: "premium",
  suburbId: null,
  vendorId: null,
  scheduleId: null,
  lineItems: [makeLi(1, 600, "Photography"), makeLi(3, 300, "Video")],
  status: "approved",
  createdAt: "2026-02-10T00:00:00Z",
  updatedAt: "2026-02-10T00:00:00Z",
};

const createMockRepo = (budgets: Budget[] = [budget1, budget2]): IBudgetRepository => ({
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

describe("BudgetComparisonView", () => {
  it("renders loading spinner initially", () => {
    const repo = createMockRepo();
    render(<BudgetComparisonView repository={repo} userRole="admin" />);
    expect(screen.getByText("Loading budgets…")).toBeInTheDocument();
  });

  it("renders title after loading", async () => {
    const repo = createMockRepo();
    render(<BudgetComparisonView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Budget Comparison")).toBeInTheDocument();
    });
  });

  it("shows budget selectors after loading", async () => {
    const repo = createMockRepo();
    render(<BudgetComparisonView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Budget A")).toBeInTheDocument();
      expect(screen.getByText("Budget B")).toBeInTheDocument();
    });
  });

  it("shows empty state when no budgets selected", async () => {
    const repo = createMockRepo();
    render(<BudgetComparisonView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(
        screen.getByText("Select two budgets above to compare"),
      ).toBeInTheDocument();
    });
  });

  it("renders comparison table when both budgets pre-selected", async () => {
    const repo = createMockRepo();
    render(
      <BudgetComparisonView
        repository={repo}
        userRole="admin"
        initialLeftId={1}
        initialRightId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("comparison-table")).toBeInTheDocument();
    });
  });

  it("shows error on load failure", async () => {
    const repo = createMockRepo();
    (repo.getBudgets as jest.Mock).mockRejectedValue(new Error("Load error"));
    render(<BudgetComparisonView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Load error")).toBeInTheDocument();
    });
  });
});
