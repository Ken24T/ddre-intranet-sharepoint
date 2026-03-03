/**
 * Unit tests for column migration (migrateColumns).
 */

import {
  migrateVacatesRow,
  migrateEntriesRow,
  migrateColumns,
  EXPECTED_VACATES_COLS,
  EXPECTED_ENTRIES_COLS,
} from "./migrateColumns";
import type { IDashboardData, IPropertyRow } from "./types";

// ─── Vacates ──────────────────────────────────────────────

describe("migrateVacatesRow", () => {
  it("should migrate an 8-column row to 5 columns", () => {
    const row: IPropertyRow = {
      id: "v1",
      pm: "KB",
      columns: ["15/03", "42 Smith St", "Y", "Y", "", "KB 15/3", "KB", "End of lease"],
    };
    const result = migrateVacatesRow(row);
    expect(result.columns).toEqual(["15/03", "42 Smith St", "KB 15/3", "KB", "End of lease"]);
    expect(result.columns.length).toBe(EXPECTED_VACATES_COLS);
  });

  it("should preserve other row properties", () => {
    const row: IPropertyRow = {
      id: "v2",
      pm: "CY",
      propertyUrl: "https://example.com",
      columns: ["15/03", "7 Chapel St", "", "", "", "", "CY", ""],
    };
    const result = migrateVacatesRow(row);
    expect(result.id).toBe("v2");
    expect(result.pm).toBe("CY");
    expect(result.propertyUrl).toBe("https://example.com");
  });

  it("should not touch a row that already has 5 columns", () => {
    const row: IPropertyRow = {
      id: "v3",
      pm: "KB",
      columns: ["15/03", "42 Smith St", "KB 15/3", "KB", "Relocating"],
    };
    const result = migrateVacatesRow(row);
    expect(result).toBe(row); // same reference — no copy
  });

  it("should skip blank rows", () => {
    const row: IPropertyRow = { id: "vb", pm: "", columns: [], blank: true };
    const result = migrateVacatesRow(row);
    expect(result).toBe(row);
  });

  it("should skip rows with empty columns array", () => {
    const row: IPropertyRow = { id: "ve", pm: "", columns: [] };
    const result = migrateVacatesRow(row);
    expect(result).toBe(row);
  });
});

// ─── Entries ──────────────────────────────────────────────

describe("migrateEntriesRow", () => {
  it("should migrate a 10-column row to 11 columns (insert Bag)", () => {
    const row: IPropertyRow = {
      id: "e1",
      pm: "KB",
      columns: ["10/03", "Tue", "Y", "Y", "", "22 Albert Rd", "", "", "KB", "New tenant"],
    };
    const result = migrateEntriesRow(row);
    expect(result.columns).toEqual([
      "10/03", "Tue", "Y", "Y", "", "22 Albert Rd", "",
      "",   // new Bag column
      "", "KB", "New tenant",
    ]);
    expect(result.columns.length).toBe(EXPECTED_ENTRIES_COLS);
  });

  it("should preserve ECR BY value during migration", () => {
    const row: IPropertyRow = {
      id: "e2",
      pm: "CW",
      columns: ["10/03", "Tue", "Y", "Y", "Y", "5/44 Barkly St", "Y", "CW 10/3", "CW", ""],
    };
    const result = migrateEntriesRow(row);
    // ECR BY was at old index 7, now at index 8
    expect(result.columns[8]).toBe("CW 10/3");
    // Bag at index 7 should be empty
    expect(result.columns[7]).toBe("");
  });

  it("should not touch a row that already has 11 columns", () => {
    const row: IPropertyRow = {
      id: "e3",
      pm: "ES",
      columns: ["14/03", "Sat", "", "", "", "91 Fitzroy St", "", "", "", "ES", "Waiting"],
    };
    const result = migrateEntriesRow(row);
    expect(result).toBe(row);
  });

  it("should skip blank rows", () => {
    const row: IPropertyRow = { id: "eb", pm: "", columns: [], blank: true };
    const result = migrateEntriesRow(row);
    expect(result).toBe(row);
  });
});

// ─── Full dataset migration ──────────────────────────────

describe("migrateColumns", () => {
  it("should migrate both sections of a dataset", () => {
    const data: IDashboardData = {
      vacates: [
        { id: "v1", pm: "KB", columns: ["15/03", "42 Smith St", "Y", "", "", "KB 15/3", "KB", "End of lease"] },
      ],
      entries: [
        { id: "e1", pm: "KB", columns: ["10/03", "Tue", "Y", "Y", "", "22 Albert Rd", "", "", "KB", "New tenant"] },
      ],
    };

    const result = migrateColumns(data);
    expect(result).not.toBe(data); // new object created
    expect(result.vacates[0].columns.length).toBe(EXPECTED_VACATES_COLS);
    expect(result.entries[0].columns.length).toBe(EXPECTED_ENTRIES_COLS);
  });

  it("should return the same reference when no migration is needed", () => {
    const data: IDashboardData = {
      vacates: [
        { id: "v1", pm: "KB", columns: ["15/03", "42 Smith St", "KB 15/3", "KB", "End of lease"] },
      ],
      entries: [
        { id: "e1", pm: "KB", columns: ["10/03", "Tue", "Y", "Y", "", "22 Albert Rd", "", "", "", "KB", ""] },
      ],
    };

    const result = migrateColumns(data);
    expect(result).toBe(data); // same reference — no change
  });

  it("should handle mixed migrated and non-migrated rows", () => {
    const data: IDashboardData = {
      vacates: [
        { id: "v1", pm: "KB", columns: ["15/03", "42 Smith St", "Y", "", "", "KB 15/3", "KB", ""] },
        { id: "vb", pm: "", columns: [], blank: true },
        { id: "v2", pm: "CY", columns: ["20/03", "7 Chapel St", "", "CY", ""] }, // already migrated
      ],
      entries: [],
    };

    const result = migrateColumns(data);
    expect(result.vacates[0].columns.length).toBe(EXPECTED_VACATES_COLS);
    expect(result.vacates[1].blank).toBe(true);
    // v2 was already correct — but since v1 changed, we get a new array
    expect(result.vacates[2].columns.length).toBe(EXPECTED_VACATES_COLS);
  });

  it("should handle empty dataset", () => {
    const data: IDashboardData = { vacates: [], entries: [] };
    const result = migrateColumns(data);
    expect(result).toBe(data);
  });
});
