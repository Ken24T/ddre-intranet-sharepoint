/**
 * Unit tests for TemplatePickerDialog component.
 *
 * Verifies: template listing, empty state, delete, error handling.
 */

import * as React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import type { IBudgetTemplateService } from "../services/IBudgetTemplateService";
import type { BudgetTemplate } from "../models/types";

// ─── Mock data ──────────────────────────────────────────────

const makeTemplate = (overrides?: Partial<BudgetTemplate>): BudgetTemplate => ({
  id: 1,
  name: "Standard Photography",
  description: "Basic photo package",
  propertyType: "house",
  propertySize: "medium",
  tier: "standard",
  lineItems: [
    {
      serviceId: 1,
      serviceName: "Photography",
      variantId: "8-photos",
      variantName: "8 Photos",
      isSelected: true,
      savedPrice: 330,
      overridePrice: null,
      isOverridden: false,
    },
    {
      serviceId: 2,
      serviceName: "Floor Plan",
      variantId: "medium",
      variantName: "Medium",
      isSelected: true,
      savedPrice: 180,
      overridePrice: null,
      isOverridden: false,
    },
  ],
  createdAt: "2024-06-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
  ...overrides,
});

const createMockTemplateService = (
  templates: BudgetTemplate[] = [],
): IBudgetTemplateService => ({
  getTemplates: jest.fn().mockResolvedValue(templates),
  getTemplate: jest.fn().mockResolvedValue(undefined),
  saveTemplate: jest.fn().mockResolvedValue({} as BudgetTemplate),
  deleteTemplate: jest.fn().mockResolvedValue(undefined),
});

// ─── Tests ──────────────────────────────────────────────────

describe("TemplatePickerDialog", () => {
  it("renders dialog with title when open", async () => {
    const service = createMockTemplateService();

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    expect(screen.getByText("Apply Budget Template")).toBeInTheDocument();
  });

  it("does not render dialog content when closed", () => {
    const service = createMockTemplateService();

    render(
      <TemplatePickerDialog
        isOpen={false}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    expect(screen.queryByText("Apply Budget Template")).not.toBeInTheDocument();
  });

  it("shows empty state when no templates exist", async () => {
    const service = createMockTemplateService([]);

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("No saved templates yet.")).toBeInTheDocument();
    });
  });

  it("lists templates when they exist", async () => {
    const templates = [
      makeTemplate({ id: 1, name: "Standard Package" }),
      makeTemplate({ id: 2, name: "Premium Package" }),
    ];
    const service = createMockTemplateService(templates);

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Standard Package")).toBeInTheDocument();
      expect(screen.getByText("Premium Package")).toBeInTheDocument();
    });
  });

  it("shows loading spinner while fetching", () => {
    // Create a service that never resolves
    const service: IBudgetTemplateService = {
      getTemplates: jest.fn().mockReturnValue(new Promise(() => { /* never resolves */ })),
      getTemplate: jest.fn(),
      saveTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
    };

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    expect(screen.getByText("Loading templates…")).toBeInTheDocument();
  });

  it("shows error when loading fails", async () => {
    const service: IBudgetTemplateService = {
      getTemplates: jest.fn().mockRejectedValue(new Error("Network error")),
      getTemplate: jest.fn(),
      saveTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
    };

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("deletes a template when delete button is clicked", async () => {
    const templates = [makeTemplate({ id: 1, name: "My Template" })];
    const service = createMockTemplateService(templates);

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("My Template")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle("Delete template");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(service.deleteTemplate).toHaveBeenCalledWith(1);
    });
  });

  it("calls onDismiss when Cancel is clicked", async () => {
    const service = createMockTemplateService([]);
    const onDismiss = jest.fn();

    render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={onDismiss}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("No saved templates yet.")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("loads templates on each open", async () => {
    const service = createMockTemplateService([]);

    const { rerender } = render(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(service.getTemplates).toHaveBeenCalledTimes(1);
    });

    // Close and reopen
    rerender(
      <TemplatePickerDialog
        isOpen={false}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    rerender(
      <TemplatePickerDialog
        isOpen={true}
        onDismiss={jest.fn()}
        onApply={jest.fn()}
        templateService={service}
      />,
    );

    await waitFor(() => {
      expect(service.getTemplates).toHaveBeenCalledTimes(2);
    });
  });
});
