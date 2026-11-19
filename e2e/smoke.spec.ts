import { expect, test } from "@playwright/test";

test("page opens and shows the app name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("darkwindow");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("darkwindow");
});

const widths = [360, 1280] as const;

for (const width of widths) {
  test(`look at ${width}px`, async ({ page }) => {
    test.skip(
      process.platform !== "linux",
      "Screenshot baselines are Linux-only: run in CI or `npm run e2e:update`.",
    );
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(page).toHaveScreenshot(`home-${width}.png`, { fullPage: true });
  });
}
