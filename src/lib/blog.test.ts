import { describe, expect, it } from 'vitest';

import { getPublishedAt } from './blog';

describe('getPublishedAt', () => {
  it('derives a UTC publication date from a date-prefixed post ID', () => {
    expect(getPublishedAt({ id: '2019-05-16-how-to-use-git-effectively' })).toEqual(
      new Date('2019-05-16T00:00:00.000Z'),
    );
  });

  it('returns undefined when the post ID has no valid date prefix', () => {
    expect(getPublishedAt({ id: 'how-to-use-git-effectively' })).toBeUndefined();
    expect(getPublishedAt({ id: '2019-02-30-invalid-date' })).toBeUndefined();
  });
});
