/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/lib/resume-coverage.ts'],
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
