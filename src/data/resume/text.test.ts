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
});
