import { skillCatalog } from '../data/resume/skills';

export interface ContentField {
  name: string;
  kind: 'string' | 'text' | 'boolean' | 'date' | 'string-list' | 'image' | 'file' | 'body';
  required?: boolean;
  default?: boolean | string[];
  cms: {
    label: string;
    default?: boolean | '{{now}}';
    help?: string;
    options?: ReadonlyArray<{ label: string; value: string }>;
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
  extensions?: readonly string[];
  format?: 'json';
  slug: string;
  summary?: string;
  sort?: {
    fields: readonly string[];
    default?: {
      field: string;
      direction: 'ascending' | 'descending';
    };
  };
  fields: Record<string, ContentField>;
}

export const blogContentModel = {
  name: 'blog',
  label: 'Blog Posts',
  labelSingular: 'Blog Post',
  folder: 'src/content/blog',
  extensions: ['md', 'mdx'],
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

const skillOptions = Object.entries(skillCatalog)
  .map(([value, skill]) => ({ label: skill.name, value }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const experienceContentModel = {
  name: 'experience',
  label: 'Experience',
  labelSingular: 'Experience Entry',
  folder: 'src/content/experience',
  extensions: ['json'],
  format: 'json',
  slug: "{{startDate | date('YYYY-MM')}}-{{organization}}-{{project}}-{{title}}",
  summary: "{{startDate | date('YYYY-MM')}} — {{organization}} — {{project}} — {{title}}",
  sort: {
    fields: ['startDate'],
    default: { field: 'startDate', direction: 'descending' },
  },
  fields: {
    title: { name: 'title', kind: 'string', required: true, cms: { label: 'Role title' } },
    organization: { name: 'organization', kind: 'string', required: true, cms: { label: 'Organization' } },
    organizationUrl: { name: 'organizationUrl', kind: 'string', cms: { label: 'Organization URL' } },
    project: { name: 'project', kind: 'string', required: true, cms: { label: 'Project or team' } },
    startDate: {
      name: 'startDate',
      kind: 'date',
      required: true,
      cms: { label: 'Start date', help: 'Choose the start date. Resume output displays only its year and month.' },
    },
    endDate: {
      name: 'endDate',
      kind: 'date',
      cms: { label: 'End date', help: 'Choose the end date, or leave blank for a current role.' },
    },
    description: { name: 'description', kind: 'text', required: true, cms: { label: 'Resume summary' } },
    highlights: { name: 'highlights', kind: 'string-list', default: [], cms: { label: 'Highlights' } },
    skills: {
      name: 'skills',
      kind: 'string-list',
      default: [],
      cms: { label: 'Skills', options: skillOptions },
    },
  },
} as const satisfies ContentCollectionModel;

export const contentModels = [blogContentModel, experienceContentModel] as const;
