import { expect, test } from '@playwright/test';

import { siteTheme, siteThemeColor } from '../src/themes/site-theme';
import { sitePath } from './support/site';

test('public pages apply the configured theme and its browser color', async ({ page }) => {
  await page.goto(sitePath('/'));

  await expect(page.locator('html')).toHaveAttribute('data-theme', siteTheme);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', siteThemeColor);
});
