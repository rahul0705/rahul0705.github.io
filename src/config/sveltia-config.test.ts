import { describe, expect, it } from 'vitest';

import { blogContentModel, contentModels } from './content-model';
import { sveltiaConfig } from './sveltia-config';

describe('Sveltia CMS configuration', () => {
  it('registers every shared content model', () => {
    expect(sveltiaConfig.collections.map((collection) => collection.name)).toEqual(
      contentModels.map((model) => model.name),
    );
  });

  it('derives the Blog Posts collection from the shared model', () => {
    const [blog] = sveltiaConfig.collections;

    expect(blog).toMatchObject({
      name: blogContentModel.name,
      label: blogContentModel.label,
      label_singular: blogContentModel.labelSingular,
      folder: blogContentModel.folder,
      slug: blogContentModel.slug,
    });
    const frontmatterFieldNames = Object.values(blogContentModel.fields)
      .filter((field) => field.kind !== 'body')
      .map((field) => field.name);

    expect(blog.fields.map((field) => field.name)).toEqual([...frontmatterFieldNames, 'body']);
  });

  it('keeps CMS transport settings separate from the shared content fields', () => {
    const [blog] = sveltiaConfig.collections;

    expect(sveltiaConfig).toMatchObject({
      load_config_file: false,
      media_folder: 'public/assets/{{year}}',
      public_folder: '/assets/{{year}}',
    });
    expect(blog.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'categories', widget: 'list' }),
        expect.objectContaining({
          name: 'coverImage',
          widget: 'image',
          media_folder: '/src/assets/{{year}}',
          public_folder: '../../assets/{{year}}',
        }),
        expect.objectContaining({ name: 'description', widget: 'text' }),
        expect.objectContaining({ name: 'draft', default: true }),
        expect.objectContaining({ name: 'title', required: true }),
      ]),
    );
  });
});
