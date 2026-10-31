import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PLAYWRIGHT_PORT must be an integer between 1 and 65535");
}

export default defineConfig({
  testDir: "./tests/e2e",
  snapshotPathTemplate: "tests/golden/pages/{arg}{ext}",
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://127.0.0.1:${port}/`,
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
