import type { CustomPreviewTemplateProps } from '@sveltia/cms';

import type { ContentLink } from '../../config/content-model';
import { siteTheme } from '../../themes/site-theme';

type PreviewTemplate = (props: CustomPreviewTemplateProps) => unknown;
type PreviewElement = ReturnType<PreviewTemplate>;
type CreateElement = (type: string, props: Record<string, unknown> | null, ...children: unknown[]) => PreviewElement;
type PreviewEntry = CustomPreviewTemplateProps['entry'];

export interface ExperiencePreviewData {
  title: string;
  organization: string;
  project: string;
  projectUrl: string;
  additionalInformation: ContentLink[];
  financialScopeIds: string[];
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

const toPlainValue = (value: unknown): unknown =>
  value && typeof value === 'object' && 'toJS' in value && typeof value.toJS === 'function' ? value.toJS() : value;

const isContentLink = (value: unknown): value is ContentLink => {
  const plainValue = toPlainValue(value);

  return (
    plainValue !== null &&
    plainValue !== undefined &&
    typeof plainValue === 'object' &&
    'label' in plainValue &&
    typeof plainValue.label === 'string' &&
    'url' in plainValue &&
    typeof plainValue.url === 'string'
  );
};

const relationLabels = (fieldsMetaData: CustomPreviewTemplateProps['fieldsMetaData'], field: string, ids: string[]) => {
  const metadata = toPlainValue(fieldsMetaData?.get(field));
  const records = Array.isArray(metadata)
    ? metadata
    : metadata && typeof metadata === 'object'
      ? Object.values(metadata)
      : [];

  return ids.map((id, index) => {
    const candidate = toPlainValue(records[index]);
    const data =
      candidate && typeof candidate === 'object' && 'data' in candidate ? toPlainValue(candidate.data) : candidate;
    return data && typeof data === 'object' && 'name' in data && typeof data.name === 'string' ? data.name : id;
  });
};

const getLinkList = (entry: PreviewEntry, field: string) => {
  const value = entry.getIn(['data', field]);
  const items =
    value && typeof value === 'object' && 'toArray' in value && typeof value.toArray === 'function'
      ? value.toArray()
      : value;

  return Array.isArray(items) ? items.map(toPlainValue).filter(isContentLink) : [];
};

export const getExperiencePreviewData = (entry: PreviewEntry): ExperiencePreviewData => ({
  title: getString(entry, 'title'),
  organization: getString(entry, 'organization'),
  project: getString(entry, 'project'),
  projectUrl: getString(entry, 'projectUrl'),
  additionalInformation: getLinkList(entry, 'additionalInformation'),
  financialScopeIds: getStringList(entry, 'financialScopeIds'),
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

const renderBadges = (h: CreateElement, title: string, labels: string[]) =>
  labels.length
    ? renderSection(
        h,
        title,
        h(
          'div',
          { className: 'flex flex-wrap gap-2' },
          ...labels.map((label) => h('span', { className: 'badge badge-outline badge-primary' }, label)),
        ),
      )
    : null;

const renderLinks = (h: CreateElement, title: string, links: ContentLink[]) =>
  links.length
    ? renderSection(
        h,
        title,
        h(
          'ul',
          { className: 'space-y-2' },
          ...links.map(({ label, url }) =>
            h(
              'li',
              null,
              h(
                'a',
                { className: 'link link-primary break-all', href: url, rel: 'noreferrer', target: '_blank' },
                label,
              ),
            ),
          ),
        ),
      )
    : null;

export const renderExperiencePreview = ({ document, entry, fieldsMetaData, window }: CustomPreviewTemplateProps) => {
  document.documentElement.dataset.theme = siteTheme;

  const h = getCreateElement(window.parent);
  const data = getExperiencePreviewData(entry);

  return h(
    'article',
    { className: 'mx-auto max-w-3xl rounded-box bg-base-200 p-6 text-base-content shadow-sm sm:p-8' },
    renderHeader(h, data),
    data.description ? h('p', { className: 'mt-5 leading-relaxed text-base-content/85' }, data.description) : null,
    renderHighlights(h, data.highlights),
    renderBadges(h, 'Skills', relationLabels(fieldsMetaData, 'skills', data.skills)),
    renderLinks(h, 'Primary links', [
      ...(data.organizationUrl ? [{ label: 'Organization', url: data.organizationUrl }] : []),
      ...(data.projectUrl ? [{ label: 'Project homepage', url: data.projectUrl }] : []),
    ]),
    renderBadges(h, 'Financial context', relationLabels(fieldsMetaData, 'financialScopeIds', data.financialScopeIds)),
    renderLinks(h, 'Additional information', data.additionalInformation),
  );
};
