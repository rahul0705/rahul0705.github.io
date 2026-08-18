import { describe, expect, it } from 'vitest';

import { defineModel } from './define-model';
import type { ContentField } from './types';

describe('content model definitions', () => {
  it('derives defaults and CMS initial values from the field kind', () => {
    const booleanField = {
      kind: 'boolean',
      default: false,
      cms: { label: 'Draft', initialValue: true },
    } as const satisfies ContentField;
    const dateField = {
      kind: 'date',
      cms: { label: 'Published at', initialValue: '{{now}}' },
    } as const satisfies ContentField;

    expect(booleanField.cms.initialValue).toBe(true);
    expect(dateField.cms.initialValue).toBe('{{now}}');
  });

  it('preserves model literals through defineModel', () => {
    const model = defineModel({
      name: 'articles',
      label: 'Articles',
      labelSingular: 'Article',
      folder: 'src/content/articles',
      slug: '{{slug}}',
      fields: {
        title: { kind: 'string', required: true, cms: { label: 'Title' } },
      },
    });

    expect(model.name).toBe('articles');
    expect(model.fields.title.kind).toBe('string');
  });

  it('rejects values and configuration owned by a different field kind', () => {
    const dateInitialValueOnBoolean = {
      kind: 'boolean',
      cms: { label: 'Draft', initialValue: '{{now}}' },
    } as const;
    const listDefaultOnString = {
      kind: 'string',
      default: [],
      cms: { label: 'Title' },
    } as const;

    // @ts-expect-error A boolean editor cannot have a date initial value.
    const invalidBoolean: ContentField = dateInitialValueOnBoolean;
    // @ts-expect-error A string field cannot have a list default.
    const invalidString: ContentField = listDefaultOnString;

    expect([invalidBoolean, invalidString]).toHaveLength(2);
  });
});
