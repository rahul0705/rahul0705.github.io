import { describe, expect, it } from 'vitest';

import type { ExperienceOrganization, ExperienceRole } from './experience';
import { deriveSkillEvidence, flattenExperienceRoles, yearsOfExperience } from './experience-coverage';
import type { SkillId } from './skills';

const role = (id: string, title: string, startDate?: string, endDate?: string, skills?: SkillId[]): ExperienceRole => ({
  id,
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
        additionalInformation: [],
        financialScopeIds: [],
        roles: [
          role('current-role', 'Current role', '2024-01', undefined, ['typescript']),
          role('earlier-role', 'Earlier role', '2022-01', '2023-12', ['typescript', 'python']),
        ],
      },
    ],
  },
];

describe('skill evidence', () => {
  it('keeps the overall career-years calculation', () => {
    expect(flattenExperienceRoles(experience).map((entry) => entry.title)).toEqual(['Current role', 'Earlier role']);
    expect(yearsOfExperience(experience, new Date('2024-06-15T00:00:00Z'))).toBe(2);
  });

  it('uses stable IDs and links to recorded roles, with ongoing use first', () => {
    const evidence = deriveSkillEvidence(experience);
    const typescript = evidence.find((skill) => skill.id === 'typescript');
    const python = evidence.find((skill) => skill.id === 'python');

    expect(typescript).toMatchObject({
      id: 'typescript',
      name: 'TypeScript',
      category: 'languages-frameworks',
      latestUse: 'Present',
      roles: [
        {
          id: 'current-role',
          organization: 'Example Company',
          project: 'Example Project',
          href: '#experience-current-role',
        },
        { id: 'earlier-role', href: '#experience-earlier-role' },
      ],
    });
    expect(python).toMatchObject({ latestUse: '2023-12', roles: [{ id: 'earlier-role' }] });
    const names = evidence.map((skill) => skill.name);
    expect(names).toEqual(names.toSorted((a, b) => a.localeCompare(b)));
  });

  it('keeps undated roles and distinguishes skills without role evidence', () => {
    const undated: ExperienceOrganization[] = [
      {
        name: 'Example Company',
        projects: [
          {
            name: 'Example Project',
            additionalInformation: [],
            financialScopeIds: [],
            roles: [role('undated-role', 'Undated role', undefined, undefined, ['css'])],
          },
        ],
      },
    ];
    const evidence = deriveSkillEvidence(undated);

    expect(evidence.find((skill) => skill.id === 'css')).toMatchObject({
      roles: [{ id: 'undated-role', href: '#experience-undated-role' }],
    });
    expect(evidence.find((skill) => skill.id === 'css')?.latestUse).toBeUndefined();
    expect(evidence.find((skill) => skill.id === 'computer-science')).toMatchObject({ roles: [] });
  });
});
