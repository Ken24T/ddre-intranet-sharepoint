/**
 * Unit tests for SaveTemplateDialog component.
 *
 * Verifies: form fields, validation, save flow, error handling.
 */

import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import type { IBudgetTemplateService } from "../services/IBudgetTemplateService";
import type { BudgetLineItem, BudgetTemplate } from "../models/types";

// ─── Mock data ──────────────────────────────────────────────

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
    isSelected: false,
    schedulePrice: 180,
    overridePrice: null,
    isOverridden: false,
  },
];

const createMockTemplateService = (): IBudgetTemplateService => ({
  getTemplates: jest.fn().mockResolvedValue([]),
  getTemplate: jest.fn().mockResolvedValue(undefined),
  saveTemplate: jest.fn().mockImplementation(
    (t: BudgetTemplate): Promise<BudgetTemplate> =>
      Promise.resolve({ ...t, id: 1 }),
  ),
  deleteTemplate: jest.fn().mockResolvedValue(undefined),
});

// ─── Tests ──────────────────────────────────────────────────

describe("SaveTemplateDialog", () => {
  it("renders dialog with title when open", () => {
    const service = createMockTemplateService();
    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    expect(screen.getByText("Save as Template")).toBeInTheDocument();
  });

  it("does not render dialog content when closed", () => {
    const service = createMockTemplateService();
    render(
      <SaveTemplateDialog
        isOpen={false}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    expect(screen.queryByText("Save as Template")).not.toBeInTheDocument();
  });

  it("shows selected line item count in subtitle", () => {
    const service = createMockTemplateService();
    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    // 1 out of 2 is selected
    expect(screen.getByText(/1 selected line item/)).toBeInTheDocument();
  });

  it("renders name and description fields", () => {
    const service = createMockTemplateService();
    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    expect(screen.getByLabelText(/Template name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });

  it("disables save button when name is empty", () => {
    const service = createMockTemplateService();
    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    const saveBtn = screen.getByText("Save Template");
    expect(saveBtn.closest("button")).toBeDisabled();
  });

  it("enables save button when name is entered", () => {
    const service = createMockTemplateService();
    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    const nameField = screen.getByLabelText(/Template name/);
    fireEvent.change(nameField, { target: { value: "My Template" } });

    const saveBtn = screen.getByText("Save Template");
    expect(saveBtn.closest("button")).not.toBeDisabled();
  });

  it("calls templateService.saveTemplate on save", async () => {
    const service = createMockTemplateService();
    const onSaved = jest.fn();

    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={onSaved}
        templateService={service}
        lineItems={mockLineItems}
        propertyType="house"
        propertySize="medium"
        tier="standard"
      />,
    );

    const nameField = screen.getByLabelText(/Template name/);
    fireEvent.change(nameField, { target: { value: "Standard Package" } });

    const saveBtn = screen.getByText("Save Template");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(service.saveTemplate).toHaveBeenCalledTimes(1);
    });

    const savedTemplate = (service.saveTemplate as jest.Mock).mock
      .calls[0][0] as BudgetTemplate;
    expect(savedTemplate.name).toBe("Standard Package");
    expect(savedTemplate.propertyType).toBe("house");
    expect(savedTemplate.propertySize).toBe("medium");
    expect(savedTemplate.tier).toBe("standard");
    expect(savedTemplate.lineItems).toHaveLength(2);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error when save fails", async () => {
    const service = createMockTemplateService();
    (service.saveTemplate as jest.Mock).mockRejectedValue(
      new Error("DB error"),
    );

    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    const nameField = screen.getByLabelText(/Template name/);
    fireEvent.change(nameField, { target: { value: "Test" } });

    const saveBtn = screen.getByText("Save Template");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText("DB error")).toBeInTheDocument();
    });
  });

  it("calls onDismiss when Cancel is clicked", () => {
    const service = createMockTemplateService();
    const onDismiss = jest.fn();

    render(
      <SaveTemplateDialog
        isOpen={true}
        onDismiss={onDismiss}
        onSaved={jest.fn()}
        templateService={service}
        lineItems={mockLineItems}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
