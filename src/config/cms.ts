import type { CmsConfig } from '@sveltia/cms';

import { createCmsCollection } from './cms-adapter';
import { contentModels } from './content-model';

export const cmsConfig = {
  load_config_file: false,
  backend: {
    name: 'github',
    repo: 'rahul0705/rahul0705.github.io',
    auth_methods: ['token'],
  },
  media_folder: 'public/assets/{{year}}',
  public_folder: '/assets/{{year}}',
  collections: contentModels.map(createCmsCollection),
} satisfies CmsConfig;
