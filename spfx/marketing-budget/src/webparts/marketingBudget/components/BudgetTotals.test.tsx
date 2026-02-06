/**
 * Unit tests for BudgetTotals component.
 *
 * Verifies currency formatting, GST calculation, and item counts.
 */

import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BudgetTotals } from "./BudgetTotals";
import type { BudgetLineItem } from "../../../models/types";

// ─── Test data ──────────────────────────────────────────────

const makeItem = (
  price: number,
  selected: boolean,
  overridePrice?: number,
): BudgetLineItem => ({
  serviceId: 1,
  serviceName: "Test",
  variantId: "default",
  variantName: "Standard",
  isSelected: selected,
  schedulePrice: price,
  overridePrice: overridePrice ?? 0,
  isOverridden: overridePrice !== undefined,
});

// ─── Tests ──────────────────────────────────────────────────

describe("BudgetTotals", () => {
  it("renders item counts correctly", () => {
    const items = [
      makeItem(100, true),
      makeItem(200, true),
      makeItem(300, false),
    ];
    render(<BudgetTotals lineItems={items} />);

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("calculates subtotal from selected items only", () => {
    const items = [
      makeItem(100, true),
      makeItem(200, true),
      makeItem(500, false), // Not selected
    ];
    render(<BudgetTotals lineItems={items} />);

    // Subtotal should be $300.00, not $800.00 (also appears as total)
    const matches = screen.getAllByText("$300.00");
    expect(matches.length).toBe(2);
  });

  it("shows GST component (10% inclusive)", () => {
    // $330 total → GST = 330 - (330/1.1) = 330 - 300 = $30.00
    const items = [makeItem(330, true)];
    render(<BudgetTotals lineItems={items} />);

    expect(screen.getByText("$30.00")).toBeInTheDocument();
  });

  it("handles zero items gracefully", () => {
    render(<BudgetTotals lineItems={[]} />);

    expect(screen.getByText("0 / 0")).toBeInTheDocument();
    // $0.00 appears for subtotal and total
    const zeros = screen.getAllByText("$0.00");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it("uses override price when item is overridden", () => {
    const items = [
      makeItem(100, true, 250), // Override to $250
    ];
    render(<BudgetTotals lineItems={items} />);

    // $250 appears as both subtotal and total
    const matches = screen.getAllByText("$250.00");
    expect(matches.length).toBe(2);
  });

  it("shows correct currency formatting for large amounts", () => {
    const items = [
      makeItem(3699, true),
      makeItem(550, true),
      makeItem(180, true),
    ];
    render(<BudgetTotals lineItems={items} />);

    // Total = 4429, appears as both subtotal and total
    const matches = screen.getAllByText("$4,429.00");
    expect(matches.length).toBe(2);
  });
});
