import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { sitePath } from './support/site';

test('the content manager is not indexed, uses its bundled configuration, and supports local editing', async ({
  page,
}) => {
  let requestedConfigFile = false;
  page.on('request', (request) => {
    requestedConfigFile ||= new URL(request.url()).pathname === sitePath('/admin/config.yml');
  });

  const response = await page.goto(sitePath(`/admin/?branding-check=${Date.now()}`));
  assert(response, 'Expected the CMS navigation to return a response');
  const html = await response.text();
  expect(html.match(/rel="icon"/g)).toHaveLength(1);
  expect(html).not.toContain('favicon.ico');
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('button', { name: 'Work with Local Repository' })).toBeVisible();
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('href', sitePath('/favicon.svg'));
  await expect(icon).toHaveAttribute('type', 'image/svg+xml');
  const logo = page.locator(`img[src="${sitePath('/favicon.svg')}"]`);
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.waitForTimeout(100);
  expect(requestedConfigFile).toBe(false);
});

test('the deployed CMS formatter wraps article prose and is stable on re-save', async ({ page }) => {
  const asset = (await readdir('dist/_astro')).find((file) => /^article-save-format\..*\.js$/.test(file));
  assert(asset, 'Expected the CMS save formatter in the build');
  await page.goto(sitePath('/admin/'));
  await expect(page.getByRole('button', { name: 'Work with Local Repository' })).toBeVisible();
  const body = 'An article sentence that should be wrapped consistently. '.repeat(10).trim();
  const result = await page.evaluate(
    async ({ modulePath, body }) => {
      const element = document.getElementById('article-format-options');
      if (!element?.textContent) throw new Error('Missing deployed formatting policy');
      const options: unknown = JSON.parse(element.textContent);
      const module: unknown = await import(modulePath);
      if (
        !module ||
        typeof module !== 'object' ||
        !('formatArticleBody' in module) ||
        typeof module.formatArticleBody !== 'function'
      )
        throw new Error('Missing deployed article formatter');
      const formatted: unknown = await module.formatArticleBody(body, options);
      if (typeof formatted !== 'string') throw new Error('Expected formatted Markdown');
      const savedAgain: unknown = await module.formatArticleBody(formatted, options);
      return { formatted, savedAgain };
    },
    { modulePath: sitePath(`/_astro/${asset}`), body },
  );
  expect(result.formatted).toContain('\n');
  expect(result.formatted.split('\n').every((line) => line.length <= 120)).toBe(true);
  expect(result.formatted.replace(/\s+/g, ' ').trim()).toBe(body);
  expect(result.savedAgain).toBe(result.formatted);
});
