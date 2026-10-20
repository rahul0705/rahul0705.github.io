import { defineConfig } from 'oxfmt';

export const articleFormatting = {
  // Keep article code examples unchanged while formatting their surrounding Markdown.
  embeddedLanguageFormatting: 'off',
  proseWrap: 'preserve',
} as const;

export default defineConfig({
  trailingComma: 'all',
  singleQuote: true,
  sortImports: true,
  sortTailwindcss: true,
  sortPackageJson: true,
  ignorePatterns: [],
  overrides: [
    { files: ['src/content/blog/*.md', 'src/content/blog/*.mdx'], options: articleFormatting },
    {
      files: ['src/content/experience/*.json'],
      options: {
        // Match Sveltia's one-item-per-line serialization for JSON arrays.
        printWidth: 1,
      },
    },
  ],
});
