import { preview } from 'astro';

// Keep the server in Playwright's process tree, including in agent environments.
await preview({ server: { host: '127.0.0.1', port: Number(process.env.PLAYWRIGHT_PORT ?? 4321) } });
