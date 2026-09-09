import { siteConfig, socialLinks } from '../../config/site';
import type { ProfileNetwork } from '../../lib/social-networks';

interface ResumeProfile {
  network: ProfileNetwork;
  username: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  url: string;
  profiles: ResumeProfile[];
}

export const basics: ResumeBasics = {
  name: siteConfig.author.name,
  label: siteConfig.author.role,
  email: siteConfig.author.email,
  url: siteConfig.url,
  profiles: [
    { network: 'LinkedIn', username: 'rahul0705', url: socialLinks.LinkedIn.href },
    { network: 'GitHub', username: siteConfig.repository.owner, url: socialLinks.GitHub.href },
  ],
} as const;
