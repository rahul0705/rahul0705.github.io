import { describe, expect, it } from 'vitest';

import type { ExperienceOrganization, ExperienceRole } from './experience';
import {
  deriveSkillExperienceCoverage,
  flattenExperienceRoles,
  monthIndex,
  orderRolesNewestFirst,
  skillLevel,
  uniqueMonths,
  yearsOfExperience,
} from './experience-coverage';
import type { SkillId } from './skills';

const role = (title: string, startDate: string, endDate?: string, skills?: SkillId[]): ExperienceRole => ({
  title,
  startDate,
  endDate,
  skills,
});
const experience: ExperienceOrganization[] = [
  {
    name: 'Example Company',
    projects: [
      {
        name: 'Example Project',
        roles: [
          role('Current role', '2024-01', undefined, ['typescript']),
          role('Earlier role', '2022-01', '2023-12', ['typescript', 'python']),
        ],
      },
    ],
  },
];

describe('experience coverage', () => {
  it('flattens and orders roles', () => {
    expect(flattenExperienceRoles(experience).map((entry) => entry.title)).toEqual(['Current role', 'Earlier role']);
    expect(orderRolesNewestFirst(flattenExperienceRoles(experience)).map((entry) => entry.title)).toEqual([
      'Current role',
      'Earlier role',
    ]);
  });
  it('merges contiguous intervals once', () => {
    expect(
      uniqueMonths([
        { start: monthIndex('2020-01'), end: monthIndex('2020-03') },
        { start: monthIndex('2020-03'), end: monthIndex('2020-05') },
        { start: monthIndex('2020-06'), end: monthIndex('2020-06') },
      ]),
    ).toBe(6);
  });
  it('derives experience years from the earliest role', () => {
    expect(yearsOfExperience(experience, new Date('2024-06-15T00:00:00Z'))).toBe(2);
  });
  it('derives ongoing-role coverage', () => {
    expect(
      deriveSkillExperienceCoverage(
        experience,
        new Set<SkillId>(['typescript', 'python']),
        new Date('2024-06-15T00:00:00Z'),
      ),
    ).toEqual([
      { name: 'TypeScript', months: 30, percentage: 100 },
      { name: 'Python', months: 24, percentage: 80 },
    ]);
  });
  it('maps coverage to five levels', () => {
    expect([1, 20, 21, 40, 41, 60, 61, 80, 81, 100].map(skillLevel)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
});
