/**
 * PM Dashboard – Property Manager helper utilities.
 *
 * Functions for working with property manager users:
 * initials, colour lookup, and contrast colour calculation.
 */

import type { IPropertyManager } from "./types";

/**
 * Get two-letter uppercase initials from a property manager.
 * Uses first letter of firstName + first letter of lastName.
 */
export function getInitials(pm: IPropertyManager): string {
  const first = pm.firstName?.[0] ?? "";
  const last = pm.lastName?.[0] ?? "";
  return (first + last).toUpperCase();
}

/**
 * Find a property manager's colour by their initials.
 * Returns undefined if no matching PM is found.
 */
export function getPmColor(
  initials: string,
  propertyManagers: IPropertyManager[],
): string | undefined {
  const pm = propertyManagers.find((p) => getInitials(p) === initials);
  return pm?.color;
}

/**
 * Find a property manager by their initials.
 * Returns undefined if no matching PM is found.
 */
export function findPmByInitials(
  initials: string,
  propertyManagers: IPropertyManager[],
): IPropertyManager | undefined {
  return propertyManagers.find((p) => getInitials(p) === initials);
}

/**
 * Calculate whether to use black or white text on a given background colour.
 * Uses the W3C relative luminance formula.
 *
 * @param hexColor - A hex colour string (with or without #), e.g. "#ffc0cb"
 * @returns "#000000" for light backgrounds, "#ffffff" for dark backgrounds
 */
export function getContrastColor(hexColor: string | undefined): string {
  if (!hexColor) return "#000000";

  const color = hexColor.replace("#", "");
  if (color.length < 6) return "#000000";

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // W3C relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Generate initials options for all property managers.
 * Useful for building PM dropdown options.
 */
export function getPmInitialsOptions(
  propertyManagers: IPropertyManager[],
): Array<{ initials: string; displayName: string; color: string }> {
  return propertyManagers.map((pm) => ({
    initials: getInitials(pm),
    displayName: pm.preferredName || pm.firstName,
    color: pm.color,
  }));
}
