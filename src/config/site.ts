import type { SocialNetwork } from '../lib/social-networks';

interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

interface SocialLink extends NavigationItem {
  label: SocialNetwork;
}

interface SiteConfig {
  url: string;
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
    description: string;
  };
  analytics: {
    measurementId: string;
  };
  nonIndexablePaths: readonly string[];
  robotsDisallowPaths: readonly string[];
}

export const siteConfig = {
  url: 'https://www.rahulmohandas.com',
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
      { label: 'Articles', href: '/blog', external: false },
      { label: 'Resume', href: '/resume', external: false },
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
    description:
      'Writing about software engineering, distributed systems, cloud infrastructure, and developer tooling.',
  },
  analytics: {
    measurementId: 'G-K6P860TJ0W',
  },
  nonIndexablePaths: ['/admin/', '/resume.json', '/resume.md', '/resume.txt'],
  robotsDisallowPaths: ['/resume.json', '/resume.md', '/resume.txt'],
} as const satisfies SiteConfig;

export const socialLinks = Object.fromEntries(siteConfig.socialLinks.map((link) => [link.label, link])) as Record<
  SocialNetwork,
  SocialLink
>;
