export interface ContentField {
  name: string;
  kind: 'string' | 'text' | 'boolean' | 'date' | 'string-list' | 'image' | 'file' | 'body';
  required?: boolean;
  default?: boolean | string[];
  cms: {
    label: string;
    default?: boolean | '{{now}}';
    help?: string;
    media?: {
      mediaFolder: string;
      publicFolder: string;
    };
  };
}

export interface ContentCollectionModel {
  name: string;
  label: string;
  labelSingular: string;
  folder: string;
  slug: string;
  fields: Record<string, ContentField>;
}

export const blogContentModel = {
  name: 'blog',
  label: 'Blog Posts',
  labelSingular: 'Blog Post',
  folder: 'src/content/blog',
  slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
  fields: {
    title: { name: 'title', kind: 'string', required: true, cms: { label: 'Title' } },
    draft: {
      name: 'draft',
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Draft',
        default: true,
        help: 'Draft posts will not be published on the site.',
      },
    },
    description: { name: 'description', kind: 'text', cms: { label: 'Description' } },
    featured: { name: 'featured', kind: 'boolean', default: false, cms: { label: 'Featured' } },
    categories: { name: 'categories', kind: 'string-list', default: [], cms: { label: 'Categories' } },
    tags: { name: 'tags', kind: 'string-list', default: [], cms: { label: 'Tags' } },
    coverImage: {
      name: 'coverImage',
      kind: 'image',
      cms: {
        label: 'Cover image',
        media: {
          mediaFolder: '/src/assets/{{year}}',
          publicFolder: '../../assets/{{year}}',
        },
      },
    },
    body: { name: 'body', kind: 'body', cms: { label: 'Body' } },
  },
} as const satisfies ContentCollectionModel;

export const contentModels = [blogContentModel] as const;
