import { readdir, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { normalizeArticleFrontmatter } from './article-format';

describe('article frontmatter normalization', () => {
  it('orders fields without changing values, comments, unknown keys, or body text', () => {
    const source =
      '---\ncustom: keep\n# Cover credit\ncoverImage: ../../assets/cover.jpg\ntags: [git, review]\ntitle: A title\ndescription: A description\nother: also keep\n---\n\nBody with  two spaces.\n\n```text\n  untouched\n```\n';
    const result = normalizeArticleFrontmatter(source);
    const before = source.split('---\n');
    const after = result.split('---\n');
    expect(parse(after[1])).toEqual(parse(before[1]));
    expect(after[2]).toBe(before[2]);
    expect(result).toContain('# Cover credit\ncoverImage: ../../assets/cover.jpg');
    expect(Object.keys(parse(after[1]))).toEqual(['title', 'description', 'tags', 'coverImage', 'custom', 'other']);
    expect(result).not.toContain('draft:');
    expect(normalizeArticleFrontmatter(result)).toBe(result);
  });
});

it('reports an article and the expected order when hand edits drift', async () => {
  const { checkArticleFrontmatterOrder } = await import('./article-format');
  expect(() =>
    checkArticleFrontmatterOrder('---\nsection: Process\ntitle: Example\n---\nBody\n', 'example.md'),
  ).toThrow('example.md: frontmatter keys must be ordered title, section');
  expect(() =>
    checkArticleFrontmatterOrder('---\ntitle: Example\nsection: Process\n---\nBody\n', 'example.md'),
  ).not.toThrow();
});

it('keeps checked-in articles in canonical frontmatter order', async () => {
  const { checkArticleFrontmatterOrder } = await import('./article-format');
  const folder = new URL('./blog/', import.meta.url);
  const files = (await readdir(folder)).filter((file) => /\.mdx?$/.test(file));
  const failures: string[] = [];
  for (const file of files) {
    try {
      checkArticleFrontmatterOrder(await readFile(new URL(file, folder), 'utf8'), file);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  expect(failures, failures.join('\n')).toEqual([]);
});
