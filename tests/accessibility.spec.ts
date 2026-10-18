import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { sitePath } from './support/site';

const routes = [
  '/',
  '/about/',
  '/blog/',
  '/blog/2019-05-16-how-to-use-git-effectively/',
  '/resume/',
  '/privacy/',
  '/dotfiles/',
];

for (const route of routes) {
  test(`${route} has no automatically detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(sitePath(route));
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
