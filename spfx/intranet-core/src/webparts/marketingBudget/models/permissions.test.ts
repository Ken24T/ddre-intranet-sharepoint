/**
 * Unit tests for permissions predicates.
 *
 * Verifies role-based access control logic across viewer, editor, and admin roles.
 */

import {
  canCreateBudget,
  canEditBudget,
  canDeleteBudget,
  canDuplicateBudget,
  canTransitionBudget,
  canManageReferenceData,
} from "../models/permissions";
import type { UserRole } from "../models/permissions";

// ─── canCreateBudget ────────────────────────────────────────

describe("canCreateBudget", () => {
  it("returns false for viewer", () => {
    expect(canCreateBudget("viewer")).toBe(false);
  });

  it("returns true for editor", () => {
    expect(canCreateBudget("editor")).toBe(true);
  });

  it("returns true for admin", () => {
    expect(canCreateBudget("admin")).toBe(true);
  });
});

// ─── canEditBudget ──────────────────────────────────────────

describe("canEditBudget", () => {
  const statuses = ["draft", "approved", "sent", "archived"];

  it("returns false for viewer regardless of status", () => {
    for (const status of statuses) {
      expect(canEditBudget("viewer", status)).toBe(false);
    }
  });

  it("returns true for editor only when status is draft", () => {
    expect(canEditBudget("editor", "draft")).toBe(true);
    expect(canEditBudget("editor", "approved")).toBe(false);
    expect(canEditBudget("editor", "sent")).toBe(false);
    expect(canEditBudget("editor", "archived")).toBe(false);
  });

  it("returns true for admin regardless of status", () => {
    for (const status of statuses) {
      expect(canEditBudget("admin", status)).toBe(true);
    }
  });
});

// ─── canDeleteBudget ────────────────────────────────────────

describe("canDeleteBudget", () => {
  it("returns false for viewer", () => {
    expect(canDeleteBudget("viewer")).toBe(false);
  });

  it("returns true for editor", () => {
    expect(canDeleteBudget("editor")).toBe(true);
  });

  it("returns true for admin", () => {
    expect(canDeleteBudget("admin")).toBe(true);
  });
});

// ─── canDuplicateBudget ─────────────────────────────────────

describe("canDuplicateBudget", () => {
  it("returns false for viewer", () => {
    expect(canDuplicateBudget("viewer")).toBe(false);
  });

  it("returns true for editor", () => {
    expect(canDuplicateBudget("editor")).toBe(true);
  });

  it("returns true for admin", () => {
    expect(canDuplicateBudget("admin")).toBe(true);
  });
});

// ─── canTransitionBudget ────────────────────────────────────

describe("canTransitionBudget", () => {
  it("returns false for viewer", () => {
    expect(canTransitionBudget("viewer")).toBe(false);
  });

  it("returns false for editor", () => {
    expect(canTransitionBudget("editor")).toBe(false);
  });

  it("returns true for admin", () => {
    expect(canTransitionBudget("admin")).toBe(true);
  });
});

// ─── canManageReferenceData ─────────────────────────────────

describe("canManageReferenceData", () => {
  it("returns false for viewer", () => {
    expect(canManageReferenceData("viewer")).toBe(false);
  });

  it("returns false for editor", () => {
    expect(canManageReferenceData("editor")).toBe(false);
  });

  it("returns true for admin", () => {
    expect(canManageReferenceData("admin")).toBe(true);
  });
});

// ─── Exhaustive role coverage ───────────────────────────────

describe("permission matrix", () => {
  const roles: UserRole[] = ["viewer", "editor", "admin"];

  it("only admin can transition budgets", () => {
    const result = roles.filter(canTransitionBudget);
    expect(result).toEqual(["admin"]);
  });

  it("only admin can manage reference data", () => {
    const result = roles.filter(canManageReferenceData);
    expect(result).toEqual(["admin"]);
  });

  it("editor and admin can create budgets", () => {
    const result = roles.filter(canCreateBudget);
    expect(result).toEqual(["editor", "admin"]);
  });

  it("editor and admin can duplicate budgets", () => {
    const result = roles.filter(canDuplicateBudget);
    expect(result).toEqual(["editor", "admin"]);
  });

  it("editor and admin can delete budgets", () => {
    const result = roles.filter(canDeleteBudget);
    expect(result).toEqual(["editor", "admin"]);
  });
});
