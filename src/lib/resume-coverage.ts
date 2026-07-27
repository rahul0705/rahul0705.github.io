import type { ExperienceCompany, ResumeEntry } from '../data/resume';

export interface ExperienceSkillCoverage {
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

export const flattenExperienceRoles = (experience: ExperienceCompany[]): ResumeEntry[] =>
  experience.flatMap((company) => company.projects.flatMap((project) => project.roles));

export const orderRolesNewestFirst = (roles: ResumeEntry[]) =>
  [...roles].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));

export const uniqueMonths = (intervals: SkillInterval[]) => {
  const sorted = intervals.map((interval) => ({ ...interval })).sort((a, b) => a.start - b.start);
  if (sorted.length === 0) return 0;

  let total = 0;
  let active = sorted[0]!;

  for (const interval of sorted.slice(1)) {
    if (interval.start <= active.end + 1) {
      active.end = Math.max(active.end, interval.end);
    } else {
      total += active.end - active.start + 1;
      active = interval;
    }
  }

  return total + active.end - active.start + 1;
};

export const skillLevel = (percentage: number) => Math.min(5, Math.max(1, Math.ceil(percentage / 20)));

export const deriveExperienceSkillCoverage = (
  experience: ExperienceCompany[],
  programmingAndTooling: ReadonlySet<string>,
  currentDate = new Date(),
): ExperienceSkillCoverage[] => {
  const currentMonth = currentDate.getUTCFullYear() * 12 + currentDate.getUTCMonth();
  const experienceRoles = flattenExperienceRoles(experience).filter((role) => role.startDate);
  if (experienceRoles.length === 0) return [];

  const careerStart = Math.min(...experienceRoles.map((role) => monthIndex(role.startDate!)));
  const careerEnd = Math.max(
    ...experienceRoles.map((role) => (role.endDate ? monthIndex(role.endDate) : currentMonth)),
  );
  const careerMonths = careerEnd - careerStart + 1;
  const skillIntervals = new Map<string, SkillInterval[]>();

  experienceRoles.forEach((role) => {
    const interval = {
      start: monthIndex(role.startDate!),
      end: role.endDate ? monthIndex(role.endDate) : currentMonth,
    };

    role.tags
      ?.filter((tag) => programmingAndTooling.has(tag))
      .forEach((tag) => {
        skillIntervals.set(tag, [...(skillIntervals.get(tag) ?? []), interval]);
      });
  });

  return [...skillIntervals.entries()]
    .map(([name, intervals]) => {
      const months = uniqueMonths(intervals);
      return { name, months, percentage: Math.round((months / careerMonths) * 100) };
    })
    .sort((a, b) => b.months - a.months || a.name.localeCompare(b.name));
};
