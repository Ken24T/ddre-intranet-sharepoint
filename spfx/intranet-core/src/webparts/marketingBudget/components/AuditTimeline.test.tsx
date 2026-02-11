/**
 * Unit tests for AuditTimeline component.
 *
 * Verifies: loading state, empty state, entries rendering,
 * and correct data display from audit logger.
 */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuditTimeline } from "./AuditTimeline";
import type { IAuditLogger } from "../services/IAuditLogger";
import type { AuditEntry } from "../models/auditTypes";

// ─── Mock logger ────────────────────────────────────────────

const createMockLogger = (
  entries: AuditEntry[] = [],
): IAuditLogger => ({
  log: jest.fn().mockResolvedValue({} as AuditEntry),
  getByEntity: jest.fn().mockResolvedValue(entries),
  getAll: jest.fn().mockResolvedValue(entries),
  clear: jest.fn().mockResolvedValue(undefined),
});

const makeEntry = (
  overrides: Partial<AuditEntry> = {},
): AuditEntry => ({
  id: 1,
  timestamp: "2024-06-15T10:30:00Z",
  user: "admin",
  entityType: "budget",
  entityId: 42,
  entityLabel: "1 Test St",
  action: "create",
  summary: "Created budget for 1 Test St",
  before: null,
  after: "{}",
  ...overrides,
});

// ─── Tests ──────────────────────────────────────────────────

describe("AuditTimeline", () => {
  it("shows loading spinner initially", () => {
    // Logger returns a promise that never resolves
    const logger: IAuditLogger = {
      log: jest.fn(),
      getByEntity: jest.fn().mockReturnValue(new Promise(() => {})),
      getAll: jest.fn(),
      clear: jest.fn(),
    };

    render(
      <AuditTimeline
        auditLogger={logger}
        entityType="budget"
        entityId={42}
      />,
    );

    expect(screen.getByText("Loading history…")).toBeInTheDocument();
  });

  it("shows empty message when no entries exist", async () => {
    const logger = createMockLogger([]);

    render(
      <AuditTimeline
        auditLogger={logger}
        entityType="budget"
        entityId={42}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("No change history recorded yet."),
      ).toBeInTheDocument();
    });
  });

  it("renders entries with summary and user", async () => {
    const entries = [
      makeEntry({
        id: 1,
        summary: "Created budget for 1 Test St",
        user: "jdoe",
      }),
      makeEntry({
        id: 2,
        action: "statusChange",
        summary: "Status changed to approved",
        user: "admin",
        timestamp: "2024-06-16T14:00:00Z",
      }),
    ];
    const logger = createMockLogger(entries);

    render(
      <AuditTimeline
        auditLogger={logger}
        entityType="budget"
        entityId={42}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Created budget for 1 Test St"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Status changed to approved"),
    ).toBeInTheDocument();

    // Check user names appear in meta text
    expect(screen.getByText(/jdoe/)).toBeInTheDocument();
    expect(screen.getByText(/admin/)).toBeInTheDocument();
  });

  it("calls getByEntity with the correct entity type and id", async () => {
    const logger = createMockLogger([]);

    render(
      <AuditTimeline
        auditLogger={logger}
        entityType="vendor"
        entityId={7}
      />,
    );

    await waitFor(() => {
      expect(logger.getByEntity).toHaveBeenCalledWith("vendor", 7);
    });
  });

  it("renders a list role for accessibility", async () => {
    const entries = [makeEntry()];
    const logger = createMockLogger(entries);

    render(
      <AuditTimeline
        auditLogger={logger}
        entityType="budget"
        entityId={42}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("list")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("handles logger errors gracefully", async () => {
    const logger: IAuditLogger = {
      log: jest.fn(),
      getByEntity: jest.fn().mockRejectedValue(new Error("DB fail")),
      getAll: jest.fn(),
      clear: jest.fn(),
    };

    render(
      <AuditTimeline
        auditLogger={logger}
        entityType="budget"
        entityId={42}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("No change history recorded yet."),
      ).toBeInTheDocument();
    });
  });
});
