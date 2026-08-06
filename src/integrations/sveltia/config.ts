import type { CmsConfig } from '@sveltia/cms';

import { contentModels } from '../../config/content-model';
import { createSveltiaCollection } from './adapter';

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
  },
  media_folder: 'public/assets/{{year}}',
  public_folder: '/assets/{{year}}',
  collections: contentModels.map(createSveltiaCollection),
} satisfies CmsConfig;
