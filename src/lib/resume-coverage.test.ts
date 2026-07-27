import { describe, expect, it } from 'vitest';

import type { ExperienceCompany, ResumeEntry } from '../data/resume';
import {
  deriveExperienceSkillCoverage,
  flattenExperienceRoles,
  monthIndex,
  orderRolesNewestFirst,
  skillLevel,
  uniqueMonths,
} from './resume-coverage';

const role = (title: string, startDate: string, endDate?: string, tags?: string[]): ResumeEntry => ({
  title,
  startDate,
  endDate,
  tags,
});

const experience: ExperienceCompany[] = [
  {
    name: 'Example Company',
    projects: [
      {
        name: 'Example Project',
        roles: [
          role('Current role', '2024-01', undefined, ['TypeScript']),
          role('Earlier role', '2022-01', '2023-12', ['TypeScript', 'Python']),
        ],
      },
    ],
  },
];

describe('resume coverage', () => {
  it('flattens company, project, and role data', () => {
    expect(flattenExperienceRoles(experience).map((entry) => entry.title)).toEqual(['Current role', 'Earlier role']);
  });

  it('orders roles newest first', () => {
    expect(orderRolesNewestFirst(flattenExperienceRoles(experience)).map((entry) => entry.title)).toEqual([
      'Current role',
      'Earlier role',
    ]);
  });

  it('merges overlapping and contiguous month intervals once', () => {
    expect(
      uniqueMonths([
        { start: monthIndex('2020-01'), end: monthIndex('2020-03') },
        { start: monthIndex('2020-03'), end: monthIndex('2020-05') },
        { start: monthIndex('2020-06'), end: monthIndex('2020-06') },
      ]),
    ).toBe(6);
  });

  it('derives deterministic coverage for ongoing roles', () => {
    expect(
      deriveExperienceSkillCoverage(experience, new Set(['TypeScript', 'Python']), new Date('2024-06-15T00:00:00Z')),
    ).toEqual([
      { name: 'TypeScript', months: 30, percentage: 100 },
      { name: 'Python', months: 24, percentage: 80 },
    ]);
  });

  it('maps coverage to five visual levels', () => {
    expect([1, 20, 21, 40, 41, 60, 61, 80, 81, 100].map(skillLevel)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
});
