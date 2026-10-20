import type { OxfmtConfig } from 'oxfmt';
import { resolveConfig } from 'prettier';

import markdownlintConfig from '../../../.markdownlint.json' with { type: 'json' };
import oxfmtConfig, { articleFormatting } from '../../../oxfmt.config';

export interface ArticleFormatOptions {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  endOfLine: 'lf';
  embeddedLanguageFormatting: 'off';
  proseWrap: 'preserve' | 'always' | 'never';
  singleQuote: boolean;
  trailingComma: 'all' | 'es5' | 'none';
}

export async function getArticleFormatOptions(): Promise<ArticleFormatOptions> {
  const editor = await resolveConfig('src/content/blog/article.md', { editorconfig: true });
  const configured: OxfmtConfig = { ...oxfmtConfig, ...articleFormatting };
  const printWidth = configured.printWidth ?? editor?.printWidth;
  const tabWidth = configured.tabWidth ?? editor?.tabWidth;
  const endOfLine = configured.endOfLine ?? editor?.endOfLine;
  if (typeof printWidth !== 'number' || typeof tabWidth !== 'number' || endOfLine !== 'lf') {
    throw new Error('Article formatting requires a numeric line length, indentation, and LF in EditorConfig/Oxfmt');
  }
  if (markdownlintConfig.MD013.line_length !== printWidth) {
    throw new Error('Markdownlint line_length and EditorConfig/Oxfmt printWidth must agree');
  }
  return {
    printWidth,
    tabWidth,
    useTabs: configured.useTabs ?? editor?.useTabs ?? false,
    endOfLine,
    embeddedLanguageFormatting: articleFormatting.embeddedLanguageFormatting,
    proseWrap: configured.proseWrap ?? 'preserve',
    singleQuote: configured.singleQuote ?? false,
    trailingComma: configured.trailingComma ?? 'all',
  };
}
