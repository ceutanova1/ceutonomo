import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/production",
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: "line",
  timeout: 30_000,
  use: {
    baseURL: process.env.CEUTONOMO_PRODUCTION_URL ?? "https://ceutonomo.vercel.app",
    trace: "on-first-retry",
  },
  projects: [
    { name: "production-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
