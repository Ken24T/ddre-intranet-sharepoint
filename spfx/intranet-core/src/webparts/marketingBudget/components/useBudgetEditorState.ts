/* eslint-disable @rushstack/no-new-null */
/**
 * useBudgetEditorState — State management hook for the Budget Editor Panel.
 *
 * Encapsulates form state, reference data loading, schedule template
 * application, save logic, and status transitions. Extracted from
 * BudgetEditorPanel to keep files under ~300 lines.
 */

import * as React from "react";
import type { IDropdownOption } from "@fluentui/react";
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
} from "../models/types";
import type { IBudgetRepository } from "../services/IBudgetRepository";
import {
  createDefaultBudget,
  resolveLineItems,
} from "../models/budgetCalculations";
import { getServiceVariant } from "../models/variantHelpers";
import { statusTransitions } from "./budgetEditorConstants";

export interface IBudgetEditorState {
  // Reference data
  services: Service[];
  isLoadingRef: boolean;

  // Form values
  address: string;
  propertyType: PropertyType;
  propertySize: PropertySize;
  tier: BudgetTier;
  suburbId: number | null;
  vendorId: number | null;
  scheduleId: number | null;
  lineItems: BudgetLineItem[];
  notes: string;
  clientName: string;
  agentName: string;
  status: BudgetStatus;

  // Derived
  variantContext: VariantContext;
  vendorOptions: IDropdownOption[];
  suburbOptions: IDropdownOption[];
  scheduleOptions: IDropdownOption[];
  allowedTransitions: BudgetStatus[];
  isNew: boolean;

  // UI state
  isSaving: boolean;
  error: string | null;

  // Setters
  setAddress: (value: string) => void;
  setPropertyType: (value: PropertyType) => void;
  setPropertySize: (value: PropertySize) => void;
  setTier: (value: BudgetTier) => void;
  setSuburbId: (value: number | null) => void;
  setVendorId: (value: number | null) => void;
  setNotes: (value: string) => void;
  setClientName: (value: string) => void;
  setAgentName: (value: string) => void;
  setLineItems: (items: BudgetLineItem[]) => void;
  setError: (value: string | null) => void;

  // Actions
  applySchedule: (selectedScheduleId: number | null) => void;
  handleSave: () => Promise<void>;
  handleStatusChange: (newStatus: BudgetStatus) => Promise<void>;
}

export function useBudgetEditorState(
  editBudget: Budget | undefined,
  repository: IBudgetRepository,
  isOpen: boolean,
  onSaved: (budget: Budget) => void,
): IBudgetEditorState {
  const isNew = !editBudget?.id;

  // ─── Reference data (loaded once) ──────────────────────
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [suburbs, setSuburbs] = React.useState<Suburb[]>([]);
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoadingRef, setIsLoadingRef] = React.useState(true);

  // ─── Form state ────────────────────────────────────────
  const [address, setAddress] = React.useState("");
  const [propertyType, setPropertyType] = React.useState<PropertyType>("house");
  const [propertySize, setPropertySize] =
    React.useState<PropertySize>("medium");
  const [tier, setTier] = React.useState<BudgetTier>("standard");
  const [suburbId, setSuburbId] = React.useState<number | null>(null);
  const [vendorId, setVendorId] = React.useState<number | null>(null);
  const [scheduleId, setScheduleId] = React.useState<number | null>(null);
  const [lineItems, setLineItems] = React.useState<BudgetLineItem[]>([]);
  const [notes, setNotes] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [agentName, setAgentName] = React.useState("");
  const [status, setStatus] = React.useState<BudgetStatus>("draft");

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
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load reference data",
          );
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
      setNotes(editBudget.notes ?? "");
      setClientName(editBudget.clientName ?? "");
      setAgentName(editBudget.agentName ?? "");
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
      setNotes("");
      setClientName("");
      setAgentName("");
      setStatus(defaults.status);
    }
    setError(null);
  }, [isOpen, editBudget]);

  // ─── Re-resolve line items when context changes ────────
  React.useEffect(() => {
    if (lineItems.length > 0 && services.length > 0) {
      const resolved = resolveLineItems(lineItems, services, variantContext);
      const changed = resolved.some(
        (r, i) =>
          r.serviceName !== lineItems[i].serviceName ||
          r.variantName !== lineItems[i].variantName ||
          r.schedulePrice !== lineItems[i].schedulePrice,
      );
      if (changed) {
        setLineItems(resolved);
      }
    }
  }, [variantContext, services]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Dropdown options ──────────────────────────────────

  const vendorOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: "", text: "(None)" },
      ...vendors
        .filter((v) => v.isActive)
        .map((v) => ({ key: String(v.id), text: v.name })),
    ],
    [vendors],
  );

  const suburbOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: "", text: "(None)" },
      ...suburbs.map((s) => ({
        key: String(s.id),
        text: `${s.name} (Tier ${s.pricingTier})`,
      })),
    ],
    [suburbs],
  );

  const scheduleOptions: IDropdownOption[] = React.useMemo(
    () => [
      { key: "", text: "(None — start from scratch)" },
      ...schedules
        .filter((s) => s.isActive)
        .map((s) => ({ key: String(s.id), text: s.name })),
    ],
    [schedules],
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

      setPropertyType(schedule.propertyType);
      setPropertySize(schedule.propertySize);
      setTier(schedule.tier);
      if (schedule.defaultVendorId) {
        setVendorId(schedule.defaultVendorId);
      }

      const newItems: BudgetLineItem[] = schedule.lineItems.map((sli) => {
        const service = services.find((s) => s.id === sli.serviceId);
        const variant = service
          ? getServiceVariant(
              service,
              {
                propertySize: schedule.propertySize,
                suburbTier: suburbs.find((s) => s.id === suburbId)?.pricingTier,
              },
              sli.variantId,
            )
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
    [schedules, services, suburbs, suburbId],
  );

  // ─── Save ──────────────────────────────────────────────

  const handleSave = React.useCallback(async (): Promise<void> => {
    if (!address.trim()) {
      setError("Property address is required.");
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
      setError(err instanceof Error ? err.message : "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  }, [
    address,
    propertyType,
    propertySize,
    tier,
    suburbId,
    vendorId,
    scheduleId,
    lineItems,
    notes,
    clientName,
    agentName,
    status,
    editBudget,
    repository,
    onSaved,
    schedules,
  ]);

  // ─── Status transition ─────────────────────────────────

  const allowedTransitions = statusTransitions[status] ?? [];

  const handleStatusChange = React.useCallback(
    async (newStatus: BudgetStatus): Promise<void> => {
      setStatus(newStatus);
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
          setError(
            err instanceof Error ? err.message : "Failed to update status",
          );
          setStatus(status);
        } finally {
          setIsSaving(false);
        }
      }
    },
    [
      editBudget,
      address,
      propertyType,
      propertySize,
      tier,
      suburbId,
      vendorId,
      scheduleId,
      lineItems,
      notes,
      clientName,
      agentName,
      status,
      repository,
      onSaved,
    ],
  );

  return {
    services,
    isLoadingRef,
    address,
    propertyType,
    propertySize,
    tier,
    suburbId,
    vendorId,
    scheduleId,
    lineItems,
    notes,
    clientName,
    agentName,
    status,
    variantContext,
    vendorOptions,
    suburbOptions,
    scheduleOptions,
    allowedTransitions,
    isNew,
    isSaving,
    error,
    setAddress,
    setPropertyType,
    setPropertySize,
    setTier,
    setSuburbId,
    setVendorId,
    setNotes,
    setClientName,
    setAgentName,
    setLineItems,
    setError,
    applySchedule,
    handleSave,
    handleStatusChange,
  };
}
