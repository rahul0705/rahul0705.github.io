import { describe, expect, it } from 'vitest';

import { education } from './education';
import { experienceEntries } from './experience';
import { createExperienceSlug } from './experience-slug';
import { skillCatalog, type SkillId } from './skills';

describe('experience content', () => {
  it('uses the start-date-organization-project-role filename schema', () => {
    experienceEntries.forEach((entry) => {
      expect(entry.id).toBe(createExperienceSlug(entry.data));
    });
  });

  it('provides a substantive summary, three to five highlights, and skills for every role', () => {
    experienceEntries.forEach((entry) => {
      expect(entry.data.description.trim().length, entry.id).toBeGreaterThanOrEqual(80);
      expect(entry.data.highlights.length, entry.id).toBeGreaterThanOrEqual(3);
      expect(entry.data.highlights.length, entry.id).toBeLessThanOrEqual(5);
      expect(entry.data.skills.length, entry.id).toBeGreaterThan(0);
    });
  });

  it('only catalogs skills evidenced by experience or education', () => {
    const evidencedSkills = new Set<SkillId>([
      ...experienceEntries.flatMap((entry) => entry.data.skills as SkillId[]),
      ...education.flatMap((entry) => entry.skills ?? []),
    ]);

    expect(Object.keys(skillCatalog).filter((skill) => !evidencedSkills.has(skill as SkillId))).toEqual([]);
  });

  it('includes Git for every Harris, L3Harris, and AWS role', () => {
    const gitOrganizations = new Set(['Harris Corporation', 'L3Harris Technologies', 'Amazon Web Services']);

    experienceEntries
      .filter((entry) => gitOrganizations.has(entry.data.organization))
      .forEach((entry) => expect(entry.data.skills, entry.id).toContain('git'));
  });
});
