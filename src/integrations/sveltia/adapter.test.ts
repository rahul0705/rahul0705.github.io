import { describe, expect, it } from 'vitest';

import { blogContentModel } from '../../config/content-models/blog';
import { experienceContentModel } from '../../config/content-models/experience';
import { financialScopeContentModel } from '../../config/content-models/financial-scopes';
import type { ContentCollectionModel } from '../../lib/content-model/types';
import { createSveltiaCollection } from './adapter';

describe('Sveltia CMS adapter', () => {
  const collection = createSveltiaCollection(blogContentModel);

  it('derives collection metadata and field order from the content model', () => {
    expect(collection).toMatchObject({
      name: blogContentModel.name,
      label: blogContentModel.label,
      label_singular: blogContentModel.labelSingular,
      folder: blogContentModel.folder,
      slug: blogContentModel.slug,
      sortable_fields: {
        fields: ['slug', 'title'],
        default: { field: 'slug', direction: 'descending' },
      },
    });
    expect(collection.fields.map((field) => field.name)).toEqual([
      ...Object.keys(blogContentModel.fields),
      blogContentModel.body.name,
    ]);
  });

  it('maps shared field kinds to the expected CMS widgets and options', () => {
    expect(collection.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'title', required: true }),
        expect.objectContaining({ name: 'draft', widget: 'boolean', default: true, required: false }),
        expect.objectContaining({ name: 'description', widget: 'text', required: true }),
        expect.objectContaining({ name: 'publishedDate', widget: 'datetime', required: true }),
        expect.objectContaining({ name: 'featured', widget: 'boolean', default: false }),
        expect.objectContaining({ name: 'section', widget: 'select', required: true }),
        expect.objectContaining({ name: 'tags', widget: 'list', default: [] }),
        expect.objectContaining({
          name: 'coverImage',
          widget: 'image',
          required: true,
          media_folder: '/src/assets/{{year}}',
          public_folder: '../../assets/{{year}}',
        }),
        expect.objectContaining({ name: 'coverImageAlt', required: true }),
        expect.objectContaining({ name: 'body', widget: 'richtext' }),
      ]),
    );
  });

  it('maps file fields to the global public-asset location', () => {
    const model = {
      name: 'documents',
      label: 'Documents',
      labelSingular: 'Document',
      folder: 'src/content/documents',
      slug: '{{slug}}',
      fields: {
        attachment: { kind: 'asset', assetType: 'file', cms: { label: 'Attachment' } },
      },
    } as const satisfies ContentCollectionModel;

    expect(createSveltiaCollection(model).fields).toEqual([
      expect.objectContaining({ name: 'attachment', widget: 'file' }),
    ]);
  });

  it('maps structured link fields to nested CMS editors', () => {
    const model = {
      name: 'projects',
      label: 'Projects',
      labelSingular: 'Project',
      folder: 'src/content/projects',
      slug: '{{slug}}',
      fields: {
        contract: {
          kind: 'object',
          fields: {
            label: { kind: 'string', required: true, cms: { label: 'Label' } },
            url: { kind: 'string', required: true, cms: { label: 'URL' } },
          },
          cms: { label: 'Contract' },
        },
        outputs: {
          kind: 'list',
          default: [],
          items: {
            kind: 'object',
            required: true,
            fields: {
              label: { kind: 'string', required: true, cms: { label: 'Label' } },
              url: { kind: 'string', required: true, cms: { label: 'URL' } },
            },
            cms: { label: 'Link' },
          },
          cms: { label: 'Outputs', itemSummary: '{{fields.label}}' },
        },
      },
    } as const satisfies ContentCollectionModel;

    expect(createSveltiaCollection(model).fields).toEqual([
      expect.objectContaining({ name: 'contract', widget: 'object', required: false }),
      expect.objectContaining({ name: 'outputs', widget: 'list', required: false, summary: '{{fields.label}}' }),
    ]);
  });

  it('maps catalog fields and searchable relations to CMS widgets', () => {
    const financialScopes = createSveltiaCollection(financialScopeContentModel);
    const experience = createSveltiaCollection(experienceContentModel);

    expect(financialScopes).toMatchObject({
      identifier_field: 'name',
      slug: '{{fields._slug}}',
      format: 'json',
      extension: 'json',
    });
    expect(financialScopes.fields.find((field) => field.name === 'amount')).toMatchObject({
      widget: 'number',
      value_type: 'float',
      min: 0.01,
    });
    expect(financialScopes.fields.find((field) => field.name === 'source')).toMatchObject({
      widget: 'object',
      fields: expect.arrayContaining([
        expect.objectContaining({ name: 'provider', widget: 'select' }),
        expect.objectContaining({ name: 'awardId', required: true }),
      ]),
    });
    expect(experience.fields.find((field) => field.name === 'skills')).toMatchObject({
      widget: 'relation',
      collection: 'skills',
      value_field: '{{slug}}',
      display_fields: ['name'],
      search_fields: ['name', 'description'],
      multiple: true,
    });
  });

  it('maps list variants and minimal collection metadata', () => {
    const model = {
      name: 'variants',
      label: 'Variants',
      labelSingular: 'Variant',
      folder: 'src/content/variants',
      slug: '{{slug}}',
      fields: {
        statuses: {
          kind: 'list',
          items: {
            kind: 'string',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            cms: { label: 'Status' },
          },
          cms: { label: 'Statuses' },
        },
        flags: {
          kind: 'list',
          items: { kind: 'boolean', cms: { label: 'Flag' } },
          cms: { label: 'Flags' },
        },
        owner: {
          kind: 'reference',
          collection: 'people',
          displayFields: ['name'],
          cms: { label: 'Owner' },
        },
      },
    } as const satisfies ContentCollectionModel;

    expect(createSveltiaCollection(model)).toMatchObject({
      name: 'variants',
      fields: [
        expect.objectContaining({ name: 'statuses', widget: 'select', multiple: true }),
        expect.objectContaining({
          name: 'flags',
          widget: 'list',
          field: expect.objectContaining({ name: 'item', widget: 'boolean' }),
        }),
        expect.objectContaining({
          name: 'owner',
          widget: 'relation',
          value_field: '{{slug}}',
          multiple: false,
        }),
      ],
    });
  });
});
