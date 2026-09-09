import { describe, expect, it } from 'vitest';

import { basics } from '../data/resume/basics';
import { site } from '../data/site';
import { siteConfig, socialLinks } from './site';

describe('site configuration', () => {
  it('is the authority for canonical identity and author metadata', () => {
    expect(site).toMatchObject({
      url: siteConfig.url,
      title: siteConfig.title,
      name: siteConfig.author.name,
      role: siteConfig.author.role,
      email: siteConfig.author.email,
    });
    expect(basics).toMatchObject({
      url: siteConfig.url,
      name: siteConfig.author.name,
      label: siteConfig.author.role,
      email: siteConfig.author.email,
    });
  });

  it('keeps resume profiles synchronized with configured social links', () => {
    for (const profile of basics.profiles) expect(profile.url).toBe(socialLinks[profile.network].href);
  });

  it('defines valid, unique navigation and repository URLs', () => {
    const navigation = [...siteConfig.navigation.primary, ...siteConfig.navigation.footer];

    expect(new Set(navigation.map(({ href }) => href)).size).toBe(navigation.length);
    for (const item of navigation)
      expect(new URL(item.href, siteConfig.url).origin).toBe(new URL(siteConfig.url).origin);
    expect(new URL(siteConfig.repository.url).pathname).toBe(
      `/${siteConfig.repository.owner}/${siteConfig.repository.name}`,
    );
    expect(siteConfig.navigation.footer).toContainEqual(
      expect.objectContaining({ label: 'RSS', href: siteConfig.rss.path }),
    );
  });
});
