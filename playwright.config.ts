import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT ?? '4321';
const deploymentURL = process.env.DEPLOYMENT_URL;
if (deploymentURL && new URL(deploymentURL).protocol !== 'https:') {
  throw new Error('DEPLOYMENT_URL must use HTTPS.');
}
const baseURL = deploymentURL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  ...(deploymentURL ? { testMatch: '**/deployment.spec.ts', retries: 2, workers: 1 } : {}),
  reporter: process.env.GITHUB_ACTIONS === 'true' ? [['dot'], ['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ].filter((project) => !deploymentURL || project.name === 'chromium'),
  webServer: deploymentURL
    ? undefined
    : {
        command: 'npm run preview:test',
        reuseExistingServer: false,
        url: baseURL,
      },
});
