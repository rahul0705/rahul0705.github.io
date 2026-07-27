import { basics } from './basics';

const linkedIn = basics.profiles.find((profile) => profile.network === 'LinkedIn')?.url ?? '';
const github = basics.profiles.find((profile) => profile.network === 'GitHub')?.url ?? '';

export const socials = {
  github,
  linkedin: linkedIn,
  email: `mailto:${basics.email}`,
};
