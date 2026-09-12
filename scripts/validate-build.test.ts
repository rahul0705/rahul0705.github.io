import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { requiredOutputPaths, validateBuild } from './validate-build';

let root: string;
const write = (file: string, value = 'fixture') => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), value);
};
const validate = () => validateBuild(join(root, 'dist'), join(root, 'content'));
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'build-smoke-'));
  for (const file of [...requiredOutputPaths, 'blog/published/index.html']) write(`dist/${file}`);
  write('content/published.md', '---\ntitle: Published\n---\nContent');
  write('content/draft.md', '---\ndraft: true\n---\nContent');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));
describe('production build smoke check', () => {
  it('accepts complete output', () => expect(validate).not.toThrow());
  it('reports a missing output directory', () => {
    rmSync(join(root, 'dist'), { recursive: true });
    expect(validate).toThrow('Build output directory does not exist');
  });
  it.each(['rss.xml', 'resume.json', 'admin/index.html', 'blog/published/index.html'])('reports missing %s', (file) => {
    rmSync(join(root, 'dist', file));
    expect(validate).toThrow(file);
  });
  it('rejects empty output', () => {
    write('dist/resume.txt', '');
    expect(validate).toThrow('resume.txt');
  });
  it.each(['site.webmanifest', 'manifest.json', 'blog/draft/index.html'])('rejects unintended %s', (file) => {
    write(`dist/${file}`);
    expect(validate).toThrow(file);
  });
  it('rejects unresolved template tokens', () => {
    write('dist/index.html', '__FORGE_' + 'SITE_NAME__');
    expect(validate).toThrow('unresolved template token');
  });
});
