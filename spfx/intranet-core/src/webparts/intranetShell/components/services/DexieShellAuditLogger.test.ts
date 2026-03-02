/**
 * Unit tests for DexieShellAuditLogger.
 *
 * Since IndexedDB is not available in Node/Jest, we mock the
 * shellAuditDb module and verify that the logger calls the
 * correct Dexie operations.
 */

// Must be before imports — @rushstack/hoist-jest-mock
const mockAdd = jest.fn().mockResolvedValue(1);
jest.mock("./shellAuditDb", () => ({
  shellAuditDb: {
    events: {
      add: mockAdd,
    },
  },
}));

import { DexieShellAuditLogger } from "./DexieShellAuditLogger";

describe("DexieShellAuditLogger", () => {
  beforeEach(() => {
    mockAdd.mockClear();
  });

  it("generates a session ID on construction", () => {
    const logger = new DexieShellAuditLogger();
    const sessionId = logger.getSessionId();
    expect(sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("is enabled by default", () => {
    const logger = new DexieShellAuditLogger();
    expect(logger.isEnabled()).toBe(true);
  });

  it("can be disabled and re-enabled", () => {
    const logger = new DexieShellAuditLogger();
    logger.setEnabled(false);
    expect(logger.isEnabled()).toBe(false);
    logger.setEnabled(true);
    expect(logger.isEnabled()).toBe(true);
  });

  it("writes navigation events to Dexie", () => {
    const logger = new DexieShellAuditLogger("user@test.com", "Test User", "1.0.0");
    logger.logNavigation("hub_changed", { hub: "sales" });

    expect(mockAdd).toHaveBeenCalledTimes(1);
    const entry = mockAdd.mock.calls[0][0];
    expect(entry.eventType).toBe("navigation");
    expect(entry.action).toBe("hub_changed");
    expect(entry.hub).toBe("sales");
    expect(entry.userId).toBe("user@test.com");
    expect(entry.userDisplayName).toBe("Test User");
    expect(entry.appVersion).toBe("1.0.0");
  });

  it("writes card_action events to Dexie", () => {
    const logger = new DexieShellAuditLogger();
    logger.logCardAction("card_opened", {
      hub: "sales",
      tool: "marketing-budget",
    });

    const entry = mockAdd.mock.calls[0][0];
    expect(entry.eventType).toBe("card_action");
    expect(entry.action).toBe("card_opened");
    expect(entry.tool).toBe("marketing-budget");
  });

  it("writes user_interaction events with metadata", () => {
    const logger = new DexieShellAuditLogger();
    logger.logUserInteraction("chat_message_sent", {
      metadata: { message: "hello" },
    });

    const entry = mockAdd.mock.calls[0][0];
    expect(entry.eventType).toBe("user_interaction");
    expect(entry.metadata).toEqual({ message: "hello" });
  });

  it("writes help_search events", () => {
    const logger = new DexieShellAuditLogger();
    logger.logHelpSearch("search_executed", {
      metadata: { query: "how to", resultCount: 3 },
    });

    const entry = mockAdd.mock.calls[0][0];
    expect(entry.eventType).toBe("help_search");
    expect(entry.action).toBe("search_executed");
  });

  it("does not write when disabled", () => {
    const logger = new DexieShellAuditLogger();
    logger.setEnabled(false);
    logger.logNavigation("hub_changed");

    expect(mockAdd).not.toHaveBeenCalled();
  });

  it("includes a UUID eventId on each entry", () => {
    const logger = new DexieShellAuditLogger();
    logger.logSystem("app_loaded");

    const entry = mockAdd.mock.calls[0][0];
    expect(entry.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("includes an ISO timestamp on each entry", () => {
    const logger = new DexieShellAuditLogger();
    logger.logError("javascript_error");

    const entry = mockAdd.mock.calls[0][0];
    expect(() => new Date(entry.timestamp)).not.toThrow();
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("writes all 10 event types", () => {
    const logger = new DexieShellAuditLogger();
    logger.logNavigation("hub_changed");
    logger.logCardAction("card_opened");
    logger.logSettings("theme_changed");
    logger.logContentView("document_opened");
    logger.logSearch("search_executed");
    logger.logUserInteraction("chat_started");
    logger.logNotification("notification_received");
    logger.logSystem("app_loaded");
    logger.logError("javascript_error");
    logger.logHelpSearch("search_executed");

    expect(mockAdd).toHaveBeenCalledTimes(10);
    const types = mockAdd.mock.calls.map(
      (c: unknown[]) => (c[0] as { eventType: string }).eventType,
    );
    expect(types).toEqual([
      "navigation",
      "card_action",
      "settings",
      "content_view",
      "search",
      "user_interaction",
      "notification",
      "system",
      "error",
      "help_search",
    ]);
  });
});
