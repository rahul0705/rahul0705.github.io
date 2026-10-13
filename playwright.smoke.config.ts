import { defineConfig } from '@playwright/test';

import config from './playwright.config';

export default defineConfig({
  ...config,
  ...(process.env.GITLAB_CI
    ? {
        reporter: [
          ['list'],
          ['junit', { outputFile: 'test-results/smoke.xml', includeProjectInTestName: true }],
          ['html', { open: 'never' }],
        ],
      }
    : {}),
  testIgnore: [],
  testMatch: '**/deployment.spec.ts',
  projects: config.projects?.filter((project) => project.name === 'chromium'),
});
