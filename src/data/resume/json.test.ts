import resumeSchema from '@jsonresume/schema';
import { describe, expect, it } from 'vitest';

import { resumeJson, skillEvidence } from './index';

describe('JSON Resume serialization', () => {
  it('includes role-supported skills in the summary', () => {
    expect(resumeJson.skills[0].keywords.length).toBeGreaterThan(6);
    expect(resumeJson.skills[0]).toEqual({
      name: 'Programming and tooling',
      keywords: skillEvidence.filter((skill) => skill.roles.length > 0).map((skill) => skill.name),
    });
  });

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
