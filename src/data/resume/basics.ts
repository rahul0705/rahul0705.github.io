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
  phone: string;
  url: string;
  profiles: ResumeProfile[];
}

export const basics: ResumeBasics = {
  name: 'Rahul Mohandas',
  label: 'Software Development Engineer',
  email: 'rahul@rahulmohandas.com',
  phone: '+1-305-926-9294',
  url: 'https://www.rahulmohandas.com',
  profiles: [
    { network: 'LinkedIn', username: 'rahul0705', url: 'https://www.linkedin.com/in/rahul0705' },
    { network: 'GitHub', username: 'rahul0705', url: 'https://github.com/rahul0705' },
  ],
} as const;
