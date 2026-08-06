import { describe, expect, it } from 'vitest';

import { resumeMarkdown, resumeText } from './index';

describe('resume text serializations', () => {
  it('provides an ATS-friendly plain-text resume', () => {
    expect(resumeText).toContain('EXPERIENCE');
    expect(resumeText).toContain('Amazon Web Services');
    expect(resumeText).not.toContain('## Experience');
  });

  it('provides a structured Markdown resume', () => {
    expect(resumeMarkdown).toContain('# Rahul Mohandas');
    expect(resumeMarkdown).toContain('## Experience');
    expect(resumeMarkdown).toContain('[LinkedIn](https://www.linkedin.com/in/rahul0705)');
  });

  it('wraps Markdown prose and generates unique experience headings', () => {
    const lines = resumeMarkdown.split('\n');
    const experienceHeadings = lines.filter((line) => line.startsWith('### ') && !line.startsWith('### ['));

    expect(lines.filter((line) => !line.startsWith('#')).every((line) => line.length <= 120)).toBe(true);
    expect(new Set(experienceHeadings).size).toBe(experienceHeadings.length);
  });
});
