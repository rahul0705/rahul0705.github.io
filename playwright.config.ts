import { defineConfig, devices } from '@playwright/test';

import { resolvePreviewURL } from './tests/support/preview-url';
import { configuredSite } from './tests/support/site';

const deploymentURL = process.env.DEPLOYMENT_URL;
const previewURL = resolvePreviewURL(process.env, configuredSite.pathname);
const baseURL = previewURL.href;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  testMatch: '**/*.spec.ts',
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
        // Keep this preview in Playwright's process tree without reusing or replacing a developer session.
        command: `npm run preview -- --ignore-lock --host 127.0.0.1 --port ${previewURL.port || 80}`,
        reuseExistingServer: false,
        url: baseURL,
      },
});
