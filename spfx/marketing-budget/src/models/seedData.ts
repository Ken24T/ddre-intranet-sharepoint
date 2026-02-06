/**
 * Seed Data — reference data for the Marketing Budget app.
 *
 * Ported from the standalone PWA's `db/sample-data.js`.
 * All prices include GST. Variants, suburb tiers, and schedule
 * templates match the production data the Sales team already uses.
 *
 * The `getSeedData()` function returns a typed `Partial<DataExport>`
 * compatible with `IBudgetRepository.seedData()`.
 */

import type {
  Vendor,
  Service,
  Suburb,
  Schedule,
  DataExport,
} from './types';

// ─────────────────────────────────────────────────────────────
// Vendors
// ─────────────────────────────────────────────────────────────

const vendors: Vendor[] = [
  {
    id: 1,
    name: 'Mountford Media',
    shortCode: 'MM',
    contactEmail: 'info@mountfordmedia.com.au',
    isActive: 1,
  },
  {
    id: 2,
    name: 'Urban Angles',
    shortCode: 'UA',
    contactEmail: 'info@urbanangles.com.au',
    isActive: 1,
  },
];

// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────

const services: Service[] = [
  // ── Mountford Media ──────────────────────────────────────
  {
    id: 1,
    name: 'Photography (Mountford)',
    category: 'photography',
    vendorId: 1,
    variantSelector: 'manual',
    variants: [
      { id: '4-photos', name: '4 Photos', basePrice: 220.0 },
      { id: '8-photos', name: '8 Photos', basePrice: 330.0 },
      { id: '12-photos', name: '12 Photos', basePrice: 440.0 },
      { id: '16-photos', name: '16 Photos', basePrice: 550.0 },
      {
        id: 'package-12',
        name: 'Package (12 Photos + Floor Plan)',
        basePrice: 550.0,
        includedServices: [
          {
            serviceId: 2,
            serviceName: 'Floor Plan (Mountford)',
            variantId: 'medium',
            variantName: 'Medium (150-250m²)',
          },
        ],
      },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 2,
    name: 'Floor Plan (Mountford)',
    category: 'floorPlans',
    vendorId: 1,
    variantSelector: 'propertySize',
    variants: [
      { id: 'small', name: 'Small (< 150m²)', basePrice: 150.0, sizeMatch: 'small' },
      { id: 'medium', name: 'Medium (150-250m²)', basePrice: 180.0, sizeMatch: 'medium' },
      { id: 'large', name: 'Large (> 250m²)', basePrice: 220.0, sizeMatch: 'large' },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 3,
    name: 'Dusk Photography',
    category: 'photography',
    vendorId: 1,
    variantSelector: null,
    variants: [{ id: 'default', name: 'Standard', basePrice: 165.0 }],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 4,
    name: 'Aerial Photography',
    category: 'aerial',
    vendorId: 1,
    variantSelector: 'manual',
    variants: [
      { id: '3-photos', name: '3 Photos', basePrice: 130.0 },
      { id: '5-photos', name: '5 Photos', basePrice: 180.0 },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 5,
    name: 'Video Walk-Through',
    category: 'video',
    vendorId: 1,
    variantSelector: null,
    variants: [{ id: 'default', name: 'Standard', basePrice: 350.0 }],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 6,
    name: '360° Virtual Tour',
    category: 'video',
    vendorId: 1,
    variantSelector: null,
    variants: [{ id: 'default', name: 'Standard', basePrice: 165.0 }],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 7,
    name: 'Virtual Furniture',
    category: 'virtualStaging',
    vendorId: 1,
    variantSelector: 'manual',
    variants: [
      { id: '1-room', name: '1 Room', basePrice: 55.0 },
      { id: '2-rooms', name: '2 Rooms', basePrice: 99.0 },
      { id: '3-rooms', name: '3 Rooms', basePrice: 132.0 },
    ],
    includesGst: true,
    isActive: 1,
  },

  // ── Urban Angles ─────────────────────────────────────────
  {
    id: 8,
    name: 'Photography (Urban Angles)',
    category: 'photography',
    vendorId: 2,
    variantSelector: 'manual',
    variants: [
      { id: '4-photos', name: '4 Photos', basePrice: 198.0 },
      { id: '8-photos', name: '8 Photos', basePrice: 297.0 },
      { id: '12-photos', name: '12 Photos', basePrice: 396.0 },
      { id: '16-photos', name: '16 Photos', basePrice: 495.0 },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 9,
    name: 'Floor Plan (Urban Angles)',
    category: 'floorPlans',
    vendorId: 2,
    variantSelector: 'propertySize',
    variants: [
      { id: 'small', name: 'Small (< 150m²)', basePrice: 140.0, sizeMatch: 'small' },
      { id: 'medium', name: 'Medium (150-250m²)', basePrice: 170.0, sizeMatch: 'medium' },
      { id: 'large', name: 'Large (> 250m²)', basePrice: 200.0, sizeMatch: 'large' },
    ],
    includesGst: true,
    isActive: 1,
  },

  // ── Internet Listings ────────────────────────────────────
  {
    id: 10,
    name: 'REA Premiere',
    category: 'internet',
    vendorId: null,
    variantSelector: 'suburbTier',
    variants: [
      { id: 'tier-a', name: 'Tier A Suburbs', basePrice: 3699.0, tierMatch: 'A' },
      { id: 'tier-b', name: 'Tier B Suburbs', basePrice: 3519.0, tierMatch: 'B' },
      { id: 'tier-c', name: 'Tier C Suburbs', basePrice: 3199.0, tierMatch: 'C' },
      { id: 'tier-d', name: 'Tier D Suburbs', basePrice: 2929.0, tierMatch: 'D' },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 11,
    name: 'REA Highlight',
    category: 'internet',
    vendorId: null,
    variantSelector: 'suburbTier',
    variants: [
      { id: 'tier-a', name: 'Tier A Suburbs', basePrice: 1759.0, tierMatch: 'A' },
      { id: 'tier-b', name: 'Tier B Suburbs', basePrice: 1599.0, tierMatch: 'B' },
      { id: 'tier-c', name: 'Tier C Suburbs', basePrice: 1449.0, tierMatch: 'C' },
      { id: 'tier-d', name: 'Tier D Suburbs', basePrice: 1299.0, tierMatch: 'D' },
    ],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 12,
    name: 'Domain',
    category: 'internet',
    vendorId: null,
    variantSelector: null,
    variants: [{ id: 'default', name: 'Standard Listing', basePrice: 349.0 }],
    includesGst: true,
    isActive: 1,
  },

  // ── Legal / Admin ────────────────────────────────────────
  {
    id: 13,
    name: 'Title Search',
    category: 'legal',
    vendorId: null,
    variantSelector: null,
    variants: [{ id: 'default', name: 'Standard', basePrice: 25.0 }],
    includesGst: true,
    isActive: 1,
  },
  {
    id: 14,
    name: 'Disclosure Statement',
    category: 'legal',
    vendorId: null,
    variantSelector: null,
    variants: [{ id: 'default', name: 'Standard', basePrice: 35.0 }],
    includesGst: true,
    isActive: 1,
  },

  // ── Print ────────────────────────────────────────────────
  {
    id: 15,
    name: 'Property Brochure',
    category: 'print',
    vendorId: null,
    variantSelector: 'manual',
    variants: [
      { id: 'dl-50', name: 'DL Flyer (50)', basePrice: 85.0 },
      { id: 'dl-100', name: 'DL Flyer (100)', basePrice: 120.0 },
      { id: 'a4-25', name: 'A4 Brochure (25)', basePrice: 150.0 },
      { id: 'a4-50', name: 'A4 Brochure (50)', basePrice: 220.0 },
    ],
    includesGst: true,
    isActive: 1,
  },
];

// ─────────────────────────────────────────────────────────────
// Suburbs
// ─────────────────────────────────────────────────────────────

const suburbs: Suburb[] = [
  { id: 1, name: 'Bardon', pricingTier: 'A' },
  { id: 2, name: 'Milton', pricingTier: 'A' },
  { id: 3, name: 'St Lucia', pricingTier: 'A' },
  { id: 4, name: 'Auchenflower', pricingTier: 'A' },
  { id: 5, name: 'Toowong', pricingTier: 'A' },
  { id: 6, name: 'Indooroopilly', pricingTier: 'B' },
  { id: 7, name: 'Taringa', pricingTier: 'B' },
  { id: 8, name: 'Fig Tree Pocket', pricingTier: 'B' },
  { id: 9, name: 'Chapel Hill', pricingTier: 'D' },
  { id: 10, name: 'Kenmore', pricingTier: 'D' },
];

// ─────────────────────────────────────────────────────────────
// Schedules (Budget Templates)
// ─────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const schedules: Schedule[] = [
  {
    id: 1,
    name: 'House - Large - Premium',
    propertyType: 'house',
    propertySize: 'large',
    tier: 'premium',
    defaultVendorId: 1,
    lineItems: [
      { serviceId: 1, variantId: '12-photos', isSelected: true },
      { serviceId: 2, variantId: 'large', isSelected: true },
      { serviceId: 3, variantId: 'default', isSelected: true },
      { serviceId: 4, variantId: '5-photos', isSelected: true },
      { serviceId: 5, variantId: 'default', isSelected: true },
      { serviceId: 10, variantId: null, isSelected: true },
    ],
    createdAt: now,
    updatedAt: now,
    isActive: 1,
  },
  {
    id: 2,
    name: 'House - Medium - Standard',
    propertyType: 'house',
    propertySize: 'medium',
    tier: 'standard',
    defaultVendorId: 1,
    lineItems: [
      { serviceId: 1, variantId: '8-photos', isSelected: true },
      { serviceId: 2, variantId: 'medium', isSelected: true },
      { serviceId: 11, variantId: null, isSelected: true },
    ],
    createdAt: now,
    updatedAt: now,
    isActive: 1,
  },
  {
    id: 3,
    name: 'Unit - Small - Basic',
    propertyType: 'unit',
    propertySize: 'small',
    tier: 'basic',
    defaultVendorId: 2,
    lineItems: [
      { serviceId: 8, variantId: '4-photos', isSelected: true },
      { serviceId: 9, variantId: 'small', isSelected: true },
      { serviceId: 12, variantId: 'default', isSelected: true },
    ],
    createdAt: now,
    updatedAt: now,
    isActive: 1,
  },
];

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/** Return a fresh copy of the seed data suitable for `IBudgetRepository.seedData()`. */
export function getSeedData(): Partial<DataExport> {
  // Return deep copies so callers can't mutate the module-level arrays.
  return JSON.parse(JSON.stringify({ vendors, services, suburbs, schedules })) as Partial<DataExport>;
}

/** Reference counts for display / verification. */
export const SEED_COUNTS = {
  vendors: vendors.length,
  services: services.length,
  suburbs: suburbs.length,
  schedules: schedules.length,
} as const;
