import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { scripts } from './package.json';

const root = fileURLToPath(new URL('.', import.meta.url));
const article = 'src/content/blog/fixture.md';
let project: string | undefined;

async function write(path: string, source: string) {
  assert(project);
  const target = join(project, path);
  await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, source);
}

function run(command: 'lint:markdown' | 'lint:markdown:fix' | 'lint:resume:markdown') {
  assert(project);
  const result = spawnSync('npm', ['run', command], { cwd: project, encoding: 'utf8', timeout: 10_000 });
  if (result.error) throw result.error;
  return { status: result.status, output: result.stdout + result.stderr };
}

beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), 'frontmatter-adoption-'));
  await symlink(join(root, 'node_modules'), join(project, 'node_modules'), 'dir');
  await cp(join(root, '.markdownlint-cli2.mjs'), join(project, '.markdownlint-cli2.mjs'));
  await cp(join(root, '.gitignore'), join(project, '.gitignore'));
  await cp(join(root, '.editorconfig'), join(project, '.editorconfig'));
  await write(
    'src/config/content-models/blog.ts',
    await readFile(join(root, 'src/config/content-models/blog.ts'), 'utf8'),
  );
  await write('package.json', JSON.stringify({ private: true, type: 'module', scripts }));
});

afterEach(async () => {
  if (project) await rm(project, { recursive: true, force: true });
  project = undefined;
});

describe('Markdown npm commands', () => {
  it('derives prose width from EditorConfig instead of a second lint setting', async () => {
    await write('.editorconfig', 'root = true\n\n[*]\nmax_line_length = 40\n');
    await write('README.md', `# Fixture\n\n${'word '.repeat(15).trim()}\n`);
    expect(run('lint:markdown')).toMatchObject({ status: 1, output: expect.stringContaining('Expected: 40') });

    await write('.editorconfig', 'root = true\n\n[*]\nmax_line_length = 80\n');
    const result = run('lint:markdown');
    expect(result.status, result.output).toBe(0);
  });

  it.each(['', 'off', 'true', '0', '40.5'])('rejects a missing or invalid prose width: %s', async (width) => {
    await write('.editorconfig', `root = true\n\n[*]\n${width ? `max_line_length = ${width}\n` : ''}`);
    await write('README.md', '# Fixture\n');
    const result = run('lint:markdown');
    expect(result.status).toBe(2);
    expect(result.output).toContain('max_line_length must be a positive integer');
  });

  it('requires a shared width even when README has its own width', async () => {
    await write('.editorconfig', '[README.md]\nmax_line_length = 80\n');
    await write('README.md', '# Fixture\n');
    const result = run('lint:markdown');
    expect(result.status).toBe(2);
    expect(result.output).toContain('max_line_length must be a positive integer');
  });

  it.each(['README.md', '*.md', '*.json'])('rejects a conflicting section-specific width: %s', async (section) => {
    await write('.editorconfig', `[*]\nmax_line_length = 80\n\n[${section}]\nmax_line_length = 40\n`);
    await write('README.md', '# Fixture\n');
    const result = run('lint:markdown');
    expect(result.status).toBe(2);
    expect(result.output).toContain('Conflicting EditorConfig max_line_length');
  });

  it('allows same-width sections and unrelated properties, using the last shared setting', async () => {
    await write(
      '.editorconfig',
      '[*]\nmax_line_length = 40\n\n[*]\nMAX_LINE_LENGTH = 80\n\n[README.md]\nmax_line_length = 80\n\n[*.ts]\nindent_size = 4\n',
    );
    await write('README.md', `# Fixture\n\n${'word '.repeat(15).trim()}\n`);
    const result = run('lint:markdown');
    expect(result.status, result.output).toBe(0);
  });

  it.each(['*', 'README.md'])('uses the final mixed-case width declaration in [%s]', async (section) => {
    await write(
      '.editorconfig',
      `[*]\nmax_line_length = 120\n\n[${section}]\nmax_line_length = 40\nMAX_LINE_LENGTH = 80\nmax_line_length = 120\n`,
    );
    await write('README.md', `# Fixture\n\n${'word '.repeat(20).trim()}\n`);
    const result = run('lint:markdown');
    expect(result.status, result.output).toBe(0);
  });

  it('scopes ordering to articles, allows omitted and unknown fields, and retains Git ignores', async () => {
    const source = '---\ntitle: Fixture\ndescription: Description\nextra: preserved\n---\n\n## Fixture\n';
    await write(article, source);
    await write('README.md', '---\ndescription: Description\ntitle: Documentation\n---\n\n## Documentation\n');
    await write('dist/ignored.md', 'Invalid Markdown without a heading');

    const result = run('lint:markdown');
    expect(result.status, result.output).toBe(0);
    expect(await readFile(join(project ?? '', article), 'utf8')).toBe(source);
  });

  it('reports drift without writing, then safely fixes comments and field blocks', async () => {
    const body = '\n## Fixture\n\nAn unchanged body with `inline code`.\n';
    const header = '# Document metadata\n\n';
    const title = '# Title comment\ntitle: "Fixture"\n';
    const description = '# Description comment\ndescription: Description\n';
    const extra = 'extra:\n  z: 1\n  a: 2\n';
    const source = `---\n${header}${description}${extra}${title}---\n${body}`;
    await write(article, source);

    const checked = run('lint:markdown');
    expect(checked.status).toBe(1);
    expect(checked.output).toContain('forge/frontmatter-order');
    expect(checked.output).toContain('Expected frontmatter order: title, description, extra');
    expect(await readFile(join(project ?? '', article), 'utf8')).toBe(source);

    const fixedResult = run('lint:markdown:fix');
    expect(fixedResult.status, fixedResult.output).toBe(0);
    const fixed = `---\n${header}${title}${description}${extra}---\n${body}`;
    expect(await readFile(join(project ?? '', article), 'utf8')).toBe(fixed);
    expect(run('lint:markdown:fix').status).toBe(0);
    expect(await readFile(join(project ?? '', article), 'utf8')).toBe(fixed);
  });

  it.each([
    ['duplicate keys', 'title: One\ntitle: Two\n'],
    ['anchors and aliases', 'title: &title Fixture\ndescription: *title\n'],
    ['malformed YAML', 'title: [unfinished\n'],
    ['ambiguous comments', '# Unattached header\ntitle: Fixture\n'],
  ])('leaves %s unchanged and explains why it cannot fix the document', async (_name, frontmatter) => {
    const source = `---\n${frontmatter}---\n\n# Fixture\n`;
    await write(article, source);

    const result = run('lint:markdown:fix');
    expect(result.status).toBe(1);
    expect(result.output).toContain('forge/frontmatter-order');
    expect(await readFile(join(project ?? '', article), 'utf8')).toBe(source);
  });

  it('retains prose-length enforcement and its code/table and sibling-heading exceptions', async () => {
    const long = 'word '.repeat(30).trim();
    await write('README.md', `# Fixture\n\n${long}\n`);
    expect(run('lint:markdown')).toMatchObject({ status: 1, output: expect.stringContaining('MD013') });

    await write(
      'README.md',
      `# Fixture\n\n## One\n\n### Detail\n\n## Two\n\n### Detail\n\n\`\`\`text\n${long}\n\`\`\`\n\n| Value |\n| --- |\n| ${long} |\n`,
    );
    expect(run('lint:markdown').status).toBe(0);
  });

  it('still checks generated resume Markdown even though dist is ignored by source lint', async () => {
    await write('dist/resume.md', `# Resume\n\n${'word '.repeat(30).trim()}\n`);
    expect(run('lint:resume:markdown')).toMatchObject({ status: 1, output: expect.stringContaining('MD013') });

    await write('dist/resume.md', '# Resume\n\nValid generated content.\n');
    expect(run('lint:resume:markdown').status).toBe(0);
  });
});
