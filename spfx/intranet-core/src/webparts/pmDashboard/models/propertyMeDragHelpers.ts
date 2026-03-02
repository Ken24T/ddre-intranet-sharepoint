/**
 * PropertyMe drag-and-drop helpers.
 *
 * Pure functions for extracting property data from HTML5 drag
 * events and decoding the custom PMDASH: payload format used
 * by the PropertyMe browser extension.
 */

import { isPropertyMeUrl, extractPropertyId, extractAddressFromSlug, cleanPropertyAddress } from "./propertyMeHelpers";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Payload sent by the PropertyMe browser extension.
 * Encoded as base64 JSON prefixed with `PMDASH:`.
 */
export interface IPmDashPayload {
  url: string;
  propertyId: string;
  address?: string;
}

/**
 * Result of extracting property data from a drag event or
 * extension message. Mirrors IPropertyMeInputResult.
 */
export interface IPropertyMeDropResult {
  /** The full PropertyMe URL. */
  url: string;
  /** The extracted property ID. */
  propertyId: string;
  /** The best-effort property address. */
  address: string;
}

/**
 * Message posted from the PropertyMe browser extension via
 * `window.postMessage`.
 */
export interface IExtensionMessage {
  source: "pmdash-extension";
  type: "PROPERTY_DROP";
  payload: IPmDashPayload;
}

// ─────────────────────────────────────────────────────────────
// PMDASH: payload
// ─────────────────────────────────────────────────────────────

/**
 * Decode a `PMDASH:` prefixed base64 payload.
 *
 * The browser extension encodes property data as:
 *   `PMDASH:<base64 JSON>`
 *
 * @returns The decoded payload, or undefined if invalid.
 */
export function decodePmDashPayload(text: string): IPmDashPayload | undefined {
  if (!text || !text.startsWith("PMDASH:")) return undefined;

  try {
    const base64 = text.substring(7); // Strip "PMDASH:" prefix
    const json = atob(base64);
    const parsed = JSON.parse(json) as Partial<IPmDashPayload>;

    // Validate required fields
    if (typeof parsed.url !== "string" || typeof parsed.propertyId !== "string") {
      return undefined;
    }

    return {
      url: parsed.url,
      propertyId: parsed.propertyId,
      address: typeof parsed.address === "string" ? parsed.address : undefined,
    };
  } catch {
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────
// URL extraction from drag data
// ─────────────────────────────────────────────────────────────

/**
 * Extract a PropertyMe URL from various drag data formats.
 *
 * Checks the following sources in priority order:
 * 1. `text/plain` starting with `PMDASH:` (browser extension)
 * 2. `text/uri-list` (standard URL drag)
 * 3. `text/plain` containing a PropertyMe URL
 * 4. `text/html` containing a PropertyMe link
 *
 * @returns A drop result, or undefined if no valid PropertyMe data.
 */
export function extractFromDragEvent(
  dataTransfer: DataTransfer,
): IPropertyMeDropResult | undefined {
  // 1. PMDASH: extension payload (highest priority)
  const plainText = dataTransfer.getData("text/plain");
  if (plainText && plainText.startsWith("PMDASH:")) {
    const payload = decodePmDashPayload(plainText);
    if (payload) {
      return {
        url: payload.url,
        propertyId: payload.propertyId,
        address: payload.address
          ? cleanPropertyAddress(payload.address)
          : "",
      };
    }
  }

  // 2. text/uri-list (standard URL drag from address bar or bookmark)
  const uriList = dataTransfer.getData("text/uri-list");
  if (uriList) {
    const urls = uriList
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    for (const url of urls) {
      const result = tryExtractFromUrl(url);
      if (result) return result;
    }
  }

  // 3. text/plain containing a PropertyMe URL
  if (plainText) {
    const result = tryExtractFromUrl(plainText.trim());
    if (result) return result;
  }

  // 4. text/html containing a PropertyMe link
  const html = dataTransfer.getData("text/html");
  if (html) {
    const urlFromHtml = extractUrlFromHtml(html);
    if (urlFromHtml) {
      const result = tryExtractFromUrl(urlFromHtml);
      if (result) return result;
    }
  }

  return undefined;
}

/**
 * Attempt to build a drop result from a single URL string.
 *
 * @returns A drop result if the URL is a valid PropertyMe URL.
 */
function tryExtractFromUrl(url: string): IPropertyMeDropResult | undefined {
  if (!isPropertyMeUrl(url)) return undefined;

  const propertyId = extractPropertyId(url);
  if (!propertyId) return undefined;

  const slugAddress = extractAddressFromSlug(url);
  const address = slugAddress ? cleanPropertyAddress(slugAddress) : "";

  return { url, propertyId, address };
}

/**
 * Extract a PropertyMe URL from an HTML string.
 *
 * Looks for `<a href="...">` elements with PropertyMe URLs.
 */
function extractUrlFromHtml(html: string): string | undefined {
  const hrefPattern =
    /href=["']?(https?:\/\/manager\.propertyme\.com\/#\/property\/card\/[^"'\s>]+)["']?/i;
  const match = hrefPattern.exec(html);
  return match ? match[1] : undefined;
}

// ─────────────────────────────────────────────────────────────
// Drag event sniffing
// ─────────────────────────────────────────────────────────────

/**
 * Check whether a drag event *might* contain PropertyMe data.
 *
 * Uses a heuristic: if drag types include text data formats,
 * there's a chance it contains a PropertyMe URL. We can't read
 * the actual values during dragover (browsers restrict this for
 * security), so we accept the drag and verify on drop.
 */
export function mightContainPropertyMeData(
  dataTransfer: DataTransfer,
): boolean {
  const types = Array.from(dataTransfer.types);
  return (
    types.indexOf("text/plain") >= 0 ||
    types.indexOf("text/uri-list") >= 0 ||
    types.indexOf("text/html") >= 0
  );
}

// ─────────────────────────────────────────────────────────────
// Extension message validation
// ─────────────────────────────────────────────────────────────

/**
 * Validate whether a postMessage event contains a valid
 * PropertyMe extension message.
 *
 * @returns The validated message, or undefined.
 */
export function validateExtensionMessage(
  data: unknown,
): IExtensionMessage | undefined {
  if (!data || typeof data !== "object") return undefined;

  const msg = data as Record<string, unknown>;

  if (msg.source !== "pmdash-extension") return undefined;
  if (msg.type !== "PROPERTY_DROP") return undefined;

  const payload = msg.payload as Record<string, unknown> | undefined;
  if (!payload || typeof payload !== "object") return undefined;
  if (typeof payload.url !== "string" || typeof payload.propertyId !== "string") {
    return undefined;
  }

  return {
    source: "pmdash-extension",
    type: "PROPERTY_DROP",
    payload: {
      url: payload.url as string,
      propertyId: payload.propertyId as string,
      address: typeof payload.address === "string" ? payload.address as string : undefined,
    },
  };
}
