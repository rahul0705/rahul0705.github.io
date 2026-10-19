// cspell:ignore zqxvnosucharticle
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { sitePath } from './support/site';

async function openSearch(page: Page) {
  await page.goto(sitePath('/'));
  await page.getByRole('button', { name: 'Search articles', exact: true }).click();
}

test('navigation opens article search and body matches lead to a heading', async ({ page }) => {
  await openSearch(page);
  await expect(page).toHaveURL(new RegExp(`${sitePath('/')}?$`));
  await expect(page.getByRole('heading', { name: 'Search articles', exact: true })).toBeVisible();
  const input = page.getByRole('searchbox');
  await input.fill('taxable_amount');
  const article = page.locator('[data-search-results]').getByRole('link', { name: 'Code Reviews', exact: true });
  await expect(article).toBeVisible();
  const heading = page.locator('[data-search-results] a[href*="#"]').first();
  await expect(heading).toBeVisible();
  await input.press('ArrowDown');
  await expect(article).toBeFocused();
  await heading.click();
  await expect(page).toHaveURL(/\/blog\/2018-10-08-peer-reviews\/#.+/);
});

test('search matches titles and descriptions, filters by metadata, and handles no results', async ({ page }) => {
  await openSearch(page);
  const input = page.getByRole('searchbox');
  const results = page.locator('[data-search-results]');
  const summary = page.locator('[data-search-status]');
  await expect(summary).toContainText('Start with a title, topic, or phrase.');
  await input.fill('Learning Racetrack');
  await expect(results.getByRole('link', { name: 'Learning Racetrack', exact: true })).toBeVisible();
  await input.fill('classroom');
  await expect(results.getByRole('link', { name: 'Learning Racetrack', exact: true })).toBeVisible();
  await page.getByLabel('Section', { exact: true }).selectOption('Process');
  await expect(summary).toContainText('No results');
  await page.getByLabel('Section', { exact: true }).selectOption('Projects');
  await page.getByLabel('Tag', { exact: true }).selectOption('git');
  await expect(summary).toContainText('No results');
  await page.getByLabel('Tag', { exact: true }).selectOption('raspberry pi');
  await expect(results.getByRole('link', { name: 'Learning Racetrack', exact: true })).toBeVisible();
  await page.getByLabel('Tag', { exact: true }).selectOption('');
  await page.getByLabel('Section', { exact: true }).selectOption('');
  await input.fill('zqxvnosucharticle');
  await expect(summary).toContainText('No results');
  await expect(results.getByRole('link')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(summary).toContainText('Start with a title, topic, or phrase.');
  await page.getByLabel('Section', { exact: true }).selectOption('Projects');
  await expect(results.getByRole('link', { name: 'Learning Racetrack', exact: true })).toBeVisible();
  await expect(results.getByRole('link', { name: 'Code Reviews', exact: true })).toHaveCount(0);
});

test('search excludes drafts, other pages, and navigation boilerplate', async ({ page }) => {
  await openSearch(page);
  const input = page.getByRole('searchbox');
  await input.fill('Optimize for Reversibility');
  await expect(page.locator('[data-search-status]')).toContainText(/results? for Optimize/);
  await expect(page.locator('[data-search-results] a[href*="2026-10-03-optimize-for-reversibility"]')).toHaveCount(0);
  for (const query of ['Luna', 'Privacy']) {
    await input.fill(query);
    await expect(page.locator('[data-search-status]')).toContainText(`No results for ${query}`);
    await expect(page.locator('[data-search-results]').getByRole('link')).toHaveCount(0);
  }
});

test('search is usable on mobile and results have no detectable accessibility violations', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openSearch(page);
  await page.getByRole('searchbox').fill('taxable_amount');
  await expect(
    page.locator('[data-search-results]').getByRole('link', { name: 'Code Reviews', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await test
    .info()
    .attach('search-mobile.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});

test('search reports loading while the index is delayed', async ({ page }) => {
  const { promise, resolve } = Promise.withResolvers<void>();
  await page.route('**/pagefind-entry.json*', async (route) => {
    await promise;
    await route.continue();
  });
  try {
    await openSearch(page);
    await page.getByRole('searchbox').fill('taxable_amount');
    await expect(page.locator('[data-search-status]')).toContainText(/Searching/i);
    resolve();
    await expect(
      page.locator('[data-search-results]').getByRole('link', { name: 'Code Reviews', exact: true }),
    ).toBeVisible();
  } finally {
    resolve();
  }
});

test('a missing index produces a clear search error', async ({ page }) => {
  await page.route('**/pagefind-entry.json*', (route) => route.abort());
  await openSearch(page);
  await page.getByRole('searchbox').fill('code');
  await expect(page.getByRole('status', { name: 'Search status' })).toContainText('Search is unavailable right now.');
  await expect(page.getByRole('link', { name: 'Browse all articles' })).toBeVisible();
  await page.unroute('**/pagefind-entry.json*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('button', { name: 'Search articles', exact: true }).click();
  await page.getByRole('searchbox').fill('code');
  await expect(page.locator('[data-search-results]').getByRole('link').first()).toBeVisible();
});

test('an unavailable search module offers the article index', async ({ page }) => {
  await page.route('**/pagefind.js', (route) => route.abort());
  await openSearch(page);
  await page.getByRole('searchbox').fill('code');
  await expect(page.getByRole('status', { name: 'Search status' })).toContainText('Search is unavailable right now.');
  await expect(page.getByRole('link', { name: 'Browse all articles' })).toHaveAttribute('href', sitePath('/blog/'));
});

test('search assets load only after using the search dialog', async ({ page }) => {
  const searchRequests: string[] = [];
  const searchResponses: Promise<{ path: string; bytes: number }>[] = [];
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if (path.includes('/pagefind/')) {
      searchResponses.push(response.body().then((body) => ({ path, bytes: body.byteLength })));
    }
  });
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('/pagefind/')) searchRequests.push(request.url());
  });
  await page.goto(sitePath('/'));
  await page.goto(sitePath('/blog/'));
  expect(searchRequests).toEqual([]);
  await openSearch(page);
  expect(searchRequests).toEqual([]);
  await page.getByRole('searchbox').fill('code');
  await expect(page.locator('[data-search-results]').getByRole('link').first()).toBeVisible();
  expect(searchRequests.length).toBeGreaterThan(0);
  await test.info().attach('search-assets.json', {
    body: JSON.stringify(await Promise.all(searchResponses), null, 2),
    contentType: 'application/json',
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('search offers a working article index link', async ({ page }) => {
    await page.goto(sitePath('/'));
    await expect(page.getByRole('button', { name: 'Search articles', exact: true })).toHaveCount(0);
    await page.locator('header').getByRole('link', { name: 'Articles', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${sitePath('/blog/')}?$`));
  });
});

test('a failed article fragment offers recovery', async ({ page }) => {
  await page.route('**/pagefind/fragment/**', (route) => route.abort());
  await openSearch(page);
  await page.getByRole('searchbox').fill('code');
  await expect(page.getByRole('status', { name: 'Search status' })).toContainText('Search is unavailable right now.');
  await page.unroute('**/pagefind/fragment/**');
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('button', { name: 'Search articles', exact: true }).click();
  await page.getByRole('searchbox').fill('code');
  await expect(page.locator('[data-search-results]').getByRole('link').first()).toBeVisible();
});

test('a slow earlier search cannot replace the latest query', async ({ page }) => {
  const fragmentRequested = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  await page.route('**/pagefind/fragment/**', async (route) => {
    fragmentRequested.resolve();
    await release.promise;
    await route.continue();
  });
  try {
    await openSearch(page);
    const input = page.getByRole('searchbox');
    await input.fill('code');
    await fragmentRequested.promise;
    await input.fill('zqxvnosucharticle');
    await expect(page.getByRole('status')).toContainText('No results');
    release.resolve();
    await page.unrouteAll({ behavior: 'wait' });
    await expect(page.getByRole('status')).toContainText('No results for zqxvnosucharticle');
    await expect(page.locator('[data-search-results]').getByRole('link')).toHaveCount(0);
  } finally {
    release.resolve();
  }
});

test('search dialog restores focus after Escape, close, and backdrop dismissal', async ({ page }) => {
  await page.goto(sitePath('/'));
  const trigger = page.getByRole('button', { name: 'Search articles', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Search articles' });
  for (const dismissal of ['escape', 'close', 'backdrop']) {
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeFocused();
    await page.getByRole('searchbox').fill('code');
    if (dismissal === 'escape') await page.keyboard.press('Escape');
    else if (dismissal === 'close') await dialog.getByRole('button', { name: 'Close search', exact: true }).click();
    else
      await page
        .getByRole('button', { name: 'Close search backdrop' })
        .click({ position: { x: 5, y: 5 }, force: true });
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});
