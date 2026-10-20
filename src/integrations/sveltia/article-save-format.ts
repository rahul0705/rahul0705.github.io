import { lint } from 'markdownlint/promise';
import * as markdown from 'prettier/plugins/markdown';
import { format } from 'prettier/standalone';

import config from '../../../.markdownlint.json' with { type: 'json' };
import type { ArticleFormatOptions } from './article-format-options';

export async function formatArticleBody(body: string, options: ArticleFormatOptions): Promise<string> {
  const formatting = { ...options, parser: 'markdown', plugins: [markdown] };
  let result = await format(body, formatting);
  let errors = (await lint({ strings: { article: `---\ntitle: Article\n---\n${result}` }, config })).article ?? [];
  if (errors.some((error) => error.ruleNames.includes('MD013'))) {
    result = await format(result, { ...formatting, proseWrap: 'always' });
    errors = (await lint({ strings: { article: `---\ntitle: Article\n---\n${result}` }, config })).article ?? [];
  }
  if (errors.length) {
    throw new Error(
      `Article formatting: ${errors.map((error) => `body line ${Math.max(1, error.lineNumber - 3)} ${error.ruleNames[0]}: ${error.ruleDescription}${error.errorDetail ? ` (${error.errorDetail})` : ''}`).join('; ')}`,
    );
  }
  // Sveltia appends the file's final newline after serializing the body.
  return result.replace(/\n$/, '');
}
