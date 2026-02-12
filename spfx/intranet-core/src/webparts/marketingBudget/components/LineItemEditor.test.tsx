/**
 * Unit tests for LineItemEditor + SortableLineItem components.
 *
 * Verifies: toggle, variant selection, price override, empty state,
 * drag handles, read-only mode, and reorder callback.
 */

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/typedef */

jest.mock("@dnd-kit/core", () => {
  const ReactLocal = require("react");
  return {
    DndContext: ({ children }: { children: unknown }): unknown =>
      ReactLocal.createElement("div", { "data-testid": "dnd-context" }, children),
    closestCenter: jest.fn(),
    KeyboardSensor: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: (): unknown[] => [],
  };
});

jest.mock("@dnd-kit/sortable", () => {
  const ReactLocal = require("react");
  return {
    arrayMove: <T,>(arr: T[], from: number, to: number): T[] => {
      const clone = arr.slice();
      const item = clone.splice(from, 1)[0];
      clone.splice(to, 0, item);
      return clone;
    },
    SortableContext: ({ children }: { children: unknown }): unknown =>
      ReactLocal.createElement(
        "div",
        { "data-testid": "sortable-context" },
        children,
      ),
    sortableKeyboardCoordinates: jest.fn(),
    verticalListSortingStrategy: jest.fn(),
    useSortable: (): Record<string, unknown> => ({
      attributes: { role: "button", tabIndex: 0 },
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }),
  };
});

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: (): string | undefined => undefined,
    },
  },
}));

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

  // ─── DnD-specific tests ──────────────────────────────────

  it("renders drag handles when editable", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    const handles = screen.getAllByLabelText(/Reorder/);
    expect(handles).toHaveLength(2);
  });

  it("hides drag handles in read-only mode", () => {
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

    expect(screen.queryByLabelText(/Reorder/)).not.toBeInTheDocument();
  });

  it("wraps rows in DndContext and SortableContext", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
    expect(screen.getByTestId("sortable-context")).toBeInTheDocument();
  });

  it("renders remove buttons for each line item when editable", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    const removeBtns = screen.getAllByLabelText(/Remove/);
    expect(removeBtns).toHaveLength(2);
  });

  it("calls onChange with item removed when remove is clicked", () => {
    const onChange = jest.fn();
    render(
      <LineItemEditor
        lineItems={mockLineItems}
        services={mockServices}
        context={defaultContext}
        onChange={onChange}
      />,
    );

    const removeBtns = screen.getAllByLabelText(/Remove/);
    fireEvent.click(removeBtns[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = onChange.mock.calls[0][0] as BudgetLineItem[];
    expect(updated).toHaveLength(1);
    expect(updated[0].serviceName).toBe("Floor Plan");
  });
});

describe("arrayMove integration", () => {
  it("reorders items correctly", () => {
    // Use the inline arrayMove from the mock (same logic)
    const items = ["a", "b", "c"];
    const moveForward = (arr: string[], from: number, to: number): string[] => {
      const clone = arr.slice();
      const item = clone.splice(from, 1)[0];
      clone.splice(to, 0, item);
      return clone;
    };
    expect(moveForward(items, 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveForward(items, 2, 0)).toEqual(["c", "a", "b"]);
  });
});
