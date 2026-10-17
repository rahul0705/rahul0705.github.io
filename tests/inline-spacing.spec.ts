import { expect, test } from '@playwright/test';

for (const [path, text] of [
  ['/privacy/', "For more information, read Google's Privacy Policy."],
  ['/dotfiles/', 'configuration lives in the dotfiles repository.'],
  ['/dotfiles/', 'follow the dotfiles README.'],
  ['/about/', 'That instinct became RM Industries, my independent software company.'],
]) {
  test(`${path} preserves inline spacing: ${text}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toContainText(text);
  });
}
