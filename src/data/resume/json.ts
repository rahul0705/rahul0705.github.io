import type { Recognition } from './awards';
import type { ResumeBasics } from './basics';
import type { EducationEntry } from './education';
import type { ExperienceOrganization } from './experience';
import type { SkillExperienceCoverage } from './experience-coverage';
import type { SkillGroup } from './index';
import type { ResumeInterest } from './interests';
import { skillCatalog } from './skills';

interface ResumeJsonInput {
  basics: ResumeBasics;
  experience: ExperienceOrganization[];
  education: EducationEntry[];
  skillGroups: SkillGroup[];
  recognitions: Recognition[];
  experienceSkillCoverage: SkillExperienceCoverage[];
  interests: ResumeInterest[];
}

export const toResumeJson = ({
  basics,
  experience,
  education,
  skillGroups,
  recognitions,
  experienceSkillCoverage,
  interests,
}: ResumeJsonInput) => ({
  basics: {
    name: basics.name,
    label: basics.label,
    email: basics.email,
    url: basics.url,
    profiles: basics.profiles,
  },
  work: experience.flatMap((organization) =>
    organization.projects.flatMap((project) =>
      project.roles.map((role) => ({
        name: organization.name,
        position: role.title,
        url: organization.href,
        startDate: role.startDate,
        endDate: role.endDate,
        summary: role.description,
        highlights: role.highlights,
        skills: role.skills?.map((skill) => skillCatalog[skill].name),
      })),
    ),
  ),
  education: education.map((entry) => ({
    institution: entry.title,
    url: entry.href,
    area: entry.subtitle,
    endDate: entry.endDate,
  })),
  skills: [
    { name: 'Programming and tooling', keywords: experienceSkillCoverage.map((skill) => skill.name) },
    ...skillGroups.map((group) => ({ name: group.name, keywords: group.keywords })),
  ],
  awards: recognitions.map((recognition) => ({
    title: recognition.title,
    date: recognition.date,
    summary: recognition.description,
    highlights: recognition.highlights,
    url: recognition.href,
  })),
  interests: interests.map((interest) => ({
    name: interest.name,
    ...(interest.keywords && interest.keywords.length > 0 ? { keywords: interest.keywords } : {}),
  })),
  meta: { canonical: 'https://jsonresume.org/schema', version: '1.0.0', lastModified: '2026-08-12' },
});
