import { isMap, isScalar, parseDocument } from 'yaml';

import { blogContentModel } from '../config/content-models/blog';

const fieldOrder = Object.keys(blogContentModel.fields);

function readFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('Expected YAML article frontmatter');
  const document = parseDocument(match[1]);
  if (document.errors.length) throw new Error(document.errors.map((error) => error.message).join('\n'));
  if (!isMap(document.contents)) throw new Error('Expected frontmatter to be a mapping');
  const entries = document.contents.items.map((pair) => {
    if (!isScalar(pair.key) || typeof pair.key.value !== 'string') throw new Error('Expected string frontmatter keys');
    return { pair, name: pair.key.value };
  });
  return { document, entries, body: match[2] };
}

export function normalizeArticleFrontmatter(source: string): string {
  const { document, entries, body } = readFrontmatter(source);
  const ordered = entries.toSorted((a, b) => {
    const aIndex = fieldOrder.indexOf(a.name);
    const bIndex = fieldOrder.indexOf(b.name);
    return (aIndex < 0 ? fieldOrder.length : aIndex) - (bIndex < 0 ? fieldOrder.length : bIndex);
  });
  if (!isMap(document.contents)) throw new Error('Expected frontmatter to be a mapping');
  document.contents.items = ordered.map(({ pair }) => pair);
  return `---\n${document.toString({ lineWidth: 0 })}---\n${body}`;
}

export function checkArticleFrontmatterOrder(source: string, filename: string): void {
  const { entries } = readFrontmatter(source);
  const actual = entries.map(({ name }) => name);
  const expected = [
    ...fieldOrder.filter((name) => actual.includes(name)),
    ...actual.filter((name) => !fieldOrder.includes(name)),
  ];
  if (actual.join('\0') !== expected.join('\0')) {
    throw new Error(`${filename}: frontmatter keys must be ordered ${expected.join(', ')} (shared blog model order)`);
  }
}
