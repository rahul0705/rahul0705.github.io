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
  name: 'Rahul Mohandas',
  label: 'Software Development Engineer',
  email: 'rahul@rahulmohandas.com',
  url: 'https://www.rahulmohandas.com',
  profiles: [
    { network: 'LinkedIn', username: 'rahul0705', url: 'https://www.linkedin.com/in/rahul0705' },
    { network: 'GitHub', username: 'rahul0705', url: 'https://github.com/rahul0705' },
  ],
} as const;
