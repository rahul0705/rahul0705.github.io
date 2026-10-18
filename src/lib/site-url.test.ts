import { afterEach, describe, expect, it, vi } from 'vitest';

import { sitePath, siteURL } from './site-url';

afterEach(() => vi.unstubAllEnvs());

describe('site URLs', () => {
  it('mounts internal paths while retaining queries, fragments, and root behavior', () => {
    expect(sitePath('/resume/?download=1#skills', '/preview/')).toBe('/preview/resume/?download=1#skills');
    expect(sitePath('/', '/preview/')).toBe('/preview/');
    expect(sitePath('/resume/', '/')).toBe('/resume/');
  });

  it.each([
    'https://other.test/page',
    '//cdn.example.test/image.png',
    'mailto:person@example.test',
    '#section',
    '../image.png',
  ])('leaves external, fragment, and relative references unchanged: %s', (path) => {
    expect(sitePath(path, '/preview/')).toBe(path);
  });

  it('keeps logical routes distinct from mounted paths when the base matches a route name', () => {
    expect(sitePath('/blog/article/', '/blog/')).toBe('/blog/blog/article/');
    expect(siteURL('/about/', { site: 'https://example.test', base: '/preview/' })).toBe(
      'https://example.test/preview/about/',
    );
  });

  it('uses the configured public origin for canonical, feed, and asset URLs', () => {
    expect(siteURL('/blog/article/', { site: 'https://example.test', base: '/preview/' })).toBe(
      'https://example.test/preview/blog/article/',
    );
    expect(siteURL('/favicon.svg', { site: 'https://example.test', base: '/' })).toBe(
      'https://example.test/favicon.svg',
    );
  });

  it.each([undefined, ''])('reports a missing Astro site setting (%s) instead of asserting it exists', (site) => {
    vi.stubEnv('SITE', site);
    expect(() => siteURL('/resume/')).toThrow('Set site in astro.config.ts');
  });
});
