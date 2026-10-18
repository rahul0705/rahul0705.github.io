import { defineConfig, devices } from '@playwright/test';

import { configuredSite } from './scripts/astro-config';
import { resolvePreviewURL } from './scripts/preview-url';

const deploymentURL = process.env.DEPLOYMENT_URL;
const baseURL = resolvePreviewURL(process.env, configuredSite.pathname).href;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  testIgnore: ['**/deployment.spec.ts'],
  ...(deploymentURL ? { testMatch: '**/deployment.spec.ts', retries: 2, workers: 1 } : {}),
  reporter: process.env.GITLAB_CI
    ? [
        ['list'],
        ['junit', { outputFile: 'test-results/browser.xml', includeProjectInTestName: true }],
        ['html', { open: 'never' }],
      ]
    : process.env.GITHUB_ACTIONS === 'true'
      ? [['dot'], ['github'], ['html', { open: 'never' }]]
      : 'list',
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
