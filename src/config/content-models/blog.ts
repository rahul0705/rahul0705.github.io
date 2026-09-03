import { defineModel } from '@rm-industries/content-model';

export const blogContentModel = defineModel({
  name: 'blog',
  label: 'Blog Posts',
  labelSingular: 'Blog Post',
  folder: 'src/content/blog',
  extensions: ['md', 'mdx'],
  slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
  sort: {
    fields: ['slug', 'title'],
    default: { field: 'slug', direction: 'descending' },
  },
  fields: {
    title: { kind: 'string', required: true, label: 'Title' },
    draft: {
      kind: 'boolean',
      default: false,
      label: 'Draft',
      help: 'Draft posts will not be published on the site.',
    },
    description: { kind: 'string', label: 'Description', multiline: true },
    updatedDate: {
      kind: 'date',
      label: 'Updated date',
      help: 'Set this only when a post receives a meaningful content revision.',
    },
    tableOfContents: {
      kind: 'boolean',
      default: false,
      label: 'Table of contents',
      help: 'Show links to the article headings above the body.',
    },
    section: {
      kind: 'string',
      required: true,
      options: [
        { label: 'Process', value: 'Process' },
        { label: 'Projects', value: 'Projects' },
      ],
      label: 'Section',
      help: 'Choose the broad editorial section for this article.',
    },
    tags: {
      kind: 'list',
      default: [],
      items: { kind: 'string', required: true, label: 'Tag' },
      label: 'Tags',
    },
    coverImage: {
      kind: 'asset',
      assetType: 'image',
      label: 'Cover image',
    },
  },
  body: { name: 'body', label: 'Body' },
});
