import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: process.env.GITHUB_ACTIONS === 'true' ? [['dot'], ['github']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:4321',
  },
});
