/**
 * PropertyMe URL helpers.
 *
 * Validates and parses PropertyMe URLs to extract property IDs
 * and fallback address information from URL slugs.
 *
 * Expected URL patterns:
 *   - https://manager.propertyme.com/#/property/card/{id}
 *   - https://manager.propertyme.com/#/property/card/{id}/{slug}
 */

/**
 * Regex matching PropertyMe property card URLs.
 * Captures the property ID and an optional trailing slug.
 */
const PROPERTYME_URL_PATTERN =
  /manager\.propertyme\.com\/#\/property\/card\/([a-zA-Z0-9-]+)/i;

/**
 * Check whether a string is a valid PropertyMe property card URL.
 */
export function isPropertyMeUrl(url: string): boolean {
  return PROPERTYME_URL_PATTERN.test(url);
}

/**
 * Extract the property ID from a PropertyMe URL.
 *
 * @returns The property ID, or undefined if not a valid URL.
 */
export function extractPropertyId(url: string): string | undefined {
  const match = PROPERTYME_URL_PATTERN.exec(url);
  return match ? match[1] : undefined;
}

/**
 * Extract a human-readable address from a PropertyMe URL slug.
 *
 * PropertyMe URLs sometimes include an address slug after the ID,
 * e.g. `.../card/abc123/12-smith-street-richmond`.
 *
 * This function attempts to convert that slug into a readable address
 * as a fallback when the proxy API is unavailable.
 *
 * @returns A best-effort address string, or undefined.
 */
export function extractAddressFromSlug(url: string): string | undefined {
  // Match everything after the property ID
  const match = /property\/card\/[a-zA-Z0-9-]+\/([a-zA-Z0-9-]+)/i.exec(url);
  if (!match) return undefined;

  const slug = match[1];
  // Convert kebab-case to Title Case
  const words = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.join(" ");
}

/**
 * Clean a property address for display in the dashboard.
 *
 * Removes suburb, state, postcode, and parenthesised property type
 * suffixes. Keeps only the street address portion.
 *
 * @example
 * cleanPropertyAddress("12 Smith Street, Richmond VIC 3121")
 * // => "12 Smith Street"
 */
export function cleanPropertyAddress(fullAddress: string): string {
  if (!fullAddress) return "";

  // Remove parenthesised type like "(Residential)" or "(Commercial)"
  let cleaned = fullAddress.replace(/\s*\([^)]*\)\s*$/, "");

  // Remove everything after the first comma (suburb, state, postcode)
  const commaIndex = cleaned.indexOf(",");
  if (commaIndex > 0) {
    cleaned = cleaned.substring(0, commaIndex);
  }

  return cleaned.trim();
}
