import defaultSocialImage from '../assets/covers/code.jpg';
import { getPublishedPosts } from '../lib/blog';
import { resume } from './resume';
import { basics } from './resume/basics';
import { yearsOfExperience } from './resume/experience-coverage';

const linkedIn = basics.profiles.find((profile) => profile.network === 'LinkedIn')?.url ?? '';
const github = basics.profiles.find((profile) => profile.network === 'GitHub')?.url ?? '';
const currentRoles = resume.experience
  .flatMap((organization) =>
    organization.projects.flatMap((project) => project.roles.map((role) => ({ organization, role }))),
  )
  .filter(({ role }) => !role.endDate)
  .sort((a, b) => (b.role.startDate ?? '').localeCompare(a.role.startDate ?? ''));
const currentRoleDescription = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
  currentRoles.map(({ organization, role }) => `${role.title} at ${organization.name}`),
);
const roleCount = resume.experience.reduce(
  (count, company) =>
    count + company.projects.reduce((projectCount, project) => projectCount + project.roles.length, 0),
  0,
);

export const getSiteStats = async () => {
  const publishedPosts = await getPublishedPosts();

  return [
    { label: 'Years in engineering', value: `${yearsOfExperience(resume.experience)}+` },
    { label: 'Roles represented', value: `${roleCount}` },
    { label: 'Published articles', value: `${publishedPosts.length}` },
  ];
};

export const site = {
  url: basics.url,
  title: basics.name,
  description: currentRoleDescription || basics.label,
  defaultSocialImage: defaultSocialImage.src,
  github,
  linkedin: linkedIn,
  email: basics.email,
  name: basics.name,
  role: basics.label,
};
