import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

import { sitePath } from './support/site';

const articlePath = 'src/content/blog/2026-01-01-draft-regression.md';

for (const scenario of [
  { name: 'retains explicit false', initial: false, expected: false },
  { name: 'retains explicit true', initial: true, expected: true },
  { name: 'persists turning Draft off', initial: true, expected: false },
  { name: 'defaults new articles to true', initial: undefined, expected: true },
]) {
  test(`CMS ${scenario.name} through saving and reopening`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Local repository editing requires the File System Access API.');

    // Match Sveltia's local-backend tests: only replace the native folder dialog with a real browser file handle.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'showDirectoryPicker', {
        value: async () => (await navigator.storage.getDirectory()).getDirectoryHandle('draft-test', { create: true }),
      });
    });
    await page.route('https://*.github.com/**', (route) => route.abort());
    await page.goto(sitePath('/admin/'));
    await page.evaluate(
      async ({ path, initial }) => {
        const root = await (await navigator.storage.getDirectory()).getDirectoryHandle('draft-test', { create: true });
        await root.getDirectoryHandle('.git', { create: true });
        if (initial === undefined) return;
        let directory = root;
        const parts = path.split('/');
        const filename = parts.pop();
        if (!filename) throw new Error('Missing article filename');
        for (const part of parts) directory = await directory.getDirectoryHandle(part, { create: true });
        const file = await directory.getFileHandle(filename, { create: true });
        const writer = await file.createWritable();
        await writer.write(
          `---\ntitle: Draft regression\ndraft: ${initial}\ndescription: Original description\nsection: Process\ncoverImage: ../../assets/cover.svg\ncoverImageAlt: Test cover\n---\n\nTest body.\n`,
        );
        await writer.close();
      },
      { path: articlePath, initial: scenario.initial },
    );
    await page.getByRole('button', { name: 'Work with Local Repository' }).click();
    await page.getByRole('treeitem', { name: /^Blog Posts\b/ }).click();
    if (scenario.initial === undefined) {
      await page.getByRole('button', { name: 'Create New Entry', exact: true }).first().click();
    } else {
      await page.getByRole('row', { name: /Draft regression/ }).click();
    }
    const editor = page.getByRole('group', { name: 'Content Editor' });
    const draft = editor.getByRole('switch', { name: 'Draft', exact: true });
    await expect(draft).toBeChecked({ checked: scenario.initial ?? true });
    if (scenario.initial === undefined) {
      await editor.getByRole('textbox', { name: 'Title', exact: true }).fill('Draft regression');
      await editor.getByRole('radio', { name: 'Process', exact: true }).check();
    }
    await editor.getByRole('textbox', { name: 'Description', exact: true }).fill('Saved description');
    if (scenario.initial !== scenario.expected && scenario.initial !== undefined) await draft.click();
    await editor.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor).not.toBeVisible();

    const readArticle = () =>
      page.evaluate(async () => {
        let directory = await (await navigator.storage.getDirectory()).getDirectoryHandle('draft-test');
        for (const part of ['src', 'content', 'blog']) directory = await directory.getDirectoryHandle(part);
        for await (const handle of directory.values()) {
          if (handle.kind === 'file') return (await handle.getFile()).text();
        }
        return '';
      });
    await expect.poll(readArticle).toContain('description: Saved description');
    const saved = await readArticle();
    const frontmatter: unknown = parse(saved.split('---')[1] ?? '');
    expect(frontmatter).toMatchObject({ draft: scenario.expected, description: 'Saved description' });
    // Sign out before reloading: Chromium cannot restore Sveltia's cached browser file handle from IndexedDB.
    await page.getByRole('button', { name: 'Show Account Menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign Out', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Work with Local Repository' })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Work with Local Repository' }).click();
    await page.getByRole('treeitem', { name: /^Blog Posts\b/ }).click();
    await page.getByRole('row', { name: /Draft regression/ }).click();
    await expect(draft).toBeChecked({ checked: scenario.expected });
  });
}
