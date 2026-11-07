// Browser tests: npm run test:e2e
// Install the browser once:  npx playwright install chromium
// The Testing Agent (npm run agent:test) runs these too and explains failures.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  // starts the site (without the Python API) unless it is already running
  webServer: { command: "npm run dev -- --no-api", url: "http://localhost:3000", reuseExistingServer: true, timeout: 180_000 },
});
