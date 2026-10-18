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
  financialScopeIds: ['rfims-development'],
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

const createProps = (values: Record<string, unknown>, metadataLoaded = true) => {
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
      fieldsMetaData: {
        get: (field: string) =>
          !metadataLoaded
            ? undefined
            : field === 'skills'
              ? [{ data: { name: 'C' } }, { data: { name: 'Flask' } }]
              : field === 'financialScopeIds'
                ? [{ data: { name: 'RFIMS Development' } }]
                : undefined,
      },
      window: { parent: cmsWindow },
    },
  };
};

describe('Sveltia experience preview', () => {
  it('normalizes scalar values and immutable lists', () => {
    expect(getExperiencePreviewData(createEntry(data))).toEqual(data);
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
    expect(rendered).toContain('Jan 2014 to Apr 2016');
    expect(rendered).toContain('Recovered GOES data.');
    expect(rendered).toContain('Flask');
    expect(rendered).toContain('RFIMS Development');
    expect(rendered).toContain('https://example.com');
    expect(rendered).toContain('Project homepage');
    expect(rendered).toContain('Example contract');
    expect(rendered).toContain('Project report');
  });

  it('falls back to stable relation IDs when CMS metadata has not loaded', () => {
    const { props } = createProps({ ...data, skills: ['newSkill'], financialScopeIds: ['new-contract'] }, false);
    const rendered = JSON.stringify(renderExperiencePreview(props));

    expect(rendered).toContain('newSkill');
    expect(rendered).toContain('new-contract');
  });

  it.each([undefined, null, 'not callable'])('rejects a missing or invalid CMS renderer: %s', (renderer) => {
    const { props } = createProps(data);
    Object.defineProperty(props.window.parent, 'createElement', { value: renderer });
    expect(() => renderExperiencePreview(props)).toThrow('requires a callable createElement');
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
