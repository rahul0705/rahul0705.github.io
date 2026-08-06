const socialIcons = {
  GitFork: 'GitFork',
  BriefcaseBusiness: 'BriefcaseBusiness',
  Mail: 'Mail',
} as const;

export type SocialIcon = keyof typeof socialIcons;

export const socialNetworks = {
  GitHub: { icon: socialIcons.GitFork },
  LinkedIn: { icon: socialIcons.BriefcaseBusiness },
  Email: { icon: socialIcons.Mail },
} satisfies Record<string, { icon: SocialIcon }>;

export type SocialNetwork = keyof typeof socialNetworks;
export type ProfileNetwork = Exclude<SocialNetwork, 'Email'>;
