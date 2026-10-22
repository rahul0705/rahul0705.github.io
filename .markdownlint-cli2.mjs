import frontmatterOrder, { frontmatterOrderFromModel } from '@rm-industries/markdownlint-frontmatter';

import { blogContentModel } from './src/config/content-models/blog.ts';

export default {
  gitignore: '.gitignore',
  customRules: [frontmatterOrder],
  config: {
    MD013: { line_length: 120, code_blocks: false, tables: false },
    MD024: { siblings_only: true },
    'forge/frontmatter-order': false,
  },
  overrides: [
    {
      filter: [`${blogContentModel.folder}/**/*.md`],
      config: { 'forge/frontmatter-order': frontmatterOrderFromModel(blogContentModel) },
      combine: 'merge',
    },
  ],
};
