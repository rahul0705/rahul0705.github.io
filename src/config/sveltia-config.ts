import type { CmsConfig } from '@sveltia/cms';

import { contentModels } from './content-model';
import { createSveltiaCollection } from './sveltia-adapter';

export const sveltiaConfig = {
  load_config_file: false,
  backend: {
    name: 'github',
    repo: 'rahul0705/rahul0705.github.io',
    auth_methods: ['token'],
  },
  media_folder: 'public/assets/{{year}}',
  public_folder: '/assets/{{year}}',
  collections: contentModels.map(createSveltiaCollection),
} satisfies CmsConfig;
