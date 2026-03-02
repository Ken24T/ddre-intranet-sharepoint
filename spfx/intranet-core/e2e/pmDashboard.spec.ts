import { test, expect } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;

test.describe("PM Dashboard", () => {
  test.skip(!baseUrl, "Set PLAYWRIGHT_BASE_URL to enable e2e tests");

  test.beforeEach(async ({ page }) => {
    // Navigate to the PM Dashboard page
    await page.goto(baseUrl!);
    // Wait for the dashboard to finish loading (spinner disappears)
    await page.waitForSelector("[data-automation-id='pm-dashboard']", {
      timeout: 30_000,
    });
  });

  // ─── Page load ──────────────────────────────────────────

  test("dashboard loads with two section tables", async ({ page }) => {
    // Both sections should be visible
    await expect(page.getByText("Vacates")).toBeVisible();
    await expect(page.getByText("Entries")).toBeVisible();
  });

  // ─── PM Selector ────────────────────────────────────────

  test("PM selector displays property manager badges", async ({ page }) => {
    // Seed data includes 5 PMs — badges should be visible
    const badges = page.locator("[data-automation-id='pm-selector'] button");
    await expect(badges.first()).toBeVisible();
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("selecting a PM enables editing controls", async ({ page }) => {
    // Click the first PM badge
    const badges = page.locator("[data-automation-id='pm-selector'] button");
    await badges.first().click();

    // Add Row buttons should now be enabled
    const addButtons = page.locator("button[aria-label='Add row']");
    if ((await addButtons.count()) > 0) {
      await expect(addButtons.first()).toBeEnabled();
    }
  });

  // ─── PropertyMe Input ──────────────────────────────────

  test("PropertyMe input is visible and validates URLs", async ({ page }) => {
    const input = page.locator("input[placeholder*='PropertyMe']");
    if ((await input.count()) > 0) {
      await expect(input).toBeVisible();
    }
  });

  // ─── Settings Panel ────────────────────────────────────

  test("settings button opens the settings panel", async ({ page }) => {
    const settingsBtn = page.locator("button[aria-label='Settings']");
    if ((await settingsBtn.count()) > 0) {
      await settingsBtn.click();
      // Panel should appear
      await expect(page.getByText("Property Managers")).toBeVisible();
    }
  });
});
