import { defineConfig } from 'oxfmt';

export default defineConfig({
  trailingComma: 'all',
  singleQuote: true,
  sortImports: true,
  sortTailwindcss: true,
  sortPackageJson: true,
  ignorePatterns: [],
  overrides: [
    {
      files: ['src/content/experience/*.json'],
      options: {
        // Match Sveltia's one-item-per-line serialization for JSON arrays.
        printWidth: 1,
      },
    },
  ],
});
