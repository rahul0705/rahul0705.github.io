import { defineModel } from '../../lib/content-model/define-model';

export const blogContentModel = defineModel({
  name: 'blog',
  label: 'Blog Posts',
  labelSingular: 'Blog Post',
  folder: 'src/content/blog',
  extensions: ['md', 'mdx'],
  slug: "{{publishedDate | date('YYYY-MM-DD')}}-{{slug}}",
  sort: {
    fields: ['slug', 'title'],
    default: { field: 'slug', direction: 'descending' },
  },
  fields: {
    title: {
      kind: 'string',
      required: true,
      cms: { label: 'Title', help: 'Use a unique, descriptive article title.' },
    },
    draft: {
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Draft',
        initialValue: true,
        help: 'Draft posts will not be published on the site.',
      },
    },
    description: {
      kind: 'string',
      required: true,
      cms: { label: 'Description', multiline: true, help: 'Write a concise, unique search and social summary.' },
    },
    publishedDate: {
      kind: 'date',
      required: true,
      cms: { label: 'Publication date', help: 'The authoritative public publication date for this article.' },
    },
    updatedDate: {
      kind: 'date',
      cms: {
        label: 'Updated date',
        help: 'Set this only when a post receives a meaningful content revision.',
      },
    },
    tableOfContents: {
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Table of contents',
        help: 'Show links to the article headings above the body.',
      },
    },
    featured: {
      kind: 'boolean',
      default: false,
      cms: { label: 'Featured', help: 'Include this article in the Selected Writing section on the homepage.' },
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
      required: true,
      cms: {
        label: 'Cover image',
        help: 'Store article covers in src/assets and record third-party attribution in the adjacent attribution file.',
        media: {
          mediaFolder: '/src/assets/{{year}}',
          publicFolder: '../../assets/{{year}}',
        },
      },
    },
    coverImageAlt: {
      kind: 'string',
      required: true,
      cms: {
        label: 'Cover image alt text',
        help: 'Describe the meaningful visual content rather than repeating the title.',
      },
    },
  },
  body: { name: 'body', cms: { label: 'Body' } },
});
