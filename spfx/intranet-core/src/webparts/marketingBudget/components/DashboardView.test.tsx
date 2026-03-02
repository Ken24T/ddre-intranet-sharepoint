/**
 * DashboardView – Unit Tests
 */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DashboardView } from "./DashboardView";
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
  selected: boolean = true,
): BudgetLineItem {
  return {
    serviceId,
    variantId: "v1",
    isSelected: selected,
    schedulePrice: price,
    overridePrice: null,
    isOverridden: false,
  };
}

const testServices: Service[] = [
  {
    id: 1, name: "Photography", category: "photography", vendorId: 1,
    variantSelector: null, variants: [{ id: "v1", name: "Standard", basePrice: 500 }],
    includesGst: true, isActive: 1,
  },
  {
    id: 2, name: "Floor Plans", category: "floorPlans", vendorId: 1,
    variantSelector: null, variants: [{ id: "v1", name: "Standard", basePrice: 200 }],
    includesGst: true, isActive: 1,
  },
];

const testBudgets: Budget[] = [
  {
    id: 1, propertyAddress: "1 Test St", propertyType: "house", propertySize: "medium",
    tier: "standard", suburbId: null, vendorId: null, scheduleId: null,
    lineItems: [makeLi(1, 500), makeLi(2, 200)],
    status: "draft", createdAt: "2026-01-15T00:00:00Z", updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: 2, propertyAddress: "2 Test Ave", propertyType: "unit", propertySize: "small",
    tier: "premium", suburbId: null, vendorId: null, scheduleId: null,
    lineItems: [makeLi(1, 500)],
    status: "approved", createdAt: "2026-02-10T00:00:00Z", updatedAt: "2026-02-10T00:00:00Z",
  },
  {
    id: 3, propertyAddress: "3 Test Blvd", propertyType: "house", propertySize: "large",
    tier: "standard", suburbId: null, vendorId: null, scheduleId: null,
    lineItems: [makeLi(1, 600)],
    status: "sent", createdAt: "2026-02-20T00:00:00Z", updatedAt: "2026-02-20T00:00:00Z",
  },
];

const createMockRepo = (
  budgets: Budget[] = testBudgets,
  services: Service[] = testServices,
): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue([]),
  getVendor: jest.fn().mockResolvedValue(undefined),
  saveVendor: jest.fn().mockResolvedValue({} as Vendor),
  deleteVendor: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue(services),
  getAllServices: jest.fn().mockResolvedValue(services),
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

describe("DashboardView", () => {
  it("renders loading spinner initially", () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="admin" />);
    expect(screen.getByText("Loading dashboard…")).toBeInTheDocument();
  });

  it("renders dashboard title after loading", async () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  it("displays budget count summary", async () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByTestId("status-cards")).toBeInTheDocument();
    });
    // 3 budgets total shown in subtitle
    expect(screen.getByText(/3 budgets/)).toBeInTheDocument();
  });

  it("displays spend by category chart when there is spend", async () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Spend by Category")).toBeInTheDocument();
    });
    expect(screen.getByTestId("category-chart")).toBeInTheDocument();
  });

  it("displays tier cards", async () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Spend by Tier")).toBeInTheDocument();
    });
    expect(screen.getByTestId("tier-cards")).toBeInTheDocument();
  });

  it("displays monthly trend chart", async () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("Monthly Trend")).toBeInTheDocument();
    });
    expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
  });

  it("shows View Budgets button for editors", async () => {
    const navigateFn = jest.fn();
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="editor" onNavigate={navigateFn} />);
    await waitFor(() => {
      expect(screen.getByText("View Budgets")).toBeInTheDocument();
    });
  });

  it("does not show View Budgets button for viewers", async () => {
    const repo = createMockRepo();
    render(<DashboardView repository={repo} userRole="viewer" />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
    expect(screen.queryByText("View Budgets")).not.toBeInTheDocument();
  });

  it("handles empty budgets gracefully", async () => {
    const repo = createMockRepo([], testServices);
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText(/0 budgets/)).toBeInTheDocument();
    });
  });

  it("displays error on load failure", async () => {
    const repo = createMockRepo();
    (repo.getBudgets as jest.Mock).mockRejectedValue(new Error("DB error"));
    render(<DashboardView repository={repo} userRole="admin" />);
    await waitFor(() => {
      expect(screen.getByText("DB error")).toBeInTheDocument();
    });
  });
});
