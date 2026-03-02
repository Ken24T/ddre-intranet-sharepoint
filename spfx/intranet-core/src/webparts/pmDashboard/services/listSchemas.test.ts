/**
 * Unit tests for PM Dashboard list schemas (SP ↔ domain mappers).
 */

import {
  parseJson,
  mapDataFromSP,
  mapDataToSP,
  mapPmFromSP,
  mapPmToSP,
} from "./listSchemas";
import type { SPDataItem, SPPropertyManagerItem } from "./listSchemas";
import type { IDashboardData, IPropertyManager } from "../models/types";

// ─────────────────────────────────────────────────────────────
// parseJson
// ─────────────────────────────────────────────────────────────

describe("parseJson", () => {
  it("parses valid JSON", () => {
    expect(parseJson('["a","b"]', [])).toEqual(["a", "b"]);
  });

  it("returns fallback for undefined", () => {
    expect(parseJson(undefined, [])).toEqual([]);
  });

  it("returns fallback for empty string", () => {
    expect(parseJson("", [])).toEqual([]);
  });

  it("returns fallback for invalid JSON", () => {
    expect(parseJson("{bad", [])).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────
// mapDataFromSP / mapDataToSP
// ─────────────────────────────────────────────────────────────

describe("mapDataFromSP", () => {
  it("maps a full SP item to domain data", () => {
    const spItem: SPDataItem = {
      Id: 1,
      Title: "main",
      Vacates: JSON.stringify([{ id: "v1", pm: "KB", columns: ["15/03", "42 Smith St"], blank: false }]),
      Entries: JSON.stringify([{ id: "e1", pm: "CW", columns: ["10/03"] }]),
      Lost: "[]",
    };

    const result = mapDataFromSP(spItem);
    expect(result.vacates).toHaveLength(1);
    expect(result.vacates[0].id).toBe("v1");
    expect(result.entries).toHaveLength(1);
    expect(result.lost).toEqual([]);
  });

  it("handles missing/undefined JSON fields gracefully", () => {
    const spItem: SPDataItem = {
      Id: 1,
      Title: "main",
      Vacates: undefined as unknown as string,
      Entries: "",
      Lost: "{invalid",
    };

    const result = mapDataFromSP(spItem);
    expect(result.vacates).toEqual([]);
    expect(result.entries).toEqual([]);
    expect(result.lost).toEqual([]);
  });
});

describe("mapDataToSP", () => {
  it("serialises domain data to SP fields", () => {
    const data: IDashboardData = {
      vacates: [{ id: "v1", pm: "KB", columns: ["15/03"] }],
      entries: [],
      lost: [{ id: "l1", pm: "CW", columns: ["20/03"] }],
    };

    const result = mapDataToSP(data);
    expect(result.Title).toBe("main");
    expect(JSON.parse(result.Vacates as string)).toEqual(data.vacates);
    expect(result.Entries).toBe("[]");
    expect(JSON.parse(result.Lost as string)).toEqual(data.lost);
  });
});

// ─────────────────────────────────────────────────────────────
// mapPmFromSP / mapPmToSP
// ─────────────────────────────────────────────────────────────

describe("mapPmFromSP", () => {
  it("maps a full SP item to domain PM", () => {
    const spItem: SPPropertyManagerItem = {
      Id: 42,
      Title: "Kenneth",
      PmId: "abc-123",
      LastName: "Boyle",
      PreferredName: "Ken",
      Colour: "#abfd58",
    };

    const result = mapPmFromSP(spItem);
    expect(result.id).toBe("abc-123");
    expect(result.firstName).toBe("Kenneth");
    expect(result.lastName).toBe("Boyle");
    expect(result.preferredName).toBe("Ken");
    expect(result.color).toBe("#abfd58");
  });

  it("defaults missing fields", () => {
    const spItem: SPPropertyManagerItem = {
      Id: 1,
      Title: "Charlotte",
      PmId: "def-456",
      LastName: "",
      PreferredName: "",
      Colour: "",
    };

    const result = mapPmFromSP(spItem);
    expect(result.lastName).toBe("");
    expect(result.preferredName).toBe("");
    expect(result.color).toBe("#cccccc");
  });
});

describe("mapPmToSP", () => {
  it("maps a domain PM to SP fields", () => {
    const pm: IPropertyManager = {
      id: "abc-123",
      firstName: "Kenneth",
      lastName: "Boyle",
      preferredName: "Ken",
      color: "#abfd58",
    };

    const result = mapPmToSP(pm);
    expect(result.Title).toBe("Kenneth");
    expect(result.PmId).toBe("abc-123");
    expect(result.LastName).toBe("Boyle");
    expect(result.PreferredName).toBe("Ken");
    expect(result.Colour).toBe("#abfd58");
  });
});
