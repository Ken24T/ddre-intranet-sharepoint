import type { IPropertyManager } from "./types";
import {
  getInitials,
  getPmColor,
  findPmByInitials,
  getContrastColor,
  getPmInitialsOptions,
} from "./pmHelpers";

const mockPms: IPropertyManager[] = [
  { id: "1", firstName: "Ken", lastName: "Boyle", preferredName: "Ken", color: "#ffc0cb" },
  { id: "2", firstName: "Sarah", lastName: "Disher", preferredName: "Sarah", color: "#001CAD" },
  { id: "3", firstName: "Alex", lastName: "Wong", preferredName: "", color: "#228B22" },
];

describe("pmHelpers", () => {
  // ─── getInitials ────────────────────────────────────────
  describe("getInitials", () => {
    it("returns uppercase two-letter initials", () => {
      expect(getInitials(mockPms[0])).toBe("KB");
      expect(getInitials(mockPms[1])).toBe("SD");
      expect(getInitials(mockPms[2])).toBe("AW");
    });

    it("handles missing name fields gracefully", () => {
      const pm: IPropertyManager = {
        id: "x",
        firstName: "",
        lastName: "",
        preferredName: "",
        color: "#000",
      };
      expect(getInitials(pm)).toBe("");
    });
  });

  // ─── getPmColor ─────────────────────────────────────────
  describe("getPmColor", () => {
    it("returns the colour for matching initials", () => {
      expect(getPmColor("KB", mockPms)).toBe("#ffc0cb");
      expect(getPmColor("SD", mockPms)).toBe("#001CAD");
    });

    it("returns undefined for unknown initials", () => {
      expect(getPmColor("XX", mockPms)).toBeUndefined();
    });
  });

  // ─── findPmByInitials ──────────────────────────────────
  describe("findPmByInitials", () => {
    it("finds the matching PM", () => {
      expect(findPmByInitials("AW", mockPms)).toBe(mockPms[2]);
    });

    it("returns undefined when no match", () => {
      expect(findPmByInitials("ZZ", mockPms)).toBeUndefined();
    });
  });

  // ─── getContrastColor ──────────────────────────────────
  describe("getContrastColor", () => {
    it("returns black for light backgrounds", () => {
      expect(getContrastColor("#ffffff")).toBe("#000000");
      expect(getContrastColor("#ffc0cb")).toBe("#000000"); // pink
    });

    it("returns white for dark backgrounds", () => {
      expect(getContrastColor("#000000")).toBe("#ffffff");
      expect(getContrastColor("#001CAD")).toBe("#ffffff"); // DDRE Blue
    });

    it("handles undefined/empty input", () => {
      expect(getContrastColor(undefined)).toBe("#000000");
      expect(getContrastColor("")).toBe("#000000");
    });

    it("handles hex without # prefix", () => {
      expect(getContrastColor("ffffff")).toBe("#000000");
      expect(getContrastColor("000000")).toBe("#ffffff");
    });
  });

  // ─── getPmInitialsOptions ──────────────────────────────
  describe("getPmInitialsOptions", () => {
    it("returns options with initials, display name, and colour", () => {
      const options = getPmInitialsOptions(mockPms);
      expect(options).toHaveLength(3);
      expect(options[0]).toEqual({
        initials: "KB",
        displayName: "Ken",
        color: "#ffc0cb",
      });
    });

    it("falls back to firstName when preferredName is empty", () => {
      const options = getPmInitialsOptions(mockPms);
      expect(options[2].displayName).toBe("Alex");
    });
  });
});
