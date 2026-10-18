import { preview } from 'astro';

import { configuredSite } from './astro-config.ts';
import { resolvePreviewURL } from './preview-url.ts';

const url = resolvePreviewURL(process.env, configuredSite.pathname);

// Keep the server in Playwright's process tree, including in agent environments.
await preview({ server: { host: url.hostname, port: Number(url.port || 80) } });
