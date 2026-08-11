import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  financialScopeCatalog,
  formatFinancialScope,
  formatFinancialScopeDetail,
  resolveFinancialScopeCatalog,
  totalFinancialScope,
} from './financial-scopes';

afterEach(() => vi.restoreAllMocks());

describe('financial scope', () => {
  it('deduplicates repeated scope references before totaling them', () => {
    expect(totalFinancialScope(['ggss', 'ggss', 'rfims-development'])).toBe(694_287_958);
  });

  it('formats the total conservatively by rounding down', () => {
    expect(formatFinancialScope(2_576_300_000)).toBe('$2.5B+');
  });

  it('formats detailed values according to their basis', () => {
    expect(formatFinancialScopeDetail(financialScopeCatalog['goes-r-ground-system'])).toBe('up to $1.833 billion');
    expect(formatFinancialScopeDetail(financialScopeCatalog.ggss)).toBe('$545.9 million in base and options');
  });

  it('resolves USAspending amounts and modification dates', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({ base_and_all_options: 600_000_000, period_of_performance: { last_modified_date: '2026-07-02' } }),
    ) as unknown as typeof fetch;

    const catalog = await resolveFinancialScopeCatalog(fetcher);

    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(catalog.ggss.amount).toBe(600_000_000);
    expect(catalog.ggss.asOf).toBe('2026-07-02');
  });

  it('uses checked-in amounts when USAspending is unavailable', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fetcher = vi.fn(async () => new Response(null, { status: 503 })) as unknown as typeof fetch;

    const catalog = await resolveFinancialScopeCatalog(fetcher);

    expect(catalog.ggss.amount).toBe(financialScopeCatalog.ggss.amount);
    expect(console.warn).toHaveBeenCalledTimes(4);
  });
});
