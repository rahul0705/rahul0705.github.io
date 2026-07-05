import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'import-notation': [
      'string',
      {
        ignore: ['tailwindcss'],
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['plugin'],
      },
    ],
  },
} satisfies Config;
