import { expect, test } from '@playwright/test';

test('the content manager is not indexed, uses its bundled configuration, and supports local editing', async ({
  page,
}) => {
  let requestedConfigFile = false;
  page.on('request', (request) => {
    requestedConfigFile ||= new URL(request.url()).pathname === '/admin/config.yml';
  });

  const response = await page.goto(`/admin/?branding-check=${Date.now()}`);
  const html = await response!.text();
  expect(html.match(/rel="icon"/g)).toHaveLength(1);
  expect(html).not.toContain('favicon.ico');
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByRole('button', { name: 'Work with Local Repository' })).toBeVisible();
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('href', '/favicon.svg');
  await expect(icon).toHaveAttribute('type', 'image/svg+xml');
  const logo = page.locator('img[src="/favicon.svg"]');
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.waitForTimeout(100);
  expect(requestedConfigFile).toBe(false);
});
