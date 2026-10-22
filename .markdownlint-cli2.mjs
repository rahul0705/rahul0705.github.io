import { fileURLToPath } from 'node:url';

import frontmatterOrder, { frontmatterOrderFromModel } from '@rm-industries/markdownlint-frontmatter';
import { parseSync } from 'editorconfig';

import { blogContentModel } from './src/config/content-models/blog.ts';

const { max_line_length: lineLength } = parseSync(fileURLToPath(new URL('README.md', import.meta.url)), {
  root: fileURLToPath(new URL('.', import.meta.url)),
});
if (typeof lineLength !== 'number' || !Number.isSafeInteger(lineLength) || lineLength <= 0) {
  throw new Error('EditorConfig max_line_length must be a positive integer for Markdown');
}

export default {
  gitignore: '.gitignore',
  customRules: [frontmatterOrder],
  config: {
    MD013: { line_length: lineLength, code_blocks: false, tables: false },
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
