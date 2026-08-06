interface ExperienceSlugFields {
  organization: string;
  project: string;
  title: string;
  startDate: Date;
}

const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const createExperienceSlug = ({ organization, project, title, startDate }: ExperienceSlugFields) =>
  [startDate.toISOString().slice(0, 7), organization, project, title].map(slugify).join('-');
