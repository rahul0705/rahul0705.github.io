import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      draft: z.boolean().default(false),
      description: z.string().optional(),
      publishedAt: z.coerce.date().optional(),
      featured: z.boolean().default(false),
      categories: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      coverImage: image().optional(),
    }),
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
});

export const collections = {
  blog,
};
