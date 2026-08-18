import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { describe, expect, it } from 'vitest';

import type { ContentCollectionModel, ContentField } from '../lib/content-model/types';
import { createAstroSchema } from './astro/adapter';
import { createSveltiaCollection } from './sveltia/adapter';

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

const modelWithField = (field: ContentField): ContentCollectionModel => ({
  name: 'contract',
  label: 'Contract',
  labelSingular: 'Contract entry',
  folder: 'src/content/contract',
  slug: '{{slug}}',
  fields: { value: field },
});

interface PrimitiveContract {
  name: string;
  field: ContentField;
  valid: unknown;
  invalid: unknown;
  widget?: string;
}

const primitiveContracts: PrimitiveContract[] = [
  {
    name: 'string',
    field: { kind: 'string', required: true, cms: { label: 'Value' } },
    valid: 'value',
    invalid: 1,
  },
  {
    name: 'boolean',
    field: { kind: 'boolean', required: true, cms: { label: 'Value' } },
    valid: true,
    invalid: 'true',
    widget: 'boolean',
  },
  {
    name: 'number',
    field: { kind: 'number', required: true, cms: { label: 'Value' } },
    valid: 1,
    invalid: '1',
    widget: 'number',
  },
  {
    name: 'date',
    field: { kind: 'date', required: true, cms: { label: 'Value' } },
    valid: '2026-08-18',
    invalid: 'not-a-date',
    widget: 'datetime',
  },
  {
    name: 'list',
    field: {
      kind: 'list',
      required: true,
      items: { kind: 'string', required: true, cms: { label: 'Item' } },
      cms: { label: 'Value' },
    },
    valid: ['value'],
    invalid: [1],
    widget: 'list',
  },
  {
    name: 'object',
    field: {
      kind: 'object',
      required: true,
      fields: { child: { kind: 'string', required: true, cms: { label: 'Child' } } },
      cms: { label: 'Value' },
    },
    valid: { child: 'value' },
    invalid: {},
    widget: 'object',
  },
  {
    name: 'reference',
    field: {
      kind: 'reference',
      required: true,
      collection: 'people',
      displayFields: ['name'],
      cms: { label: 'Value' },
    },
    valid: 'person-1',
    invalid: '',
    widget: 'relation',
  },
  {
    name: 'file asset',
    field: { kind: 'asset', assetType: 'file', required: true, cms: { label: 'Value' } },
    valid: '/files/example.pdf',
    invalid: 1,
    widget: 'file',
  },
  {
    name: 'image asset',
    field: { kind: 'asset', assetType: 'image', required: true, cms: { label: 'Value' } },
    valid: { src: '/image.png', width: 10, height: 10, format: 'png' },
    invalid: '/image.png',
    widget: 'image',
  },
];

describe('content model adapter contract', () => {
  describe.each(primitiveContracts)('$name primitive', ({ field, valid, invalid, widget }) => {
    const model = modelWithField(field);
    const astroSchema = createAstroSchema(model, { image });
    const cmsField = createSveltiaCollection(model).fields[0];

    it('accepts valid content and rejects invalid or missing content in Astro', () => {
      expect(astroSchema.safeParse({ value: valid }).success).toBe(true);
      expect(astroSchema.safeParse({ value: invalid }).success).toBe(false);
      expect(astroSchema.safeParse({}).success).toBe(false);
    });

    it('maps to the corresponding Sveltia field', () => {
      expect(cmsField).toMatchObject({ name: 'value', label: 'Value', required: true });
      if (widget) expect(cmsField).toMatchObject({ widget });
      else expect(cmsField).not.toHaveProperty('widget');
    });
  });

  it.each([
    {
      name: 'optional fields',
      field: { kind: 'string', cms: { label: 'Value' } } satisfies ContentField,
      expected: undefined,
      cms: { required: false },
    },
    {
      name: 'boolean defaults with a distinct editor initial value',
      field: {
        kind: 'boolean',
        default: false,
        cms: { label: 'Value', initialValue: true },
      } satisfies ContentField,
      expected: false,
      cms: { default: true },
    },
    {
      name: 'list defaults',
      field: {
        kind: 'list',
        default: [],
        items: { kind: 'string', required: true, cms: { label: 'Item' } },
        cms: { label: 'Value' },
      } satisfies ContentField,
      expected: [],
      cms: { default: [] },
    },
    {
      name: 'multiple-reference defaults',
      field: {
        kind: 'reference',
        multiple: true,
        default: [],
        collection: 'people',
        displayFields: ['name'],
        cms: { label: 'Value' },
      } satisfies ContentField,
      expected: [],
      cms: { multiple: true, default: [] },
    },
  ])('keeps $name aligned across adapters', ({ field, expected, cms }) => {
    const model = modelWithField(field);

    expect(createAstroSchema(model, { image }).parse({}).value).toEqual(expected);
    expect(createSveltiaCollection(model).fields[0]).toMatchObject(cms);
  });

  it('uses one option set for Astro validation and the Sveltia select widget', () => {
    const options = [
      { label: 'First', value: 'first' },
      { label: 'Second', value: 'second' },
    ] as const;
    const model = modelWithField({
      kind: 'string',
      required: true,
      options,
      cms: { label: 'Value' },
    });
    const schema = createAstroSchema(model, { image });

    expect(schema.safeParse({ value: 'first' }).success).toBe(true);
    expect(schema.safeParse({ value: 'unsupported' }).success).toBe(false);
    expect(createSveltiaCollection(model).fields[0]).toMatchObject({
      widget: 'select',
      options,
    });
  });
});
