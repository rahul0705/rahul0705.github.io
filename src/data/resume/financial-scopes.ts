import { getCollection, type CollectionEntry } from 'astro:content';

import { financialScopeContentModel } from '../../config/content-models/financial-scopes';

type FinancialScopeCategory = 'contract' | 'program-budget' | 'investment' | 'revenue' | 'other';
type FinancialScopeAmountBasis = 'ceiling' | 'base-and-options' | 'annual' | 'lifetime' | 'estimated';

interface UsaSpendingSource {
  provider: 'usaspending';
  awardId: string;
  amountField: 'base_and_all_options';
}

export interface FinancialScope {
  name: string;
  amount: number;
  currency: 'USD';
  category: FinancialScopeCategory;
  amountBasis: FinancialScopeAmountBasis;
  source?: UsaSpendingSource;
  sourceUrl?: string;
  asOf?: string;
}

export type FinancialScopeId = CollectionEntry<'financial-scopes'>['id'];
export type FinancialScopeCatalog = Record<FinancialScopeId, FinancialScope>;

const financialScopeFromEntry = ({ id, data }: CollectionEntry<'financial-scopes'>): FinancialScope => {
  const { currency } = data;
  const category = financialScopeContentModel.fields.category.options.find(
    ({ value }) => value === data.category,
  )?.value;
  const amountBasis = financialScopeContentModel.fields.amountBasis.options.find(
    ({ value }) => value === data.amountBasis,
  )?.value;
  if (currency !== 'USD' || !category || !amountBasis) throw new Error(`Invalid financial scope values in ${id}`);

  let source: UsaSpendingSource | undefined;
  if (data.source) {
    const { provider, awardId, amountField } = data.source;
    if (provider !== 'usaspending' || amountField !== 'base_and_all_options') {
      throw new Error(`Invalid financial scope source in ${id}`);
    }
    source = { provider, awardId, amountField };
  }
  return { ...data, currency, category, amountBasis, source };
};

const financialScopeEntries = await getCollection('financial-scopes');

export const financialScopeCatalog: FinancialScopeCatalog = Object.fromEntries(
  financialScopeEntries.map((entry) => [entry.id, financialScopeFromEntry(entry)]),
);

export const validateFinancialScopeIds = (ids: Iterable<string>, context: string): void => {
  const invalidIds = [...ids].filter((id) => !(id in financialScopeCatalog));
  if (invalidIds.length > 0) {
    throw new Error(`Unknown financial scope ID in ${context}: ${[...new Set(invalidIds)].join(', ')}`);
  }
};

export const totalFinancialScope = (
  ids: Iterable<FinancialScopeId>,
  catalog: FinancialScopeCatalog = financialScopeCatalog,
) => [...new Set(ids)].reduce((total, id) => total + catalog[id].amount, 0);

const usaSpendingApiUrl = (awardId: string) =>
  `https://api.usaspending.gov/api/v2/awards/${encodeURIComponent(awardId)}/`;

export const financialScopeSourceUrl = (scope: FinancialScope) =>
  scope.source?.provider === 'usaspending'
    ? `https://www.usaspending.gov/award/${encodeURIComponent(scope.source.awardId)}`
    : scope.sourceUrl;

const resolveFinancialScope = async (scope: FinancialScope, fetcher: typeof fetch): Promise<FinancialScope> => {
  if (scope.source?.provider !== 'usaspending') return scope;

  try {
    const response = await fetcher(usaSpendingApiUrl(scope.source.awardId), { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid USAspending response');
    const amount = 'base_and_all_options' in data ? data.base_and_all_options : undefined;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid ${scope.source.amountField}`);
    }

    const performance = 'period_of_performance' in data ? data.period_of_performance : undefined;
    const lastModified =
      performance && typeof performance === 'object' && 'last_modified_date' in performance
        ? performance.last_modified_date
        : undefined;
    return { ...scope, amount, asOf: typeof lastModified === 'string' ? lastModified.slice(0, 10) : scope.asOf };
  } catch (error) {
    console.warn(`Using fallback financial scope for ${scope.name}:`, error);
    return scope;
  }
};

export const resolveFinancialScopeCatalog = async (fetcher: typeof fetch = fetch): Promise<FinancialScopeCatalog> =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(financialScopeCatalog).map(async ([id, scope]) => [
        id,
        await resolveFinancialScope(scope, fetcher),
      ]),
    ),
  );

let resolvedCatalog: Promise<FinancialScopeCatalog> | undefined;
export const getFinancialScopeCatalog = () => (resolvedCatalog ??= resolveFinancialScopeCatalog());

export const formatFinancialScope = (amount: number) => {
  const billions = Math.floor(amount / 100_000_000) / 10;
  return `$${billions.toFixed(1)}B+`;
};

const formatAmount = (amount: number) => {
  const [divisor, unit] = amount >= 1_000_000_000 ? [1_000_000_000, 'billion'] : [1_000_000, 'million'];
  const maximumFractionDigits = unit === 'billion' ? 3 : 1;
  return `$${new Intl.NumberFormat('en', { maximumFractionDigits }).format(amount / divisor)} ${unit}`;
};

export const formatFinancialScopeDetail = (scope: FinancialScope) => {
  const amount = formatAmount(scope.amount);

  switch (scope.amountBasis) {
    case 'ceiling':
      return `up to ${amount}`;
    case 'base-and-options':
      return `${amount} in base and options`;
    case 'annual':
      return `${amount} annually`;
    case 'estimated':
      return `approximately ${amount}`;
    case 'lifetime':
      return `${amount} lifetime value`;
  }
};
