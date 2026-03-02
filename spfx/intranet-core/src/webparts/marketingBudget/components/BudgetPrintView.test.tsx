/**
 * BudgetPrintView – Unit Tests
 */

import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BudgetPrintView } from "./BudgetPrintView";
import type { Budget, BudgetLineItem } from "../models/types";

// ─── Test data ──────────────────────────────────────────────

function makeLi(overrides: Partial<BudgetLineItem> = {}): BudgetLineItem {
  return {
    serviceId: 1,
    serviceName: "Photography",
    variantId: "v1",
    variantName: "Standard",
    isSelected: true,
    schedulePrice: 500,
    overridePrice: null,
    isOverridden: false,
    ...overrides,
  };
}

function makeBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 1,
    propertyAddress: "42 Wallaby Way, Sydney",
    propertyType: "house",
    propertySize: "medium",
    tier: "standard",
    suburbId: null,
    vendorId: null,
    scheduleId: null,
    lineItems: [
      makeLi({ serviceId: 1, serviceName: "Photography", schedulePrice: 500 }),
      makeLi({ serviceId: 2, serviceName: "Floor Plans", schedulePrice: 200 }),
      makeLi({ serviceId: 3, serviceName: "Video", schedulePrice: 300, isSelected: false }),
    ],
    status: "draft",
    clientName: "Test Client",
    agentName: "Test Agent",
    notes: "Some notes here",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────

describe("BudgetPrintView", () => {
  it("renders print view container", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.getByTestId("print-view")).toBeInTheDocument();
  });

  it("renders print button", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.getByText("Print / Save as PDF")).toBeInTheDocument();
  });

  it("renders close button when onDismiss provided", () => {
    const dismissFn = jest.fn();
    render(<BudgetPrintView budget={makeBudget()} onDismiss={dismissFn} />);
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("does not render close button when onDismiss not provided", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("shows property address", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    const matches = screen.getAllByText(/42 Wallaby Way/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows client and agent names", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.getByText("Test Client")).toBeInTheDocument();
    expect(screen.getByText("Test Agent")).toBeInTheDocument();
  });

  it("shows selected items section", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.getByText(/Selected Services \(2\)/)).toBeInTheDocument();
  });

  it("shows not included section for deselected items", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.getByText(/Not Included \(1\)/)).toBeInTheDocument();
  });

  it("does not show not included section when all items selected", () => {
    const budget = makeBudget({
      lineItems: [
        makeLi({ serviceName: "Photography", schedulePrice: 500 }),
      ],
    });
    render(<BudgetPrintView budget={budget} />);
    expect(screen.queryByText(/Not Included/)).not.toBeInTheDocument();
  });

  it("shows notes when present", () => {
    render(<BudgetPrintView budget={makeBudget()} />);
    expect(screen.getByText("Some notes here")).toBeInTheDocument();
  });

  it("does not show notes section when no notes", () => {
    render(<BudgetPrintView budget={makeBudget({ notes: undefined })} />);
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();
  });

  it("shows overridden indicator for overridden prices", () => {
    const budget = makeBudget({
      lineItems: [
        makeLi({
          serviceName: "Photography",
          schedulePrice: 500,
          overridePrice: 350,
          isOverridden: true,
        }),
      ],
    });
    render(<BudgetPrintView budget={budget} />);
    const printContent = screen.getByTestId("print-content");
    expect(printContent.textContent).toContain("*");
  });
});
