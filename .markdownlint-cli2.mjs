import { readFileSync } from 'node:fs';

import frontmatterOrder, { frontmatterOrderFromModel } from '@rm-industries/markdownlint-frontmatter';
import { parseBuffer } from 'editorconfig';

import { blogContentModel } from './src/config/content-models/blog.ts';

// Only numeric widths are consumed; folding case before parsing preserves duplicate-property precedence.
const source = readFileSync(new URL('.editorconfig', import.meta.url), 'utf8').toLowerCase();
const widths = parseBuffer(Buffer.from(source)).map(([section, properties]) => ({
  section,
  value: properties.max_line_length,
}));
const lineLength = Number(widths.findLast(({ section, value }) => section === '*' && value !== undefined)?.value);
if (!Number.isSafeInteger(lineLength) || lineLength <= 0) {
  throw new Error('EditorConfig max_line_length must be a positive integer in [*]');
}
const conflict = widths.find(
  ({ section, value }) => section !== null && section !== '*' && value !== undefined && Number(value) !== lineLength,
);
if (conflict) {
  throw new Error(
    `Conflicting EditorConfig max_line_length in [${conflict.section}]; Markdownlint uses the shared [*] width`,
  );
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
