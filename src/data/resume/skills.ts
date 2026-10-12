import { getCollection, type CollectionEntry } from 'astro:content';

import { skillCategories } from '../../config/skill-categories';

export type SkillCatalogEntry = CollectionEntry<'skills'>['data'];
export type SkillId = CollectionEntry<'skills'>['id'];

const skillEntries = await getCollection('skills');

export const skillCatalog: Record<SkillId, SkillCatalogEntry> = Object.fromEntries(
  skillEntries.map((entry) => [entry.id, entry.data]),
);

export const curatedSkillIds: SkillId[] = [
  'aws',
  'kubernetes',
  'python',
  'postgresql',
  'system-architecture',
  'typescript',
  'react',
  'nodejs',
  'cdk',
  'docker',
  'amazon-s3',
  'amazon-event-bridge',
  'git',
  'ansible',
  'continuous-integration',
  'unit-testing',
  'jest',
  'cypress',
  'aws-iam',
  'stigs',
  'system-hardening',
  'agile-scrum',
  'ui-ux',
];

export const featuredSkillIds = curatedSkillIds.slice(0, 6);

export const categorizedSkills = skillCategories.map((category) => ({
  ...category,
  skills: skillEntries.filter((entry) => entry.data.category === category.value),
}));

export const validateSkillIds = (ids: Iterable<string>, context: string): void => {
  const invalidIds = [...ids].filter((id) => !(id in skillCatalog));
  if (invalidIds.length > 0) throw new Error(`Unknown skill ID in ${context}: ${[...new Set(invalidIds)].join(', ')}`);
};

validateSkillIds(curatedSkillIds, 'curated skills');
