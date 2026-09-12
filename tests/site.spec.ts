import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { siteConfig } from '../src/config/site';
import { siteTheme, siteThemeColor } from '../src/themes/site-theme';

const routes = ['/', '/blog/', '/blog/2019-05-16-how-to-use-git-effectively/', '/resume/', '/privacy/'];

const sitemapLocations = (xml: string) =>
  Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), ([, location]) => location.replaceAll('&amp;', '&'));

test('analytics uses denied consent and sanitized page data on public HTML pages', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({ status: 204 }));
  await page.goto('/?private=value#fragment');

  const analyticsState = await page.evaluate(() => {
    const commands = (window as typeof window & { dataLayer: IArguments[] }).dataLayer;
    return commands.map((command) => Array.from(command));
  });

  expect(analyticsState).toContainEqual([
    'consent',
    'default',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    },
  ]);
  expect(analyticsState).toContainEqual([
    'config',
    siteConfig.analytics.measurementId,
    expect.objectContaining({
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      page_location: `${new URL(page.url()).origin}/`,
    }),
  ]);
});

test('analytics is absent from non-public and non-HTML endpoints', async ({ page, request }) => {
  for (const route of ['/admin/', '/this-page-does-not-exist/']) {
    await page.goto(route);
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
    expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  }

  for (const route of ['/resume.json', '/resume.txt', '/resume.md']) {
    expect(await (await request.get(route)).text()).not.toContain(siteConfig.analytics.measurementId);
  }
});

test('public pages apply the configured theme and its browser color', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', siteTheme);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', siteThemeColor);
});

for (const route of routes) {
  test(`${route} has no automatically detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('primary navigation reaches core pages', async ({ page }) => {
  await page.goto('/');
  await page.locator('header').getByRole('link', { name: 'Articles', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await page.locator('header').getByRole('link', { name: 'Resume', exact: true }).click();
  await expect(page).toHaveURL(/\/resume\/?$/);
  await page.getByRole('button', { name: 'Export Resume' }).click();
  await expect(page.getByRole('link', { name: 'Download JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print Resume' })).toBeVisible();
});

test('mobile navigation opens on tap and follows its links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open navigation menu' });
  const articles = page.locator('header').getByRole('link', { name: 'Articles', exact: true });

  await expect(articles).toBeHidden();
  await toggle.click();
  await expect(articles).toBeVisible();
  await articles.click();
  await expect(page).toHaveURL(/\/blog\/?$/);
});

test('mobile navigation supports keyboard toggling and dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open navigation menu' });

  await toggle.focus();
  await toggle.press('Enter');
  const articles = page.locator('header').getByRole('link', { name: 'Articles', exact: true });
  await expect(articles).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(articles).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('mobile navigation closes when tapping outside it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const articles = page.locator('header').getByRole('link', { name: 'Articles', exact: true });
  await expect(articles).toBeVisible();

  await page.locator('main').click({ position: { x: 10, y: 100 } });
  await expect(articles).toBeHidden();
});

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

test('resume actions remain usable within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resume/');
  await page.getByRole('button', { name: 'Export Resume' }).click();

  const menu = page.locator('#resume-actions-menu');
  const background = await menu.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  expect(background).not.toBe('transparent');
  await expect(menu.locator(':scope > li')).toHaveCount(4);
  await expect(menu.locator(':scope > li > :is(a, button)')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Print Resume' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download JSON' })).toHaveAttribute(
    'download',
    'rahul-mohandas-resume.json',
  );
  await expect(page.getByRole('link', { name: 'Download TXT' })).toHaveAttribute(
    'download',
    'rahul-mohandas-resume.txt',
  );
  await expect(page.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute(
    'download',
    'rahul-mohandas-resume.md',
  );
  for (const format of ['JSON', 'TXT', 'Markdown']) {
    await expect(page.getByRole('link', { name: `Download ${format}` })).toHaveAttribute('rel', 'nofollow');
  }
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});

test('unknown routes show the custom not-found page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
});

test('the resume has a compact print presentation', async ({ page }) => {
  await page.goto('/resume/');
  const resumeJson = await page.request.get('/resume.json');
  const resume = (await resumeJson.json()) as {
    work: unknown[];
    education: unknown[];
    awards: unknown[];
  };
  const printEntryCount = resume.work.length + resume.education.length + resume.awards.length;
  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('[data-resume-page]')).toBeHidden();
  await expect(page.locator('.resume-print')).toBeVisible();
  await expect(page.locator('.resume-print-entry')).toHaveCount(printEntryCount);
  await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Skills', exact: true })).toBeVisible();
});

test('resume text endpoints provide plain text and Markdown', async ({ request }) => {
  const plainText = await request.get('/resume.txt');
  const markdown = await request.get('/resume.md');

  expect(plainText.headers()['content-type']).toContain('text/plain');
  expect(await plainText.text()).toContain('EXPERIENCE');
  expect(markdown.headers()['content-type']).toContain('text/markdown');
  expect(await markdown.text()).toContain('## Experience');
});

test('resume role skills retain their documentation links and descriptions', async ({ page }) => {
  await page.goto('/resume/');

  const softwareDevelopmentSkills = page.getByRole('list', { name: 'Software Development Engineer skills' });
  const typeScriptSkill = softwareDevelopmentSkills.locator('a[aria-label="TypeScript: Programming Language"]');
  const evmsSkill = page.locator('a[aria-label="EVMS: Project Management Technique"]');
  await expect(typeScriptSkill).toHaveAttribute('href', 'https://www.typescriptlang.org/');
  await expect(evmsSkill).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Earned_value_management');
  expect(await page.locator('li.tooltip[data-tip="Programming Language"]').count()).toBeGreaterThan(0);
  const seniorCloudSkills = page.getByRole('list', { name: 'Senior Cloud Software Engineer skills' });
  await expect(seniorCloudSkills.getByText('Presentation Proficiency', { exact: true })).toBeVisible();
  await expect(seniorCloudSkills.getByText('YAML', { exact: true })).toBeHidden();
  await seniorCloudSkills.getByText(/Show \d+ more skills/).click();
  await expect(seniorCloudSkills.getByText('YAML', { exact: true })).toBeVisible();
  await expect(page.getByText('TCP/IP', { exact: true })).toBeVisible();
});

test('public pages provide accurate sharing metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(siteConfig.title);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${siteConfig.url}/`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
    'href',
    siteConfig.rss.path,
  );

  await page.goto('/blog/2019-05-16-how-to-use-git-effectively/');
  await expect(page).toHaveTitle(`How to use Git effectively - ${siteConfig.title}`);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    'content',
    'Source code displayed on a laptop screen',
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    'content',
    'Source code displayed on a laptop screen',
  );
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    'content',
    '2019-05-16T00:00:00.000Z',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${siteConfig.url}/blog/2019-05-16-how-to-use-git-effectively/`,
  );

  await expect(page.locator('meta[property="article:modified_time"]')).toHaveCount(0);

  await page.goto('/blog/2018-10-08-peer-reviews/');
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
  await page.goto('/blog/');
  await expect(page.getByRole('link', { name: 'RSS', exact: true })).toHaveAttribute('href', siteConfig.rss.path);

  const response = await request.get(siteConfig.rss.path);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/^(?:application\/(?:rss\+)?xml|text\/xml)(?:;|$)/);

  const feed = await response.text();
  expect(feed).toContain(`<title>${siteConfig.rss.title}</title>`);
  expect(feed).toContain('<language>en-us</language>');
  expect(feed).toContain(`<link>${siteConfig.url}/blog/2026-08-17-duplication-vs-coupling/</link>`);
  expect(feed).toContain('<pubDate>Mon, 17 Aug 2026 00:00:00 GMT</pubDate>');
});

test('crawl policy excludes raw resume exports while allowing HTML noindex directives', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(robots.headers()['content-type']).toMatch(/^text\/plain(?:;|$)/);
  expect(await robots.text()).toBe(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /resume.json',
      'Disallow: /resume.md',
      'Disallow: /resume.txt',
      '',
      `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
      '',
    ].join('\n'),
  );

  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.ok()).toBe(true);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).not.toContain('/robots.txt');
  for (const route of siteConfig.nonIndexablePaths) {
    expect(sitemapBody).not.toContain(route);
  }
});

test('the content manager is not indexed, uses its bundled configuration, and supports local editing', async ({
  page,
}) => {
  let requestedConfigFile = false;
  page.on('request', (request) => {
    requestedConfigFile ||= new URL(request.url()).pathname === '/admin/config.yml';
  });

  await page.goto('/admin/');
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('button', { name: 'Work with Local Repository' })).toBeVisible();
  await page.waitForTimeout(100);
  expect(requestedConfigFile).toBe(false);
});

for (const width of [320, 375, 390, 640, 768, 820, 1024]) {
  test(`expanded mobile controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/resume/');
    await page.evaluate(() => document.fonts.ready);
    for (const toggle of await page.getByText(/Show \d+ more skills/).all()) await toggle.click();
    await page.getByRole('button', { name: 'Export Resume' }).click();
    const menu = page.locator('#resume-actions-menu');
    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.goto('/');
    const navigation = page.getByRole('button', { name: 'Open navigation menu' });
    if (await navigation.isVisible()) {
      await navigation.click();
      const articles = page.locator('header').getByRole('link', { name: 'Articles', exact: true });
      await expect(articles).toBeVisible();
      const linkBox = await articles.boundingBox();
      expect(linkBox!.x).toBeGreaterThanOrEqual(0);
      expect(linkBox!.x + linkBox!.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await articles.click();
      await expect(page).toHaveURL(/\/blog\/?$/);
    }
  });
}

test('production pages have complete metadata and working internal references', async ({ page, request }) => {
  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.ok()).toBe(true);
  const paths = sitemapLocations(await sitemap.text()).map((location) => new URL(location).pathname);
  expect(paths).toEqual(expect.arrayContaining(['/', '/blog/', '/resume/', '/privacy/']));
  const checked = new Set<string>();
  for (const path of paths) {
    await test.step(path, async () => {
      expect((await page.goto(path))?.ok()).toBe(true);
      const canonical = `${siteConfig.url}${path}`;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      const title = await page.title();
      expect(title.trim()).not.toBe('');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.trim()).toBeTruthy();
      for (const [key, value] of Object.entries({
        'og:title': title,
        'twitter:title': title,
        'og:description': description!,
        'twitter:description': description!,
        'og:url': canonical,
        'twitter:card': 'summary_large_image',
      })) {
        await expect(page.locator(`meta[name="${key}"], meta[property="${key}"]`)).toHaveAttribute('content', value);
      }
      await expect(page.locator('link[rel="manifest"]')).toHaveCount(0);
      for (const key of ['og:image', 'twitter:image']) {
        const image = await page.locator(`meta[name="${key}"], meta[property="${key}"]`).getAttribute('content');
        expect(new URL(image!).origin).toBe(new URL(siteConfig.url).origin);
        expect((await request.get(new URL(image!).pathname)).ok()).toBe(true);
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
        if (![new URL(page.url()).origin, siteConfig.url].includes(url.origin)) continue;
        const target = url.pathname + url.search;
        if (checked.has(target)) continue;
        checked.add(target);
        expect((await request.get(target)).ok(), `${path}: broken reference ${reference}`).toBe(true);
      }
    });
  }
  const resume = await (await request.get('/resume.json')).json();
  expect(resume.basics.name).toBe(siteConfig.author.name);
  expect(resume.work.length).toBeGreaterThan(0);
});

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
