import { expect, test } from '@playwright/test';

for (const width of [390, 768, 1280]) {
  test(`navigation reaches dotfiles at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Open navigation menu' });
    if (await menu.isVisible()) await menu.click();
    const link = page.locator('header').getByRole('link', { name: 'Dotfiles', exact: true });
    await expect(link).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const box = await link.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await link.click();
    await expect(page).toHaveURL(/\/dotfiles\/$/);
    await expect(page.getByRole('heading', { name: 'Dotfiles', exact: true })).toBeVisible();
  });
}

test('dotfiles guide offers direct installers and review alternatives without executing them', async ({ page }) => {
  const installerRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('raw.githubusercontent.com/rahul0705/dotfiles/')) {
      installerRequests.push(request.url());
    }
  });
  expect((await page.goto('/dotfiles/'))?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Dotfiles', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'macOS and Linux', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Windows (PowerShell)', exact: true })).toBeVisible();
  const commands = await page.locator('pre code').allTextContents();
  expect(commands[0]).toBe('curl -fsSL https://raw.githubusercontent.com/rahul0705/dotfiles/main/install.sh | sh');
  expect(commands[1]).toContain('less install.sh\nsh install.sh');
  expect(commands[2]).toContain('powershell.exe -NoProfile -Command');
  expect(commands[2]).toContain('https://raw.githubusercontent.com/rahul0705/dotfiles/main/install.ps1');
  expect(commands[3]).toContain('Get-Content ./install.ps1\npowershell.exe -NoProfile -File ./install.ps1');
  expect(commands.join('\n')).not.toMatch(/ExecutionPolicy|RunAs|irm\s.*\|\s*iex/i);
  await expect(page.getByRole('link', { name: 'dotfiles README' })).toHaveAttribute(
    'href',
    'https://github.com/rahul0705/dotfiles#readme',
  );
  expect(installerRequests).toEqual([]);
});
