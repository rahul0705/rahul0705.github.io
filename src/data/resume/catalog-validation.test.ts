import { getCollection, type CollectionEntry } from 'astro:content';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

const scope: CollectionEntry<'financial-scopes'> = {
  id: 'example-scope',
  collection: 'financial-scopes',
  data: {
    name: 'Example scope',
    amount: 100,
    currency: 'USD',
    category: 'contract',
    amountBasis: 'ceiling',
    source: undefined,
    sourceUrl: undefined,
    asOf: undefined,
  },
};
const skill: CollectionEntry<'skills'> = {
  id: 'example-skill',
  collection: 'skills',
  data: {
    name: 'Example skill',
    category: 'languages-frameworks',
    description: 'Example',
    trackExperienceCoverage: true,
    href: undefined,
  },
};

beforeEach(() => {
  vi.resetModules();
  vi.mocked(getCollection).mockReset();
});

describe('catalog value validation', () => {
  it.each([
    { currency: 'EUR' },
    { category: 'unknown' },
    { amountBasis: 'unknown' },
    { source: { provider: 'unknown', awardId: '123', amountField: 'base_and_all_options' } },
    { source: { provider: 'usaspending', awardId: '123', amountField: 'unknown' } },
  ])('rejects unsupported financial scope values: %j', async (overrides) => {
    vi.mocked(getCollection).mockResolvedValue([{ ...scope, data: { ...scope.data, ...overrides } }]);
    await expect(import('./financial-scopes')).rejects.toThrow('example-scope');
  });

  it('preserves valid financial scope metadata', async () => {
    vi.mocked(getCollection).mockResolvedValue([scope]);
    const { financialScopeCatalog } = await import('./financial-scopes');
    expect(financialScopeCatalog['example-scope']).toEqual(scope.data);
  });

  it('rejects skill categories outside the configured list', async () => {
    vi.mocked(getCollection).mockResolvedValue([{ ...skill, data: { ...skill.data, category: 'unknown' } }]);
    await expect(import('./skills')).rejects.toThrow('Unknown skill category in example-skill: unknown');
  });

  it('preserves valid skill data', async () => {
    vi.mocked(getCollection).mockResolvedValue([skill]);
    const { skillCatalog } = await import('./skills');
    expect(skillCatalog['example-skill']).toEqual(skill.data);
  });
});
