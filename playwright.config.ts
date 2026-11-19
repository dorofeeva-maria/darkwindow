import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  // One baseline set for all machines: screenshots are compared only on Linux
  // (CI, or `npm run e2e:update` in the Playwright container).
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    baseURL: `http://localhost:${port}`,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run build && npm run preview",
    port,
    reuseExistingServer: !process.env.CI,
  },
});
