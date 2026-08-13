import { getCollection, type CollectionEntry } from 'astro:content';

import type { ContentLink } from '../../config/content-model';
import { type FinancialScopeId, validateFinancialScopeIds } from './financial-scopes';
import { type SkillId, validateSkillIds } from './skills';

export interface ExperienceRole {
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
  skills?: SkillId[];
}

export interface ExperienceProject {
  name: string;
  href?: string;
  additionalInformation: ContentLink[];
  financialScopeIds: FinancialScopeId[];
  roles: ExperienceRole[];
}

export interface ExperienceOrganization {
  name: string;
  href?: string;
  projects: ExperienceProject[];
}

export type ExperienceEntry = CollectionEntry<'experience'>;

const toResumeMonth = (date: Date) => date.toISOString().slice(0, 7);

const roleFromEntry = (entry: ExperienceEntry): ExperienceRole => {
  validateSkillIds(entry.data.skills, entry.id);

  return {
    title: entry.data.title,
    startDate: toResumeMonth(entry.data.startDate),
    endDate: entry.data.endDate ? toResumeMonth(entry.data.endDate) : undefined,
    description: entry.data.description,
    highlights: entry.data.highlights,
    skills: entry.data.skills,
  };
};

const financialScopeIdsFromEntries = (entries: ExperienceEntry[]): FinancialScopeId[] => {
  entries.forEach((entry) => validateFinancialScopeIds(entry.data.financialScopeIds ?? [], entry.id));
  const ids = entries.flatMap((entry) => entry.data.financialScopeIds ?? []);

  return [...new Set(ids)];
};

const groupExperienceEntries = (entries: ExperienceEntry[]): ExperienceOrganization[] => {
  const organizations: ExperienceOrganization[] = [];

  for (const entry of [...entries].sort((a, b) => b.data.startDate.getTime() - a.data.startDate.getTime())) {
    let organization = organizations.find((candidate) => candidate.name === entry.data.organization);
    if (!organization) {
      organization = {
        name: entry.data.organization,
        href: entry.data.organizationUrl,
        projects: [],
      };
      organizations.push(organization);
    }

    let project = organization.projects.find((candidate) => candidate.name === entry.data.project);
    if (!project) {
      project = {
        name: entry.data.project,
        href: entry.data.projectUrl,
        additionalInformation: entry.data.additionalInformation ?? [],
        financialScopeIds: entry.data.financialScopeIds ?? [],
        roles: [],
      };
      organization.projects.push(project);
    } else if (
      project.href !== entry.data.projectUrl ||
      JSON.stringify(project.additionalInformation) !== JSON.stringify(entry.data.additionalInformation ?? [])
    ) {
      throw new Error(`Conflicting project metadata for ${entry.data.organization} / ${entry.data.project}`);
    }

    for (const id of entry.data.financialScopeIds ?? []) {
      if (!project.financialScopeIds.includes(id)) {
        project.financialScopeIds.push(id);
      }
    }

    project.roles.push(roleFromEntry(entry));
  }

  return organizations;
};

export const experienceEntries = await getCollection('experience');
export const experienceFinancialScopeIds = financialScopeIdsFromEntries(experienceEntries);
export const experience = groupExperienceEntries(experienceEntries);
