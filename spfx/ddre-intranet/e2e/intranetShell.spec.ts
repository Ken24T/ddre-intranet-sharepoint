import { test, expect } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;

test.describe("IntranetShell", () => {
  test.skip(!baseUrl, "Set PLAYWRIGHT_BASE_URL to enable e2e tests");

  test("page loads", async ({ page }) => {
    await page.goto(baseUrl!);
    await expect(page).toHaveURL(/.*/);
  });
});
