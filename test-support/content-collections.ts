import { readdir, readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

import { vi } from 'vitest';
import { parse } from 'yaml';

interface TestCollectionEntry {
  id: string;
  data: Record<string, unknown>;
  body: string;
}

const readCollection = async (name: string): Promise<TestCollectionEntry[]> => {
  const folder = name === 'financialScopes' ? 'financial-scopes' : name;
  const collectionUrl = new URL(`${folder}/`, new URL('../src/content/', import.meta.url));
  const files = (await readdir(collectionUrl)).filter((file) => ['.json', '.md', '.mdx'].includes(extname(file)));

  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(new URL(file, collectionUrl), 'utf8');
      const match = source.match(/^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---\r?\n?(?<body>[\s\S]*)$/);
      const data = (
        extname(file) === '.json' ? JSON.parse(source) : match?.groups ? parse(match.groups.frontmatter) : undefined
      ) as Record<string, unknown> | undefined;
      if (!data) throw new Error(`Could not parse content in ${name}/${file}`);
      if (name === 'experience') {
        data.highlights ??= [];
        data.skills ??= [];
        data.financialScopeIds ??= [];
        data.startDate = new Date(data.startDate as string);
        if (data.endDate) data.endDate = new Date(data.endDate as string);
      }

      return {
        id: basename(file, extname(file)),
        data,
        body: match?.groups?.body ?? '',
      };
    }),
  );
};

vi.mock('astro:content', () => ({
  defineCollection: <Collection>(collection: Collection): Collection => collection,
  getCollection: async (
    name: string,
    filter?: (entry: TestCollectionEntry) => boolean,
  ): Promise<TestCollectionEntry[]> => {
    const entries = await readCollection(name);
    return filter ? entries.filter(filter) : entries;
  },
}));
