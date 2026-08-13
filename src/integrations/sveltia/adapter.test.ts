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
        expect.objectContaining({ name: 'section', widget: 'select', required: true }),
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

  it('maps structured link fields to nested CMS editors', () => {
    const model = {
      name: 'projects',
      label: 'Projects',
      labelSingular: 'Project',
      folder: 'src/content/projects',
      slug: '{{slug}}',
      fields: {
        contract: { name: 'contract', kind: 'link', cms: { label: 'Contract' } },
        outputs: { name: 'outputs', kind: 'link-list', default: [], cms: { label: 'Outputs' } },
      },
    } as const satisfies ContentCollectionModel;

    expect(createSveltiaCollection(model).fields).toEqual([
      expect.objectContaining({ name: 'contract', widget: 'object', required: false }),
      expect.objectContaining({ name: 'outputs', widget: 'list', required: false, summary: '{{fields.label}}' }),
    ]);
  });
});
