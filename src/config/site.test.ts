import { describe, expect, it } from 'vitest';

import { basics } from '../data/resume/basics';
import { site } from '../data/site';
import { siteURL } from '../lib/site-url';
import { siteConfig, socialLinks } from './site';

const publicSiteURL = siteURL('/').replace(/\/$/, '');

describe('site configuration', () => {
  it('shares author metadata and the Astro public URL across site and resume data', () => {
    expect(site).toMatchObject({
      url: publicSiteURL,
      title: siteConfig.title,
      name: siteConfig.author.name,
      role: siteConfig.author.role,
      email: siteConfig.author.email,
    });
    expect(basics).toMatchObject({
      url: publicSiteURL,
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
    for (const item of navigation) expect(new URL(item.href, publicSiteURL).origin).toBe(new URL(publicSiteURL).origin);
    expect(new URL(siteConfig.repository.url).pathname).toBe(
      `/${siteConfig.repository.owner}/${siteConfig.repository.name}`,
    );
    expect(siteConfig.navigation.footer).toContainEqual(
      expect.objectContaining({ label: 'RSS', href: siteConfig.rss.path }),
    );
  });
});
