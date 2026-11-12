export interface SecurityConfig {
  contacts: readonly string[];
  expiration: { months: number };
  canonical?: string;
}

export const securityTxtPath = '/.well-known/security.txt';

export function renderSecurityTxt(
  config: SecurityConfig,
  site: string | undefined,
  base: string,
  now = new Date(),
): string {
  if (base !== '/' || (site && new URL(site).pathname !== '/')) {
    throw new TypeError('security.txt requires a root deployment.');
  }

  const canonical = config.canonical ?? (site && new URL(securityTxtPath, site).href);
  if (!canonical || !/^https:\/\/[^\s\p{Cc}\\]+$/u.test(canonical) || !URL.canParse(canonical)) {
    throw new TypeError('security.txt requires an HTTPS canonical URL.');
  }

  if (config.contacts.length === 0) {
    throw new TypeError('security.txt requires at least one contact URI.');
  }

  const contacts = config.contacts.map((contact) => {
    if (!/^(?:https:\/\/|mailto:|tel:)[^\s\p{Cc}\\]+$/u.test(contact) || !URL.canParse(contact)) {
      throw new TypeError('security.txt contacts must be absolute HTTPS, mailto, or tel URIs.');
    }
    return `Contact: ${contact}`;
  });

  const { months } = config.expiration;
  if (!Number.isInteger(months) || months < 1 || months > 12) {
    throw new TypeError('security.txt expiration must be between 1 and 12 calendar months.');
  }

  const expires = new Date(now);
  expires.setUTCMonth(expires.getUTCMonth() + months + 1, 0);
  expires.setUTCDate(Math.min(now.getUTCDate(), expires.getUTCDate()));

  return [...contacts, `Expires: ${expires.toISOString()}`, `Canonical: ${canonical}`, ''].join('\n');
}
