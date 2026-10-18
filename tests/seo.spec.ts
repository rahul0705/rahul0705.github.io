import assert from 'node:assert/strict';

import { expect, test } from '@playwright/test';

import { siteConfig } from '../src/config/site';
import { resolvePreviewURL } from './support/preview-url';
import { publicSiteURL, sitePath } from './support/site';
import { sitemapLocations } from './support/sitemap';

test('public pages provide accurate sharing metadata', async ({ page }) => {
  await page.goto(sitePath('/'));
  await expect(page).toHaveTitle(siteConfig.title);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${publicSiteURL}/`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
    'href',
    sitePath(siteConfig.rss.path),
  );

  await page.goto(sitePath('/blog/2019-05-16-how-to-use-git-effectively/'));
  await expect(page).toHaveTitle(`How to use Git effectively - ${siteConfig.title}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    'content',
    'Close-up of syntax-highlighted Python code on a dark screen',
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    'content',
    'Close-up of syntax-highlighted Python code on a dark screen',
  );
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    'content',
    '2019-05-16T00:00:00.000Z',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${publicSiteURL}/blog/2019-05-16-how-to-use-git-effectively/`,
  );

  await expect(page.locator('meta[property="article:modified_time"]')).toHaveCount(0);

  await page.goto(sitePath('/blog/2018-10-08-peer-reviews/'));
  await expect(page.locator('article header')).toContainText('Published Oct 2018 · Updated Aug 2026');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    'content',
    '2018-10-08T00:00:00.000Z',
  );
  await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute(
    'content',
    '2026-08-12T00:00:00.000Z',
  );
  await expect(page.locator('meta[property="article:section"]')).toHaveAttribute('content', 'Process');
  await expect(page.locator('meta[property="article:tag"]')).toHaveCount(4);
});

test('RSS feed publishes discoverable article metadata', async ({ page, request }) => {
  await page.goto(sitePath('/blog/'));
  await expect(page.getByRole('link', { name: 'RSS', exact: true })).toHaveAttribute(
    'href',
    sitePath(siteConfig.rss.path),
  );

  const response = await request.get(sitePath(siteConfig.rss.path));
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/^(?:application\/(?:rss\+)?xml|text\/xml)(?:;|$)/);

  const feed = await response.text();
  expect(feed).toContain(`<title>${siteConfig.rss.title}</title>`);
  expect(feed).toContain('<language>en-us</language>');
  expect(feed).toContain(`<link>${publicSiteURL}/</link>`);
  expect(feed).toContain(`<link>${publicSiteURL}/blog/2026-08-17-duplication-vs-coupling/</link>`);
  expect(feed).toContain('<pubDate>Mon, 17 Aug 2026 00:00:00 GMT</pubDate>');
});

test('crawl policy excludes raw resume exports while allowing HTML noindex directives', async ({ request }) => {
  const robots = await request.get(sitePath('/robots.txt'));
  expect(robots.ok()).toBe(true);
  expect(robots.headers()['content-type']).toMatch(/^text\/plain(?:;|$)/);
  expect(await robots.text()).toBe(
    [
      'User-agent: *',
      'Allow: /',
      `Disallow: ${sitePath('/resume.json')}`,
      `Disallow: ${sitePath('/resume.md')}`,
      `Disallow: ${sitePath('/resume.txt')}`,
      '',
      `Sitemap: ${publicSiteURL}/sitemap-index.xml`,
      '',
    ].join('\n'),
  );

  const sitemap = await request.get(sitePath('/sitemap-0.xml'));
  expect(sitemap.ok()).toBe(true);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).not.toContain('/robots.txt');
  for (const route of siteConfig.nonIndexablePaths) {
    expect(sitemapBody).not.toContain(sitePath(route));
  }
});

test('production pages have complete metadata and working internal references', async ({ page, request }) => {
  const sitemap = await request.get(sitePath('/sitemap-0.xml'));
  expect(sitemap.ok()).toBe(true);
  const paths = sitemapLocations(await sitemap.text()).map((location) => new URL(location).pathname);
  expect(paths).toEqual(expect.arrayContaining(['/', '/blog/', '/resume/', '/privacy/'].map((path) => sitePath(path))));
  const checked = new Set<string>();
  for (const path of paths) {
    await test.step(path, async () => {
      expect((await page.goto(path))?.ok()).toBe(true);
      const canonical = new URL(path, publicSiteURL).href;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      const title = await page.title();
      expect(title.trim()).not.toBe('');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      assert(description, 'Expected a page description');
      expect(description.trim()).not.toBe('');
      for (const [key, value] of Object.entries({
        'og:title': title,
        'twitter:title': title,
        'og:description': description,
        'twitter:description': description,
        'og:url': canonical,
        'twitter:card': 'summary_large_image',
      })) {
        await expect(page.locator(`meta[name="${key}"], meta[property="${key}"]`)).toHaveAttribute('content', value);
      }
      await expect(page.locator('link[rel="manifest"]')).toHaveCount(0);
      for (const key of ['og:image', 'twitter:image']) {
        const image = await page.locator(`meta[name="${key}"], meta[property="${key}"]`).getAttribute('content');
        assert(image, `Expected ${key} metadata`);
        expect(new URL(image).origin).toBe(new URL(publicSiteURL).origin);
        expect((await request.get(new URL(image).pathname)).ok()).toBe(true);
      }
      const references = await page.evaluate(() =>
        [...document.querySelectorAll('[href], [src]')].flatMap((element) =>
          ['href', 'src']
            .map((attribute) => element.getAttribute(attribute))
            .filter((value): value is string => Boolean(value)),
        ),
      );
      for (const reference of references) {
        const url = new URL(reference, page.url());
        if (![resolvePreviewURL().origin, new URL(publicSiteURL).origin].includes(url.origin)) continue;
        const target = url.pathname + url.search;
        if (checked.has(target)) continue;
        checked.add(target);
        expect((await request.get(target)).ok(), `${path}: broken reference ${reference}`).toBe(true);
      }
    });
  }
  const resume = await (await request.get(sitePath('/resume.json'))).json();
  expect(resume.basics.name).toBe(siteConfig.author.name);
  expect(resume.work.length).toBeGreaterThan(0);
});
