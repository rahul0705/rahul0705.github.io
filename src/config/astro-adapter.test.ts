import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { describe, expect, it } from 'vitest';

import { createAstroSchema } from './astro-adapter';
import { blogContentModel } from './content-model';

describe('Astro content adapter', () => {
  const image: SchemaContext['image'] = () =>
    z.object({
      src: z.string(),
      width: z.number(),
      height: z.number(),
      format: z.union([
        z.literal('png'),
        z.literal('jpg'),
        z.literal('jpeg'),
        z.literal('tiff'),
        z.literal('webp'),
        z.literal('gif'),
        z.literal('svg'),
        z.literal('avif'),
      ]),
    });
  const schema = createAstroSchema(blogContentModel, { image });

  it('derives frontmatter defaults from the shared content model', () => {
    expect(schema.parse({ title: 'A post' })).toMatchObject({
      title: 'A post',
      draft: false,
      featured: false,
      categories: [],
      tags: [],
    });
  });

  it('requires fields marked as required in the shared content model', () => {
    expect(() => schema.parse({})).toThrow();
  });
});
