/**
 * Unit tests for diffChanges and summariseChanges utilities.
 */

import { diffChanges, summariseChanges } from "./diffChanges";
import type { FieldChange } from "./diffChanges";

describe("diffChanges", () => {
  it("returns empty array when objects are identical", () => {
    const obj = { name: "Acme", code: "AC", isActive: 1 };
    expect(diffChanges(obj, { ...obj })).toEqual([]);
  });

  it("detects a simple string change", () => {
    const before = { name: "Acme", code: "AC" };
    const after = { name: "Acme Corp", code: "AC" };
    const changes = diffChanges(before, after);
    expect(changes).toEqual([
      { field: "name", from: "Acme", to: "Acme Corp" },
    ]);
  });

  it("detects a numeric change", () => {
    const before = { price: 100 };
    const after = { price: 150 };
    const changes = diffChanges(before, after);
    expect(changes).toEqual([{ field: "price", from: "100", to: "150" }]);
  });

  it("detects a boolean change", () => {
    const before = { includesGst: true };
    const after = { includesGst: false };
    const changes = diffChanges(before, after);
    expect(changes).toEqual([
      { field: "includesGst", from: "true", to: "false" },
    ]);
  });

  it("detects null to value change", () => {
    const before = { notes: null };
    const after = { notes: "Some note" };
    const changes = diffChanges(
      before as unknown as Record<string, unknown>,
      after as unknown as Record<string, unknown>,
    );
    expect(changes).toEqual([
      { field: "notes", from: "\u2014", to: "Some note" },
    ]);
  });

  it("detects value to null change", () => {
    const before = { notes: "Some note" };
    const after = { notes: null };
    const changes = diffChanges(
      before as unknown as Record<string, unknown>,
      after as unknown as Record<string, unknown>,
    );
    expect(changes).toEqual([
      { field: "notes", from: "Some note", to: "\u2014" },
    ]);
  });

  it("detects multiple field changes", () => {
    const before = { name: "A", status: "draft", tier: "basic" };
    const after = { name: "B", status: "approved", tier: "basic" };
    const changes = diffChanges(before, after);
    expect(changes).toHaveLength(2);
    expect(changes.map((c) => c.field).sort()).toEqual(["name", "status"]);
  });

  it("ignores updatedAt and createdAt by default", () => {
    const before = { name: "A", updatedAt: "2026-01-01", createdAt: "2025-01-01" };
    const after = { name: "A", updatedAt: "2026-02-01", createdAt: "2025-01-01" };
    expect(diffChanges(before, after)).toEqual([]);
  });

  it("respects custom ignore set", () => {
    const before = { name: "A", internalId: 1 };
    const after = { name: "B", internalId: 2 };
    const changes = diffChanges(before, after, new Set(["internalId"]));
    expect(changes).toEqual([{ field: "name", from: "A", to: "B" }]);
  });

  it("detects changes in nested objects via JSON serialisation", () => {
    const before = { config: { theme: "light" } };
    const after = { config: { theme: "dark" } };
    const changes = diffChanges(
      before as Record<string, unknown>,
      after as Record<string, unknown>,
    );
    expect(changes).toHaveLength(1);
    expect(changes[0].field).toBe("config");
  });

  it("detects added fields", () => {
    const before: Record<string, unknown> = { name: "A" };
    const after: Record<string, unknown> = { name: "A", notes: "New" };
    const changes = diffChanges(before, after);
    expect(changes).toEqual([{ field: "notes", from: "\u2014", to: "New" }]);
  });

  it("displays arrays as item counts", () => {
    const before = { items: [1, 2] };
    const after = { items: [1, 2, 3] };
    const changes = diffChanges(
      before as Record<string, unknown>,
      after as Record<string, unknown>,
    );
    expect(changes[0].from).toBe("[2 items]");
    expect(changes[0].to).toBe("[3 items]");
  });
});

describe("summariseChanges", () => {
  it("formats a single change", () => {
    const changes: FieldChange[] = [{ field: "name", from: "A", to: "B" }];
    const result = summariseChanges('Updated vendor "Acme"', changes);
    expect(result).toContain('Updated vendor "Acme"');
    expect(result).toContain("name A \u2192 B");
  });

  it("formats multiple changes", () => {
    const changes: FieldChange[] = [
      { field: "name", from: "A", to: "B" },
      { field: "status", from: "draft", to: "approved" },
    ];
    const result = summariseChanges("Updated", changes);
    expect(result).toContain("name A \u2192 B");
    expect(result).toContain("status draft \u2192 approved");
  });

  it("truncates to maxFields", () => {
    const changes: FieldChange[] = [
      { field: "a", from: "1", to: "2" },
      { field: "b", from: "1", to: "2" },
      { field: "c", from: "1", to: "2" },
      { field: "d", from: "1", to: "2" },
      { field: "e", from: "1", to: "2" },
    ];
    const result = summariseChanges("Updated", changes, 3);
    expect(result).toContain("+2 more");
  });

  it("handles no changes gracefully", () => {
    const result = summariseChanges("Updated", []);
    expect(result).toContain("no field changes detected");
  });

  it("formats camelCase field names as spaced lowercase", () => {
    const changes: FieldChange[] = [
      { field: "propertyAddress", from: "A", to: "B" },
    ];
    const result = summariseChanges("Updated", changes);
    expect(result).toContain("property address");
  });

  it("strips trailing Id from field names", () => {
    const changes: FieldChange[] = [
      { field: "vendorId", from: "1", to: "2" },
    ];
    const result = summariseChanges("Updated", changes);
    expect(result).toContain("vendor 1 \u2192 2");
    expect(result).not.toContain("vendor id");
  });
});
