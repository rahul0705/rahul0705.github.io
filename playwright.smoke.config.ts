import { defineConfig } from '@playwright/test';

import config from './playwright.config';

export default defineConfig({
  ...config,
  testIgnore: [],
  testMatch: '**/deployment.spec.ts',
  projects: config.projects?.filter((project) => project.name === 'chromium'),
});
