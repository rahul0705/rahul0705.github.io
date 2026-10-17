import { expect, test } from '@playwright/test';

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
