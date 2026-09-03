import { createSveltiaCollection } from '@rm-industries/content-model/sveltia';
import type { CmsConfig, EntryCollection, Field } from '@sveltia/cms';

import { contentModels } from '../../config/content-models/registry';

const customizeCollection = (collection: EntryCollection): EntryCollection => {
  if (collection.name === 'blog') {
    collection.fields = collection.fields.map((field) => {
      if (field.name === 'draft') return { ...field, default: true } as Field;
      if (field.name === 'coverImage')
        return {
          ...field,
          media_folder: '/src/assets/{{year}}',
          public_folder: '../../assets/{{year}}',
        } as Field;
      return field;
    });
  }

  if (collection.name === 'skills' || collection.name === 'financial-scopes') {
    collection.identifier_field = 'name';
    collection.summary = '{{name}}';
  }

  if (collection.name === 'experience') {
    collection.summary = "{{startDate | date('YYYY-MM')}} — {{organization}} — {{project}} — {{title}}";
    collection.fields = collection.fields.map((field) => {
      if (field.name === 'financialScopeIds')
        return {
          ...field,
          widget: 'relation',
          collection: 'financial-scopes',
          value_field: '{{slug}}',
          display_fields: ['name'],
          search_fields: ['name'],
          multiple: true,
        } as Field;
      if (field.name === 'skills')
        return {
          ...field,
          widget: 'relation',
          collection: 'skills',
          value_field: '{{slug}}',
          display_fields: ['name'],
          search_fields: ['name', 'description'],
          multiple: true,
        } as Field;
      return field;
    });
  }

  return collection;
};

export const sveltiaConfig = {
  load_config_file: false,
  app_title: 'Rahul Mohandas Content Manager',
  logo: {
    src: '/favicon.svg',
  },
  backend: {
    name: 'github',
    repo: 'rahul0705/rahul0705.github.io',
    auth_methods: ['token'],
    commit_messages: {
      create: 'content({{collection}}): create {{slug}}',
      update: 'content({{collection}}): update {{slug}}',
      delete: 'content({{collection}}): delete {{slug}}',
      uploadMedia: 'content(assets): upload {{path}}',
      deleteMedia: 'content(assets): delete {{path}}',
    },
  },
  media_folder: 'public/assets/{{year}}',
  public_folder: '/assets/{{year}}',
  output: {
    omit_empty_optional_fields: true,
  },
  collections: contentModels.map(createSveltiaCollection).map(customizeCollection),
} satisfies CmsConfig;
