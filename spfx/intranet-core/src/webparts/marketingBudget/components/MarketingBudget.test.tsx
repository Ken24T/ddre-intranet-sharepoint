/**
 * Unit tests for the MarketingBudget component (Stage 3).
 *
 * Verifies auto-seed behaviour, data status bar, view routing,
 * standalone sidebar, and postMessage bridge integration.
 */

import * as React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import MarketingBudget from "./MarketingBudget";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  Budget,
  DataExport,
} from "../models/types";

// ─── Helpers ────────────────────────────────────────────────

const mockVendors: Vendor[] = [
  { id: 1, name: "Mountford Media", shortCode: "MM", isActive: 1 },
  { id: 2, name: "Urban Angles", shortCode: "UA", isActive: 1 },
];

const mockServices: Service[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Service ${i + 1}`,
  category: "photography" as const,
  vendorId: 1,
  variantSelector: null,
  variants: [{ id: "default", name: "Standard", basePrice: 100.0 }],
  includesGst: true,
  isActive: 1,
}));

const mockSuburbs: Suburb[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Suburb ${i + 1}`,
  pricingTier: "A" as const,
}));

const mockSchedules: Schedule[] = [
  {
    id: 1,
    name: "House - Large - Premium",
    propertyType: "house",
    propertySize: "large",
    tier: "premium",
    lineItems: [{ serviceId: 1, variantId: "default", isSelected: true }],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    isActive: 1,
  },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
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
  },
  {
    id: 2,
    propertyAddress: "456 Test Ave",
    propertyType: "unit",
    propertySize: "small",
    tier: "basic",
    suburbId: 2,
    vendorId: 1,
    scheduleId: 1,
    lineItems: [],
    status: "approved",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

/**
 * Creates a mock repo. If `preSeeded` is true, returns data from the start.
 * Otherwise starts empty and populates after seedData() is called.
 */
const createMockRepository = (
  opts: { preSeeded?: boolean; budgets?: Budget[] } = {},
): IBudgetRepository => {
  const { preSeeded = false, budgets = [] } = opts;
  let seeded = preSeeded;

  return {
    getVendors: jest
      .fn()
      .mockImplementation(() => Promise.resolve(seeded ? mockVendors : [])),
    getVendor: jest.fn().mockResolvedValue(undefined),
    saveVendor: jest.fn().mockResolvedValue({} as Vendor),
    deleteVendor: jest.fn().mockResolvedValue(undefined),
    getServices: jest
      .fn()
      .mockImplementation(() => Promise.resolve(seeded ? mockServices : [])),
    getAllServices: jest.fn().mockResolvedValue([]),
    getServicesByVendor: jest.fn().mockResolvedValue([]),
    getServicesByCategory: jest.fn().mockResolvedValue([]),
    saveService: jest.fn().mockResolvedValue({} as Service),
    deleteService: jest.fn().mockResolvedValue(undefined),
    getSuburbs: jest
      .fn()
      .mockImplementation(() => Promise.resolve(seeded ? mockSuburbs : [])),
    getSuburbsByTier: jest.fn().mockResolvedValue([]),
    saveSuburb: jest.fn().mockResolvedValue({} as Suburb),
    deleteSuburb: jest.fn().mockResolvedValue(undefined),
    getSchedules: jest
      .fn()
      .mockImplementation(() => Promise.resolve(seeded ? mockSchedules : [])),
    getSchedule: jest.fn().mockResolvedValue(undefined),
    saveSchedule: jest.fn().mockResolvedValue({} as Schedule),
    deleteSchedule: jest.fn().mockResolvedValue(undefined),
    getBudgets: jest
      .fn()
      .mockImplementation(() => Promise.resolve(seeded ? budgets : [])),
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

const defaultProps = {
  userDisplayName: "Test User",
  isDarkTheme: false,
  isSharePointContext: false,
};

// ─── Tests ──────────────────────────────────────────────────

describe("MarketingBudget component", () => {
  // In JSDOM, window.self === window.top → standalone mode (not embedded)

  it("renders the title", async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(<MarketingBudget {...defaultProps} repository={repo} />);
    expect(screen.getByText("Marketing Budgets")).toBeInTheDocument();
    // Wait for async data load to settle
    await waitFor(() => {
      expect(screen.getByText("2 vendors")).toBeInTheDocument();
    });
  });

  it("displays the user greeting", async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(
      <MarketingBudget
        {...defaultProps}
        userDisplayName="Ken Boyle"
        repository={repo}
      />,
    );
    expect(screen.getByText(/G'day Ken Boyle/)).toBeInTheDocument();
    // Wait for async data load to settle
    await waitFor(() => {
      expect(screen.getByText("2 vendors")).toBeInTheDocument();
    });
  });

  it("auto-seeds when the database is empty", async () => {
    const repo = createMockRepository({ preSeeded: false });
    render(<MarketingBudget {...defaultProps} repository={repo} />);

    await waitFor(() => {
      expect(repo.seedData).toHaveBeenCalledTimes(1);
    });
  });

  it("does not seed when database already has data", async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(<MarketingBudget {...defaultProps} repository={repo} />);

    await waitFor(() => {
      expect(screen.getByText("2 vendors")).toBeInTheDocument();
    });
    expect(repo.seedData).not.toHaveBeenCalled();
  });

  it("shows the data status bar after loading", async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(<MarketingBudget {...defaultProps} repository={repo} />);

    await waitFor(() => {
      expect(screen.getByText("2 vendors")).toBeInTheDocument();
      expect(screen.getByText("15 services")).toBeInTheDocument();
      expect(screen.getByText("10 suburbs")).toBeInTheDocument();
      expect(screen.getByText("1 schedules")).toBeInTheDocument();
      expect(screen.getByText("0 budgets")).toBeInTheDocument();
    });
  });

  it("shows seed complete notification after auto-seed", async () => {
    const repo = createMockRepository({ preSeeded: false });
    render(<MarketingBudget {...defaultProps} repository={repo} />);

    await waitFor(() => {
      expect(screen.getByText(/Reference data seeded/)).toBeInTheDocument();
    });
    expect(screen.getByText(/2 vendors.*15 services/)).toBeInTheDocument();
  });

  it("calls getVendors, getServices, getSuburbs, getSchedules, getBudgets on mount", async () => {
    const repo = createMockRepository({ preSeeded: true });
    render(<MarketingBudget {...defaultProps} repository={repo} />);

    await waitFor(() => {
      expect(screen.getByText("2 vendors")).toBeInTheDocument();
    });

    expect(repo.getVendors).toHaveBeenCalled();
    expect(repo.getServices).toHaveBeenCalled();
    expect(repo.getSuburbs).toHaveBeenCalled();
    expect(repo.getSchedules).toHaveBeenCalled();
    expect(repo.getBudgets).toHaveBeenCalled();
  });

  // ─── View Routing (Stage 3) ─────────────────────────────

  describe("view routing", () => {
    it("shows DashboardView by default when data is loaded", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        // DashboardView renders its own "Dashboard" header
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });
    });

    it("switches to BudgetListView and shows budgets", async () => {
      const repo = createMockRepository({
        preSeeded: true,
        budgets: mockBudgets,
      });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // Click Budgets nav item to switch views
      const budgetsBtn = screen.getByRole("button", { name: /Budgets/i });
      fireEvent.click(budgetsBtn);

      await waitFor(() => {
        expect(screen.getByText("123 Test St")).toBeInTheDocument();
        expect(screen.getByText("456 Test Ave")).toBeInTheDocument();
      });
    });

    it("switches to Schedules view when nav item clicked", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      // In standalone mode, sidebar nav items are rendered as buttons
      const schedulesBtn = screen.getByRole("button", { name: /Schedules/i });
      fireEvent.click(schedulesBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Budget templates that define default services/),
        ).toBeInTheDocument();
      });
    });

    it("switches to Services view when nav item clicked", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const servicesBtn = screen.getByRole("button", { name: /Services/i });
      fireEvent.click(servicesBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Marketing services and their variant pricing/),
        ).toBeInTheDocument();
      });
    });

    it("switches to Vendors view when nav item clicked", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const vendorsBtn = screen.getByRole("button", { name: /Vendors/i });
      fireEvent.click(vendorsBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/External vendors who provide marketing services/),
        ).toBeInTheDocument();
      });
    });

    it("switches to Suburbs view when nav item clicked", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });

      const suburbsBtn = screen.getByRole("button", { name: /Suburbs/i });
      fireEvent.click(suburbsBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Suburbs and their pricing tiers/),
        ).toBeInTheDocument();
      });
    });
  });

  // ─── Standalone Sidebar (Stage 3) ───────────────────────

  describe("standalone sidebar", () => {
    it("renders sidebar nav items in standalone mode", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(screen.getByText("Budgets")).toBeInTheDocument();
      });

      // All eight nav items should be visible as buttons
      expect(
        screen.getByRole("button", { name: /Dashboard/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Budgets/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Compare/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Schedules/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Vendors/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Suburbs/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Data Mgmt/i }),
      ).toBeInTheDocument();
    });
  });

  // ─── PostMessage Bridge (Stage 3) ──────────────────────

  describe("postMessage bridge", () => {
    const originalSelf = Object.getOwnPropertyDescriptor(window, "self");

    beforeEach(() => {
      // Simulate being embedded in an iframe
      Object.defineProperty(window, "self", {
        value: { not: "top" }, // Different object from window.top
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      if (originalSelf) {
        Object.defineProperty(window, "self", originalSelf);
      }
    });

    it("sends SIDEBAR_SET_ITEMS to parent when embedded", async () => {
      const postMessageSpy = jest.spyOn(window.parent, "postMessage");
      const repo = createMockRepository({ preSeeded: true });

      render(<MarketingBudget {...defaultProps} repository={repo} />);

      await waitFor(() => {
        expect(postMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "SIDEBAR_SET_ITEMS",
            items: expect.arrayContaining([
              expect.objectContaining({ key: "budgets", label: "Budgets" }),
            ]),
            activeKey: "dashboard",
          }),
          "*",
        );
      });

      postMessageSpy.mockRestore();
    });

    it("does not render standalone sidebar when embedded", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      // Header is hidden in embedded mode; wait for data status bar instead
      await waitFor(() => {
        expect(screen.getByText("2 vendors")).toBeInTheDocument();
      });

      // In embedded mode, there should be no sidebar nav buttons
      expect(
        screen.queryByRole("button", { name: /Schedules/i }),
      ).not.toBeInTheDocument();
    });

    it("navigates to a view when SIDEBAR_NAVIGATE message received", async () => {
      const repo = createMockRepository({ preSeeded: true });
      render(<MarketingBudget {...defaultProps} repository={repo} />);

      // Header is hidden in embedded mode; wait for data status bar instead
      await waitFor(() => {
        expect(screen.getByText("2 vendors")).toBeInTheDocument();
      });

      // Simulate shell sending SIDEBAR_NAVIGATE message
      act(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "SIDEBAR_NAVIGATE", key: "vendors" },
          }),
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText(/External vendors who provide marketing services/),
        ).toBeInTheDocument();
      });
    });
  });
});
