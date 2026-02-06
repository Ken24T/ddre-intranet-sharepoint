/**
 * Unit tests for BudgetEditorPanel component.
 *
 * Verifies: panel open/close, form fields, schedule application,
 * save flow, and status transitions.
 */

import * as React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BudgetEditorPanel } from "./BudgetEditorPanel";
import type { IBudgetRepository } from "../../../services/IBudgetRepository";
import type {
  Budget,
  Vendor,
  Service,
  Suburb,
  Schedule,
  DataExport,
} from "../../../models/types";

// ─── Mock data ──────────────────────────────────────────────

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
];

const mockSuburbs: Suburb[] = [
  { id: 1, name: "Bardon", pricingTier: "A" },
  { id: 2, name: "Toowong", pricingTier: "A" },
];

const mockSchedules: Schedule[] = [
  {
    id: 1,
    name: "House - Medium - Standard",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    defaultVendorId: 1,
    lineItems: [
      { serviceId: 1, variantId: "8-photos", isSelected: true },
      { serviceId: 2, variantId: "medium", isSelected: true },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    isActive: 1,
  },
];

const createMockRepository = (): IBudgetRepository => ({
  getVendors: jest.fn().mockResolvedValue(mockVendors),
  getVendor: jest.fn().mockResolvedValue(undefined),
  saveVendor: jest.fn().mockResolvedValue({} as Vendor),
  deleteVendor: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue(mockServices),
  getAllServices: jest.fn().mockResolvedValue(mockServices),
  getServicesByVendor: jest.fn().mockResolvedValue([]),
  getServicesByCategory: jest.fn().mockResolvedValue([]),
  saveService: jest.fn().mockResolvedValue({} as Service),
  deleteService: jest.fn().mockResolvedValue(undefined),
  getSuburbs: jest.fn().mockResolvedValue(mockSuburbs),
  getSuburbsByTier: jest.fn().mockResolvedValue([]),
  saveSuburb: jest.fn().mockResolvedValue({} as Suburb),
  deleteSuburb: jest.fn().mockResolvedValue(undefined),
  getSchedules: jest.fn().mockResolvedValue(mockSchedules),
  getSchedule: jest.fn().mockResolvedValue(undefined),
  saveSchedule: jest.fn().mockResolvedValue({} as Schedule),
  deleteSchedule: jest.fn().mockResolvedValue(undefined),
  getBudgets: jest.fn().mockResolvedValue([]),
  getBudget: jest.fn().mockResolvedValue(undefined),
  saveBudget: jest
    .fn()
    .mockImplementation((b: Budget) =>
      Promise.resolve({ ...b, id: b.id ?? 1 }),
    ),
  deleteBudget: jest.fn().mockResolvedValue(undefined),
  clearAllData: jest.fn().mockResolvedValue(undefined),
  seedData: jest.fn().mockResolvedValue(undefined),
  exportAll: jest.fn().mockResolvedValue({} as DataExport),
  importAll: jest.fn().mockResolvedValue(undefined),
});

// ─── Tests ──────────────────────────────────────────────────

describe("BudgetEditorPanel", () => {
  it('renders "New Budget" header when creating', async () => {
    const repo = createMockRepository();
    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("New Budget")).toBeInTheDocument();
    });
  });

  it("loads reference data when opened", async () => {
    const repo = createMockRepository();
    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(repo.getVendors).toHaveBeenCalled();
      expect(repo.getAllServices).toHaveBeenCalled();
      expect(repo.getSuburbs).toHaveBeenCalled();
      expect(repo.getSchedules).toHaveBeenCalled();
    });
  });

  it("renders property detail fields", async () => {
    const repo = createMockRepository();
    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Property Details")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Property Address/)).toBeInTheDocument();
    expect(screen.getByText("Property Type")).toBeInTheDocument();
    expect(screen.getByText("Property Size")).toBeInTheDocument();
    expect(screen.getByText("Budget Tier")).toBeInTheDocument();
  });

  it("renders schedule template section", async () => {
    const repo = createMockRepository();
    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Schedule Template")).toBeInTheDocument();
    });
  });

  it("renders line items section", async () => {
    const repo = createMockRepository();
    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Line Items")).toBeInTheDocument();
    });
  });

  it("shows Create Budget button for new budget", async () => {
    const repo = createMockRepository();
    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Create Budget")).toBeInTheDocument();
    });
  });

  it("shows Save Changes button when editing existing budget", async () => {
    const repo = createMockRepository();
    const existingBudget: Budget = {
      id: 42,
      propertyAddress: "123 Test St, Bardon",
      propertyType: "house",
      propertySize: "medium",
      tier: "standard",
      suburbId: 1,
      vendorId: 1,
      scheduleId: 1,
      lineItems: [],
      status: "draft",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    render(
      <BudgetEditorPanel
        budget={existingBudget}
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
  });

  it("shows status and transition button for existing draft budget", async () => {
    const repo = createMockRepository();
    const existingBudget: Budget = {
      id: 42,
      propertyAddress: "123 Test St",
      propertyType: "house",
      propertySize: "medium",
      tier: "standard",
      suburbId: 1,
      vendorId: 1,
      scheduleId: 1,
      lineItems: [],
      status: "draft",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    render(
      <BudgetEditorPanel
        budget={existingBudget}
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await waitFor(() => {
      // Status text spans multiple elements (<span>Status: <strong>Draft</strong></span>)
      expect(
        screen.getByText((_content, element) => {
          return element?.textContent === "Status: Draft";
        }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Mark as Approved")).toBeInTheDocument();
  });

  it("calls saveBudget when Create Budget is clicked with valid address", async () => {
    const repo = createMockRepository();
    const onSaved = jest.fn();

    render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={onSaved}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Property Details")).toBeInTheDocument();
    });

    // Enter address
    const addressInput = screen.getByLabelText(/Property Address/);
    fireEvent.change(addressInput, {
      target: { value: "42 Jubilee Terrace, Bardon" },
    });

    // Click Create Budget
    const createBtn = screen.getByText("Create Budget");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(repo.saveBudget).toHaveBeenCalledTimes(1);
    });

    const savedBudget = (repo.saveBudget as jest.Mock).mock
      .calls[0][0] as Budget;
    expect(savedBudget.propertyAddress).toBe("42 Jubilee Terrace, Bardon");
    expect(savedBudget.status).toBe("draft");
  });

  it("does not render when isOpen is false", () => {
    const repo = createMockRepository();
    const { container } = render(
      <BudgetEditorPanel
        repository={repo}
        isOpen={false}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    // Panel should not render content when closed
    expect(container.querySelector('[class*="ms-Panel"]')).toBeNull();
  });
});
