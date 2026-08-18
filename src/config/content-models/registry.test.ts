import { describe, expect, it } from 'vitest';

import type { ContentCollectionModel, ContentField } from '../../lib/content-model/types';
import { contentModels } from './registry';

const nestedFields = (field: ContentField): ContentField[] => {
  if (field.kind === 'object')
    return Object.values(field.fields).flatMap((nested) => [nested, ...nestedFields(nested)]);
  if (field.kind === 'list') return [field.items, ...nestedFields(field.items)];
  return [];
};

describe('content model registry', () => {
  it('contains uniquely named collections', () => {
    const names = contentModels.map((model) => model.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('references only registered collections', () => {
    const collectionNames = new Set(contentModels.map((model) => model.name));
    const references = contentModels.flatMap((model) =>
      Object.values(model.fields)
        .flatMap((field) => [field, ...nestedFields(field)])
        .filter((field) => field.kind === 'reference'),
    );

    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) expect(collectionNames.has(reference.collection)).toBe(true);
  });

  it('uses existing fields for identifiers and sorting', () => {
    const models: readonly ContentCollectionModel[] = contentModels;

    for (const model of models) {
      const fieldNames = new Set(Object.keys(model.fields));

      if (model.identifierField) expect(fieldNames.has(model.identifierField)).toBe(true);
      for (const sortField of model.sort?.fields ?? [])
        expect(sortField === 'slug' || fieldNames.has(sortField)).toBe(true);
      if (model.sort?.default)
        expect(model.sort.default.field === 'slug' || fieldNames.has(model.sort.default.field)).toBe(true);
      if (model.body) expect(fieldNames.has(model.body.name)).toBe(false);
    }
  });
});
