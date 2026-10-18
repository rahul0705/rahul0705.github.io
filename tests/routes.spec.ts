import { expect, test } from '@playwright/test';

import { sitePath } from './support/site';

test('unknown routes show the custom not-found page', async ({ page }) => {
  const response = await page.goto(sitePath('/this-page-does-not-exist/'));

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', sitePath('/'));
});
