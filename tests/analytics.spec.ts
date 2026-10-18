import { expect, test } from '@playwright/test';

import { resolvePreviewURL } from '../scripts/preview-url';
import { siteConfig } from '../src/config/site';
import { sitePath } from './support/site';

test('analytics uses denied consent and sanitized page data on public HTML pages', async ({ page }) => {
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({ status: 204 }));
  await page.goto(sitePath('/?private=value#fragment'));

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
      page_location: new URL(sitePath('/'), resolvePreviewURL().origin).href,
    }),
  ]);
});

test('analytics is absent from non-public and non-HTML endpoints', async ({ page, request }) => {
  for (const route of ['/admin/', '/this-page-does-not-exist/']) {
    await page.goto(sitePath(route));
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
    expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  }

  for (const route of ['/resume.json', '/resume.txt', '/resume.md']) {
    expect(await (await request.get(sitePath(route))).text()).not.toContain(siteConfig.analytics.measurementId);
  }
});
