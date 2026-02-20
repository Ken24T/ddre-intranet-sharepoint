import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BudgetListView } from "./BudgetListView";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type {
  Budget,
  DataExport,
  Schedule,
  Service,
  Suburb,
  Vendor,
} from "../models/types";

const mockBudgets: Budget[] = [
  {
    id: 1,
    propertyAddress: "123 Test Street",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    suburbId: null,
    vendorId: null,
    scheduleId: null,
    lineItems: [],
    status: "draft",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const createMockRepository = (): jest.Mocked<IBudgetRepository> => ({
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
  getBudgets: jest.fn().mockResolvedValue(mockBudgets),
  getBudget: jest.fn().mockResolvedValue(undefined),
  saveBudget: jest.fn().mockResolvedValue({} as Budget),
  deleteBudget: jest.fn().mockResolvedValue(undefined),
  clearAllData: jest.fn().mockResolvedValue(undefined),
  seedData: jest.fn().mockResolvedValue(undefined),
  exportAll: jest.fn().mockResolvedValue({
    exportVersion: "1.0",
    exportDate: "2026-01-01T00:00:00Z",
    appVersion: "0.7.5.0",
    vendors: [],
    services: [],
    suburbs: [],
    schedules: [],
    budgets: mockBudgets,
  } as DataExport),
  importAll: jest.fn().mockResolvedValue(undefined),
});

describe("BudgetListView import/export settings", () => {
  const createObjectUrlMock = jest.fn(() => "blob:mock-url");
  const revokeObjectUrlMock = jest.fn();
  const anchorClickSpy = jest
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);

  beforeAll(() => {
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: createObjectUrlMock,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectUrlMock,
    });
  });

  beforeEach(() => {
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
  });

  afterAll(() => {
    anchorClickSpy.mockRestore();
  });

  it("exports data from Settings", async () => {
    const repository = createMockRepository();

    render(
      <BudgetListView
        repository={repository}
        userRole="admin"
        defaultAgentName="Doug Disher Real Estate"
        onDefaultAgentNameChange={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("123 Test Street")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Export Data" }));

    await waitFor(() => {
      expect(repository.exportAll).toHaveBeenCalledTimes(1);
    });

    expect(createObjectUrlMock).toHaveBeenCalled();
    expect(revokeObjectUrlMock).toHaveBeenCalled();
  });

  it("imports data from Settings and triggers parent refresh", async () => {
    const repository = createMockRepository();
    const onDataChanged = jest.fn();

    render(
      <BudgetListView
        repository={repository}
        userRole="admin"
        defaultAgentName="Doug Disher Real Estate"
        onDefaultAgentNameChange={jest.fn()}
        onDataChanged={onDataChanged}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("123 Test Street")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    const input = screen.getByLabelText("Import MB data file");
    const file = new File(
      [
        JSON.stringify({
          exportVersion: "1.0",
          exportDate: "2026-01-01T00:00:00Z",
          appVersion: "0.7.5.0",
          vendors: [],
          services: [],
          suburbs: [],
          schedules: [],
          budgets: [],
        }),
      ],
      "mb-export.json",
      { type: "application/json" },
    );

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(repository.importAll).toHaveBeenCalledTimes(1);
      expect(onDataChanged).toHaveBeenCalledTimes(1);
    });
  });
});
