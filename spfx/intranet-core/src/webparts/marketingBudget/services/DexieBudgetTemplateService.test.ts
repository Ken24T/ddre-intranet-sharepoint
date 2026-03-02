/**
 * Unit tests for DexieBudgetTemplateService.
 *
 * Mocks the Dexie database to verify template CRUD operations.
 */

import type { BudgetTemplate } from "../models/types";

// ─── Mock Dexie table ───────────────────────────────────────

const mockTable = {
  orderBy: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const mockChain = {
  reverse: jest.fn().mockReturnThis(),
  toArray: jest.fn(),
};

mockTable.orderBy.mockReturnValue(mockChain);

jest.mock("./db", () => ({
  db: {
    budgetTemplates: mockTable,
  },
}));

import { DexieBudgetTemplateService } from "./DexieBudgetTemplateService";

// ─── Helpers ────────────────────────────────────────────────

const makeTemplate = (overrides?: Partial<BudgetTemplate>): BudgetTemplate => ({
  id: 1,
  name: "Standard Photography",
  description: "Basic photo package",
  propertyType: "house",
  propertySize: "medium",
  tier: "standard",
  lineItems: [
    {
      serviceId: 1,
      serviceName: "Photography",
      variantId: "8-photos",
      variantName: "8 Photos",
      isSelected: true,
      savedPrice: 330,
      overridePrice: null,
      isOverridden: false,
    },
  ],
  createdAt: "2024-06-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
  ...overrides,
});

// ─── Tests ──────────────────────────────────────────────────

describe("DexieBudgetTemplateService", () => {
  let service: DexieBudgetTemplateService;

  beforeEach(() => {
    service = new DexieBudgetTemplateService();
    jest.clearAllMocks();
    mockTable.orderBy.mockReturnValue(mockChain);
  });

  describe("getTemplates", () => {
    it("returns templates ordered by createdAt descending", async () => {
      const templates = [makeTemplate({ id: 2 }), makeTemplate({ id: 1 })];
      mockChain.toArray.mockResolvedValue(templates);

      const result = await service.getTemplates();

      expect(mockTable.orderBy).toHaveBeenCalledWith("createdAt");
      expect(mockChain.reverse).toHaveBeenCalled();
      expect(result).toEqual(templates);
    });

    it("returns empty array when no templates exist", async () => {
      mockChain.toArray.mockResolvedValue([]);

      const result = await service.getTemplates();

      expect(result).toEqual([]);
    });
  });

  describe("getTemplate", () => {
    it("returns a template by ID", async () => {
      const template = makeTemplate();
      mockTable.get.mockResolvedValue(template);

      const result = await service.getTemplate(1);

      expect(mockTable.get).toHaveBeenCalledWith(1);
      expect(result).toEqual(template);
    });

    it("returns undefined for non-existent ID", async () => {
      mockTable.get.mockResolvedValue(undefined);

      const result = await service.getTemplate(999);

      expect(result).toBeUndefined();
    });
  });

  describe("saveTemplate", () => {
    it("saves a new template with timestamps", async () => {
      const template = makeTemplate({ id: undefined, createdAt: "", updatedAt: "" });
      mockTable.put.mockResolvedValue(42);

      const result = await service.saveTemplate(template);

      expect(mockTable.put).toHaveBeenCalled();
      const saved = mockTable.put.mock.calls[0][0] as BudgetTemplate;
      expect(saved.createdAt).toBeTruthy();
      expect(saved.updatedAt).toBeTruthy();
      expect(result.id).toBe(42);
    });

    it("preserves existing createdAt on update", async () => {
      const template = makeTemplate({ createdAt: "2024-01-01T00:00:00Z" });
      mockTable.put.mockResolvedValue(1);

      const result = await service.saveTemplate(template);

      const saved = mockTable.put.mock.calls[0][0] as BudgetTemplate;
      expect(saved.createdAt).toBe("2024-01-01T00:00:00Z");
      expect(result.id).toBe(1);
    });
  });

  describe("deleteTemplate", () => {
    it("deletes a template by ID", async () => {
      mockTable.delete.mockResolvedValue(undefined);

      await service.deleteTemplate(5);

      expect(mockTable.delete).toHaveBeenCalledWith(5);
    });
  });
});
