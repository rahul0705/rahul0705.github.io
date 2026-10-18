import { fileURLToPath } from 'node:url';

import { validateConfig } from 'astro/config';
import { loadConfigFromFile } from 'vite';

// Bundle explicitly so config imports keep Vite resolution even if its default loader changes.
const loaded = await loadConfigFromFile(
  { command: 'serve', mode: 'production' },
  fileURLToPath(new URL('../astro.config.ts', import.meta.url)),
  undefined,
  undefined,
  undefined,
  'bundle',
);
if (!loaded) throw new Error('Unable to load astro.config.ts for browser testing.');

const { site, base } = await validateConfig(loaded.config, process.cwd(), 'dev');
export const configuredSite = new URL(`${base.replace(/\/$/, '')}/`, site);
