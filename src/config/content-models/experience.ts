import { defineModel } from '@rm-industries/content-model';

import { contentLinkFields } from './shared-fields';

export const experienceContentModel = defineModel({
  name: 'experience',
  label: 'Experience',
  labelSingular: 'Experience Entry',
  folder: 'src/content/experience',
  extensions: ['json'],
  format: 'json',
  slug: "{{startDate | date('YYYY-MM')}}-{{organization}}-{{project}}-{{title}}",
  sort: {
    fields: ['startDate'],
    default: { field: 'startDate', direction: 'descending' },
  },
  fields: {
    title: { kind: 'string', required: true, label: 'Role title' },
    organization: { kind: 'string', required: true, label: 'Organization' },
    organizationUrl: { kind: 'string', label: 'Organization URL' },
    project: { kind: 'string', required: true, label: 'Project or team' },
    projectUrl: {
      kind: 'string',
      label: 'Project URL',
      help: 'Optional public page with more information about the project.',
    },
    additionalInformation: {
      kind: 'list',
      items: {
        kind: 'object',
        required: true,
        fields: contentLinkFields,
        label: 'Link',
      },
      label: 'Additional information',
      help: 'Optional contracts, awards, reports, presentations, articles, or other project resources.',
      itemLabel: '{{fields.label}}',
    },
    financialScopeIds: {
      kind: 'list',
      default: [],
      items: { kind: 'string', required: true, label: 'Financial scope' },
      label: 'Financial scopes',
      help: 'Programs, contracts, budgets, investments, or other financial scope represented by this work.',
    },
    startDate: {
      kind: 'date',
      required: true,
      label: 'Start date',
      help: 'Choose the start date. Resume output displays only its year and month.',
    },
    endDate: {
      kind: 'date',
      label: 'End date',
      help: 'Choose the end date, or leave blank for a current role.',
    },
    description: {
      kind: 'string',
      required: true,
      label: 'Resume summary',
      multiline: true,
    },
    highlights: {
      kind: 'list',
      default: [],
      items: { kind: 'string', required: true, label: 'Highlight' },
      label: 'Highlights',
    },
    skills: {
      kind: 'list',
      default: [],
      items: { kind: 'string', required: true, label: 'Skill' },
      label: 'Skills',
    },
  },
});
