import type { APIRoute } from 'astro';

import { siteConfig } from '../config/site';

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      ...siteConfig.robotsDisallowPaths.map((path) => `Disallow: ${path}`),
      '',
      `Sitemap: ${new URL('/sitemap-index.xml', siteConfig.url).href}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
