import {
  isoToDisplay,
  displayToIso,
  getDayOfWeek,
  compareDates,
  dateToDisplay,
  dateToIso,
  parseDisplayDate,
  todayIso,
  todayDisplay,
} from "./dateHelpers";

describe("dateHelpers", () => {
  // ─── isoToDisplay ───────────────────────────────────────
  describe("isoToDisplay", () => {
    it("converts YYYY-MM-DD to DD/MM", () => {
      expect(isoToDisplay("2026-03-02")).toBe("02/03");
    });

    it("returns empty string for empty input", () => {
      expect(isoToDisplay("")).toBe("");
      expect(isoToDisplay(undefined)).toBe("");
      expect(isoToDisplay(undefined)).toBe("");
    });

    it("returns empty string for invalid format", () => {
      expect(isoToDisplay("not-a-date")).toBe("");
    });
  });

  // ─── displayToIso ──────────────────────────────────────
  describe("displayToIso", () => {
    it("converts DD/MM/YYYY to YYYY-MM-DD", () => {
      expect(displayToIso("02/03/2026")).toBe("2026-03-02");
    });

    it("converts DD/MM to YYYY-MM-DD using current year", () => {
      const year = new Date().getFullYear();
      expect(displayToIso("15/06")).toBe(`${year}-06-15`);
    });

    it("pads single-digit day and month", () => {
      const year = new Date().getFullYear();
      expect(displayToIso("5/3")).toBe(`${year}-03-05`);
    });

    it("returns today ISO for empty input", () => {
      expect(displayToIso("")).toBe(todayIso());
      expect(displayToIso(undefined)).toBe(todayIso());
    });
  });

  // ─── getDayOfWeek ──────────────────────────────────────
  describe("getDayOfWeek", () => {
    it("returns abbreviated day name", () => {
      // 2026-03-02 is a Monday
      expect(getDayOfWeek("02/03/2026")).toBe("Mon");
    });

    it("handles DD/MM format (current year)", () => {
      const result = getDayOfWeek("01/01");
      expect(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).toContain(result);
    });

    it("returns empty string for empty input", () => {
      expect(getDayOfWeek("")).toBe("");
    });
  });

  // ─── compareDates ──────────────────────────────────────
  describe("compareDates", () => {
    it("returns negative when a < b", () => {
      expect(compareDates("01/03", "15/03")).toBeLessThan(0);
    });

    it("returns positive when a > b", () => {
      expect(compareDates("15/03", "01/03")).toBeGreaterThan(0);
    });

    it("returns 0 for equal dates", () => {
      expect(compareDates("02/03", "02/03")).toBe(0);
    });
  });

  // ─── dateToDisplay ─────────────────────────────────────
  describe("dateToDisplay", () => {
    it("converts Date to DD/MM", () => {
      expect(dateToDisplay(new Date(2026, 2, 2))).toBe("02/03");
    });

    it("pads single-digit values", () => {
      expect(dateToDisplay(new Date(2026, 0, 5))).toBe("05/01");
    });
  });

  // ─── dateToIso ─────────────────────────────────────────
  describe("dateToIso", () => {
    it("converts Date to ISO string", () => {
      expect(dateToIso(new Date(2026, 2, 2))).toBe("2026-03-02");
    });
  });

  // ─── parseDisplayDate ──────────────────────────────────
  describe("parseDisplayDate", () => {
    it("parses DD/MM/YYYY to Date", () => {
      const d = parseDisplayDate("02/03/2026");
      expect(d).toBeDefined();
      expect(d!.getDate()).toBe(2);
      expect(d!.getMonth()).toBe(2); // March = 2
      expect(d!.getFullYear()).toBe(2026);
    });

    it("returns undefined for empty input", () => {
      expect(parseDisplayDate("")).toBeUndefined();
    });
  });

  // ─── todayIso / todayDisplay ───────────────────────────
  describe("todayIso", () => {
    it("returns a string matching YYYY-MM-DD pattern", () => {
      expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("todayDisplay", () => {
    it("returns a string matching DD/MM pattern", () => {
      expect(todayDisplay()).toMatch(/^\d{2}\/\d{2}$/);
    });
  });
});
