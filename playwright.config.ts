import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT ?? '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: process.env.GITHUB_ACTIONS === 'true' ? [['dot'], ['github']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node --experimental-strip-types scripts/preview-test.ts',
    reuseExistingServer: false,
    url: baseURL,
  },
});
