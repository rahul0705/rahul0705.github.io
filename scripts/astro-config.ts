import { validateConfig } from 'astro/config';

import config from '../astro.config.ts';

// Node-side browser tooling uses the same normalized site and base as Astro.
const { site, base } = await validateConfig(config, process.cwd(), 'dev');
export const configuredSite = new URL(`${base.replace(/\/$/, '')}/`, site);
