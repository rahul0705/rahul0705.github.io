import { expect, test } from '@playwright/test';

import { sitemapLocations } from './support/sitemap';

for (const width of [320, 375, 390, 640, 768, 820, 1024]) {
  test(`every public page fits the ${width}px viewport`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 });

    const sitemapIndex = await request.get('/sitemap-index.xml');
    expect(sitemapIndex.ok()).toBe(true);

    const sitemapUrls = sitemapLocations(await sitemapIndex.text());
    expect(sitemapUrls.length).toBeGreaterThan(0);

    const pagePaths: string[] = ['/this-page-does-not-exist/'];
    for (const sitemapUrl of sitemapUrls) {
      const sitemap = await request.get(new URL(sitemapUrl).pathname);
      expect(sitemap.ok()).toBe(true);
      pagePaths.push(...sitemapLocations(await sitemap.text()).map((location) => new URL(location).pathname));
    }

    expect(pagePaths.length).toBeGreaterThan(0);
    for (const path of pagePaths) {
      await test.step(path, async () => {
        await page.goto(path);
        await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
          'content',
          'width=device-width, initial-scale=1',
        );
        await expect(page.locator('main')).toBeVisible();

        await page.evaluate(() => document.fonts.ready);
        await page.locator('footer').scrollIntoViewIfNeeded();
        const viewport = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(viewport.clientWidth).toBe(width);
        expect(viewport.innerWidth).toBe(width);
        expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
      });
    }
  });
}

test('long inline code wraps within the article column on narrow phones', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/blog/2018-10-08-peer-reviews/');
  await page.evaluate(() => document.fonts.ready);
  const code = page.locator('p > code').filter({ hasText: 'calculate_tax(taxable_amount, tax_rate)' });
  await expect(code).toHaveCount(1);
  const bounds = await code.evaluate((element) => {
    const parent = element.parentElement!.getBoundingClientRect();
    return {
      left: parent.left,
      right: parent.right,
      fragments: [...element.getClientRects()].map((rect) => ({ left: rect.left, right: rect.right })),
    };
  });
  for (const fragment of bounds.fragments) {
    expect(fragment.left).toBeGreaterThanOrEqual(bounds.left);
    expect(fragment.right).toBeLessThanOrEqual(bounds.right);
  }
});

test('About mobile hero appears before the lede and reserves space while its image loads', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let releaseImage!: () => void;
  const imageReady = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  await page.route('**/_astro/rahul-and-luna*', async (route) => {
    await imageReady;
    await route.continue();
  });
  try {
    await page.goto('/about/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() =>
      Promise.all([
        document.fonts.load('400 18px "Fira Sans"'),
        document.fonts.load('500 20px "Fira Sans"'),
        document.fonts.load('700 48px "Fira Sans"'),
      ]),
    );
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
    const image = await page.getByAltText('Rahul relaxing on the couch with Luna, his Border Collie.').boundingBox();
    const lede = page.locator('.hero-lede');
    const before = await lede.boundingBox();
    expect(heading!.y + heading!.height).toBeLessThan(image!.y);
    expect(image!.y + image!.height).toBeLessThan(844);
    expect(image!.y + image!.height).toBeLessThanOrEqual(before!.y);
    releaseImage();
    await page
      .getByAltText('Rahul relaxing on the couch with Luna, his Border Collie.')
      .evaluate((image) => (image as HTMLImageElement).decode());
    expect((await lede.boundingBox())!.y).toBeCloseTo(before!.y, 1);
  } finally {
    releaseImage();
  }
});
