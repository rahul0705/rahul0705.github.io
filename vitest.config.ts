/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    reporters: process.env.GITLAB_CI
      ? ['default', ['junit', { outputFile: 'test-results/unit.xml' }]]
      : process.env.GITHUB_ACTIONS === 'true'
        ? ['default', 'github-actions']
        : ['default'],
    include: ['*.test.ts', 'src/**/*.test.ts', 'scripts/**/*.test.ts', 'tests/support/**/*.test.ts'],
    setupFiles: ['./test-support/content-collections.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: process.env.GITLAB_CI
        ? ['text', 'html', ['cobertura', { projectRoot: process.env.CI_PROJECT_DIR ?? process.cwd() }]]
        : ['text', 'html'],
    },
  },
});
