import { socialNetworks, type SocialNetwork } from '../lib/social-networks';

interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

interface SocialLink extends NavigationItem {
  label: SocialNetwork;
}

interface SiteConfig {
  title: string;
  author: {
    name: string;
    role: string;
    email: string;
  };
  repository: {
    owner: string;
    name: string;
    url: string;
  };
  navigation: {
    primary: readonly NavigationItem[];
    footer: readonly NavigationItem[];
  };
  socialLinks: readonly SocialLink[];
  rss: {
    path: string;
    title: string;
  };
  analytics: {
    measurementId: string;
  };
  nonIndexablePaths: readonly string[];
  robotsDisallowPaths: readonly string[];
}

export const siteConfig = {
  title: 'Rahul Mohandas',
  author: {
    name: 'Rahul Mohandas',
    role: 'Software Development Engineer',
    email: 'rahul@rahulmohandas.com',
  },
  repository: {
    owner: 'rahul0705',
    name: 'rahul0705.github.io',
    url: 'https://github.com/rahul0705/rahul0705.github.io',
  },
  navigation: {
    primary: [
      { label: 'About', href: '/about/', external: false },
      { label: 'Articles', href: '/blog', external: false },
      { label: 'Resume', href: '/resume', external: false },
      { label: 'Dotfiles', href: '/dotfiles/', external: false },
    ],
    footer: [
      { label: 'RSS', href: '/rss.xml', external: false },
      { label: 'Privacy', href: '/privacy/', external: false },
    ],
  },
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/rahul0705', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rahul0705', external: true },
    { label: 'Email', href: 'mailto:rahul@rahulmohandas.com', external: false },
  ],
  rss: {
    path: '/rss.xml',
    title: 'Rahul Mohandas Articles',
  },
  analytics: {
    measurementId: 'G-K6P860TJ0W',
  },
  nonIndexablePaths: ['/admin/', '/resume.json', '/resume.md', '/resume.txt'],
  robotsDisallowPaths: ['/resume.json', '/resume.md', '/resume.txt'],
} as const satisfies SiteConfig;

const linksByNetwork = Object.fromEntries(siteConfig.socialLinks.map((link) => [link.label, link]));
for (const network of Object.keys(socialNetworks)) {
  if (!linksByNetwork[network]) throw new Error(`Missing social link for ${network}`);
}
// Every supported network was checked above; Object.fromEntries cannot retain those keys.
export const socialLinks = linksByNetwork as Record<SocialNetwork, SocialLink>;
