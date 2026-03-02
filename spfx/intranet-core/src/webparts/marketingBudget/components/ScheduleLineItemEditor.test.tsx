/**
 * Unit tests for ScheduleLineItemEditor component.
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ScheduleLineItemEditor } from "./ScheduleLineItemEditor";
import type { ScheduleLineItem, Service } from "../models/types";

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
      { id: "medium", name: "Medium", basePrice: 180, sizeMatch: "medium" },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 3,
    name: "Aerial Photography",
    category: "aerial",
    vendorId: 1,
    variantSelector: null,
    variants: [{ id: "default", name: "Standard", basePrice: 250 }],
    includesGst: true,
    isActive: 1,
  },
];

const baseLineItems: ScheduleLineItem[] = [
  { serviceId: 1, variantId: "8-photos", isSelected: true },
  { serviceId: 2, variantId: "medium", isSelected: false },
];

describe("ScheduleLineItemEditor", () => {
  it("renders line items with service names", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Photography")).toBeInTheDocument();
    expect(screen.getByText("Floor Plan")).toBeInTheDocument();
  });

  it("shows empty state when no line items", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={[]}
        services={mockServices}
        onChange={onChange}
      />,
    );
    expect(
      screen.getByText("No line items. Use the dropdown below to add services."),
    ).toBeInTheDocument();
  });

  it("renders toggle checkboxes for each line item", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onChange when toggling a line item", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    // The second line item is not selected; toggle it
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ScheduleLineItem[];
    expect(result[1].isSelected).toBe(true);
  });

  it("calls onChange when removing a line item", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    const removeButtons = screen.getAllByTitle("Remove");
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ScheduleLineItem[];
    expect(result).toHaveLength(1);
    expect(result[0].serviceId).toBe(2);
  });

  it("renders move up/down buttons", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    expect(screen.getAllByTitle("Move up").length).toBe(2);
    expect(screen.getAllByTitle("Move down").length).toBe(2);
  });

  it("calls onChange when moving an item down", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    const moveDownButtons = screen.getAllByTitle("Move down");
    // Move first item down
    fireEvent.click(moveDownButtons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ScheduleLineItem[];
    expect(result[0].serviceId).toBe(2);
    expect(result[1].serviceId).toBe(1);
  });

  it("calls onChange when moving an item up", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    const moveUpButtons = screen.getAllByTitle("Move up");
    // Move second item up
    fireEvent.click(moveUpButtons[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as ScheduleLineItem[];
    expect(result[0].serviceId).toBe(2);
    expect(result[1].serviceId).toBe(1);
  });

  it("disables move up on first item and move down on last item", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    const moveUpButtons = screen.getAllByTitle("Move up");
    const moveDownButtons = screen.getAllByTitle("Move down");
    // First item's "Move up" should be disabled
    expect(moveUpButtons[0].closest("button")).toBeDisabled();
    // Last item's "Move down" should be disabled
    expect(moveDownButtons[1].closest("button")).toBeDisabled();
  });

  it("shows add service dropdown with available services", () => {
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={baseLineItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    // Service 3 (Aerial Photography) is not in line items, so should appear in dropdown
    expect(screen.getByText("Add a service…")).toBeInTheDocument();
  });

  it("does not show add dropdown when all services are used", () => {
    const allItems: ScheduleLineItem[] = [
      { serviceId: 1, variantId: "8-photos", isSelected: true },
      { serviceId: 2, variantId: "medium", isSelected: true },
      { serviceId: 3, variantId: "default", isSelected: true },
    ];
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={allItems}
        services={mockServices}
        onChange={onChange}
      />,
    );
    expect(screen.queryByText("Add a service…")).not.toBeInTheDocument();
  });

  it("renders service name fallback for unknown service IDs", () => {
    const items: ScheduleLineItem[] = [
      { serviceId: 999, variantId: null, isSelected: true },
    ];
    const onChange = jest.fn();
    render(
      <ScheduleLineItemEditor
        lineItems={items}
        services={mockServices}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("Service #999")).toBeInTheDocument();
  });
});
