import { defineModel } from '@rm-industries/content-model';

export const skillContentModel = defineModel({
  name: 'skills',
  label: 'Skills',
  labelSingular: 'Skill',
  folder: 'src/content/skills',
  extensions: ['json'],
  format: 'json',
  slug: '{{fields._slug}}',
  sort: { fields: ['name'], default: { field: 'name', direction: 'ascending' } },
  fields: {
    name: { kind: 'string', required: true, label: 'Name' },
    description: {
      kind: 'string',
      required: true,
      label: 'Description',
      multiline: true,
    },
    href: { kind: 'string', label: 'URL' },
    trackExperienceCoverage: {
      kind: 'boolean',
      default: false,
      label: 'Track experience coverage',
      help: 'Include this skill in the duration-based experience coverage summary.',
    },
  },
});
