import { readdir, readFile } from 'node:fs/promises';

import { expect, it } from 'vitest';
import { parseDocument } from 'yaml';

it('stores an explicit draft boolean on every article', async () => {
  const folder = new URL('./blog/', import.meta.url);
  const files = (await readdir(folder)).filter((file) => /\.mdx?$/.test(file));
  for (const file of files) {
    const source = await readFile(new URL(file, folder), 'utf8');
    const [, metadata] = source.split(/^---\r?$/m);
    expect(typeof parseDocument(metadata).get('draft'), file).toBe('boolean');
  }
});
