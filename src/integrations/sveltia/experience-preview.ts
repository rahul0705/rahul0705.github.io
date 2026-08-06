import type { CustomPreviewTemplateProps } from '@sveltia/cms';

import { skillCatalog } from '../../data/resume/skills';
import { siteTheme } from '../../themes/site-theme';

type PreviewTemplate = (props: CustomPreviewTemplateProps) => unknown;
type PreviewElement = ReturnType<PreviewTemplate>;
type CreateElement = (type: string, props: Record<string, unknown> | null, ...children: unknown[]) => PreviewElement;
type PreviewEntry = CustomPreviewTemplateProps['entry'];

export interface ExperiencePreviewData {
  title: string;
  organization: string;
  project: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
  skills: string[];
  organizationUrl: string;
}

const getCreateElement = (window: Window): CreateElement =>
  (window as Window & { createElement: CreateElement }).createElement;

const getString = (entry: PreviewEntry, field: string) => {
  const value = entry.getIn(['data', field]);

  return typeof value === 'string' ? value : '';
};

const getStringList = (entry: PreviewEntry, field: string) => {
  const value = entry.getIn(['data', field]);
  const items =
    value && typeof value === 'object' && 'toArray' in value && typeof value.toArray === 'function'
      ? value.toArray()
      : value;

  return Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : [];
};

export const getExperiencePreviewData = (entry: PreviewEntry): ExperiencePreviewData => ({
  title: getString(entry, 'title'),
  organization: getString(entry, 'organization'),
  project: getString(entry, 'project'),
  startDate: getString(entry, 'startDate'),
  endDate: getString(entry, 'endDate'),
  description: getString(entry, 'description'),
  highlights: getStringList(entry, 'highlights'),
  skills: getStringList(entry, 'skills'),
  organizationUrl: getString(entry, 'organizationUrl'),
});

const formatDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
};

const renderSection = (h: CreateElement, title: string, content: PreviewElement) =>
  h(
    'section',
    { className: 'mt-6 border-t border-base-300 pt-5' },
    h('h2', { className: 'mb-3 text-sm font-bold uppercase tracking-widest text-primary' }, title),
    content,
  );

const renderHeader = (h: CreateElement, data: ExperiencePreviewData) => {
  const organizationAndProject = [data.organization, data.project].filter(Boolean).join(' · ');
  const dateRange = data.startDate
    ? `${formatDate(data.startDate)} — ${data.endDate ? formatDate(data.endDate) : 'Present'}`
    : data.endDate
      ? formatDate(data.endDate)
      : '';

  return h(
    'header',
    { className: 'border-b border-base-300 pb-5' },
    h('h1', { className: 'text-3xl font-bold tracking-tight text-base-content' }, data.title),
    organizationAndProject
      ? h('p', { className: 'mt-2 text-lg font-medium text-primary' }, organizationAndProject)
      : null,
    dateRange ? h('p', { className: 'mt-2 text-sm text-base-content/70' }, dateRange) : null,
  );
};

const renderHighlights = (h: CreateElement, highlights: string[]) =>
  highlights.length
    ? renderSection(
        h,
        'Highlights',
        h(
          'ul',
          { className: 'list-disc space-y-2 pl-5 leading-relaxed text-base-content/85' },
          ...highlights.map((highlight) => h('li', null, highlight)),
        ),
      )
    : null;

const renderSkills = (h: CreateElement, skills: string[]) =>
  skills.length
    ? renderSection(
        h,
        'Skills',
        h(
          'div',
          { className: 'flex flex-wrap gap-2' },
          ...skills.map((skill) =>
            h(
              'span',
              { className: 'badge badge-outline badge-primary' },
              skill in skillCatalog ? skillCatalog[skill as keyof typeof skillCatalog].name : skill,
            ),
          ),
        ),
      )
    : null;

const renderOrganizationLink = (h: CreateElement, url: string) =>
  url
    ? renderSection(
        h,
        'Organization link',
        h('a', { className: 'link link-primary break-all', href: url, rel: 'noreferrer', target: '_blank' }, url),
      )
    : null;

export const renderExperiencePreview = ({ document, entry, window }: CustomPreviewTemplateProps) => {
  document.documentElement.dataset.theme = siteTheme;

  const h = getCreateElement(window.parent);
  const data = getExperiencePreviewData(entry);

  return h(
    'article',
    { className: 'mx-auto max-w-3xl rounded-box bg-base-200 p-6 text-base-content shadow-sm sm:p-8' },
    renderHeader(h, data),
    data.description ? h('p', { className: 'mt-5 leading-relaxed text-base-content/85' }, data.description) : null,
    renderHighlights(h, data.highlights),
    renderSkills(h, data.skills),
    renderOrganizationLink(h, data.organizationUrl),
  );
};
