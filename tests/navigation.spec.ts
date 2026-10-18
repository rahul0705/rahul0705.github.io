import { expect, test } from '@playwright/test';

import { sitePath } from './support/site';

test('primary navigation reaches core pages', async ({ page }) => {
  await page.goto(sitePath('/'));
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
  await page.goto(sitePath('/'));
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
  await page.goto(sitePath('/'));
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
  await page.goto(sitePath('/'));
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const articles = page.locator('header').getByRole('link', { name: 'Articles', exact: true });
  await expect(articles).toBeVisible();

  await page.locator('main').click({ position: { x: 10, y: 100 } });
  await expect(articles).toBeHidden();
});

for (const width of [320, 375, 390, 640, 768, 820, 1024]) {
  test(`navigation controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(sitePath('/'));
    await page.evaluate(() => document.fonts.ready);
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
