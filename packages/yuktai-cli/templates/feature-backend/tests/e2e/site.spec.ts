import { expect, test } from "@playwright/test";

// The loading screen shows once per tab; tests start after it.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("yuktai-splash", "1"));
});

test("home page: title, menu and no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("skip link moves to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});

test("data grid: search works", async ({ page }) => {
  await page.goto("/grid/");
  await page.getByRole("radio", { name: "1,000" }).check();
  await expect(page.locator(".grid-status")).toContainText("1,000 rows", { timeout: 60_000 });
  // the order id shows in the table (desktop) and in the cards (phone)
  await page.locator(".yk-grid__toolbar input").first().fill("ORD-0000042");
  await expect(page.locator(".yk-grid tbody tr, .yk-grid__card").first()).toContainText("ORD-0000042");
});

test("backend page: shows whether the Python API is running", async ({ page }) => {
  await page.goto("/backend/");
  await expect(page.locator(".api-status").first()).toContainText(/Connected|not running/, { timeout: 30_000 });
});

test("page fits a phone screen", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
