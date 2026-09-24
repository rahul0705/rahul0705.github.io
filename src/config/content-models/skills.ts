import { defineModel } from '@rm-industries/content-model';

import { skillCategories } from '../skill-categories';

export const skillContentModel = defineModel({
  name: 'skills',
  label: 'Skills',
  labelSingular: 'Skill',
  folder: 'src/content/skills',
  extensions: ['json'],
  format: 'json',
  slug: '{{fields._slug}}',
  entryLabelField: 'name',
  sort: { fields: ['name'], default: { field: 'name', direction: 'ascending' } },
  fields: {
    name: { kind: 'string', required: true, label: 'Name' },
    category: {
      kind: 'string',
      required: true,
      options: skillCategories,
      label: 'Category',
    },
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
