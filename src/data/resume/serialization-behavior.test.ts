import { describe, expect, it } from 'vitest';

import { toResumeJson } from './json';
import { toResumeMarkdown, toResumeText } from './text';

const input = {
  basics: { name: 'Example Person', label: 'Engineer', email: '', url: '', profiles: [] },
  experience: [
    {
      name: 'Example Organization',
      projects: [
        {
          name: 'Example Project',
          additionalInformation: [],
          financialScopeIds: [],
          roles: [
            {
              title: 'Earlier role',
              startDate: '2023-02',
              endDate: '2024-05',
              highlights: ['Delivered a useful result'],
            },
            { title: 'Current role', startDate: '2024-05' },
            { title: 'Undated role' },
          ],
        },
      ],
    },
  ],
  education: [],
  skillGroups: [],
  recognitions: [],
  interests: [],
};

describe('resume serialization behavior', () => {
  it.each([
    ['text', toResumeText],
    ['Markdown', toResumeMarkdown],
  ] as const)('orders %s roles newest first without mutating the source chronology', (_, serialize) => {
    const original = structuredClone(input);
    const output = serialize(input);

    for (const title of ['Current role', 'Earlier role', 'Undated role']) expect(output).toContain(title);
    expect(output.indexOf('Current role')).toBeLessThan(output.indexOf('Earlier role'));
    expect(output.indexOf('Earlier role')).toBeLessThan(output.indexOf('Undated role'));
    expect(output).toContain('Delivered a useful result');
    expect(input).toEqual(original);
  });

  it('preserves month-level transitions and marks only dated ongoing roles as present in plain text', () => {
    const output = toResumeText(input);

    expect(output).toContain('February 2023 - May 2024');
    expect(output).toContain('May 2024 - Present');
    expect(output.slice(output.indexOf('Undated role'))).not.toContain('Present');
  });

  it.each([
    ['text', toResumeText],
    ['Markdown', toResumeMarkdown],
  ] as const)('omits empty optional sections and absent role metadata from %s', (_, serialize) => {
    const output = serialize(input);

    expect(output).not.toMatch(/EDUCATION|## Education|AWARDS|## Awards|INTERESTS|## Interests/);
    expect(output).not.toMatch(/Skills:|Additional information:|undefined|null/);
  });

  it('preserves exact JSON dates and leaves ongoing or undated dates absent on the wire', () => {
    const output = JSON.parse(JSON.stringify(toResumeJson({ ...input, experienceSkillCoverage: [] })));

    expect(output.work).toEqual([
      {
        name: 'Example Organization',
        position: 'Earlier role',
        startDate: '2023-02',
        endDate: '2024-05',
        highlights: ['Delivered a useful result'],
      },
      { name: 'Example Organization', position: 'Current role', startDate: '2024-05' },
      { name: 'Example Organization', position: 'Undated role' },
    ]);
  });

  it('keeps interest names while omitting empty JSON keyword lists', () => {
    const output = toResumeJson({
      ...input,
      experienceSkillCoverage: [],
      interests: [
        { name: 'Outdoors' },
        { name: 'Reading', keywords: [] },
        { name: 'Making', keywords: ['Electronics'] },
      ],
    });

    expect(output.interests).toEqual([
      { name: 'Outdoors' },
      { name: 'Reading' },
      { name: 'Making', keywords: ['Electronics'] },
    ]);
  });
});
