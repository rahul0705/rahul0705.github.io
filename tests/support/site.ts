import { getViteConfig } from 'astro/config';

import { sitePath as mountPath } from '../../src/lib/site-url';

// Ask Astro to resolve its config, just as the Vitest configuration does.
const { define } = await getViteConfig({})({ command: 'serve', mode: 'production' });
const site: unknown = JSON.parse(define?.['import.meta.env.SITE'] ?? 'null');
const base: unknown = JSON.parse(define?.['import.meta.env.BASE_URL'] ?? 'null');
if (typeof site !== 'string' || typeof base !== 'string') {
  throw new Error('Browser tests require Astro to provide SITE and BASE_URL.');
}

export const configuredSite = new URL(`${base.replace(/\/$/, '')}/`, site);
export const sitePath = (path: string) => mountPath(path, configuredSite.pathname);
export const publicSiteURL = configuredSite.href.replace(/\/$/, '');
