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
import type { Budget } from "../../../models/types";
import type { IBudgetRepository } from "../../../services/IBudgetRepository";
import { LineItemEditor } from "./LineItemEditor";
import { BudgetTotals } from "./BudgetTotals";
import { BudgetPropertyForm } from "./BudgetPropertyForm";
import { useBudgetEditorState } from "./useBudgetEditorState";
import styles from "./MarketingBudget.module.scss";

// ─── Props ──────────────────────────────────────────────────

export interface IBudgetEditorPanelProps {
  /** The budget to edit, or undefined for a new budget. */
  budget?: Budget;
  repository: IBudgetRepository;
  isOpen: boolean;
  onDismiss: () => void;
  onSaved: (budget: Budget) => void;
}

// ─── Component ─────────────────────────────────────────────

export const BudgetEditorPanel: React.FC<IBudgetEditorPanelProps> = ({
  budget: editBudget,
  repository,
  isOpen,
  onDismiss,
  onSaved,
}) => {
  const state = useBudgetEditorState(editBudget, repository, isOpen, onSaved);

  // ─── Footer ────────────────────────────────────────────

  const onRenderFooterContent = React.useCallback(
    (): JSX.Element => (
      <div className={styles.editorFooter}>
        <div className={styles.editorFooterLeft}>
          {!state.isNew &&
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
          <DefaultButton
            text="Cancel"
            onClick={onDismiss}
            disabled={state.isSaving}
          />
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
        </div>
      </div>
    ),
    [state, onDismiss],
  );

  // ─── Render ────────────────────────────────────────────

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.large}
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
        <div className={styles.editorContent}>
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
          <Text variant="large" className={styles.sectionTitle}>
            Line Items
          </Text>

          <LineItemEditor
            lineItems={state.lineItems}
            services={state.services}
            context={state.variantContext}
            onChange={state.setLineItems}
            readOnly={state.status === "sent" || state.status === "archived"}
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
          />
        </div>
      )}
    </Panel>
  );
};
