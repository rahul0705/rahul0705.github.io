import { getCollection, type CollectionEntry } from 'astro:content';

export type SkillCatalogEntry = CollectionEntry<'skills'>['data'];
export type SkillId = CollectionEntry<'skills'>['id'];

const skillEntries = await getCollection('skills');

export const skillCatalog: Record<SkillId, SkillCatalogEntry> = Object.fromEntries(
  skillEntries.map((entry) => [entry.id, entry.data]),
);

export const validateSkillIds = (ids: Iterable<string>, context: string): void => {
  const invalidIds = [...ids].filter((id) => !(id in skillCatalog));
  if (invalidIds.length > 0) throw new Error(`Unknown skill ID in ${context}: ${[...new Set(invalidIds)].join(', ')}`);
};
