/**
 * CSS Custom Properties Generator
 *
 * Generates CSS custom properties (variables) from design tokens.
 * Supports runtime injection and static CSS export.
 */

import { spacing, spacingValues, fontSize, lineHeight, fontWeight } from './index';
import { shadows, radii, zIndex, breakpoints, duration, easing } from './index';
import {
  brandColors,
  hubColors,
  semanticColors,
  neutralColors,
  neutralAliases,
  darkModeAliases,
} from './colors';

// =============================================================================
// CSS VARIABLE GENERATION
// =============================================================================

/**
 * Prefix for all DDRE CSS variables.
 */
const CSS_VAR_PREFIX = '--ddre';

/**
 * Convert camelCase to kebab-case.
 */
const toKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Generate CSS variable declarations from an object.
 */
const generateVarsFromObject = (
  obj: Record<string, string | number>,
  category: string
): Record<string, string> => {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const varName = `${CSS_VAR_PREFIX}-${category}-${toKebabCase(key)}`;
    vars[varName] = String(value);
  }
  return vars;
};

// =============================================================================
// GENERATED CSS VARIABLES
// =============================================================================

/**
 * All spacing CSS variables.
 */
export const spacingVars = generateVarsFromObject(spacing, 'space');

/**
 * All font size CSS variables.
 */
export const fontSizeVars = generateVarsFromObject(fontSize, 'font-size');

/**
 * All line height CSS variables.
 */
export const lineHeightVars = generateVarsFromObject(lineHeight, 'line-height');

/**
 * All font weight CSS variables.
 */
export const fontWeightVars = generateVarsFromObject(fontWeight, 'font-weight');

/**
 * All shadow CSS variables.
 */
export const shadowVars = generateVarsFromObject(shadows, 'shadow');

/**
 * All border radius CSS variables.
 */
export const radiiVars = generateVarsFromObject(radii, 'radius');

/**
 * All z-index CSS variables.
 */
export const zIndexVars = generateVarsFromObject(zIndex, 'z');

/**
 * All duration CSS variables.
 */
export const durationVars = generateVarsFromObject(duration, 'duration');

/**
 * All easing CSS variables.
 */
export const easingVars = generateVarsFromObject(easing, 'easing');

/**
 * All brand color CSS variables.
 */
export const brandColorVars = generateVarsFromObject(brandColors, 'color-brand');

/**
 * All semantic color CSS variables.
 */
export const semanticColorVars = generateVarsFromObject(semanticColors, 'color');

/**
 * All neutral color CSS variables.
 */
export const neutralColorVars = generateVarsFromObject(neutralColors, 'color-neutral');

/**
 * Light mode semantic aliases as CSS variables.
 */
export const lightModeVars = generateVarsFromObject(neutralAliases, 'color');

/**
 * Dark mode semantic aliases as CSS variables.
 */
export const darkModeVars = generateVarsFromObject(darkModeAliases, 'color');

// =============================================================================
// COMBINED VARIABLE SETS
// =============================================================================

/**
 * All layout-related CSS variables.
 */
export const layoutVars: Record<string, string> = {
  ...spacingVars,
  ...radiiVars,
  ...zIndexVars,
};

/**
 * All typography CSS variables.
 */
export const typographyVars: Record<string, string> = {
  ...fontSizeVars,
  ...lineHeightVars,
  ...fontWeightVars,
};

/**
 * All animation CSS variables.
 */
export const animationVars: Record<string, string> = {
  ...durationVars,
  ...easingVars,
};

/**
 * All color CSS variables (light mode).
 */
export const colorVars: Record<string, string> = {
  ...brandColorVars,
  ...semanticColorVars,
  ...neutralColorVars,
  ...lightModeVars,
};

/**
 * Complete set of all CSS variables (light mode).
 */
export const allVars: Record<string, string> = {
  ...layoutVars,
  ...typographyVars,
  ...shadowVars,
  ...animationVars,
  ...colorVars,
};

// =============================================================================
// CSS STRING GENERATION
// =============================================================================

/**
 * Convert variable object to CSS declaration string.
 */
const varsToCSS = (vars: Record<string, string>): string => {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
};

/**
 * Generate complete CSS string with :root selector.
 */
export const generateRootCSS = (vars: Record<string, string> = allVars): string => {
  return `:root {\n${varsToCSS(vars)}\n}`;
};

/**
 * Generate dark mode CSS with prefers-color-scheme media query.
 */
export const generateDarkModeCSS = (): string => {
  const darkVars = generateVarsFromObject(darkModeAliases, 'color');
  return `@media (prefers-color-scheme: dark) {\n  :root {\n${varsToCSS(darkVars).replace(/^  /gm, '    ')}\n  }\n}`;
};

/**
 * Generate CSS for a specific data-theme attribute.
 */
export const generateThemeCSS = (theme: 'light' | 'dark'): string => {
  const vars = theme === 'dark' 
    ? generateVarsFromObject(darkModeAliases, 'color')
    : generateVarsFromObject(neutralAliases, 'color');
  return `[data-theme="${theme}"] {\n${varsToCSS(vars)}\n}`;
};

/**
 * Generate complete static CSS file content.
 */
export const generateStaticCSS = (): string => {
  return `/**
 * DDRE Intranet Design Tokens
 * Auto-generated CSS custom properties.
 * DO NOT EDIT DIRECTLY - regenerate from pkg-theme.
 */

${generateRootCSS()}

/* Dark mode (system preference) */
${generateDarkModeCSS()}

/* Theme attribute overrides */
${generateThemeCSS('light')}
${generateThemeCSS('dark')}
`;
};

// =============================================================================
// RUNTIME INJECTION
// =============================================================================

/**
 * ID for the injected style element.
 */
const STYLE_ELEMENT_ID = 'ddre-theme-vars';

/**
 * Inject CSS variables into the document at runtime.
 * Safe to call multiple times - will update existing style element.
 * 
 * @param vars - Variables to inject (defaults to all variables)
 * @param target - Target document (defaults to current document)
 * @returns The style element
 */
export const injectThemeVars = (
  vars: Record<string, string> = allVars,
  target: Document = typeof document !== 'undefined' ? document : (null as unknown as Document)
): HTMLStyleElement | null => {
  // Guard for SSR/non-browser environments
  if (!target) {
    return null;
  }

  // Find or create style element
  let styleEl = target.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  
  if (!styleEl) {
    styleEl = target.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    styleEl.setAttribute('data-ddre-theme', 'true');
    target.head.appendChild(styleEl);
  }

  // Update content
  styleEl.textContent = generateRootCSS(vars);
  
  return styleEl;
};

/**
 * Remove injected theme variables from the document.
 * 
 * @param target - Target document (defaults to current document)
 */
export const removeThemeVars = (
  target: Document = typeof document !== 'undefined' ? document : (null as unknown as Document)
): void => {
  if (!target) return;
  
  const styleEl = target.getElementById(STYLE_ELEMENT_ID);
  if (styleEl) {
    styleEl.remove();
  }
};

/**
 * Update a single CSS variable at runtime.
 * 
 * @param name - Variable name (with or without -- prefix)
 * @param value - New value
 * @param target - Target element (defaults to document.documentElement)
 */
export const setThemeVar = (
  name: string,
  value: string,
  target: HTMLElement = typeof document !== 'undefined' ? document.documentElement : (null as unknown as HTMLElement)
): void => {
  if (!target) return;
  
  const varName = name.startsWith('--') ? name : `--${name}`;
  target.style.setProperty(varName, value);
};

/**
 * Get the current value of a CSS variable.
 * 
 * @param name - Variable name (with or without -- prefix)
 * @param target - Target element (defaults to document.documentElement)
 * @returns The variable value or empty string if not found
 */
export const getThemeVar = (
  name: string,
  target: HTMLElement = typeof document !== 'undefined' ? document.documentElement : (null as unknown as HTMLElement)
): string => {
  if (!target) return '';
  
  const varName = name.startsWith('--') ? name : `--${name}`;
  return getComputedStyle(target).getPropertyValue(varName).trim();
};

// =============================================================================
// HELPER FOR USING VARIABLES IN JS
// =============================================================================

/**
 * Get a CSS variable reference string for use in styles.
 * 
 * @param name - Variable name from the token system
 * @param fallback - Optional fallback value
 * @returns CSS var() function string
 * 
 * @example
 * cssVar('space-md') // returns 'var(--ddre-space-md)'
 * cssVar('color-primary', '#0078d4') // returns 'var(--ddre-color-primary, #0078d4)'
 */
export const cssVar = (name: string, fallback?: string): string => {
  const varName = name.startsWith('--') ? name : `${CSS_VAR_PREFIX}-${name}`;
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
};
