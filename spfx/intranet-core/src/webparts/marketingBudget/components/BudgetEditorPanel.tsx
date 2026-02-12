/**
 * BudgetEditorPanel — Fluent UI Panel for creating and editing budgets.
 *
 * Workflow:
 * 1. Fill property details (address, type, size, suburb, vendor)
 * 2. Select a schedule template → auto-populates line items
 * 3. Adjust line items (toggle, variant, price override)
 * 4. Save as draft or update status (draft → approved → sent)
 *
 * State logic lives in useBudgetEditorState; property form fields
 * are rendered by BudgetPropertyForm.
 */

import * as React from "react";
import {
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  Label,
  MessageBar,
  MessageBarType,
  Separator,
  Spinner,
  SpinnerSize,
  TextField,
  Text,
  Icon,
} from "@fluentui/react";
import type { Budget, BudgetLineItem, BudgetTemplate } from "../models/types";
import type { UserRole } from "../models/permissions";
import { canEditBudget, canTransitionBudget } from "../models/permissions";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import type { IBudgetAuditLogger } from "../services/IAuditLogger";
import type { IBudgetTemplateService } from "../services/IBudgetTemplateService";
import { LineItemEditor } from "./LineItemEditor";
import { BudgetTotals } from "./BudgetTotals";
import { BudgetPropertyForm } from "./BudgetPropertyForm";
import { AuditTimeline } from "./AuditTimeline";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import { useBudgetEditorState } from "./useBudgetEditorState";
import { printElement } from "./BudgetPrintView";
import styles from "./MarketingBudget.module.scss";

// ─── Props ──────────────────────────────────────────────────

export interface IBudgetEditorPanelProps {
  /** The budget to edit, or undefined for a new budget. */
  budget?: Budget;
  repository: IBudgetRepository;
  isOpen: boolean;
  onDismiss: () => void;
  onSaved: (budget: Budget) => void;
  /** User's role — controls which fields and actions are available. */
  userRole: UserRole;
  /** Optional audit logger for displaying change history. */
  auditLogger?: IBudgetAuditLogger;
  /** Optional template service for save/load template features. */
  templateService?: IBudgetTemplateService;
}

// ─── Component ─────────────────────────────────────────────

export const BudgetEditorPanel: React.FC<IBudgetEditorPanelProps> = ({
  budget: editBudget,
  repository,
  isOpen,
  onDismiss,
  onSaved,
  userRole,
  auditLogger,
  templateService,
}) => {
  const state = useBudgetEditorState(editBudget, repository, isOpen, onSaved);

  const isEditable = canEditBudget(userRole, state.status);
  const showTransitions = canTransitionBudget(userRole);

  // ─── Template dialog state ─────────────────────────────
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = React.useState(false);
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  /** Apply a saved template's line items into the editor. */
  const handleApplyTemplate = React.useCallback(
    (template: BudgetTemplate): void => {
      const items: BudgetLineItem[] = template.lineItems.map((tli) => ({
        serviceId: tli.serviceId,
        serviceName: tli.serviceName,
        variantId: tli.variantId,
        variantName: tli.variantName,
        isSelected: tli.isSelected,
        schedulePrice: tli.savedPrice ?? 0,
        overridePrice: tli.overridePrice,
        isOverridden: tli.isOverridden,
      }));
      state.setLineItems(items);

      // Apply property defaults from template if set
      if (template.propertyType) state.setPropertyType(template.propertyType);
      if (template.propertySize) state.setPropertySize(template.propertySize);
      if (template.tier) state.setTier(template.tier);

      setIsPickerOpen(false);
    },
    [state],
  );

  // ─── Footer ────────────────────────────────────────────

  const onRenderFooterContent = React.useCallback(
    (): JSX.Element => (
      <div className={styles.editorFooter}>
        <div className={styles.editorFooterLeft}>
          {showTransitions &&
            !state.isNew &&
            state.allowedTransitions.map((nextStatus) => (
              <DefaultButton
                key={nextStatus}
                text={
                  nextStatus === "draft"
                    ? "Revert to Draft"
                    : `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`
                }
                onClick={(): void => {
                  state.handleStatusChange(nextStatus); // eslint-disable-line @typescript-eslint/no-floating-promises
                }}
                disabled={state.isSaving}
              />
            ))}
        </div>
        <div className={styles.editorFooterRight}>
          {!state.isNew && (
            <DefaultButton
              text="Print"
              iconProps={{ iconName: "Print" }}
              onClick={(): void => {
                const panel = document.querySelector("[data-testid='editor-panel-content']") as HTMLElement | null;
                if (panel) {
                  printElement(panel);
                }
              }}
              disabled={state.isSaving}
            />
          )}
          <DefaultButton
            text={isEditable ? "Cancel" : "Close"}
            onClick={onDismiss}
            disabled={state.isSaving}
          />
          {isEditable && (
            <PrimaryButton
              text={
                state.isSaving
                  ? "Saving…"
                  : state.isNew
                    ? "Create Budget"
                    : "Save Changes"
              }
              onClick={state.handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
              disabled={state.isSaving || !state.address.trim()}
            />
          )}
        </div>
      </div>
    ),
    [state, onDismiss, isEditable, showTransitions],
  );

  // ─── Render ────────────────────────────────────────────

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.custom}
      customWidth="66%"
      headerText={
        state.isNew ? "New Budget" : `Edit — ${state.address || "Budget"}`
      }
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      closeButtonAriaLabel="Close"
    >
      {state.isLoadingRef ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading reference data…" />
        </div>
      ) : (
        <div className={styles.editorContent} data-testid="editor-panel-content">
          {state.error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              onDismiss={(): void => state.setError(null)}
              dismissButtonAriaLabel="Close"
            >
              {state.error}
            </MessageBar>
          )}

          {/* Status indicator for existing budgets */}
          {!state.isNew && (
            <div className={styles.statusIndicator}>
              <Icon iconName="Info" />
              <Text variant="medium">
                Status:{" "}
                <strong>
                  {state.status.charAt(0).toUpperCase() +
                    state.status.slice(1)}
                </strong>
              </Text>
            </div>
          )}

          {/* ─── Property Details ──────────────────────── */}
          <Text variant="large" className={styles.sectionTitle}>
            Property Details
          </Text>

          <BudgetPropertyForm
            address={state.address}
            propertyType={state.propertyType}
            propertySize={state.propertySize}
            tier={state.tier}
            suburbId={state.suburbId}
            vendorId={state.vendorId}
            clientName={state.clientName}
            agentName={state.agentName}
            suburbOptions={state.suburbOptions}
            vendorOptions={state.vendorOptions}
            onAddressChange={state.setAddress}
            onPropertyTypeChange={state.setPropertyType}
            onPropertySizeChange={state.setPropertySize}
            onTierChange={state.setTier}
            onSuburbIdChange={state.setSuburbId}
            onVendorIdChange={state.setVendorId}
            onClientNameChange={state.setClientName}
            onAgentNameChange={state.setAgentName}
            readOnly={!isEditable}
          />

          <Separator />

          {/* ─── Schedule Template ─────────────────────── */}
          <Text variant="large" className={styles.sectionTitle}>
            Schedule Template
          </Text>

          <Dropdown
            label="Apply a schedule template"
            options={state.scheduleOptions}
            selectedKey={state.scheduleId ? String(state.scheduleId) : ""}
            onChange={(_, opt): void => {
              const id = opt?.key ? Number(opt.key) : null;
              state.applySchedule(id || null);
            }}
            placeholder="Choose a template…"
            disabled={!isEditable}
          />

          {state.scheduleId && (
            <MessageBar
              messageBarType={MessageBarType.info}
              styles={{ root: { marginTop: 8 } }}
            >
              Template applied — line items populated. Adjust selections and
              prices below.
            </MessageBar>
          )}

          <Separator />

          {/* ─── Line Items ────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="large" className={styles.sectionTitle}>
              Line Items
            </Text>
            {templateService && isEditable && (
              <div style={{ display: "flex", gap: 8 }}>
                <DefaultButton
                  text="Load Template"
                  iconProps={{ iconName: "OpenFolderHorizontal" }}
                  onClick={(): void => setIsPickerOpen(true)}
                  disabled={state.isSaving}
                />
                {state.lineItems.length > 0 && (
                  <DefaultButton
                    text="Save as Template"
                    iconProps={{ iconName: "SaveTemplate" }}
                    onClick={(): void => setIsSaveTemplateOpen(true)}
                    disabled={state.isSaving}
                  />
                )}
              </div>
            )}
          </div>

          <LineItemEditor
            lineItems={state.lineItems}
            services={state.services}
            context={state.variantContext}
            onChange={state.setLineItems}
            readOnly={!isEditable || state.status === "sent" || state.status === "archived"}
          />

          {state.lineItems.length > 0 && (
            <>
              <Separator />
              <BudgetTotals lineItems={state.lineItems} />
            </>
          )}

          <Separator />

          {/* ─── Notes ─────────────────────────────────── */}
          <Label>Notes</Label>
          <TextField
            multiline
            rows={3}
            value={state.notes}
            onChange={(_, val): void => state.setNotes(val ?? "")}
            placeholder="Any additional notes for this budget…"
            readOnly={!isEditable}
          />

          {/* ─── Change History ─────────────────────────── */}
          {auditLogger && !state.isNew && editBudget?.id && (
            <>
              <Separator />
              <Label>Change History</Label>
              <AuditTimeline
                auditLogger={auditLogger}
                entityType="budget"
                entityId={editBudget.id}
              />
            </>
          )}
        </div>
      )}

      {/* ─── Template Dialogs ───────────────────────── */}
      {templateService && (
        <>
          <SaveTemplateDialog
            isOpen={isSaveTemplateOpen}
            onDismiss={(): void => setIsSaveTemplateOpen(false)}
            onSaved={(): void => setIsSaveTemplateOpen(false)}
            templateService={templateService}
            lineItems={state.lineItems}
            propertyType={state.propertyType}
            propertySize={state.propertySize}
            tier={state.tier}
            sourceScheduleId={state.scheduleId ?? undefined}
          />
          <TemplatePickerDialog
            isOpen={isPickerOpen}
            onDismiss={(): void => setIsPickerOpen(false)}
            onApply={handleApplyTemplate}
            templateService={templateService}
          />
        </>
      )}
    </Panel>
  );
};
