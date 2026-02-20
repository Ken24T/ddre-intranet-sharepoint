/**
 * Unit tests for LineItemEditor component.
 *
 * Verifies: toggle, variant selection, price override, empty state.
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LineItemEditor } from "./LineItemEditor";
import type {
  BudgetLineItem,
  Service,
  VariantContext,
} from "../models/types";

// ─── Test data ──────────────────────────────────────────────

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

const mockLineItems: BudgetLineItem[] = [
  {
    serviceId: 1,
    serviceName: "Photography",
    variantId: "8-photos",
    variantName: "8 Photos",
    isSelected: true,
    schedulePrice: 330,
    overridePrice: null,
    isOverridden: false,
  },
  {
    serviceId: 2,
    serviceName: "Floor Plan",
    variantId: "medium",
    variantName: "Medium",
    isSelected: true,
    schedulePrice: 180,
    overridePrice: null,
    isOverridden: false,
  },
];

const defaultContext: VariantContext = { propertySize: "medium" };

// ─── Tests ──────────────────────────────────────────────────

describe("LineItemEditor", () => {
  it("renders service names for each line item", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Photography")).toBeInTheDocument();
    expect(screen.getByText("Floor Plan")).toBeInTheDocument();
  });

  it("shows prices for line items", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    // $330.00 and $180.00 should appear
    expect(screen.getByText("$330.00")).toBeInTheDocument();
    expect(screen.getByText("$180.00")).toBeInTheDocument();
  });

  it("renders checkboxes for each line item", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it("calls onChange when a checkbox is toggled", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    // First item should be deselected
    const updatedItems = onChange.mock.calls[0][0] as BudgetLineItem[];
    expect(updatedItems[0].isSelected).toBe(false);
    expect(updatedItems[1].isSelected).toBe(true);
  });

  it("shows empty state when no line items", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={[]}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    expect(screen.getByText(/No line items/)).toBeInTheDocument();
  });

  it("renders override button for selected items", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    const overrideBtns = screen.getAllByLabelText("Override price");
    expect(overrideBtns).toHaveLength(2);
  });

  it("shows variant dropdown for manual-select services", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    // Photography is manual — should have a dropdown (Fluent UI renders as combobox)
    // Floor Plan is propertySize-resolved — should show text
    const dropdowns = screen.getAllByRole("combobox");
    expect(dropdowns.length).toBeGreaterThanOrEqual(1);
  });

  it("renders as read-only when readOnly prop is true", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
        readOnly={true}
      />,
    );

    // Checkboxes should be disabled
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => {
      expect(cb).toBeDisabled();
    });

    // No override buttons
    expect(screen.queryByLabelText("Override price")).not.toBeInTheDocument();
  });
});
