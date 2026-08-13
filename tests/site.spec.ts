import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { siteTheme, siteThemeColor } from '../src/themes/site-theme';

const routes = ['/', '/blog/', '/blog/2019-05-16-how-to-use-git-effectively/', '/resume/', '/privacy/'];

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
    'G-K6P860TJ0W',
    expect.objectContaining({
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      page_location: 'http://127.0.0.1:4321/',
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
    expect(await (await request.get(route)).text()).not.toContain('G-K6P860TJ0W');
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

test('resume actions remain usable within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resume/');
  await page.getByRole('button', { name: 'Export Resume' }).click();

  const menu = page.locator('#resume-actions-menu');
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
  await expect(page).toHaveTitle('Rahul Mohandas');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.rahulmohandas.com/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

  await page.goto('/blog/2019-05-16-how-to-use-git-effectively/');
  await expect(page).toHaveTitle('How to use Git effectively - Rahul Mohandas');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
    'content',
    '2019-05-16T00:00:00.000Z',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.rahulmohandas.com/blog/2019-05-16-how-to-use-git-effectively/',
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
