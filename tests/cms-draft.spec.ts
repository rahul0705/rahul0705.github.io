import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type BrowserContext, expect, test as base } from '@playwright/test';
import { parse } from 'yaml';

import { sitePath } from './support/site';

const test = base.extend({
  page: async ({ playwright, browserName, baseURL }, use) => {
    const profile = await mkdtemp(join(tmpdir(), 'cms-save-'));
    let context: BrowserContext | undefined;
    try {
      context = await playwright[browserName].launchPersistentContext(profile, { baseURL });
      await use(await context.newPage());
    } finally {
      await context?.close();
      await rm(profile, { recursive: true, force: true });
    }
  },
});

// WebKit's persistent storage is process-shared; keep these repository fixtures from racing.
test.describe.configure({ mode: 'serial' });

const articlePath = 'src/content/blog/2026-01-01-draft-regression.md';

for (const scenario of [
  { name: 'retains explicit false', initial: false, expected: false },
  { name: 'retains explicit true', initial: true, expected: true },
  { name: 'persists turning Draft off', initial: true, expected: false },
  { name: 'recovers from a WASM load failure', initial: false, expected: false },
  { name: 'defaults new articles to true', initial: undefined, expected: true },
]) {
  test(`CMS ${scenario.name} through formatted saves, recovery, and reopening`, async ({ page }) => {
    // Match Sveltia's local-backend tests: only replace the native folder dialog with a real browser file handle.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'showDirectoryPicker', {
        value: async () => (await navigator.storage.getDirectory()).getDirectoryHandle('draft-test', { create: true }),
      });
    });
    await page.route('https://*.github.com/**', (route) => route.abort());
    await page.goto(sitePath('/admin/'));
    await page.evaluate(async () => {
      await (await navigator.storage.getDirectory()).removeEntry('draft-test', { recursive: true }).catch(() => {});
    });
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
    const readArticle = () =>
      page.evaluate(async () => {
        let directory = await (await navigator.storage.getDirectory()).getDirectoryHandle('draft-test');
        for (const part of ['src', 'content', 'blog']) directory = await directory.getDirectoryHandle(part);
        for await (const handle of directory.values()) {
          if (handle.kind === 'file') return (await handle.getFile()).text();
        }
        return '';
      });
    const original = scenario.initial === undefined ? '' : await readArticle();
    await editor.getByRole('textbox', { name: 'Description', exact: true }).fill('Saved description');
    if (scenario.initial !== scenario.expected && scenario.initial !== undefined) await draft.click();
    if (scenario.name === 'retains explicit true') {
      await editor.getByRole('button', { name: 'Edit in Markdown', exact: true }).click();
      await editor
        .getByRole('textbox', { name: 'Body', exact: true })
        .fill(
          `${'Long article prose with meaningful words for wrapping. '.repeat(1000)}\n\n\`\`\`js\nconst value={hello:"world"};\n\`\`\`\n\n\`\`\`js\nconst = ;\n\`\`\`\n\n\`\`\`yaml\nitems: [\n\`\`\`\n`,
        );
    } else if (scenario.name === 'persists turning Draft off') {
      await editor.getByRole('textbox', { name: 'Body', exact: true }).fill('Rich text editing retains this body.');
    }
    if (scenario.initial !== undefined) {
      const asset =
        scenario.name === 'retains explicit false'
          ? 'policy.json'
          : scenario.name === 'retains explicit true'
            ? 'index.js*'
            : scenario.name === 'recovers from a WASM load failure'
              ? 'generated/engine_bg.wasm'
              : 'worker.js';
      const failurePath = `**/admin/formatter/${asset}`;
      await page.route(failurePath, (route) =>
        asset === 'policy.json' ? route.fulfill({ json: { upstreamVersion: 'invalid', options: {} } }) : route.abort(),
      );
      await editor.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByRole('alertdialog')).toContainText('Article formatting failed');
      await page.getByRole('alertdialog').getByRole('button', { name: 'OK', exact: true }).press('Enter');
      await expect(editor.getByRole('textbox', { name: 'Description', exact: true })).toHaveValue('Saved description');
      expect(await readArticle()).toBe(original);
      await page.unroute(failurePath);
    }
    await editor.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor).not.toBeVisible();

    await expect.poll(readArticle).toContain('description: Saved description');
    const saved = await readArticle();
    expect(saved).toBe(
      execFileSync('node_modules/.bin/oxfmt', ['--stdin-filepath', articlePath], { input: saved, encoding: 'utf8' }),
    );

    const lintFolder = await mkdtemp('src/content/blog/cms-save-test-');
    try {
      const lintFile = join(lintFolder, 'saved.md');
      await writeFile(lintFile, saved);
      execFileSync('node_modules/.bin/markdownlint-cli2', [lintFile], { encoding: 'utf8' });
    } finally {
      await rm(lintFolder, { recursive: true, force: true });
    }
    if (scenario.name === 'retains explicit true') {
      expect(saved.match(/Long\s+article\s+prose/g)).toHaveLength(1000);
      expect(saved).toContain("const value = { hello: 'world' };");
      expect(saved).toContain('```js\nconst = ;\n```');
      expect(saved).toContain('```yaml\nitems: [\n```');
    } else if (scenario.name === 'persists turning Draft off') {
      expect(saved).toContain('Rich text editing retains this body.');
    }
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
    await editor.getByRole('textbox', { name: 'Description', exact: true }).fill('Second saved description');
    await editor.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(editor).not.toBeVisible();
    expect(await readArticle()).toBe(
      saved.replace('description: Saved description', 'description: Second saved description'),
    );
  });
}
