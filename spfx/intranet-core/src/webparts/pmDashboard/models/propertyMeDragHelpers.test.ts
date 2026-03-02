/**
 * Tests for PropertyMe drag-and-drop helpers.
 */

import {
  decodePmDashPayload,
  extractFromDragEvent,
  mightContainPropertyMeData,
  validateExtensionMessage,
} from "./propertyMeDragHelpers";

// ─── Helper: build a mock DataTransfer ──────────────────
function createMockDataTransfer(
  dataMap: Record<string, string>,
): DataTransfer {
  const types = Object.keys(dataMap);
  return {
    types,
    getData: (type: string): string => dataMap[type] || "",
  } as unknown as DataTransfer;
}

// ─────────────────────────────────────────────────────────────
// decodePmDashPayload
// ─────────────────────────────────────────────────────────────

describe("decodePmDashPayload", () => {
  it("should decode a valid PMDASH: payload", () => {
    const payload = { url: "https://manager.propertyme.com/#/property/card/abc123", propertyId: "abc123", address: "12 Smith St" };
    const encoded = "PMDASH:" + btoa(JSON.stringify(payload));

    const result = decodePmDashPayload(encoded);

    expect(result).toEqual(payload);
  });

  it("should return undefined for non-PMDASH text", () => {
    expect(decodePmDashPayload("hello world")).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    expect(decodePmDashPayload("")).toBeUndefined();
  });

  it("should return undefined for invalid base64", () => {
    expect(decodePmDashPayload("PMDASH:!!!notbase64!!!")).toBeUndefined();
  });

  it("should return undefined for valid base64 but invalid JSON", () => {
    expect(decodePmDashPayload("PMDASH:" + btoa("not json"))).toBeUndefined();
  });

  it("should return undefined if payload lacks url", () => {
    const encoded = "PMDASH:" + btoa(JSON.stringify({ propertyId: "abc" }));
    expect(decodePmDashPayload(encoded)).toBeUndefined();
  });

  it("should return undefined if payload lacks propertyId", () => {
    const encoded = "PMDASH:" + btoa(JSON.stringify({ url: "https://example.com" }));
    expect(decodePmDashPayload(encoded)).toBeUndefined();
  });

  it("should handle payload without address", () => {
    const payload = { url: "https://manager.propertyme.com/#/property/card/xyz", propertyId: "xyz" };
    const encoded = "PMDASH:" + btoa(JSON.stringify(payload));

    const result = decodePmDashPayload(encoded);

    expect(result).toBeDefined();
    expect(result!.address).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────
// extractFromDragEvent
// ─────────────────────────────────────────────────────────────

describe("extractFromDragEvent", () => {
  const validUrl =
    "https://manager.propertyme.com/#/property/card/abc123/12-smith-street-richmond";

  it("should extract from PMDASH payload (highest priority)", () => {
    const payload = { url: validUrl, propertyId: "abc123", address: "12 Smith St, Richmond VIC 3121" };
    const dt = createMockDataTransfer({
      "text/plain": "PMDASH:" + btoa(JSON.stringify(payload)),
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.url).toBe(validUrl);
    expect(result!.propertyId).toBe("abc123");
    expect(result!.address).toBe("12 Smith St");
  });

  it("should extract from text/uri-list", () => {
    const dt = createMockDataTransfer({
      "text/uri-list": validUrl,
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.url).toBe(validUrl);
    expect(result!.propertyId).toBe("abc123");
  });

  it("should extract from text/plain containing PropertyMe URL", () => {
    const dt = createMockDataTransfer({
      "text/plain": validUrl,
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.url).toBe(validUrl);
  });

  it("should extract from text/html containing PropertyMe link", () => {
    const dt = createMockDataTransfer({
      "text/html": `<a href="${validUrl}">Property</a>`,
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.url).toBe(validUrl);
  });

  it("should return undefined for non-PropertyMe URLs", () => {
    const dt = createMockDataTransfer({
      "text/plain": "https://example.com/some-page",
    });

    expect(extractFromDragEvent(dt)).toBeUndefined();
  });

  it("should return undefined for empty data transfer", () => {
    const dt = createMockDataTransfer({});
    expect(extractFromDragEvent(dt)).toBeUndefined();
  });

  it("should skip comments in uri-list", () => {
    const dt = createMockDataTransfer({
      "text/uri-list": `# This is a comment\n${validUrl}`,
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.url).toBe(validUrl);
  });

  it("should pick first valid PropertyMe URL from uri-list", () => {
    const dt = createMockDataTransfer({
      "text/uri-list": `https://example.com\n${validUrl}\nhttps://other.com`,
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.url).toBe(validUrl);
  });

  it("should extract address from URL slug", () => {
    const dt = createMockDataTransfer({
      "text/plain": validUrl,
    });

    const result = extractFromDragEvent(dt);

    expect(result).toBeDefined();
    expect(result!.address).toBe("12 Smith Street Richmond");
  });
});

// ─────────────────────────────────────────────────────────────
// mightContainPropertyMeData
// ─────────────────────────────────────────────────────────────

describe("mightContainPropertyMeData", () => {
  it("should return true for text/plain", () => {
    const dt = createMockDataTransfer({ "text/plain": "test" });
    expect(mightContainPropertyMeData(dt)).toBe(true);
  });

  it("should return true for text/uri-list", () => {
    const dt = createMockDataTransfer({ "text/uri-list": "test" });
    expect(mightContainPropertyMeData(dt)).toBe(true);
  });

  it("should return true for text/html", () => {
    const dt = createMockDataTransfer({ "text/html": "<p>test</p>" });
    expect(mightContainPropertyMeData(dt)).toBe(true);
  });

  it("should return false for no text types", () => {
    const dt = createMockDataTransfer({ "application/json": "{}" });
    expect(mightContainPropertyMeData(dt)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// validateExtensionMessage
// ─────────────────────────────────────────────────────────────

describe("validateExtensionMessage", () => {
  it("should validate a correct extension message", () => {
    const msg = {
      source: "pmdash-extension",
      type: "PROPERTY_DROP",
      payload: {
        url: "https://manager.propertyme.com/#/property/card/abc123",
        propertyId: "abc123",
        address: "12 Smith St",
      },
    };

    const result = validateExtensionMessage(msg);

    expect(result).toBeDefined();
    expect(result!.payload.url).toBe(msg.payload.url);
    expect(result!.payload.propertyId).toBe("abc123");
    expect(result!.payload.address).toBe("12 Smith St");
  });

  it("should return undefined for wrong source", () => {
    const msg = {
      source: "other",
      type: "PROPERTY_DROP",
      payload: { url: "test", propertyId: "abc" },
    };
    expect(validateExtensionMessage(msg)).toBeUndefined();
  });

  it("should return undefined for wrong type", () => {
    const msg = {
      source: "pmdash-extension",
      type: "UNKNOWN",
      payload: { url: "test", propertyId: "abc" },
    };
    expect(validateExtensionMessage(msg)).toBeUndefined();
  });

  it("should return undefined for missing payload", () => {
    const msg = {
      source: "pmdash-extension",
      type: "PROPERTY_DROP",
    };
    expect(validateExtensionMessage(msg)).toBeUndefined();
  });

  it("should return undefined for missing url in payload", () => {
    const msg = {
      source: "pmdash-extension",
      type: "PROPERTY_DROP",
      payload: { propertyId: "abc" },
    };
    expect(validateExtensionMessage(msg)).toBeUndefined();
  });

  it("should return undefined for null input", () => {
    expect(validateExtensionMessage(null)).toBeUndefined();
  });

  it("should return undefined for non-object input", () => {
    expect(validateExtensionMessage("string")).toBeUndefined();
  });

  it("should handle payload without optional address", () => {
    const msg = {
      source: "pmdash-extension",
      type: "PROPERTY_DROP",
      payload: {
        url: "https://manager.propertyme.com/#/property/card/xyz",
        propertyId: "xyz",
      },
    };

    const result = validateExtensionMessage(msg);

    expect(result).toBeDefined();
    expect(result!.payload.address).toBeUndefined();
  });
});
