import defaultSocialImage from '../assets/covers/code.jpg';
import { basics } from './basics';
import { resume } from './resume';

const linkedIn = basics.profiles.find((profile) => profile.network === 'LinkedIn')?.url ?? '';
const github = basics.profiles.find((profile) => profile.network === 'GitHub')?.url ?? '';

export const site = {
  url: basics.url,
  title: basics.name,
  description: 'Software Development Engineer at Amazon Web Services',
  defaultSocialImage: defaultSocialImage.src,
  github,
  linkedin: linkedIn,
  email: basics.email,
  name: basics.name,
  role: basics.label,
  stats: [
    { label: 'Years in engineering', value: '13+' },
    {
      label: 'Roles represented',
      value: `${resume.experience.reduce(
        (count, company) =>
          count + company.projects.reduce((projectCount, project) => projectCount + project.roles.length, 0),
        0,
      )}`,
    },
    { label: 'Published articles', value: '5' },
  ],
  highlights: [
    'Building self-service marketing technology at Amazon Web Services.',
    'Leading cloud and embedded systems work for radio-frequency and satellite-data products.',
    'Experienced with architecture, delivery planning, security controls, and customer-facing software.',
  ],
  focusAreas: ['Cloud architecture', 'Developer tooling', 'Distributed systems'],
  toolkit: ['Java', 'TypeScript', 'React', 'AWS', 'Python', 'Ansible'],
};
