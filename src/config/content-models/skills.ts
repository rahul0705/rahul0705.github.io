import { defineModel } from '../../lib/content-model/define-model';

export const skillContentModel = defineModel({
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
    name: { kind: 'string', required: true, cms: { label: 'Name' } },
    description: {
      kind: 'string',
      required: true,
      cms: { label: 'Description', multiline: true },
    },
    href: { kind: 'string', cms: { label: 'URL' } },
    trackExperienceCoverage: {
      kind: 'boolean',
      default: false,
      cms: {
        label: 'Track experience coverage',
        help: 'Include this skill in the duration-based experience coverage summary.',
      },
    },
  },
});
