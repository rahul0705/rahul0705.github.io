import { format } from 'oxfmt';
import { describe, expect, it } from 'vitest';

import { getArticleFormatOptions } from './article-format-options';
import { formatArticleBody } from './article-save-format';

describe('CMS article save formatting', () => {
  it('wraps overlong prose using the repository line length and converges on re-save', async () => {
    const options = await getArticleFormatOptions();
    const source = `${'A useful sentence about editing. '.repeat(12).trim()}\n`;
    const result = await formatArticleBody(source, options);
    expect(result.split('\n').every((line) => line.length <= options.printWidth)).toBe(true);
    expect(result.replace(/\s+/g, ' ').trim()).toBe(source.trim());
    expect(await formatArticleBody(result, { ...options })).toBe(result);
  });
});

it('preserves code, tables, and intentional hard breaks and agrees with Oxfmt', async () => {
  const options = await getArticleFormatOptions();
  const code = 'x'.repeat(options.printWidth + 20);
  const cell = 'table text '.repeat(20).trim();
  const source = [
    'First line  ',
    'second line.',
    '',
    '- Parent',
    '  - Nested',
    '',
    '```text',
    code,
    '```',
    '',
    '| Column |',
    '| --- |',
    `| ${cell} |`,
    '',
  ].join('\n');
  const result = await formatArticleBody(source, options);
  expect(result).toContain(code);
  expect(result).toContain(cell);
  expect(result).toMatch(/First line(?: {2}|\\)\nsecond line\./);
  expect(result).toContain('- Parent\n  - Nested');
  expect(await formatArticleBody(result, { ...options })).toBe(result);
  const editor = await format('article.md', result, { ...options });
  expect(editor.errors).toEqual([]);
  expect(editor.code).toBe(result);
});

it('rejects remaining lint errors with an actionable save error', async () => {
  await expect(formatArticleBody('## Repeated\n\n## Repeated\n', await getArticleFormatOptions())).rejects.toThrow(
    'MD024',
  );
});
