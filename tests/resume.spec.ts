import { expect, test } from '@playwright/test';

test('resume actions remain usable within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/resume/');
  await page.getByRole('button', { name: 'Export Resume' }).click();

  const menu = page.locator('#resume-actions-menu');
  const background = await menu.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  expect(background).not.toBe('transparent');
  await expect(menu.locator(':scope > li')).toHaveCount(4);
  await expect(menu.locator(':scope > li > :is(a, button)')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Print Resume' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download JSON' })).toHaveAttribute(
    'download',
    'rahul-mohandas-resume.json',
  );
  await expect(page.getByRole('link', { name: 'Download TXT' })).toHaveAttribute(
    'download',
    'rahul-mohandas-resume.txt',
  );
  await expect(page.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute(
    'download',
    'rahul-mohandas-resume.md',
  );
  for (const format of ['JSON', 'TXT', 'Markdown']) {
    await expect(page.getByRole('link', { name: `Download ${format}` })).toHaveAttribute('rel', 'nofollow');
  }
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});

test('the resume has a compact print presentation', async ({ page }) => {
  await page.goto('/resume/');
  const resumeJson = await page.request.get('/resume.json');
  const resume = (await resumeJson.json()) as {
    work: unknown[];
    education: unknown[];
    awards: unknown[];
  };
  const printEntryCount = resume.work.length + resume.education.length + resume.awards.length;
  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('[data-resume-page]')).toBeHidden();
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

  const softwareDevelopmentSkills = page.getByRole('list', { name: 'Software Development Engineer skills' });
  const typeScriptSkill = softwareDevelopmentSkills.locator('a[aria-label="TypeScript: Programming Language"]');
  const evmsSkill = page.locator('a[aria-label="EVMS: Project Management Technique"]');
  await expect(typeScriptSkill).toHaveAttribute('href', 'https://www.typescriptlang.org/');
  await expect(evmsSkill).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Earned_value_management');
  expect(await page.locator('li.tooltip[data-tip="Programming Language"]').count()).toBeGreaterThan(0);
  const seniorCloudSkills = page.getByRole('list', { name: 'Senior Cloud Software Engineer skills' });
  await expect(seniorCloudSkills.getByText('Presentation Proficiency', { exact: true })).toBeVisible();
  await expect(seniorCloudSkills.getByText('YAML', { exact: true })).toBeHidden();
  await seniorCloudSkills.getByText(/Show \d+ more skills/).click();
  await expect(seniorCloudSkills.getByText('YAML', { exact: true })).toBeVisible();
  await expect(page.getByText('TCP/IP', { exact: true })).toBeVisible();
});

for (const width of [320, 375, 390, 640, 768, 820, 1024]) {
  test(`expanded resume controls fit at ${width}px`, async ({ page }) => {
    // Opening every skill disclosure can take nearly 30 seconds in Linux WebKit.
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/resume/');
    await page.evaluate(() => document.fonts.ready);
    for (const toggle of await page.getByText(/Show \d+ more skills/).all()) await toggle.click();
    await page.getByRole('button', { name: 'Export Resume' }).click();
    const menu = page.locator('#resume-actions-menu');
    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
