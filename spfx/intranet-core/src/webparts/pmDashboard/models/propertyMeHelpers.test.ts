/**
 * PropertyMe helpers – Unit tests.
 */

import {
  isPropertyMeUrl,
  extractPropertyId,
  extractAddressFromSlug,
  cleanPropertyAddress,
} from "./propertyMeHelpers";

// ─── isPropertyMeUrl ────────────────────────────────────────

describe("isPropertyMeUrl", () => {
  it("accepts a valid property card URL", () => {
    expect(
      isPropertyMeUrl(
        "https://manager.propertyme.com/#/property/card/abc123",
      ),
    ).toBe(true);
  });

  it("accepts a URL with a slug after the ID", () => {
    expect(
      isPropertyMeUrl(
        "https://manager.propertyme.com/#/property/card/abc123/12-smith-st",
      ),
    ).toBe(true);
  });

  it("rejects a non-PropertyMe URL", () => {
    expect(isPropertyMeUrl("https://google.com")).toBe(false);
  });

  it("rejects a PropertyMe URL without property card path", () => {
    expect(
      isPropertyMeUrl("https://manager.propertyme.com/#/dashboard"),
    ).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isPropertyMeUrl("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(
      isPropertyMeUrl(
        "https://MANAGER.PROPERTYME.COM/#/property/card/ABC123",
      ),
    ).toBe(true);
  });
});

// ─── extractPropertyId ──────────────────────────────────────

describe("extractPropertyId", () => {
  it("extracts the property ID from a valid URL", () => {
    expect(
      extractPropertyId(
        "https://manager.propertyme.com/#/property/card/abc-123-def",
      ),
    ).toBe("abc-123-def");
  });

  it("extracts ID when a slug follows", () => {
    expect(
      extractPropertyId(
        "https://manager.propertyme.com/#/property/card/abc123/12-smith-st",
      ),
    ).toBe("abc123");
  });

  it("returns undefined for an invalid URL", () => {
    expect(extractPropertyId("https://google.com")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(extractPropertyId("")).toBeUndefined();
  });
});

// ─── extractAddressFromSlug ─────────────────────────────────

describe("extractAddressFromSlug", () => {
  it("converts a kebab-case slug to Title Case", () => {
    expect(
      extractAddressFromSlug(
        "https://manager.propertyme.com/#/property/card/abc123/12-smith-street-richmond",
      ),
    ).toBe("12 Smith Street Richmond");
  });

  it("returns undefined when there is no slug", () => {
    expect(
      extractAddressFromSlug(
        "https://manager.propertyme.com/#/property/card/abc123",
      ),
    ).toBeUndefined();
  });

  it("returns undefined for an invalid URL", () => {
    expect(extractAddressFromSlug("https://google.com")).toBeUndefined();
  });
});

// ─── cleanPropertyAddress ───────────────────────────────────

describe("cleanPropertyAddress", () => {
  it("removes suburb, state and postcode after a comma", () => {
    expect(cleanPropertyAddress("12 Smith Street, Richmond VIC 3121")).toBe(
      "12 Smith Street",
    );
  });

  it("removes parenthesised property type", () => {
    expect(cleanPropertyAddress("12 Smith Street (Residential)")).toBe(
      "12 Smith Street",
    );
  });

  it("handles both comma and parentheses", () => {
    expect(
      cleanPropertyAddress(
        "12 Smith Street, Richmond VIC 3121 (Residential)",
      ),
    ).toBe("12 Smith Street");
  });

  it("returns empty string for empty input", () => {
    expect(cleanPropertyAddress("")).toBe("");
  });

  it("returns the input unchanged when no comma or parentheses", () => {
    expect(cleanPropertyAddress("12 Smith Street")).toBe("12 Smith Street");
  });
});
