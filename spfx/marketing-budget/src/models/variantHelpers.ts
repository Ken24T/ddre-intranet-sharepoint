/**
 * Service Variant Helpers
 *
 * Pure functions for resolving the correct service variant based on
 * context (property size, suburb tier) or explicit user selection.
 *
 * Ported from: app-marketing-budget/src/js/db/variant-helpers.js
 */

/* eslint-disable @rushstack/no-new-null */

import type { Service, ServiceVariant, VariantContext } from './types';

const DEFAULT_VARIANT: ServiceVariant = {
  id: 'default',
  name: 'Standard',
  basePrice: 0,
};

/**
 * Get the appropriate variant for a service based on context.
 *
 * Resolution order:
 * 1. Explicitly selected variant (by ID)
 * 2. Auto-match by variantSelector (propertySize → sizeMatch, suburbTier → tierMatch)
 * 3. First variant in the list
 * 4. Fallback default (price $0)
 */
export function getServiceVariant(
  service: Service,
  context: VariantContext = {},
  selectedVariantId?: string | null
): ServiceVariant {
  const variants = service.variants ?? [];
  if (variants.length === 0) {
    return DEFAULT_VARIANT;
  }

  // Explicit selection
  if (selectedVariantId) {
    const selected = variants.find((v) => v.id === selectedVariantId);
    if (selected) return selected;
  }

  // Auto-select based on selector type
  const selector = service.variantSelector;

  if (selector === 'propertySize' && context.propertySize) {
    const match = variants.find((v) => v.sizeMatch === context.propertySize);
    if (match) return match;
  }

  if (selector === 'suburbTier' && context.suburbTier) {
    const match = variants.find((v) => v.tierMatch === context.suburbTier);
    if (match) return match;
  }

  // Fallback to first
  return variants[0];
}

/**
 * Get the resolved price for a service variant.
 */
export function getVariantPrice(
  service: Service,
  context: VariantContext = {},
  variantId?: string | null
): number {
  const variant = getServiceVariant(service, context, variantId);
  return variant.basePrice ?? 0;
}

/**
 * True if the service has multiple variants that the user can choose manually.
 */
export function hasSelectableVariants(service: Service): boolean {
  return (
    !!service.variants &&
    service.variants.length > 1 &&
    service.variantSelector === 'manual'
  );
}

/**
 * True if the service auto-selects a variant based on property/suburb context.
 */
export function hasAutoVariants(service: Service): boolean {
  return (
    !!service.variantSelector &&
    service.variantSelector !== 'manual' &&
    !!service.variants &&
    service.variants.length > 1
  );
}
