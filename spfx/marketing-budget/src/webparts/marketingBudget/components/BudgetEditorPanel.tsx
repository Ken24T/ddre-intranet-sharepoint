/**
 * BudgetEditorPanel — Fluent UI Panel for creating and editing budgets.
 *
 * Workflow:
 * 1. Fill property details (address, type, size, suburb, vendor)
 * 2. Select a schedule template → auto-populates line items
 * 3. Adjust line items (toggle, variant, price override)
 * 4. Save as draft or update status (draft → approved → sent)
 *
 * Uses the pure calculation + variant functions from the models layer.
 */

import * as React from 'react';
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
} from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react';
import type {
  Budget,
  BudgetLineItem,
  BudgetStatus,
  BudgetTier,
  PropertySize,
  PropertyType,
  Schedule,
  Service,
  Suburb,
  Vendor,
  VariantContext,
} from '../../../models/types';
import type { IBudgetRepository } from '../../../services/IBudgetRepository';
import { createDefaultBudget, resolveLineItems } from '../../../models/budgetCalculations';
import { getServiceVariant } from '../../../models/variantHelpers';
import { LineItemEditor } from './LineItemEditor';
import { BudgetTotals } from './BudgetTotals';
import styles from './MarketingBudget.module.scss';

// ─── Props ──────────────────────────────────────────────────

export interface IBudgetEditorPanelProps {
  /** The budget to edit, or undefined for a new budget. */
  budget?: Budget;
  repository: IBudgetRepository;
  isOpen: boolean;
  onDismiss: () => void;
  onSaved: (budget: Budget) => void;
}

// ─── Dropdown option builders ──────────────────────────────

const propertyTypeOptions: IDropdownOption[] = [
  { key: 'house', text: 'House' },
  { key: 'unit', text: 'Unit' },
  { key: 'townhouse', text: 'Townhouse' },
  { key: 'land', text: 'Land' },
  { key: 'rural', text: 'Rural' },
  { key: 'commercial', text: 'Commercial' },
];

const propertySizeOptions: IDropdownOption[] = [
  { key: 'small', text: 'Small' },
  { key: 'medium', text: 'Medium' },
  { key: 'large', text: 'Large' },
];

const budgetTierOptions: IDropdownOption[] = [
  { key: 'basic', text: 'Basic' },
  { key: 'standard', text: 'Standard' },
  { key: 'premium', text: 'Premium' },
];

const statusTransitions: Record<BudgetStatus, BudgetStatus[]> = {
  draft: ['approved'],
  approved: ['sent', 'draft'],
  sent: ['archived'],
  archived: [],
};

// ─── Component ─────────────────────────────────────────────

export const BudgetEditorPanel: React.FC<IBudgetEditorPanelProps> = ({
  budget: editBudget,
  repository,
  isOpen,
  onDismiss,
  onSaved,
}) => {
  const isNew = !editBudget?.id;

  // ─── Reference data (loaded once) ──────────────────────
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [suburbs, setSuburbs] = React.useState<Suburb[]>([]);
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoadingRef, setIsLoadingRef] = React.useState(true);

  // ─── Form state ────────────────────────────────────────
  const [address, setAddress] = React.useState('');
  const [propertyType, setPropertyType] = React.useState<PropertyType>('house');
  const [propertySize, setPropertySize] = React.useState<PropertySize>('medium');
  const [tier, setTier] = React.useState<BudgetTier>('standard');
  const [suburbId, setSuburbId] = React.useState<number | null>(null);
  const [vendorId, setVendorId] = React.useState<number | null>(null);
  const [scheduleId, setScheduleId] = React.useState<number | null>(null);
  const [lineItems, setLineItems] = React.useState<BudgetLineItem[]>([]);
  const [notes, setNotes] = React.useState('');
  const [clientName, setClientName] = React.useState('');
  const [agentName, setAgentName] = React.useState('');
  const [status, setStatus] = React.useState<BudgetStatus>('draft');

  // ─── UI state ──────────────────────────────────────────
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ─── Variant context (drives auto-resolution) ──────────
  const variantContext: VariantContext = React.useMemo(() => {
    const suburb = suburbs.find((s) => s.id === suburbId);
    return {
      propertySize,
      suburbTier: suburb?.pricingTier,
    };
  }, [propertySize, suburbId, suburbs]);

  // ─── Load reference data ──────────────────────────────
  React.useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async (): Promise<void> => {
      setIsLoadingRef(true);
      try {
        const [v, svc, sub, sch] = await Promise.all([
          repository.getVendors(),
          repository.getAllServices(),
          repository.getSuburbs(),
          repository.getSchedules(),
        ]);
        if (cancelled) return;
        setVendors(v);
        setServices(svc);
        setSuburbs(sub);
        setSchedules(sch);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load reference data');
        }
      } finally {
        if (!cancelled) setIsLoadingRef(false);
      }
    };

    load(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return (): void => {
      cancelled = true;
    };
  }, [isOpen, repository]);

  // ─── Initialise form from editBudget or defaults ──────
  React.useEffect(() => {
    if (!isOpen) return;

    if (editBudget) {
      setAddress(editBudget.propertyAddress);
      setPropertyType(editBudget.propertyType);
      setPropertySize(editBudget.propertySize);
      setTier(editBudget.tier);
      setSuburbId(editBudget.suburbId ?? null);
      setVendorId(editBudget.vendorId ?? null);
      setScheduleId(editBudget.scheduleId ?? null);
      setLineItems(editBudget.lineItems);
      setNotes(editBudget.notes ?? '');
      setClientName(editBudget.clientName ?? '');
      setAgentName(editBudget.agentName ?? '');
      setStatus(editBudget.status);
    } else {
      const defaults = createDefaultBudget();
      setAddress(defaults.propertyAddress);
      setPropertyType(defaults.propertyType);
      setPropertySize(defaults.propertySize);
      setTier(defaults.tier);
      setSuburbId(defaults.suburbId);
      setVendorId(defaults.vendorId);
      setScheduleId(defaults.scheduleId ?? null);
      setLineItems(defaults.lineItems);
      setNotes('');
      setClientName('');
      setAgentName('');
      setStatus(defaults.status);
    }
    setError(null);
  }, [isOpen, editBudget]);

  // ─── Re-resolve line items when context changes ────────
  React.useEffect(() => {
    if (lineItems.length > 0 && services.length > 0) {
      const resolved = resolveLineItems(lineItems, services, variantContext);
      // Only update if something actually changed (avoid infinite loop)
      const changed = resolved.some(
        (r, i) =>
          r.serviceName !== lineItems[i].serviceName ||
          r.variantName !== lineItems[i].variantName ||
          r.schedulePrice !== lineItems[i].schedulePrice
      );
      if (changed) {
        setLineItems(resolved);
      }
    }
  }, [variantContext, services]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Dropdown options ──────────────────────────────────

  const vendorOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: '', text: '(None)' },
      ...vendors.filter((v) => v.isActive).map((v) => ({ key: String(v.id), text: v.name })),
    ],
    [vendors]
  );

  const suburbOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: '', text: '(None)' },
      ...suburbs.map((s) => ({ key: String(s.id), text: `${s.name} (Tier ${s.pricingTier})` })),
    ],
    [suburbs]
  );

  const scheduleOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: '', text: '(None — start from scratch)' },
      ...schedules
        .filter((s) => s.isActive)
        .map((s) => ({ key: String(s.id), text: s.name })),
    ],
    [schedules]
  );

  // ─── Schedule template application ─────────────────────

  const applySchedule = React.useCallback(
    (selectedScheduleId: number | null): void => {
      setScheduleId(selectedScheduleId);

      if (!selectedScheduleId) {
        setLineItems([]);
        return;
      }

      const schedule = schedules.find((s) => s.id === selectedScheduleId);
      if (!schedule) return;

      // Apply schedule defaults to the property fields
      setPropertyType(schedule.propertyType);
      setPropertySize(schedule.propertySize);
      setTier(schedule.tier);
      if (schedule.defaultVendorId) {
        setVendorId(schedule.defaultVendorId);
      }

      // Convert schedule line items to budget line items
      const newItems: BudgetLineItem[] = schedule.lineItems.map((sli) => {
        const service = services.find((s) => s.id === sli.serviceId);
        const variant = service
          ? getServiceVariant(service, {
              propertySize: schedule.propertySize,
              suburbTier: suburbs.find((s) => s.id === suburbId)?.pricingTier,
            }, sli.variantId)
          : undefined;

        return {
          serviceId: sli.serviceId,
          serviceName: service?.name,
          variantId: variant?.id ?? sli.variantId,
          variantName: variant?.name ?? null,
          isSelected: sli.isSelected,
          schedulePrice: variant?.basePrice ?? 0,
          overridePrice: null,
          isOverridden: false,
        };
      });

      setLineItems(newItems);
    },
    [schedules, services, suburbs, suburbId]
  );

  // ─── Save ──────────────────────────────────────────────

  const handleSave = React.useCallback(async (): Promise<void> => {
    // Validation
    if (!address.trim()) {
      setError('Property address is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const schedule = schedules.find((s) => s.id === scheduleId);

      const budgetData: Budget = {
        ...(editBudget?.id ? { id: editBudget.id } : {}),
        propertyAddress: address.trim(),
        propertyType,
        propertySize,
        tier,
        suburbId,
        vendorId,
        scheduleId,
        scheduleName: schedule?.name ?? null,
        lineItems,
        notes: notes.trim() || undefined,
        clientName: clientName.trim() || undefined,
        agentName: agentName.trim() || undefined,
        status,
        createdAt: editBudget?.createdAt ?? now,
        updatedAt: now,
      };

      const saved = await repository.saveBudget(budgetData);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  }, [
    address, propertyType, propertySize, tier, suburbId, vendorId,
    scheduleId, lineItems, notes, clientName, agentName, status,
    editBudget, repository, onSaved, schedules,
  ]);

  // ─── Status transition buttons ─────────────────────────

  const allowedTransitions = statusTransitions[status] ?? [];

  const handleStatusChange = React.useCallback(
    async (newStatus: BudgetStatus): Promise<void> => {
      setStatus(newStatus);
      // Save immediately when transitioning status on existing budget
      if (editBudget?.id) {
        setIsSaving(true);
        try {
          const now = new Date().toISOString();
          const saved = await repository.saveBudget({
            ...editBudget,
            propertyAddress: address.trim(),
            propertyType,
            propertySize,
            tier,
            suburbId,
            vendorId,
            scheduleId,
            lineItems,
            notes: notes.trim() || undefined,
            clientName: clientName.trim() || undefined,
            agentName: agentName.trim() || undefined,
            status: newStatus,
            updatedAt: now,
          });
          onSaved(saved);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update status');
          setStatus(status); // Revert
        } finally {
          setIsSaving(false);
        }
      }
    },
    [
      editBudget, address, propertyType, propertySize, tier,
      suburbId, vendorId, scheduleId, lineItems, notes,
      clientName, agentName, status, repository, onSaved,
    ]
  );

  // ─── Render ────────────────────────────────────────────

  const onRenderFooterContent = React.useCallback(
    (): JSX.Element => (
      <div className={styles.editorFooter}>
        <div className={styles.editorFooterLeft}>
          {!isNew &&
            allowedTransitions.map((nextStatus) => (
              <DefaultButton
                key={nextStatus}
                text={nextStatus === 'draft' ? 'Revert to Draft' : `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                onClick={(): void => {
                  handleStatusChange(nextStatus); // eslint-disable-line @typescript-eslint/no-floating-promises
                }}
                disabled={isSaving}
              />
            ))}
        </div>
        <div className={styles.editorFooterRight}>
          <DefaultButton text="Cancel" onClick={onDismiss} disabled={isSaving} />
          <PrimaryButton
            text={isSaving ? 'Saving…' : isNew ? 'Create Budget' : 'Save Changes'}
            onClick={handleSave} // eslint-disable-line @typescript-eslint/no-floating-promises
            disabled={isSaving || !address.trim()}
          />
        </div>
      </div>
    ),
    [isNew, allowedTransitions, isSaving, address, onDismiss, handleSave, handleStatusChange]
  );

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.large}
      headerText={isNew ? 'New Budget' : `Edit — ${address || 'Budget'}`}
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      closeButtonAriaLabel="Close"
    >
      {isLoadingRef ? (
        <div className={styles.centeredState}>
          <Spinner size={SpinnerSize.large} label="Loading reference data…" />
        </div>
      ) : (
        <div className={styles.editorContent}>
          {error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              onDismiss={(): void => setError(null)}
              dismissButtonAriaLabel="Close"
            >
              {error}
            </MessageBar>
          )}

          {/* Status indicator for existing budgets */}
          {!isNew && (
            <div className={styles.statusIndicator}>
              <Icon iconName="Info" />
              <Text variant="medium">
                Status: <strong>{status.charAt(0).toUpperCase() + status.slice(1)}</strong>
              </Text>
            </div>
          )}

          {/* ─── Property Details ──────────────────────── */}
          <Text variant="large" className={styles.sectionTitle}>
            Property Details
          </Text>

          <TextField
            label="Property Address"
            value={address}
            onChange={(_, val): void => setAddress(val ?? '')}
            required
            placeholder="e.g. 42 Jubilee Terrace, Bardon QLD 4065"
          />

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <Dropdown
                label="Property Type"
                options={propertyTypeOptions}
                selectedKey={propertyType}
                onChange={(_, opt): void => setPropertyType((opt?.key ?? 'house') as PropertyType)}
              />
            </div>
            <div className={styles.formField}>
              <Dropdown
                label="Property Size"
                options={propertySizeOptions}
                selectedKey={propertySize}
                onChange={(_, opt): void => setPropertySize((opt?.key ?? 'medium') as PropertySize)}
              />
            </div>
            <div className={styles.formField}>
              <Dropdown
                label="Budget Tier"
                options={budgetTierOptions}
                selectedKey={tier}
                onChange={(_, opt): void => setTier((opt?.key ?? 'standard') as BudgetTier)}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <Dropdown
                label="Suburb"
                options={suburbOptions}
                selectedKey={suburbId ? String(suburbId) : ''}
                onChange={(_, opt): void => {
                  const id = opt?.key ? Number(opt.key) : null;
                  setSuburbId(id || null);
                }}
                placeholder="Select suburb…"
              />
            </div>
            <div className={styles.formField}>
              <Dropdown
                label="Preferred Vendor"
                options={vendorOptions}
                selectedKey={vendorId ? String(vendorId) : ''}
                onChange={(_, opt): void => {
                  const id = opt?.key ? Number(opt.key) : null;
                  setVendorId(id || null);
                }}
                placeholder="Select vendor…"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <TextField
                label="Client Name"
                value={clientName}
                onChange={(_, val): void => setClientName(val ?? '')}
                placeholder="Property owner name"
              />
            </div>
            <div className={styles.formField}>
              <TextField
                label="Agent Name"
                value={agentName}
                onChange={(_, val): void => setAgentName(val ?? '')}
                placeholder="Listing agent"
              />
            </div>
          </div>

          <Separator />

          {/* ─── Schedule Template ─────────────────────── */}
          <Text variant="large" className={styles.sectionTitle}>
            Schedule Template
          </Text>

          <Dropdown
            label="Apply a schedule template"
            options={scheduleOptions}
            selectedKey={scheduleId ? String(scheduleId) : ''}
            onChange={(_, opt): void => {
              const id = opt?.key ? Number(opt.key) : null;
              applySchedule(id || null);
            }}
            placeholder="Choose a template…"
          />

          {scheduleId && (
            <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: 8 } }}>
              Template applied — line items populated. Adjust selections and prices below.
            </MessageBar>
          )}

          <Separator />

          {/* ─── Line Items ────────────────────────────── */}
          <Text variant="large" className={styles.sectionTitle}>
            Line Items
          </Text>

          <LineItemEditor
            lineItems={lineItems}
            services={services}
            context={variantContext}
            onChange={setLineItems}
            readOnly={status === 'sent' || status === 'archived'}
          />

          {lineItems.length > 0 && (
            <>
              <Separator />
              <BudgetTotals lineItems={lineItems} />
            </>
          )}

          <Separator />

          {/* ─── Notes ─────────────────────────────────── */}
          <Label>Notes</Label>
          <TextField
            multiline
            rows={3}
            value={notes}
            onChange={(_, val): void => setNotes(val ?? '')}
            placeholder="Any additional notes for this budget…"
          />
        </div>
      )}
    </Panel>
  );
};
