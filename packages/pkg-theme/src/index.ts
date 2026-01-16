/**
 * DDRE Intranet Design Tokens
 *
 * Shared design tokens for consistent styling across all SPFx solutions.
 */

// =============================================================================
// COLOR EXPORTS
// =============================================================================

export {
  brandColors,
  hubColors,
  getHubColor,
  getHubKeys,
  semanticColors,
  semanticColorVariants,
  neutralColors,
  neutralAliases,
  darkModeAliases,
} from './colors';

export type {
  HubColor,
  BrandColors,
  SemanticColors,
  NeutralColors,
  HubColorKey,
} from './colors';

// =============================================================================
// CSS VARIABLES EXPORTS
// =============================================================================

export {
  // Variable objects
  spacingVars,
  fontSizeVars,
  lineHeightVars,
  fontWeightVars,
  shadowVars,
  radiiVars,
  zIndexVars,
  durationVars,
  easingVars,
  brandColorVars,
  semanticColorVars,
  neutralColorVars,
  lightModeVars,
  darkModeVars,
  // Combined sets
  layoutVars,
  typographyVars,
  animationVars,
  colorVars,
  allVars,
  // CSS generation
  generateRootCSS,
  generateDarkModeCSS,
  generateThemeCSS,
  generateStaticCSS,
  // Runtime injection
  injectThemeVars,
  removeThemeVars,
  setThemeVar,
  getThemeVar,
  // Helper
  cssVar,
} from './css-variables';

// =============================================================================
// SPACING
// =============================================================================

/**
 * Spacing scale based on 4px base unit.
 * Use for margins, padding, and gaps.
 */
export const spacing = {
  /** 4px */
  xs: "4px",
  /** 8px */
  sm: "8px",
  /** 16px */
  md: "16px",
  /** 24px */
  lg: "24px",
  /** 32px */
  xl: "32px",
  /** 48px */
  xxl: "48px",
} as const;

/** Numeric spacing values for calculations */
export const spacingValues = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Font size scale aligned with Fluent UI.
 */
export const fontSize = {
  /** 10px - Caption, metadata */
  xs: "10px",
  /** 12px - Small text, labels */
  sm: "12px",
  /** 14px - Body text (default) */
  md: "14px",
  /** 16px - Emphasized body */
  lg: "16px",
  /** 20px - Heading 4 */
  xl: "20px",
  /** 24px - Heading 3 */
  xxl: "24px",
  /** 28px - Heading 2 */
  xxxl: "28px",
  /** 32px - Heading 1 */
  display: "32px",
} as const;

/**
 * Line height scale.
 */
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

/**
 * Font weight scale.
 */
export const fontWeight = {
  regular: 400,
  semibold: 600,
  bold: 700,
} as const;

// =============================================================================
// SHADOWS / ELEVATION
// =============================================================================

/**
 * Shadow scale for elevation levels.
 * Aligned with Fluent UI depth levels.
 */
export const shadows = {
  /** No shadow */
  none: "none",
  /** Subtle lift - cards at rest */
  card: "0 1.6px 3.6px 0 rgba(0, 0, 0, 0.132), 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.108)",
  /** Hover state elevation */
  cardHover:
    "0 3.2px 7.2px 0 rgba(0, 0, 0, 0.132), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.108)",
  /** Dropdowns, popovers */
  dropdown:
    "0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)",
  /** Modals, dialogs */
  modal:
    "0 25.6px 57.6px 0 rgba(0, 0, 0, 0.22), 0 4.8px 14.4px 0 rgba(0, 0, 0, 0.18)",
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

/**
 * Border radius scale.
 */
export const radii = {
  /** No rounding */
  none: "0",
  /** 2px - Subtle rounding */
  sm: "2px",
  /** 4px - Default rounding */
  md: "4px",
  /** 8px - Prominent rounding */
  lg: "8px",
  /** 50% - Circular */
  full: "50%",
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

/**
 * Z-index scale for layering.
 * SPFx runs inside SharePoint, so avoid extremely high values.
 */
export const zIndex = {
  /** Below content */
  behind: -1,
  /** Default layer */
  base: 0,
  /** Sticky headers, floating elements */
  sticky: 100,
  /** Dropdowns, popovers */
  dropdown: 200,
  /** Overlays, backdrops */
  overlay: 300,
  /** Modals, dialogs */
  modal: 400,
  /** Tooltips, toasts */
  tooltip: 500,
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints.
 * Use with CSS media queries or JS matchMedia.
 */
export const breakpoints = {
  /** 320px - Small mobile */
  xs: 320,
  /** 480px - Mobile */
  sm: 480,
  /** 768px - Tablet */
  md: 768,
  /** 1024px - Desktop */
  lg: 1024,
  /** 1366px - Large desktop */
  xl: 1366,
  /** 1920px - Extra large */
  xxl: 1920,
} as const;

/**
 * Media query strings for use in CSS-in-JS.
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`,
} as const;

// =============================================================================
// TRANSITIONS
// =============================================================================

/**
 * Transition duration scale.
 */
export const duration = {
  /** 100ms - Micro-interactions */
  fast: "100ms",
  /** 200ms - Default transitions */
  normal: "200ms",
  /** 300ms - Deliberate animations */
  slow: "300ms",
} as const;

/**
 * Easing functions.
 */
export const easing = {
  /** Standard easing for most transitions */
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Enter/appear animations */
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  /** Exit/leave animations */
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
} as const;
