import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { sitePath } from './support/site';

const articleFolder = 'src/content/blog';
const articles = readdirSync(articleFolder, { recursive: true })
  .filter((filename): filename is string => typeof filename === 'string' && filename.endsWith('.md'))
  .map((filename) => ({ filename, source: readFileSync(join(articleFolder, filename), 'utf8') }));
const synthetic = {
  filename: 'formatting-probe.md',
  source: `---\ntitle:   "Formatting probe"\ndraft: false\ntags: [test,formatting]\n---\n\n${'Deliberately unwrapped prose with enough words to require the configured line width. '.repeat(6)}\n\n\`\`\`js\nconst greeting={hello:"world",values:[1,2,3]};\n\`\`\`\n\n\`\`\`yaml\nitems: [one,two,three]\n\`\`\`\n`,
};

function cli(source: string): string {
  return execFileSync('node_modules/.bin/oxfmt', ['--stdin-filepath', 'src/content/blog/formatting-probe.md'], {
    input: source,
    encoding: 'utf8',
  });
}

test('production formatter matches the CLI for articles and supported embeds, without eager workers', async ({
  page,
}) => {
  const workers: string[] = [];
  page.on('worker', (worker) => workers.push(worker.url()));
  await page.goto(sitePath('/admin/'));
  expect(workers).toHaveLength(0);
  const sources = [...articles, synthetic];
  const expected = sources.map(({ source }) => cli(source));
  const result = await page.evaluate(
    async ({ root, sources }) => {
      const formatter = await import(`${root}/index.js`);
      const policy = await fetch(`${root}/policy.json`).then((response) => response.json());
      const output: string[] = [];
      for (const { source, filename } of sources) {
        const formatted = await formatter.format(source, filename, policy);
        if ((await formatter.format(formatted, filename, policy)) !== formatted) throw new Error('Not idempotent');
        output.push(formatted);
      }
      return output;
    },
    { root: sitePath('/admin/formatter').replace(/\/$/, ''), sources },
  );
  expect(result).toEqual(expected);
  expect(workers).toHaveLength(1);
});

test('the deployed worker uses scoped WebAssembly CSP, correct MIME types, and rejects unsafe policy', async ({
  page,
  request,
}) => {
  const root = sitePath('/admin/formatter').replace(/\/$/, '');
  for (const [filename, contentType] of [
    ['index.js', /javascript/],
    ['worker.js', /javascript/],
    ['generated/engine.js', /javascript/],
    ['generated/engine_bg.wasm', /application\/wasm/],
  ] as const) {
    const response = await request.get(`${root}/${filename}`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toMatch(contentType);
  }
  await page.route(`**${sitePath('/admin/')}*`, async (route) => {
    if (new URL(route.request().url()).pathname !== sitePath('/admin/')) return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy':
          "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:",
      },
    });
  });
  await page.goto(sitePath('/admin/'));
  const result = await page.evaluate(async (root) => {
    const { format, engine } = await import(`${root}/index.js`);
    const policy = await fetch(`${root}/policy.json`).then((response) => response.json());
    const source = '```html\n<div class="p-4 flex bg-red-500">hello</div>\n```\n';
    const formatted = await format(source, 'probe.md', policy);
    const errors: string[] = [];
    for (const invalid of [
      { ...policy, upstreamVersion: '0.0.0' },
      { ...policy, options: { ...policy.options, unknownOption: true } },
    ]) {
      try {
        await format(source, 'probe.md', invalid);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    return { formatted, errors, tailwind: engine.capabilities.tailwindClassSorting, version: engine.upstreamVersion };
  }, root);
  expect(result.formatted).toContain('class="p-4 flex bg-red-500"');
  expect(cli(result.formatted)).toContain('class="flex bg-red-500 p-4"');
  expect(result.tailwind).toBe(false);
  expect(result.errors).toHaveLength(2);
  expect(result.errors[0]).toContain(`Oxfmt ${result.version} resolved options are required`);
  expect(result.errors[1]).toMatch(/unsupported|unknown/i);
});
