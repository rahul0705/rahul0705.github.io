import { describe, expect, it } from 'vitest';

import { education } from './education';
import { experienceEntries } from './experience';
import { createExperienceSlug } from './experience-slug';
import { skillCatalog, type SkillId, validateSkillIds } from './skills';

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

  it('resolves every education skill through the catalog', () => {
    education.forEach((entry) =>
      entry.skills?.forEach((skill) => expect(skillCatalog, `${entry.title}: ${skill}`).toHaveProperty(skill)),
    );
  });

  it('uses readable kebab-case filename IDs for experience relations', () => {
    expect(skillCatalog['amazon-cloud-watch'].name).toBe('Amazon CloudWatch');
    expect(skillCatalog['aws-iam'].name).toBe('AWS IAM');
    expect(skillCatalog['tcp-ip'].name).toBe('TCP/IP');
    expect(Object.keys(skillCatalog).every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
  });

  it('rejects dangling skill relations with their referring content entry', () => {
    expect(() => validateSkillIds(['missing-skill'], 'example-experience')).toThrow(
      'Unknown skill ID in example-experience: missing-skill',
    );
  });

  it('includes Git for every Harris, L3Harris, and AWS role', () => {
    const gitOrganizations = new Set(['Harris Corporation', 'L3Harris Technologies', 'Amazon Web Services']);

    experienceEntries
      .filter((entry) => gitOrganizations.has(entry.data.organization))
      .forEach((entry) => expect(entry.data.skills, entry.id).toContain('git'));
  });

  it('lists every role skill alphabetically by display name', () => {
    const collator = new Intl.Collator('en', { sensitivity: 'base' });

    experienceEntries.forEach((entry) => {
      const skillNames = entry.data.skills.map((skill) => skillCatalog[skill as SkillId].name);
      expect(skillNames, entry.id).toEqual([...skillNames].sort(collator.compare));
    });
  });

  it('uses the same skill set for every GCCS role', () => {
    const gccsRoles = experienceEntries.filter((entry) => entry.data.project === 'GCCS');
    const expectedSkills = gccsRoles[0]?.data.skills;

    gccsRoles.forEach((entry) => expect(entry.data.skills, entry.id).toEqual(expectedSkills));
  });
});
