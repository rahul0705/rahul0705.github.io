import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { resume } from '../src/data/resume';

const routes = ['/', '/blog/', '/blog/2019-05-16-how-to-use-git-effectively/', '/resume/'];
const printEntryCount =
  resume.experience.reduce(
    (count, organization) =>
      count + organization.projects.reduce((projectCount, project) => projectCount + project.roles.length, 0),
    0,
  ) +
  resume.education.length +
  resume.awards.length;

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
  await expect(page.getByRole('link', { name: 'View resume.json' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print resume' })).toBeVisible();
});

test('mobile navigation is keyboard reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).press('Enter');
  await expect(page.getByRole('link', { name: 'Articles' }).last()).toBeVisible();
});

test('unknown routes show the custom not-found page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
});

test('the resume has a compact print presentation', async ({ page }) => {
  await page.goto('/resume/');
  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('.resume-page')).toBeHidden();
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

  const typeScriptSkill = page.getByRole('link', { name: 'TypeScript: Programming Language' });
  const evmsSkill = page.getByRole('link', { name: 'EVMS: Project Management Technique' });
  await expect(typeScriptSkill).toHaveAttribute('href', 'https://www.typescriptlang.org/');
  await expect(evmsSkill).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Earned_value_management');
  expect(await page.locator('li.tooltip[data-tip="Programming Language"]').count()).toBeGreaterThan(0);
  await expect(page.getByText('Presentation Proficiency', { exact: true })).toBeVisible();
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
