import { preview } from 'astro';

import { resolvePreviewURL } from './preview-url.ts';

const url = resolvePreviewURL();

// Keep the server in Playwright's process tree, including in agent environments.
await preview({ server: { host: url.hostname, port: Number(url.port || 80) } });
