import type { ContentCollectionModel } from '@rm-industries/content-model';
import { createSveltiaCollections, type SveltiaCollectionOptions } from '@rm-industries/content-model/sveltia';
import type { CmsConfig } from '@sveltia/cms';

import { contentModels } from '../../config/content-models/registry';

const collectionOptions = (model: ContentCollectionModel): SveltiaCollectionOptions | undefined => {
  if (model.name === 'blog')
    return {
      customizeField: (field, context) => {
        if (context.path.endsWith('.draft') && field.widget === 'boolean') return { ...field, default: true };
        if (context.path.endsWith('.coverImage') && field.widget === 'image')
          return {
            ...field,
            media_folder: '/src/assets/{{year}}',
            public_folder: '../../assets/{{year}}',
          };
        return field;
      },
    };
  if (model.name === 'skills' || model.name === 'financial-scopes') return { summary: '{{name}}' };
  if (model.name === 'experience')
    return { summary: "{{startDate | date('YYYY-MM')}} — {{organization}} — {{project}} — {{title}}" };
  return undefined;
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
  collections: createSveltiaCollections(contentModels, collectionOptions),
} satisfies CmsConfig;
