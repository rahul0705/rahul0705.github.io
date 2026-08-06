import type { ExperienceOrganization, ExperienceRole } from './experience';
import { skillCatalog, type SkillId } from './skills';

export interface SkillExperienceCoverage {
  name: string;
  months: number;
  percentage: number;
}

interface SkillInterval {
  start: number;
  end: number;
}

export const monthIndex = (date: string) => {
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

export const orderRolesNewestFirst = (roles: ExperienceRole[]) =>
  [...roles].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));

export const uniqueMonths = (intervals: SkillInterval[]) => {
  const sorted = intervals.map((interval) => ({ ...interval })).sort((a, b) => a.start - b.start);
  if (sorted.length === 0) return 0;
  let total = 0;
  let active = sorted[0]!;
  for (const interval of sorted.slice(1)) {
    if (interval.start <= active.end + 1) active.end = Math.max(active.end, interval.end);
    else {
      total += active.end - active.start + 1;
      active = interval;
    }
  }
  return total + active.end - active.start + 1;
};

export const skillLevel = (percentage: number) => Math.min(5, Math.max(1, Math.ceil(percentage / 20)));

export const deriveSkillExperienceCoverage = (
  experience: ExperienceOrganization[],
  trackedSkills: ReadonlySet<SkillId>,
  currentDate = new Date(),
): SkillExperienceCoverage[] => {
  const currentMonth = currentDate.getUTCFullYear() * 12 + currentDate.getUTCMonth();
  const roles = flattenExperienceRoles(experience).filter((role) => role.startDate);
  if (roles.length === 0) return [];
  const careerStart = Math.min(...roles.map((role) => monthIndex(role.startDate!)));
  const careerEnd = Math.max(...roles.map((role) => (role.endDate ? monthIndex(role.endDate) : currentMonth)));
  const careerMonths = careerEnd - careerStart + 1;
  const intervalsBySkill = new Map<SkillId, SkillInterval[]>();
  roles.forEach((role) => {
    const interval = {
      start: monthIndex(role.startDate!),
      end: role.endDate ? monthIndex(role.endDate) : currentMonth,
    };
    role.skills
      ?.filter((skill) => trackedSkills.has(skill))
      .forEach((skill) => {
        intervalsBySkill.set(skill, [...(intervalsBySkill.get(skill) ?? []), interval]);
      });
  });
  return [...intervalsBySkill.entries()]
    .map(([skillId, intervals]) => {
      const months = uniqueMonths(intervals);
      return { name: skillCatalog[skillId].name, months, percentage: Math.round((months / careerMonths) * 100) };
    })
    .sort((a, b) => b.months - a.months || a.name.localeCompare(b.name));
};
