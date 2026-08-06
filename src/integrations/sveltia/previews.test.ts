import { registerPreviewTemplate } from '@sveltia/cms';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerSveltiaPreviews } from './previews';

vi.mock('@sveltia/cms', () => ({ registerPreviewTemplate: vi.fn() }));

describe('Sveltia CMS previews', () => {
  beforeEach(() => {
    vi.mocked(registerPreviewTemplate).mockClear();
    registerSveltiaPreviews();
  });

  it('registers custom previews for articles and experience entries', () => {
    expect(vi.mocked(registerPreviewTemplate).mock.calls.map(([name]) => name)).toEqual(['blog', 'experience']);
  });
});
