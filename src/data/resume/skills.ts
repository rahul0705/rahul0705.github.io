import { getCollection, type CollectionEntry } from 'astro:content';

import { skillCategories, type SkillCategory } from '../../config/skill-categories';

export type SkillCatalogEntry = Omit<CollectionEntry<'skills'>['data'], 'category'> & { category: SkillCategory };
export type SkillId = CollectionEntry<'skills'>['id'];

const skillEntries = await getCollection('skills');

export const skillCatalog: Record<SkillId, SkillCatalogEntry> = Object.fromEntries(
  skillEntries.map(({ id, data }) => {
    const category = skillCategories.find(({ value }) => value === data.category)?.value;
    if (!category) throw new Error(`Unknown skill category in ${id}: ${data.category}`);
    return [id, { ...data, category }];
  }),
);

export const categorizedSkills = skillCategories.map((category) => ({
  ...category,
  skills: skillEntries.filter((entry) => entry.data.category === category.value),
}));

export const validateSkillIds = (ids: Iterable<string>, context: string): void => {
  const invalidIds = [...ids].filter((id) => !(id in skillCatalog));
  if (invalidIds.length > 0) throw new Error(`Unknown skill ID in ${context}: ${[...new Set(invalidIds)].join(', ')}`);
};
