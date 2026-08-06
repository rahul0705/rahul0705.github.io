import resumeSchema from '@jsonresume/schema';
import { describe, expect, it } from 'vitest';

import { resumeJson } from './index';

describe('JSON Resume serialization', () => {
  it('includes the configured interests', () => {
    expect(resumeJson.interests).toEqual([]);
  });

  it('conforms to the official JSON Resume schema', () => {
    let validation: { errors: unknown[] | null; valid: boolean } | undefined;

    resumeSchema.validate(resumeJson, (errors: unknown, valid: boolean) => {
      validation = { errors: errors as unknown[] | null, valid };
    });

    expect(validation).toEqual({ errors: null, valid: true });
  });
});
