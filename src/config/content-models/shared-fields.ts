import type { ContentField } from '../../lib/content-model/types';

export const contentLinkFields = {
  label: { kind: 'string', required: true, cms: { label: 'Label' } },
  url: { kind: 'string', required: true, cms: { label: 'URL' } },
} as const satisfies Record<string, ContentField>;
