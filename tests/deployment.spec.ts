import { expect, test } from '@playwright/test';

import { siteConfig } from '../src/config/site';

for (const path of ['/', '/resume/', '/blog/2018-10-08-peer-reviews/']) {
  test(`deployed ${path} serves content and fits a phone viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const failedAssets: string[] = [];
    page.on('response', (response) => {
      if (['stylesheet', 'image', 'font'].includes(response.request().resourceType()) && !response.ok()) {
        failedAssets.push(`${response.status()} ${response.url()}`);
      }
    });
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).not.toBeEmpty();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${siteConfig.url}${path}`);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      'width=device-width, initial-scale=1',
    );
    await page.evaluate(() => document.fonts.ready);
    await page.locator('footer').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => [...document.styleSheets].some((sheet) => sheet.href))).toBe(true);
    expect(failedAssets).toEqual([]);
  });
}

test('deployed machine-readable routes and not-found response are intact', async ({ request }) => {
  for (const path of ['/robots.txt', '/rss.xml', '/sitemap-index.xml', '/resume.json', '/resume.md', '/resume.txt']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect((await response.text()).trim(), path).not.toBe('');
  }
  const resume = await (await request.get('/resume.json')).json();
  expect(resume.basics.name).toBe(siteConfig.author.name);
  const missing = await request.get('/deployment-smoke-does-not-exist/');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('Page not found');
});
