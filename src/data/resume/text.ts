import type { Recognition } from './awards';
import type { ResumeBasics } from './basics';
import type { EducationEntry } from './education';
import type { ExperienceOrganization, ExperienceRole } from './experience';
import type { ResumeInterest } from './interests';
import { skillCatalog } from './skills';

interface ResumeTextInput {
  basics: ResumeBasics;
  experience: ExperienceOrganization[];
  education: EducationEntry[];
  skillGroups: Array<{ name: string; keywords: string[] }>;
  recognitions: Recognition[];
  interests: ResumeInterest[];
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatDate = (value?: string) => {
  if (!value) return undefined;

  const [year, month] = value.split('-');
  const monthName = month ? monthNames[Number(month) - 1] : undefined;

  return monthName ? `${monthName} ${year}` : year;
};

const formatPeriod = (entry: { startDate?: string; endDate?: string }) => {
  const start = formatDate(entry.startDate);
  const end = entry.endDate ? formatDate(entry.endDate) : entry.startDate ? 'Present' : undefined;

  return [start, end].filter(Boolean).join(' - ');
};

const formatYearPeriod = (entry: { startDate?: string; endDate?: string }) => {
  const start = entry.startDate?.split('-')[0];
  const end = entry.endDate?.split('-')[0] ?? (entry.startDate ? 'Present' : undefined);

  return [start, end].filter(Boolean).join('–');
};

const section = (title: string, content: string[]) =>
  content.length > 0 ? [title, ...content].join('\n\n') : undefined;

const markdownLineLength = 120;

const wrapMarkdown = (value: string, firstPrefix = '', continuationPrefix = '') => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = firstPrefix;

  words.forEach((word) => {
    const separator = line === firstPrefix || line === continuationPrefix ? '' : ' ';

    if (`${line}${separator}${word}`.length > markdownLineLength && line !== firstPrefix) {
      lines.push(line);
      line = `${continuationPrefix}${word}`;
    } else {
      line = `${line}${separator}${word}`;
    }
  });

  if (line) lines.push(line);

  return lines.join('\n');
};

const roleText = (organization: ExperienceOrganization, project: string, role: ExperienceRole) =>
  [
    role.title,
    [organization.name, project].filter(Boolean).join(' | '),
    formatPeriod(role),
    role.description,
    role.highlights?.map((highlight) => `- ${highlight}`).join('\n'),
    role.skills && role.skills.length > 0
      ? `Skills: ${role.skills.map((skill) => skillCatalog[skill].name).join(', ')}`
      : undefined,
  ]
    .filter(Boolean)
    .join('\n');

const roleMarkdown = (organization: ExperienceOrganization, project: string, role: ExperienceRole) =>
  [
    `### ${role.title} — ${project}${formatYearPeriod(role) ? ` (${formatYearPeriod(role)})` : ''}`,
    `Organization: **${organization.name}**`,
    role.description ? wrapMarkdown(role.description) : undefined,
    role.highlights?.map((highlight) => wrapMarkdown(highlight, '- ', '  ')).join('\n'),
    role.skills && role.skills.length > 0
      ? wrapMarkdown(`**Skills:** ${role.skills.map((skill) => skillCatalog[skill].name).join(', ')}`)
      : undefined,
  ]
    .filter(Boolean)
    .join('\n\n');

const experienceEntries = (experience: ExperienceOrganization[]) =>
  experience
    .flatMap((organization) =>
      organization.projects.flatMap((project) =>
        project.roles.map((role) => ({ organization, project: project.name, role })),
      ),
    )
    .sort((a, b) => (b.role.startDate ?? '').localeCompare(a.role.startDate ?? ''));

export const toResumeText = ({
  basics,
  experience,
  education,
  skillGroups,
  recognitions,
  interests,
}: ResumeTextInput) => {
  const contact = [
    basics.email,
    basics.phone,
    basics.url,
    ...basics.profiles.map((profile) => `${profile.network}: ${profile.url}`),
  ].filter(Boolean);
  const experienceContent = experienceEntries(experience).map(({ organization, project, role }) =>
    roleText(organization, project, role),
  );
  const educationContent = education.map((entry) =>
    [entry.title, entry.subtitle, formatPeriod(entry)].filter(Boolean).join('\n'),
  );
  const skillContent = skillGroups.map((group) => `${group.name}: ${group.keywords.join(', ')}`);
  const awardContent = recognitions.map((recognition) =>
    [
      recognition.title,
      recognition.date,
      recognition.description,
      recognition.highlights?.map((highlight) => `- ${highlight}`).join('\n'),
    ]
      .filter(Boolean)
      .join('\n'),
  );
  const interestContent = interests.map((interest) =>
    [interest.name, interest.keywords?.join(', ')].filter(Boolean).join(': '),
  );

  return [
    basics.name,
    basics.label,
    contact.join('\n'),
    section('EXPERIENCE', experienceContent),
    section('EDUCATION', educationContent),
    section('SKILLS', skillContent),
    section('AWARDS AND ACTIVITIES', awardContent),
    section('INTERESTS', interestContent),
  ]
    .filter(Boolean)
    .join('\n\n');
};

export const toResumeMarkdown = ({
  basics,
  experience,
  education,
  skillGroups,
  recognitions,
  interests,
}: ResumeTextInput) => {
  const contact = [
    basics.email && `[${basics.email}](mailto:${basics.email})`,
    basics.phone,
    basics.url && `[${basics.url}](${basics.url})`,
    ...basics.profiles.map((profile) => `[${profile.network}](${profile.url})`),
  ].filter(Boolean);
  const experienceContent = experienceEntries(experience).map(({ organization, project, role }) =>
    roleMarkdown(organization, project, role),
  );
  const educationContent = education.map((entry) =>
    [`### ${entry.href ? `[${entry.title}](${entry.href})` : entry.title}`, entry.subtitle, formatPeriod(entry)]
      .filter(Boolean)
      .join('\n\n'),
  );
  const skillContent = skillGroups.map((group) =>
    wrapMarkdown(`**${group.name}:** ${group.keywords.join(', ')}`, '- ', '  '),
  );
  const awardContent = recognitions.map((recognition) =>
    [
      `### ${recognition.href ? `[${recognition.title}](${recognition.href})` : recognition.title}`,
      recognition.date,
      wrapMarkdown(recognition.description),
      recognition.highlights?.map((highlight) => wrapMarkdown(highlight, '- ', '  ')).join('\n'),
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
  const interestContent = interests.map((interest) =>
    [`- ${interest.href ? `[${interest.name}](${interest.href})` : interest.name}`, interest.keywords?.join(', ')]
      .filter(Boolean)
      .join(': '),
  );

  return [
    `# ${basics.name}`,
    basics.label,
    wrapMarkdown(contact.join(' | ')),
    section('## Experience', experienceContent),
    section('## Education', educationContent),
    section('## Skills', skillContent),
    section('## Awards and Activities', awardContent),
    section('## Interests', interestContent),
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
};
