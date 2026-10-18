import { describe, expect, it } from 'vitest';

import { resolvePreviewURL } from './preview-url';

describe('browser preview URL', () => {
  it('defaults to the local Astro preview target', () => {
    expect(resolvePreviewURL({}).href).toBe('http://127.0.0.1:4321/');
  });

  it('uses the requested local port for both URL and server settings', () => {
    const url = resolvePreviewURL({ PLAYWRIGHT_PORT: '5432' });
    expect(url.href).toBe('http://127.0.0.1:5432/');
    expect(url.hostname).toBe('127.0.0.1');
    expect(url.port).toBe('5432');
    expect(url.origin).toBe('http://127.0.0.1:5432');
  });

  it('uses the deployment URL independently of the local port and preserves its path', () => {
    const url = resolvePreviewURL({
      DEPLOYMENT_URL: 'https://preview.example.test:8443/site/',
      PLAYWRIGHT_PORT: '5432',
    });
    expect(url.href).toBe('https://preview.example.test:8443/site/');
    expect(url.origin).toBe('https://preview.example.test:8443');
  });

  it.each(['http://example.test/', 'file:///tmp/site/', 'not-a-url'])(
    'rejects unsafe or malformed deployment targets: %s',
    (DEPLOYMENT_URL) => {
      expect(() => resolvePreviewURL({ DEPLOYMENT_URL })).toThrow();
    },
  );

  it('rejects an unusable local port before launching the preview server', () => {
    expect(() => resolvePreviewURL({ PLAYWRIGHT_PORT: '70000' })).toThrow();
  });
});
