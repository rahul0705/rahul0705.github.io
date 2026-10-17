import { createAstroSchema } from '@rm-industries/content-model/astro';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';

import { blogContentModel } from './blog';

const schema = createAstroSchema(blogContentModel, {
  image: () =>
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
        z.literal('apng'),
      ]),
    }),
});
const post = { title: 'A draft article', description: 'An article in progress.', section: 'Projects' };
const cover = {
  coverImage: { src: '/cover.png', width: 1200, height: 675, format: 'png' },
  coverImageAlt: 'A workstation with a laptop and notebook.',
};

describe('blog cover requirements', () => {
  it('allows drafts without either cover field', () => {
    expect(schema.safeParse({ ...post, draft: true }).success).toBe(true);
  });

  it.each([false, undefined])('rejects missing published cover metadata with draft=%s', (draft) => {
    const result = schema.safeParse({ ...post, draft });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path)).toEqual([['coverImage'], ['coverImageAlt']]);
    }
  });

  it.each(['coverImage', 'coverImageAlt'] as const)('rejects a published post missing %s', (field) => {
    const result = schema.safeParse({ ...post, ...cover, draft: false, [field]: undefined });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path)).toEqual([[field]]);
  });

  it('accepts published posts with both cover fields', () => {
    expect(schema.safeParse({ ...post, ...cover, draft: false }).success).toBe(true);
  });
});
