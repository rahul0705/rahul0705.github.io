import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { describe, expect, it } from 'vitest';

import { blogContentModel, experienceContentModel } from '../../config/content-model';
import { createAstroSchema } from './adapter';

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
    expect(schema.parse({ title: 'A post', section: 'Process' })).toMatchObject({
      title: 'A post',
      draft: false,
      featured: false,
      section: 'Process',
      tags: [],
    });
  });

  it('requires fields marked as required in the shared content model', () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ title: 'A post', section: 'process' })).toThrow();
  });

  it('supports an optional updated date without requiring it on existing posts', () => {
    expect(schema.parse({ title: 'Existing post', section: 'Process' }).updatedDate).toBeUndefined();
    expect(schema.parse({ title: 'Revised post', section: 'Process', updatedDate: '2026-08-12' }).updatedDate).toEqual(
      new Date('2026-08-12T00:00:00.000Z'),
    );
  });

  it('coerces experience calendar dates to Date values', () => {
    const experienceSchema = createAstroSchema(experienceContentModel, { image });
    const requiredFields = {
      title: 'Engineer',
      organization: 'Example',
      project: 'Platform',
      description: 'Built the platform.',
    };

    expect(experienceSchema.parse({ ...requiredFields, startDate: '2026-08-06' })).toMatchObject({
      startDate: new Date('2026-08-06T00:00:00.000Z'),
    });
    expect(
      experienceSchema.parse({
        ...requiredFields,
        startDate: '2026-08-06',
        additionalInformation: [
          { label: 'Award notice', url: 'https://example.com/contract' },
          { label: 'Project report', url: '/report.pdf' },
        ],
      }),
    ).toMatchObject({
      additionalInformation: [
        { label: 'Award notice', url: 'https://example.com/contract' },
        { label: 'Project report', url: '/report.pdf' },
      ],
    });
    expect(experienceSchema.parse({ ...requiredFields, startDate: '2026-08-06', endDate: null })).toMatchObject({
      startDate: new Date('2026-08-06T00:00:00.000Z'),
      endDate: undefined,
    });
    expect(() => experienceSchema.parse({ ...requiredFields, startDate: '2026-13-01' })).toThrow();
    expect(() => experienceSchema.parse({ ...requiredFields, startDate: null })).toThrow();
  });
});
