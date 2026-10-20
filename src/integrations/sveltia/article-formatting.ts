import { registerEventListener } from '@sveltia/cms';

import type { ArticleFormatOptions } from './article-format-options';

export function readArticleFormatOptions(value: unknown): ArticleFormatOptions {
  if (
    !value ||
    typeof value !== 'object' ||
    !('printWidth' in value) ||
    typeof value.printWidth !== 'number' ||
    !('tabWidth' in value) ||
    typeof value.tabWidth !== 'number' ||
    !('useTabs' in value) ||
    typeof value.useTabs !== 'boolean' ||
    !('embeddedLanguageFormatting' in value) ||
    value.embeddedLanguageFormatting !== 'off' ||
    !('endOfLine' in value) ||
    value.endOfLine !== 'lf' ||
    !('proseWrap' in value) ||
    !('singleQuote' in value) ||
    typeof value.singleQuote !== 'boolean' ||
    !('trailingComma' in value)
  )
    throw new Error('Invalid article formatting options');
  const { proseWrap, trailingComma } = value;
  if (proseWrap !== 'preserve' && proseWrap !== 'always' && proseWrap !== 'never')
    throw new Error('Invalid prose wrapping');
  if (trailingComma !== 'all' && trailingComma !== 'es5' && trailingComma !== 'none')
    throw new Error('Invalid trailing comma policy');
  return {
    printWidth: value.printWidth,
    tabWidth: value.tabWidth,
    useTabs: value.useTabs,
    endOfLine: value.endOfLine,
    embeddedLanguageFormatting: value.embeddedLanguageFormatting,
    proseWrap,
    singleQuote: value.singleQuote,
    trailingComma,
  };
}

export function registerArticleFormatting(options: ArticleFormatOptions): void {
  registerEventListener({
    name: 'preSave',
    handler: async ({ entry }) => {
      if (entry.get('collection') !== 'blog') return;
      const data = entry.get('data');
      const body: unknown = data.get('body');
      if (body === undefined) return;
      if (typeof body !== 'string') throw new Error('Expected article body text');
      const { formatArticleBody } = await import('./article-save-format');
      return data.set('body', await formatArticleBody(body, options));
    },
  });
}
