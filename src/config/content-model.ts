export interface ContentField {
  name: string;
  kind:
    | 'string'
    | 'text'
    | 'boolean'
    | 'number'
    | 'date'
    | 'string-list'
    | 'relation'
    | 'object'
    | 'link'
    | 'link-list'
    | 'image'
    | 'file'
    | 'body';
  required?: boolean;
  default?: boolean | number | string[] | ContentLink[];
  min?: number;
  fields?: Record<string, ContentField>;
  relation?: {
    collection: string;
    multiple?: boolean;
    valueField?: string;
    displayFields: readonly string[];
    searchFields?: readonly string[];
  };
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

export interface ContentLink {
  label: string;
  url: string;
}

export interface ContentCollectionModel {
  name: string;
  label: string;
  labelSingular: string;
  folder: string;
  extensions?: readonly string[];
  format?: 'json';
  identifierField?: string;
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
    updatedDate: {
      name: 'updatedDate',
      kind: 'date',
      cms: {
        label: 'Updated date',
        help: 'Set this only when a post receives a meaningful content revision.',
      },
    },
    featured: { name: 'featured', kind: 'boolean', default: false, cms: { label: 'Featured' } },
    section: {
      name: 'section',
      kind: 'string',
      required: true,
      cms: {
        label: 'Section',
        help: 'Choose the broad editorial section for this article.',
        options: [
          { label: 'Process', value: 'Process' },
          { label: 'Projects', value: 'Projects' },
        ],
      },
    },
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

export const skillContentModel = {
  name: 'skills',
  label: 'Skills',
  labelSingular: 'Skill',
  folder: 'src/content/skills',
  extensions: ['json'],
  format: 'json',
  identifierField: 'name',
  slug: '{{fields._slug}}',
  summary: '{{name}}',
  sort: { fields: ['name'], default: { field: 'name', direction: 'ascending' } },
  fields: {
    name: { name: 'name', kind: 'string', required: true, cms: { label: 'Name' } },
    description: { name: 'description', kind: 'text', required: true, cms: { label: 'Description' } },
    href: { name: 'href', kind: 'string', cms: { label: 'URL' } },
    trackExperienceCoverage: {
      name: 'trackExperienceCoverage',
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Track experience coverage',
        help: 'Include this skill in the duration-based experience coverage summary.',
      },
    },
  },
} as const satisfies ContentCollectionModel;

export const financialScopeContentModel = {
  name: 'financialScopes',
  label: 'Financial Scopes',
  labelSingular: 'Financial Scope',
  folder: 'src/content/financial-scopes',
  extensions: ['json'],
  format: 'json',
  identifierField: 'name',
  slug: '{{fields._slug}}',
  summary: '{{name}}',
  sort: { fields: ['name'], default: { field: 'name', direction: 'ascending' } },
  fields: {
    name: { name: 'name', kind: 'string', required: true, cms: { label: 'Name' } },
    amount: {
      name: 'amount',
      kind: 'number',
      required: true,
      min: 0.01,
      cms: { label: 'Fallback amount', help: 'Positive checked-in value used when the source cannot be refreshed.' },
    },
    currency: {
      name: 'currency',
      kind: 'string',
      required: true,
      cms: { label: 'Currency', options: [{ label: 'USD', value: 'USD' }] },
    },
    category: {
      name: 'category',
      kind: 'string',
      required: true,
      cms: {
        label: 'Category',
        options: [
          { label: 'Contract', value: 'contract' },
          { label: 'Program budget', value: 'program-budget' },
          { label: 'Investment', value: 'investment' },
          { label: 'Revenue', value: 'revenue' },
          { label: 'Other', value: 'other' },
        ],
      },
    },
    amountBasis: {
      name: 'amountBasis',
      kind: 'string',
      required: true,
      cms: {
        label: 'Amount basis',
        options: [
          { label: 'Ceiling', value: 'ceiling' },
          { label: 'Base and options', value: 'base-and-options' },
          { label: 'Annual', value: 'annual' },
          { label: 'Lifetime', value: 'lifetime' },
          { label: 'Estimated', value: 'estimated' },
        ],
      },
    },
    source: {
      name: 'source',
      kind: 'object',
      cms: { label: 'USAspending source', help: 'Optional source used to refresh the checked-in fallback value.' },
      fields: {
        provider: {
          name: 'provider',
          kind: 'string',
          required: true,
          cms: { label: 'Provider', options: [{ label: 'USAspending', value: 'usaspending' }] },
        },
        awardId: { name: 'awardId', kind: 'string', required: true, cms: { label: 'Award ID' } },
        amountField: {
          name: 'amountField',
          kind: 'string',
          required: true,
          cms: {
            label: 'Amount field',
            options: [{ label: 'Base and all options', value: 'base_and_all_options' }],
          },
        },
      },
    },
    sourceUrl: { name: 'sourceUrl', kind: 'string', cms: { label: 'Source URL' } },
    asOf: { name: 'asOf', kind: 'string', cms: { label: 'As-of date' } },
  },
} as const satisfies ContentCollectionModel;

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
    projectUrl: {
      name: 'projectUrl',
      kind: 'string',
      cms: { label: 'Project URL', help: 'Optional public page with more information about the project.' },
    },
    additionalInformation: {
      name: 'additionalInformation',
      kind: 'link-list',
      cms: {
        label: 'Additional information',
        help: 'Optional contracts, awards, reports, presentations, articles, or other project resources.',
      },
    },
    financialScopeIds: {
      name: 'financialScopeIds',
      kind: 'relation',
      default: [],
      relation: {
        collection: financialScopeContentModel.name,
        multiple: true,
        valueField: '{{slug}}',
        displayFields: ['name'],
        searchFields: ['name'],
      },
      cms: {
        label: 'Financial scopes',
        help: 'Programs, contracts, budgets, investments, or other financial scope represented by this work.',
      },
    },
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
      kind: 'relation',
      default: [],
      relation: {
        collection: skillContentModel.name,
        multiple: true,
        valueField: '{{slug}}',
        displayFields: ['name'],
        searchFields: ['name', 'description'],
      },
      cms: { label: 'Skills' },
    },
  },
} as const satisfies ContentCollectionModel;

export const contentModels = [
  blogContentModel,
  skillContentModel,
  financialScopeContentModel,
  experienceContentModel,
] as const;
