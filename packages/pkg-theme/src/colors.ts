/**
 * DDRE Intranet Color System
 *
 * Centralized color definitions for consistent branding across all SPFx solutions.
 */

// =============================================================================
// BRAND COLORS
// =============================================================================

/**
 * Primary brand colors.
 * These define the core DDRE (Doug Disher Real Estate) identity.
 */
export const brandColors = {
  /** DDRE Blue - main brand colour for primary actions, links, headers */
  primary: '#001CAD',
  /** Darker variant - used for hover states */
  primaryDark: '#001589',
  /** Light Blue - used for backgrounds, highlights, panels */
  primaryLight: '#EEF2F8',
  /** Eggshell - used for page backgrounds, cards */
  eggshell: '#F6F6F6',
  /** Accent color - used for secondary emphasis */
  accent: '#001CAD',
} as const;

// =============================================================================
// HUB COLORS
// =============================================================================

/**
 * Hub-specific color definitions.
 * Each hub has a gradient for hero banners and an accent for UI elements.
 */
export interface HubColor {
  /** CSS gradient for hero banners */
  gradient: string;
  /** Solid accent color for buttons, icons */
  accent: string;
}

/**
 * Hub color map.
 * Keys match the hub identifiers used in navigation.
 */
export const hubColors: Record<string, HubColor> = {
  home: {
    gradient: 'linear-gradient(135deg, #001CAD 0%, #001589 100%)',
    accent: '#001CAD',
  },
  library: {
    gradient: 'linear-gradient(135deg, #107c10 0%, #0b5c0b 100%)',
    accent: '#107c10',
  },
  administration: {
    gradient: 'linear-gradient(135deg, #5c2d91 0%, #3b1d5c 100%)',
    accent: '#5c2d91',
  },
  office: {
    gradient: 'linear-gradient(135deg, #008575 0%, #005a4e 100%)',
    accent: '#008575',
  },
  'property-management': {
    gradient: 'linear-gradient(135deg, #c239b3 0%, #8a1a7a 100%)',
    accent: '#c239b3',
  },
  sales: {
    gradient: 'linear-gradient(135deg, #ca5010 0%, #8e3a0b 100%)',
    accent: '#ca5010',
  },
} as const;

/**
 * Get hub color with fallback to home.
 * @param hubKey - The hub identifier
 * @returns Hub color object with gradient and accent
 */
export const getHubColor = (hubKey: string): HubColor => {
  return hubColors[hubKey] || hubColors.home;
};

/**
 * Get all available hub keys.
 * @returns Array of hub identifiers
 */
export const getHubKeys = (): string[] => {
  return Object.keys(hubColors);
};

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

/**
 * Semantic colors for status and feedback.
 * Use these for consistent meaning across the application.
 */
export const semanticColors = {
  /** Success states, confirmations, positive indicators */
  success: '#107c10',
  /** Warning states, caution indicators */
  warning: '#ffb900',
  /** Error states, destructive actions, alerts */
  error: '#d13438',
  /** Informational states, neutral highlights */
  info: '#0078d4',
} as const;

/**
 * Semantic color variants for different use cases.
 */
export const semanticColorVariants = {
  success: {
    base: '#107c10',
    dark: '#0b5c0b',
    light: '#dff6dd',
    text: '#107c10',
  },
  warning: {
    base: '#ffb900',
    dark: '#c59600',
    light: '#fff4ce',
    text: '#835b00',
  },
  error: {
    base: '#d13438',
    dark: '#a4262c',
    light: '#fde7e9',
    text: '#d13438',
  },
  info: {
    base: '#0078d4',
    dark: '#005a9e',
    light: '#cce4f6',
    text: '#0078d4',
  },
} as const;

// =============================================================================
// NEUTRAL COLORS
// =============================================================================

/**
 * Neutral color palette.
 * Aligned with Fluent UI neutral colors.
 */
export const neutralColors = {
  /** Pure white */
  white: '#ffffff',
  /** Very light gray - alternate backgrounds */
  gray10: '#faf9f8',
  /** Light gray - subtle backgrounds */
  gray20: '#f3f2f1',
  /** Light gray - borders, dividers */
  gray30: '#edebe9',
  /** Medium light gray */
  gray40: '#e1dfdd',
  /** Medium gray */
  gray50: '#d0d0d0',
  /** Medium gray - disabled states */
  gray60: '#c8c6c4',
  /** Dark gray - secondary text */
  gray90: '#a19f9d',
  /** Dark gray - primary text on light bg */
  gray130: '#605e5c',
  /** Very dark gray */
  gray150: '#3b3a39',
  /** Near black - headings */
  gray160: '#323130',
  /** Very dark - high contrast */
  gray180: '#201f1e',
  /** Pure black */
  black: '#000000',
} as const;

/**
 * Semantic neutral aliases for common use cases.
 */
export const neutralAliases = {
  /** Default background color */
  background: neutralColors.white,
  /** Secondary/alternate background */
  backgroundAlt: neutralColors.gray10,
  /** Surface color (cards, panels) */
  surface: neutralColors.white,
  /** Border color */
  border: neutralColors.gray30,
  /** Divider color */
  divider: neutralColors.gray30,
  /** Primary text color */
  textPrimary: neutralColors.gray160,
  /** Secondary text color */
  textSecondary: neutralColors.gray130,
  /** Disabled text color */
  textDisabled: neutralColors.gray90,
  /** Placeholder text color */
  textPlaceholder: neutralColors.gray90,
} as const;

// =============================================================================
// DARK MODE COLORS
// =============================================================================

/**
 * Dark mode neutral aliases.
 * Use with theme switching.
 */
export const darkModeAliases = {
  /** Dark mode background */
  background: neutralColors.gray180,
  /** Dark mode alternate background */
  backgroundAlt: neutralColors.gray160,
  /** Dark mode surface */
  surface: neutralColors.gray160,
  /** Dark mode border */
  border: neutralColors.gray150,
  /** Dark mode divider */
  divider: neutralColors.gray150,
  /** Dark mode primary text */
  textPrimary: neutralColors.white,
  /** Dark mode secondary text */
  textSecondary: neutralColors.gray60,
  /** Dark mode disabled text */
  textDisabled: neutralColors.gray90,
  /** Dark mode placeholder text */
  textPlaceholder: neutralColors.gray90,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type BrandColors = typeof brandColors;
export type SemanticColors = typeof semanticColors;
export type NeutralColors = typeof neutralColors;
export type HubColorKey = keyof typeof hubColors;
