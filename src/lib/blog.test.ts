import { describe, expect, it } from 'vitest';

import { getPublishedAt } from './blog';

describe('getPublishedAt', () => {
  it('uses the front matter publication date as the authoritative source', () => {
    expect(getPublishedAt({ data: { publishedDate: new Date('2019-05-16T00:00:00.000Z') } } as never)).toEqual(
      new Date('2019-05-16T00:00:00.000Z'),
    );
  });
});
