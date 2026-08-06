import { describe, expect, it } from 'vitest';

import { experienceEntries } from './experience';
import { createExperienceSlug } from './experience-slug';

describe('experience content', () => {
  it('uses the start-date-organization-project-role filename schema', () => {
    experienceEntries.forEach((entry) => {
      expect(entry.id).toBe(createExperienceSlug(entry.data));
    });
  });
});
