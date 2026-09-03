import type { ContentCollectionModel } from '@rm-industries/content-model';
import { describe, expect, it } from 'vitest';

import { contentModels } from './registry';

describe('content model registry', () => {
  it('contains uniquely named collections', () => {
    const names = contentModels.map((model) => model.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('uses existing fields for sorting', () => {
    const models: readonly ContentCollectionModel[] = contentModels;

    for (const model of models) {
      const fieldNames = new Set(Object.keys(model.fields));

      for (const sortField of model.sort?.fields ?? [])
        expect(sortField === 'slug' || fieldNames.has(sortField)).toBe(true);
      if (model.sort?.default)
        expect(model.sort.default.field === 'slug' || fieldNames.has(model.sort.default.field)).toBe(true);
      if (model.body) expect(fieldNames.has(model.body.name)).toBe(false);
    }
  });
});
