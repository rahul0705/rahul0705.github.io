import type { SkillId } from './skills';

export interface EducationEntry {
  title: string;
  href?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  skills?: SkillId[];
}

export const education: EducationEntry[] = [
  {
    title: 'Purdue University',
    href: 'https://www.purdue.edu/',
    subtitle: "Bachelor's Degree in Computer Science",
    endDate: '2013-05',
    skills: ['computerScience'],
  },
  {
    title: 'Palmer Trinity School',
    href: 'https://www.palmertrinity.org/',
    subtitle: 'High School Degree',
    endDate: '2009-05',
  },
];
