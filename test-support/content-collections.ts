import { readdir, readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

import { vi } from 'vitest';
import { parse } from 'yaml';

interface TestCollectionEntry {
  id: string;
  data: Record<string, unknown>;
  body: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const readCollection = async (name: string): Promise<TestCollectionEntry[]> => {
  const folder = name === 'financialScopes' ? 'financial-scopes' : name;
  const collectionUrl = new URL(`${folder}/`, new URL('../src/content/', import.meta.url));
  const files = (await readdir(collectionUrl)).filter((file) => ['.json', '.md', '.mdx'].includes(extname(file)));

  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(new URL(file, collectionUrl), 'utf8');
      const match = source.match(/^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---\r?\n?(?<body>[\s\S]*)$/);
      const data: unknown =
        extname(file) === '.json' ? JSON.parse(source) : match?.groups ? parse(match.groups.frontmatter) : undefined;
      if (!isRecord(data)) throw new Error(`Could not parse content in ${name}/${file}`);
      if (name === 'experience') {
        data.highlights ??= [];
        data.skills ??= [];
        data.financialScopeIds ??= [];
        if (typeof data.startDate !== 'string' || Number.isNaN(Date.parse(data.startDate))) {
          throw new Error(`Invalid start date in ${name}/${file}`);
        }
        data.startDate = new Date(data.startDate);
        if (data.endDate) {
          if (typeof data.endDate !== 'string' || Number.isNaN(Date.parse(data.endDate))) {
            throw new Error(`Invalid end date in ${name}/${file}`);
          }
          data.endDate = new Date(data.endDate);
        }
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
