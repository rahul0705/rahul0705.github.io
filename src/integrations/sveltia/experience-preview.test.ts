import type { CustomPreviewTemplateProps } from '@sveltia/cms';
import { describe, expect, it } from 'vitest';

import { siteTheme } from '../../themes/site-theme';
import { getExperiencePreviewData, renderExperiencePreview } from './experience-preview';

const data = {
  title: 'Software Engineer',
  organization: 'L3Harris Technologies',
  project: 'WxConnect',
  projectUrl: 'https://example.com/project',
  additionalInformation: [
    { label: 'Example contract', url: 'https://example.com/contract' },
    { label: 'Project report', url: 'https://example.com/report' },
  ],
  startDate: '2014-01-01',
  endDate: '2016-04-01',
  description: 'Built satellite data-recovery systems.',
  highlights: ['Recovered GOES data.', 'Recovered Himawari data.'],
  skills: ['c', 'flask'],
  organizationUrl: 'https://example.com',
};

const createEntry = (values: Record<string, unknown>) => ({
  getIn: ([, field]: string[]) => {
    const value = values[field];

    return Array.isArray(value) ? { toArray: () => value } : value;
  },
});

const createProps = (values: Record<string, unknown>) => {
  const document = {
    documentElement: { dataset: {} },
    body: { classList: { add: () => undefined } },
  };
  const cmsWindow = {
    createElement: (type: string, props: Record<string, unknown> | null, ...children: unknown[]) => ({
      type,
      props,
      children,
    }),
  };

  return {
    document,
    props: {
      document,
      entry: createEntry(values),
      window: { parent: cmsWindow },
    } as unknown as CustomPreviewTemplateProps,
  };
};

describe('Sveltia experience preview', () => {
  it('normalizes scalar values and immutable lists', () => {
    expect(getExperiencePreviewData(createEntry(data) as unknown as CustomPreviewTemplateProps['entry'])).toEqual(data);
  });

  it('renders a themed, resume-like card', () => {
    const { document, props } = createProps(data);
    const preview = renderExperiencePreview(props);
    const rendered = JSON.stringify(preview);

    expect(document.documentElement.dataset).toEqual({ theme: siteTheme });
    expect(preview).toMatchObject({
      type: 'article',
      props: { className: expect.stringContaining('bg-base-200') },
    });
    expect(rendered).toContain('L3Harris Technologies · WxConnect');
    expect(rendered).toContain('Jan 2014 — Apr 2016');
    expect(rendered).toContain('Recovered GOES data.');
    expect(rendered).toContain('Flask');
    expect(rendered).toContain('https://example.com');
    expect(rendered).toContain('Project homepage');
    expect(rendered).toContain('Example contract');
    expect(rendered).toContain('Project report');
  });

  it('omits optional sections and separators when their data is empty', () => {
    const { props } = createProps({ title: 'Software Engineer', organization: 'L3Harris Technologies' });
    const rendered = JSON.stringify(renderExperiencePreview(props));

    expect(rendered).toContain('L3Harris Technologies');
    expect(rendered).not.toContain(' · ');
    expect(rendered).not.toContain('Highlights');
    expect(rendered).not.toContain('Skills');
    expect(rendered).not.toContain('Primary links');
    expect(rendered).not.toContain('Contracts');
    expect(rendered).not.toContain('Additional information');
  });
});
