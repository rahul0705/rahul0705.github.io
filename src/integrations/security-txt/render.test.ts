import { describe, expect, it } from 'vitest';

import { renderSecurityTxt } from './render';

const config = {
  contacts: ['mailto:security@example.com', 'https://example.com/report'],
  expiration: { months: 6 },
};
const site = 'https://www.example.com/';
const now = new Date('2026-08-31T12:34:56Z');

describe('renderSecurityTxt', () => {
  it('preserves contact order and clamps calendar months in UTC', () => {
    expect(renderSecurityTxt(config, site, '/', now)).toBe(
      'Contact: mailto:security@example.com\n' +
        'Contact: https://example.com/report\n' +
        'Expires: 2027-02-28T12:34:56.000Z\n' +
        'Canonical: https://www.example.com/.well-known/security.txt\n',
    );
  });

  it.each([
    { site, base: '/project/' },
    { site: 'https://www.example.com/project/', base: '/' },
  ])('rejects deployment under a subpath ($site, $base)', ({ site, base }) => {
    expect(() => renderSecurityTxt(config, site, base, now)).toThrow('requires a root deployment');
  });
});
