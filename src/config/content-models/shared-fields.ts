import type { ContentField } from '@rm-industries/content-model';

export const contentLinkFields = {
  label: { kind: 'string', required: true, label: 'Label' },
  url: { kind: 'string', required: true, label: 'URL' },
} as const satisfies Record<string, ContentField>;
