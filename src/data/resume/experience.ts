import { getCollection, type CollectionEntry } from 'astro:content';

import type { ContentLink } from '../../config/content-model';
import { financialScopeCatalog, type FinancialScopeId } from './financial-scopes';
import { skillCatalog, type SkillId } from './skills';

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

const isSkillId = (value: string): value is SkillId => value in skillCatalog;
const isFinancialScopeId = (value: string): value is FinancialScopeId => value in financialScopeCatalog;
const toResumeMonth = (date: Date) => date.toISOString().slice(0, 7);

const roleFromEntry = (entry: ExperienceEntry): ExperienceRole => {
  const invalidSkills = entry.data.skills.filter((skill) => !isSkillId(skill));
  if (invalidSkills.length > 0) {
    throw new Error(`Unknown skill ID in ${entry.id}: ${invalidSkills.join(', ')}`);
  }

  return {
    title: entry.data.title,
    startDate: toResumeMonth(entry.data.startDate),
    endDate: entry.data.endDate ? toResumeMonth(entry.data.endDate) : undefined,
    description: entry.data.description,
    highlights: entry.data.highlights,
    skills: entry.data.skills.filter(isSkillId),
  };
};

const financialScopeIdsFromEntries = (entries: ExperienceEntry[]): FinancialScopeId[] => {
  const ids = entries.flatMap((entry) => entry.data.financialScopeIds ?? []);
  const invalidIds = ids.filter((id) => !isFinancialScopeId(id));
  if (invalidIds.length > 0) {
    throw new Error(`Unknown financial scope ID: ${[...new Set(invalidIds)].join(', ')}`);
  }

  return [...new Set(ids.filter(isFinancialScopeId))];
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
        financialScopeIds: (entry.data.financialScopeIds ?? []).filter(isFinancialScopeId),
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
      if (isFinancialScopeId(id) && !project.financialScopeIds.includes(id)) {
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
