import type { IPropertyRow, IDashboardData } from "./types";
import {
  createPropertyRow,
  createBlankRow,
  insertRow,
  removeRow,
  reorderRows,
  reorderByDate,
  updateDateFromDragPosition,
  updateRowColumns,
  updateCell,
  updateRowPm,
  updateRowPropertyUrl,
  validateAndCleanData,
  sanitisePastedText,
} from "./rowOperations";

// ─── Test Fixtures ────────────────────────────────────────
function makeRow(id: string, date: string, pm: string = "KB", blank?: boolean): IPropertyRow {
  if (blank) return { id, pm: "", columns: [], blank: true };
  return {
    id,
    pm,
    columns: [date, "123 Test St", "", "", "", "", pm, ""],
  };
}

function makeEntriesRow(id: string, date: string, pm: string = "KB"): IPropertyRow {
  return {
    id,
    pm,
    columns: [date, "Mon", "", "", "", "123 Test St", "", "", pm, ""],
  };
}

describe("rowOperations", () => {
  // ─── createPropertyRow ──────────────────────────────────
  describe("createPropertyRow", () => {
    it("creates a vacates row with date and PM", () => {
      const row = createPropertyRow("vacates", "KB", "15/03");
      expect(row.id).toBeTruthy();
      expect(row.pm).toBe("KB");
      expect(row.columns[0]).toBe("15/03");
      expect(row.columns[6]).toBe("KB"); // PM column
      expect(row.columns).toHaveLength(8);
    });

    it("creates an entries row with auto-calculated Day", () => {
      const row = createPropertyRow("entries", "SD", "02/03");
      expect(row.columns[0]).toBe("02/03");
      expect(row.columns[1]).toBeTruthy(); // Day should be calculated
      expect(row.columns[8]).toBe("SD"); // PM column
      expect(row.columns).toHaveLength(10);
    });

    it("uses today's date when no date is provided", () => {
      const row = createPropertyRow("vacates", "KB");
      expect(row.columns[0]).toMatch(/^\d{2}\/\d{2}$/);
    });
  });

  // ─── createBlankRow ─────────────────────────────────────
  describe("createBlankRow", () => {
    it("creates a blank spacer row", () => {
      const row = createBlankRow();
      expect(row.id).toBeTruthy();
      expect(row.blank).toBe(true);
      expect(row.columns).toHaveLength(0);
    });
  });

  // ─── insertRow ──────────────────────────────────────────
  describe("insertRow", () => {
    const existing: IPropertyRow[] = [
      makeRow("a", "01/03"),
      makeRow("b", "02/03"),
    ];

    it("inserts after a specified row", () => {
      const newRow = makeRow("c", "03/03");
      const result = insertRow(existing, newRow, "a");
      expect(result).toHaveLength(3);
      expect(result[1].id).toBe("c");
    });

    it("appends when afterRowId is not found", () => {
      const newRow = makeRow("c", "03/03");
      const result = insertRow(existing, newRow, "nonexistent");
      expect(result).toHaveLength(3);
      expect(result[2].id).toBe("c");
    });

    it("appends when afterRowId is undefined", () => {
      const newRow = makeRow("c", "03/03");
      const result = insertRow(existing, newRow);
      expect(result).toHaveLength(3);
      expect(result[2].id).toBe("c");
    });

    it("does not mutate the original array", () => {
      const newRow = makeRow("c", "03/03");
      const result = insertRow(existing, newRow, "a");
      expect(existing).toHaveLength(2);
      expect(result).toHaveLength(3);
    });
  });

  // ─── removeRow ──────────────────────────────────────────
  describe("removeRow", () => {
    it("removes a row by ID", () => {
      const rows = [makeRow("a", "01/03"), makeRow("b", "02/03")];
      const result = removeRow(rows, "a");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("b");
    });

    it("returns the same array if ID is not found", () => {
      const rows = [makeRow("a", "01/03")];
      const result = removeRow(rows, "nonexistent");
      expect(result).toHaveLength(1);
    });
  });

  // ─── reorderRows ───────────────────────────────────────
  describe("reorderRows", () => {
    it("reorders rows according to new ID order", () => {
      const rows = [makeRow("a", "01/03"), makeRow("b", "02/03"), makeRow("c", "03/03")];
      const result = reorderRows(rows, ["c", "a", "b"]);
      expect(result.map((r) => r.id)).toEqual(["c", "a", "b"]);
    });

    it("skips missing IDs", () => {
      const rows = [makeRow("a", "01/03"), makeRow("b", "02/03")];
      const result = reorderRows(rows, ["b", "missing", "a"]);
      expect(result.map((r) => r.id)).toEqual(["b", "a"]);
    });
  });

  // ─── reorderByDate ─────────────────────────────────────
  describe("reorderByDate", () => {
    it("moves a row to after the last row with the same date", () => {
      const rows = [
        makeRow("a", "01/03"),
        makeRow("b", "01/03"),
        makeRow("c", "02/03"),
        makeRow("d", "02/03"),
      ];
      // Move row "a" to date "02/03" — should go after "d"
      const result = reorderByDate(rows, "a", "02/03");
      expect(result.map((r) => r.id)).toEqual(["b", "c", "d", "a"]);
    });

    it("places row chronologically when no matching date exists", () => {
      const rows = [
        makeRow("a", "01/03"),
        makeRow("b", "03/03"),
      ];
      // Move row "b" to date "02/03" — should go between a and b
      const result = reorderByDate(rows, "b", "02/03");
      expect(result[0].id).toBe("a");
      expect(result[1].id).toBe("b");
    });

    it("returns unchanged array for unknown row ID", () => {
      const rows = [makeRow("a", "01/03")];
      const result = reorderByDate(rows, "missing", "01/03");
      expect(result).toBe(rows);
    });
  });

  // ─── updateDateFromDragPosition ────────────────────────
  describe("updateDateFromDragPosition", () => {
    it("updates date when dragged to a different date group", () => {
      const rows = [
        makeRow("a", "01/03"),
        makeRow("dragged", "01/03"),
        makeRow("c", "02/03"),
      ];
      const result = updateDateFromDragPosition(rows, "dragged", "vacates");
      // dragged is between "01/03" and "02/03" — should pick "02/03" (after neighbour)
      // Actually index 1, after=index 2 has "02/03" which differs
      expect(result[1].columns[0]).toBe("02/03");
    });

    it("updates Day column for entries section", () => {
      const rows = [
        makeEntriesRow("a", "01/03"),
        makeEntriesRow("dragged", "01/03"),
        makeEntriesRow("c", "02/03"),
      ];
      const result = updateDateFromDragPosition(rows, "dragged", "entries");
      expect(result[1].columns[0]).toBe("02/03");
      expect(result[1].columns[1]).toBeTruthy(); // Day column should be recalculated
    });

    it("returns unchanged when no different date found nearby", () => {
      const rows = [
        makeRow("a", "01/03"),
        makeRow("dragged", "01/03"),
        makeRow("c", "01/03"),
      ];
      const result = updateDateFromDragPosition(rows, "dragged", "vacates");
      expect(result[1].columns[0]).toBe("01/03");
    });

    it("skips blank rows", () => {
      const rows = [
        makeRow("a", "01/03"),
        makeRow("dragged", "01/03"),
        makeRow("blank1", "", "", true),
      ];
      const result = updateDateFromDragPosition(rows, "dragged", "vacates");
      // No non-blank neighbour with different date → unchanged
      expect(result[1].columns[0]).toBe("01/03");
    });
  });

  // ─── updateRowColumns ──────────────────────────────────
  describe("updateRowColumns", () => {
    it("replaces a row's columns", () => {
      const rows = [makeRow("a", "01/03")];
      const newCols = ["01/03", "New Address", "SD", "", "", "", "Y", "Moving"];
      const result = updateRowColumns(rows, "a", newCols);
      expect(result[0].columns).toEqual(newCols);
      expect(result[0].columns).not.toBe(newCols); // Should be a copy
    });
  });

  // ─── updateCell ─────────────────────────────────────────
  describe("updateCell", () => {
    it("updates a single cell value", () => {
      const rows = [makeRow("a", "01/03")];
      const result = updateCell(rows, "a", 1, "456 New St");
      expect(result[0].columns[1]).toBe("456 New St");
      expect(result[0].columns[0]).toBe("01/03"); // Other columns unchanged
    });
  });

  // ─── updateRowPm ────────────────────────────────────────
  describe("updateRowPm", () => {
    it("updates both the pm field and PM column", () => {
      const rows = [makeRow("a", "01/03", "KB")];
      const result = updateRowPm(rows, "a", "vacates", "SD");
      expect(result[0].pm).toBe("SD");
      expect(result[0].columns[6]).toBe("SD"); // PM column in vacates
    });
  });

  // ─── updateRowPropertyUrl ──────────────────────────────
  describe("updateRowPropertyUrl", () => {
    it("sets the propertyUrl on a row", () => {
      const rows = [makeRow("a", "01/03")];
      const result = updateRowPropertyUrl(rows, "a", "https://app.propertyme.com/property/123");
      expect(result[0].propertyUrl).toBe("https://app.propertyme.com/property/123");
    });
  });

  // ─── validateAndCleanData ──────────────────────────────
  describe("validateAndCleanData", () => {
    it("removes null and undefined rows", () => {
      const data: IDashboardData = {
        vacates: [makeRow("a", "01/03"), null as unknown as IPropertyRow, makeRow("b", "02/03")],
        entries: [undefined as unknown as IPropertyRow],
      };
      const result = validateAndCleanData(data);
      expect(result.vacates).toHaveLength(2);
      expect(result.entries).toHaveLength(0);
    });

    it("removes rows without an ID", () => {
      const data: IDashboardData = {
        vacates: [{ id: "", pm: "KB", columns: ["01/03"] } as IPropertyRow],
        entries: [],
      };
      const result = validateAndCleanData(data);
      expect(result.vacates).toHaveLength(0);
    });
  });

  // ─── sanitisePastedText ────────────────────────────────
  describe("sanitisePastedText", () => {
    it("strips HTML tags", () => {
      expect(sanitisePastedText("<b>bold</b> text")).toBe("bold text");
    });

    it("normalises whitespace", () => {
      expect(sanitisePastedText("  hello   world  ")).toBe("hello world");
    });

    it("handles combined HTML and whitespace", () => {
      expect(sanitisePastedText("<p>  test  </p>")).toBe("test");
    });
  });
});
