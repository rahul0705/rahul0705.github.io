import { defineModel } from '../../lib/content-model/define-model';

export const blogContentModel = defineModel({
  name: 'blog',
  label: 'Blog Posts',
  labelSingular: 'Blog Post',
  folder: 'src/content/blog',
  extensions: ['md', 'mdx'],
  slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
  fields: {
    title: { kind: 'string', required: true, cms: { label: 'Title' } },
    draft: {
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Draft',
        initialValue: true,
        help: 'Draft posts will not be published on the site.',
      },
    },
    description: { kind: 'string', cms: { label: 'Description', multiline: true } },
    updatedDate: {
      kind: 'date',
      cms: {
        label: 'Updated date',
        help: 'Set this only when a post receives a meaningful content revision.',
      },
    },
    featured: { kind: 'boolean', default: false, cms: { label: 'Featured' } },
    tableOfContents: {
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Table of contents',
        help: 'Show links to the article headings above the body.',
      },
    },
    section: {
      kind: 'string',
      required: true,
      options: [
        { label: 'Process', value: 'Process' },
        { label: 'Projects', value: 'Projects' },
      ],
      cms: {
        label: 'Section',
        help: 'Choose the broad editorial section for this article.',
      },
    },
    tags: {
      kind: 'list',
      default: [],
      items: { kind: 'string', required: true, cms: { label: 'Tag' } },
      cms: { label: 'Tags' },
    },
    coverImage: {
      kind: 'asset',
      assetType: 'image',
      cms: {
        label: 'Cover image',
        media: {
          mediaFolder: '/src/assets/{{year}}',
          publicFolder: '../../assets/{{year}}',
        },
      },
    },
  },
  body: { name: 'body', cms: { label: 'Body' } },
});
