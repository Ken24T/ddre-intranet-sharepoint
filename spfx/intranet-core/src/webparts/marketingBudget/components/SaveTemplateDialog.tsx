/**
 * SaveTemplateDialog — Dialog for saving current budget line items as a
 * reusable template.
 *
 * The user enters a name and optional description, then the current
 * editor state is persisted via IBudgetTemplateService.
 */

import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  TextField,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import type {
  BudgetLineItem,
  BudgetTemplate,
  BudgetTemplateLineItem,
  BudgetTier,
  PropertySize,
  PropertyType,
} from "../models/types";
import { getLineItemPrice } from "../models/budgetCalculations";
import type { IBudgetTemplateService } from "../services/IBudgetTemplateService";

// ─── Props ──────────────────────────────────────────────────

export interface ISaveTemplateDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSaved: (template: BudgetTemplate) => void;
  templateService: IBudgetTemplateService;
  lineItems: BudgetLineItem[];
  propertyType?: PropertyType;
  propertySize?: PropertySize;
  tier?: BudgetTier;
  sourceScheduleId?: number;
}

// ─── Component ─────────────────────────────────────────────

export const SaveTemplateDialog: React.FC<ISaveTemplateDialogProps> = ({
  isOpen,
  onDismiss,
  onSaved,
  templateService,
  lineItems,
  propertyType,
  propertySize,
  tier,
  sourceScheduleId,
}) => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setError(undefined);
    }
  }, [isOpen]);

  const handleSave = React.useCallback(async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Template name is required.");
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      const templateItems: BudgetTemplateLineItem[] = lineItems.map((li) => ({
        serviceId: li.serviceId,
        serviceName: li.serviceName,
        variantId: li.variantId,
        variantName: li.variantName,
        isSelected: li.isSelected,
        savedPrice: getLineItemPrice(li),
        overridePrice: li.overridePrice,
        isOverridden: li.isOverridden,
      }));

      const template: BudgetTemplate = {
        name: trimmed,
        description: description.trim() || undefined,
        propertyType,
        propertySize,
        tier,
        sourceScheduleId: sourceScheduleId ?? undefined,
        lineItems: templateItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await templateService.saveTemplate(template);
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save template",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    description,
    lineItems,
    propertyType,
    propertySize,
    tier,
    sourceScheduleId,
    templateService,
    onSaved,
  ]);

  const selectedCount = lineItems.filter((li) => li.isSelected).length;

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: "Save as Template",
        subText: `Save ${selectedCount} selected line item${selectedCount !== 1 ? "s" : ""} as a reusable template.`,
      }}
      modalProps={{ isBlocking: true }}
      minWidth={420}
    >
      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={(): void => setError(undefined)}
          dismissButtonAriaLabel="Close"
        >
          {error}
        </MessageBar>
      )}

      <TextField
        label="Template name"
        required
        value={name}
        onChange={(_, val): void => setName(val ?? "")}
        placeholder="e.g. Standard Photography + Floor Plan"
        disabled={isSaving}
        autoFocus
      />

      <TextField
        label="Description (optional)"
        multiline
        rows={2}
        value={description}
        onChange={(_, val): void => setDescription(val ?? "")}
        placeholder="When to use this template…"
        disabled={isSaving}
      />

      <DialogFooter>
        <DefaultButton text="Cancel" onClick={onDismiss} disabled={isSaving} />
        <PrimaryButton
          text={isSaving ? "Saving…" : "Save Template"}
          onClick={handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
          disabled={isSaving || !name.trim()}
        />
      </DialogFooter>

      {isSaving && (
        <Spinner
          size={SpinnerSize.small}
          label="Saving…"
          style={{ marginTop: 8 }}
        />
      )}
    </Dialog>
  );
};
