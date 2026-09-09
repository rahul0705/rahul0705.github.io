import defaultSocialImage from '../assets/covers/code.jpg';
import { siteConfig, socialLinks } from '../config/site';
import { getPublishedPosts } from '../lib/blog';
import { resume } from './resume';
import { basics } from './resume/basics';
import { experienceFinancialScopeIds } from './resume/experience';
import { yearsOfExperience } from './resume/experience-coverage';
import { formatFinancialScope, getFinancialScopeCatalog, totalFinancialScope } from './resume/financial-scopes';

const currentRoles = resume.experience
  .flatMap((organization) =>
    organization.projects.flatMap((project) => project.roles.map((role) => ({ organization, role }))),
  )
  .filter(({ role }) => !role.endDate)
  .sort((a, b) => (b.role.startDate ?? '').localeCompare(a.role.startDate ?? ''));
const currentRoleDescription = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
  currentRoles.map(({ organization, role }) => `${role.title} at ${organization.name}`),
);
export const getSiteStats = async () => {
  const [publishedPosts, financialScopes] = await Promise.all([getPublishedPosts(), getFinancialScopeCatalog()]);

  return [
    { label: 'Years in engineering', value: `${yearsOfExperience(resume.experience)}+` },
    {
      label: 'Program scale',
      value: formatFinancialScope(totalFinancialScope(experienceFinancialScopeIds, financialScopes)),
    },
    { label: 'Published articles', value: `${publishedPosts.length}` },
  ];
};

export const site = {
  url: siteConfig.url,
  title: siteConfig.title,
  description: currentRoleDescription || basics.label,
  defaultSocialImage: defaultSocialImage.src,
  github: socialLinks.GitHub.href,
  linkedin: socialLinks.LinkedIn.href,
  email: siteConfig.author.email,
  name: siteConfig.author.name,
  role: siteConfig.author.role,
};
