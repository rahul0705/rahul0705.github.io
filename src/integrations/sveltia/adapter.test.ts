import { describe, expect, it } from 'vitest';

import { blogContentModel, type ContentCollectionModel } from '../../config/content-model';
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
    });
    expect(collection.fields.map((field) => field.name)).toEqual(
      Object.values(blogContentModel.fields).map((field) => field.name),
    );
  });

  it('maps shared field kinds to the expected CMS widgets and options', () => {
    expect(collection.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'title', required: true }),
        expect.objectContaining({ name: 'draft', widget: 'boolean', default: true, required: false }),
        expect.objectContaining({ name: 'description', widget: 'text', required: false }),
        expect.objectContaining({ name: 'featured', widget: 'boolean', default: false }),
        expect.objectContaining({ name: 'categories', widget: 'list', default: [] }),
        expect.objectContaining({ name: 'tags', widget: 'list', default: [] }),
        expect.objectContaining({
          name: 'coverImage',
          widget: 'image',
          required: false,
          media_folder: '/src/assets/{{year}}',
          public_folder: '../../assets/{{year}}',
        }),
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
        attachment: { name: 'attachment', kind: 'file', cms: { label: 'Attachment' } },
      },
    } as const satisfies ContentCollectionModel;

    expect(createSveltiaCollection(model).fields).toEqual([
      expect.objectContaining({ name: 'attachment', widget: 'file' }),
    ]);
  });
});
