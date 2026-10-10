import type { SkillCategory } from '../../config/skill-categories';
import type { ExperienceOrganization, ExperienceRole } from './experience';
import { skillCatalog, type SkillId } from './skills';

interface SkillRoleEvidence {
  id: string;
  title: string;
  organization: string;
  project: string;
  startDate?: string;
  endDate?: string;
  href: string;
}

export interface SkillEvidence {
  id: SkillId;
  name: string;
  category: SkillCategory;
  roles: SkillRoleEvidence[];
  latestUse?: string;
}

const monthIndex = (date: string) => {
  const [year, month] = date.split('-').map(Number);
  return year * 12 + month - 1;
};

export const flattenExperienceRoles = (experience: ExperienceOrganization[]): ExperienceRole[] =>
  experience.flatMap((organization) => organization.projects.flatMap((project) => project.roles));

export const yearsOfExperience = (experience: ExperienceOrganization[], currentDate = new Date()) => {
  const roles = flattenExperienceRoles(experience).filter((role) => role.startDate);
  if (roles.length === 0) return 0;
  const firstMonth = Math.min(...roles.map((role) => monthIndex(role.startDate!)));
  const currentMonth = currentDate.getUTCFullYear() * 12 + currentDate.getUTCMonth();
  return Math.floor((currentMonth - firstMonth + 1) / 12);
};

export const deriveSkillEvidence = (experience: ExperienceOrganization[]): SkillEvidence[] => {
  const roles = experience.flatMap((organization) =>
    organization.projects.flatMap((project) =>
      project.roles.map((role) => ({ role, organization: organization.name, project: project.name })),
    ),
  );

  return Object.entries(skillCatalog)
    .map(([id, skill]) => {
      const matchingRoles = roles
        .filter(({ role }) => role.skills?.includes(id))
        .map(({ role, organization, project }) => ({
          id: role.id,
          title: role.title,
          organization,
          project,
          startDate: role.startDate,
          endDate: role.endDate,
          href: `#experience-${role.id}`,
        }))
        .sort(
          (a, b) =>
            (b.endDate ?? (b.startDate ? '9999-12' : '')).localeCompare(a.endDate ?? (a.startDate ? '9999-12' : '')) ||
            (b.startDate ?? '').localeCompare(a.startDate ?? '') ||
            a.id.localeCompare(b.id),
        );
      const latestUse = matchingRoles.some((role) => role.startDate && !role.endDate)
        ? 'Present'
        : matchingRoles.reduce<string | undefined>(
            (latest, role) => (role.endDate && (!latest || role.endDate > latest) ? role.endDate : latest),
            undefined,
          );

      return {
        id: id as SkillId,
        name: skill.name,
        category: skill.category as SkillCategory,
        roles: matchingRoles,
        latestUse,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
};
