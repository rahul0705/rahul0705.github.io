import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { engine } from '@rm-industries/browser-oxfmt';
import { resolveBrowserOptions } from '@rm-industries/browser-oxfmt/build';
import { afterEach, expect, test } from 'vitest';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function fixture(config: object, version = engine.upstreamVersion) {
  const cwd = await mkdtemp(join(tmpdir(), 'cms-formatter-policy-'));
  fixtures.push(cwd);
  await mkdir(join(cwd, 'node_modules/oxfmt'), { recursive: true });
  await writeFile(join(cwd, 'node_modules/oxfmt/package.json'), JSON.stringify({ version }));
  await writeFile(join(cwd, '.editorconfig'), await readFile('.editorconfig'));
  await writeFile(join(cwd, '.oxfmtrc.json'), JSON.stringify(config));
  return { cwd, filename: 'src/content/blog/future-article.md', requireUniformPolicy: true };
}

test('the real project policy is uniform for future Markdown while retaining its JSON override', async () => {
  const result = await resolveBrowserOptions({
    cwd: process.cwd(),
    filename: 'src/content/blog/future-article.md',
    requireUniformPolicy: true,
  });
  expect(result.resolvedOptions.options).toMatchObject({
    printWidth: 120,
    tabWidth: 2,
    proseWrap: 'always',
    useTabs: false,
  });
  expect(result.diagnostics.map(({ code }) => code)).toEqual(['tailwind-class-order-preserved']);
});

test('a future Markdown-specific override blocks a global CMS policy', async () => {
  const input = await fixture({
    overrides: [{ files: ['src/content/blog/private/*.md'], options: { printWidth: 80 } }],
  });
  await expect(resolveBrowserOptions(input)).rejects.toThrow(/uniform|override|Markdown/i);
});

test('unsupported options and mismatched installed engines fail instead of silently diverging', async () => {
  await expect(resolveBrowserOptions(await fixture({ experimentalOption: true }))).rejects.toThrow(
    /unsupported|unknown/i,
  );
  await expect(resolveBrowserOptions(await fixture({}, '99.0.0'))).rejects.toThrow(/does not match/i);
});
