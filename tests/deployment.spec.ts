import { expect, test } from '@playwright/test';

import { security } from '../src/config/security';
import { siteConfig } from '../src/config/site';
import { securityTxtPath } from '../src/integrations/security-txt/render';
import { publicSiteURL, sitePath } from './support/site';

for (const path of ['/', '/resume/', '/dotfiles/', '/blog/2018-10-08-peer-reviews/']) {
  test(`deployed ${path} serves content and fits a phone viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const failedAssets: string[] = [];
    page.on('response', (response) => {
      if (['stylesheet', 'image', 'font'].includes(response.request().resourceType()) && !response.ok()) {
        failedAssets.push(`${response.status()} ${response.url()}`);
      }
    });
    expect((await page.goto(sitePath(path)))?.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).not.toBeEmpty();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${publicSiteURL}${path}`);
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
    const response = await request.get(sitePath(path));
    expect(response.status(), path).toBe(200);
    expect((await response.text()).trim(), path).not.toBe('');
  }
  const resume = await (await request.get(sitePath('/resume.json'))).json();
  expect(resume.basics.name).toBe(siteConfig.author.name);
  const missing = await request.get(sitePath('/deployment-smoke-does-not-exist/'));
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('Page not found');
});

test('security.txt publishes the reporting contact, expiration, and canonical URL', async ({ request }) => {
  const path = sitePath(securityTxtPath);
  const canonical = new URL(path, publicSiteURL).href;
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const contentType = response.headers()['content-type'];
  if (process.env.DEPLOYMENT_URL) {
    expect(new URL(response.url()).protocol).toBe('https:');
    expect(contentType).toMatch(/^text\/plain;\s*charset=utf-8$/i);
  } else {
    expect(contentType).toBe('text/plain');
  }

  const lines = new TextDecoder('utf-8', { fatal: true })
    .decode(await response.body())
    .trimEnd()
    .split(/\r?\n/);
  expect(lines.filter((line) => line.startsWith('Contact: '))).toEqual(
    security.contacts.map((contact) => `Contact: ${contact}`),
  );
  expect(lines.filter((line) => line.startsWith('Canonical: '))).toEqual([`Canonical: ${canonical}`]);
  const expirations = lines.filter((line) => line.startsWith('Expires: '));
  expect(expirations).toHaveLength(1);
  if (process.env.SECURITY_TXT_EXPIRES) {
    expect(expirations[0]).toBe(process.env.SECURITY_TXT_EXPIRES);
  }
  expect(Date.parse(expirations[0].slice('Expires: '.length))).toBeGreaterThan(Date.now());
});

test('the production apex redirects security.txt to its canonical URL', async ({ request }) => {
  test.skip(
    !process.env.DEPLOYMENT_URL || new URL(process.env.DEPLOYMENT_URL).origin !== publicSiteURL,
    'The apex redirect is configured on the production domain.',
  );
  const canonical = new URL(securityTxtPath, publicSiteURL);
  const apex = new URL(canonical);
  apex.hostname = apex.hostname.replace(/^www\./, '');
  const redirect = await request.get(apex.href, { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers().location).toBe(canonical.href);

  const response = await request.get(apex.href);
  expect(response.url()).toBe(canonical.href);
  expect(response.status()).toBe(200);
});
