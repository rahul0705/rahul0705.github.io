import { describe, expect, it } from 'vitest';

import { contentModels } from './config/content-models/registry';
import { collections } from './content.config';

describe('Astro content configuration', () => {
  it('registers every shared content model', () => {
    expect(Object.keys(collections)).toEqual(contentModels.map((model) => model.name));
  });
});
