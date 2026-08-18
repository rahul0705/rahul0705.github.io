import { defineModel } from '../../lib/content-model/define-model';
import { financialScopeContentModel } from './financial-scopes';
import { contentLinkFields } from './shared-fields';
import { skillContentModel } from './skills';

export const experienceContentModel = defineModel({
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
    title: { kind: 'string', required: true, cms: { label: 'Role title' } },
    organization: { kind: 'string', required: true, cms: { label: 'Organization' } },
    organizationUrl: { kind: 'string', cms: { label: 'Organization URL' } },
    project: { kind: 'string', required: true, cms: { label: 'Project or team' } },
    projectUrl: {
      kind: 'string',
      cms: { label: 'Project URL', help: 'Optional public page with more information about the project.' },
    },
    additionalInformation: {
      kind: 'list',
      items: {
        kind: 'object',
        required: true,
        fields: contentLinkFields,
        cms: { label: 'Link' },
      },
      cms: {
        label: 'Additional information',
        help: 'Optional contracts, awards, reports, presentations, articles, or other project resources.',
        itemSummary: '{{fields.label}}',
      },
    },
    financialScopeIds: {
      kind: 'reference',
      default: [],
      collection: financialScopeContentModel.name,
      multiple: true,
      valueField: '{{slug}}',
      displayFields: ['name'],
      searchFields: ['name'],
      cms: {
        label: 'Financial scopes',
        help: 'Programs, contracts, budgets, investments, or other financial scope represented by this work.',
      },
    },
    startDate: {
      kind: 'date',
      required: true,
      cms: { label: 'Start date', help: 'Choose the start date. Resume output displays only its year and month.' },
    },
    endDate: {
      kind: 'date',
      cms: { label: 'End date', help: 'Choose the end date, or leave blank for a current role.' },
    },
    description: {
      kind: 'string',
      required: true,
      cms: { label: 'Resume summary', multiline: true },
    },
    highlights: {
      kind: 'list',
      default: [],
      items: { kind: 'string', required: true, cms: { label: 'Highlight' } },
      cms: { label: 'Highlights' },
    },
    skills: {
      kind: 'reference',
      default: [],
      collection: skillContentModel.name,
      multiple: true,
      valueField: '{{slug}}',
      displayFields: ['name'],
      searchFields: ['name', 'description'],
      cms: { label: 'Skills' },
    },
  },
});
