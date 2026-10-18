import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  financialScopeCatalog,
  formatFinancialScope,
  formatFinancialScopeDetail,
  resolveFinancialScopeCatalog,
  totalFinancialScope,
  validateFinancialScopeIds,
} from './financial-scopes';

afterEach(() => vi.restoreAllMocks());

describe('financial scope', () => {
  const usaSpendingScopeCount = Object.values(financialScopeCatalog).filter(
    (scope) => scope.source?.provider === 'usaspending',
  ).length;

  it('loads stable filename IDs from the financial-scope collection', () => {
    expect(Object.keys(financialScopeCatalog)).toEqual(
      expect.arrayContaining(['ggss', 'goes-r-ground-system', 'gwsas-ground-readiness-antennas']),
    );
  });

  it('rejects dangling financial-scope relations with their referring content entry', () => {
    expect(() => validateFinancialScopeIds(['missing-scope'], 'example-experience')).toThrow(
      'Unknown financial scope ID in example-experience: missing-scope',
    );
  });
  it('deduplicates repeated scope references before totaling them', () => {
    expect(totalFinancialScope(['ggss', 'ggss', 'rfims-development'])).toBe(694_287_958);
  });

  it('formats the total conservatively by rounding down', () => {
    expect(formatFinancialScope(2_576_300_000)).toBe('$2.5B+');
  });

  it('formats detailed values according to their basis', () => {
    expect(formatFinancialScopeDetail(financialScopeCatalog['goes-r-ground-system'])).toBe('up to $1.833 billion');
    expect(formatFinancialScopeDetail(financialScopeCatalog['gwsas-ground-readiness-antennas'])).toBe(
      'up to $24.6 million',
    );
    expect(formatFinancialScopeDetail(financialScopeCatalog.ggss)).toBe('$545.9 million in base and options');
  });

  it('resolves USAspending amounts and modification dates', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({ base_and_all_options: 600_000_000, period_of_performance: { last_modified_date: '2026-07-02' } }),
    ) as unknown as typeof fetch;

    const catalog = await resolveFinancialScopeCatalog(fetcher);

    expect(fetcher).toHaveBeenCalledTimes(usaSpendingScopeCount);
    expect(catalog.ggss.amount).toBe(600_000_000);
    expect(catalog.ggss.asOf).toBe('2026-07-02');
  });

  it('uses checked-in amounts when USAspending is unavailable', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fetcher = vi.fn(async () => new Response(null, { status: 503 })) as unknown as typeof fetch;

    const catalog = await resolveFinancialScopeCatalog(fetcher);

    expect(catalog.ggss.amount).toBe(financialScopeCatalog.ggss.amount);
    expect(console.warn).toHaveBeenCalledTimes(usaSpendingScopeCount);
  });

  it.each([0, -1, '600000000', null, undefined])(
    'retains the complete checked-in scope when the remote amount is %s',
    async (amount) => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const fetcher = vi.fn(async () => Response.json({ base_and_all_options: amount }));

      const catalog = await resolveFinancialScopeCatalog(fetcher);

      expect(catalog).toEqual(financialScopeCatalog);
      expect(console.warn).toHaveBeenCalledTimes(usaSpendingScopeCount);
    },
  );

  it.each(['network', 'timeout', 'invalid JSON'])('retains checked-in scopes after a %s failure', async (failure) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fetcher = vi.fn(async () => {
      if (failure === 'invalid JSON') return new Response('not JSON');
      throw failure === 'timeout' ? new DOMException('Timed out', 'TimeoutError') : new TypeError('Offline');
    });

    expect(await resolveFinancialScopeCatalog(fetcher)).toEqual(financialScopeCatalog);
    expect(console.warn).toHaveBeenCalledTimes(usaSpendingScopeCount);
  });

  it('isolates a failed award while refreshing others and preserving source metadata', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failedAward = financialScopeCatalog.ggss.source!.awardId;
    const fetcher = vi.fn(async (input: Parameters<typeof fetch>[0]) =>
      String(input).includes(encodeURIComponent(failedAward))
        ? new Response(null, { status: 503 })
        : Response.json({ base_and_all_options: 700_000_000 }),
    );

    const catalog = await resolveFinancialScopeCatalog(fetcher);

    for (const [id, original] of Object.entries(financialScopeCatalog)) {
      expect(catalog[id]).toEqual(
        original.source && original.source.awardId !== failedAward ? { ...original, amount: 700_000_000 } : original,
      );
    }
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('uses the date portion of remote timestamps without changing the checked-in fallback', async () => {
    const original = structuredClone(financialScopeCatalog);
    const catalog = await resolveFinancialScopeCatalog(
      vi.fn(async () =>
        Response.json({
          base_and_all_options: 700_000_000,
          period_of_performance: { last_modified_date: '2026-07-02T14:30:00Z' },
        }),
      ),
    );

    expect(catalog.ggss.asOf).toBe('2026-07-02');
    expect(financialScopeCatalog).toEqual(original);
  });

  it.each([
    ['annual', '$24.6 million annually'],
    ['estimated', 'approximately $24.6 million'],
    ['lifetime', '$24.6 million lifetime value'],
  ] as const)('preserves the %s qualifier in financial claims', (amountBasis, expected) => {
    expect(
      formatFinancialScopeDetail({
        ...financialScopeCatalog['gwsas-ground-readiness-antennas'],
        amount: 24_600_000,
        amountBasis,
      }),
    ).toBe(expected);
  });

  it.each([undefined, 123])(
    'keeps the stored as-of date when a successful response has date %s',
    async (lastModified) => {
      const original = financialScopeCatalog.ggss;
      financialScopeCatalog.ggss = { ...original, asOf: '2025-01-15' };
      try {
        const catalog = await resolveFinancialScopeCatalog(
          vi.fn(async () =>
            Response.json({
              base_and_all_options: 700_000_000,
              period_of_performance: { last_modified_date: lastModified },
            }),
          ),
        );

        expect(catalog.ggss.amount).toBe(700_000_000);
        expect(catalog.ggss.asOf).toBe('2025-01-15');
      } finally {
        financialScopeCatalog.ggss = original;
      }
    },
  );
});
